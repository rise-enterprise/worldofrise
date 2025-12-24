import { useState } from 'react';
import { useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin, useResendInvitation, useDeleteAdminPermanently, Admin, CreateAdminInput, InviteResult } from '@/hooks/useAdmins';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Shield, ShieldCheck, UserCog, Eye, RefreshCw, Copy, Check, Link, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['super_admin', 'admin', 'manager', 'viewer']),
});

const editAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['super_admin', 'admin', 'manager', 'viewer']),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;
type EditAdminFormData = z.infer<typeof editAdminSchema>;

const roleIcons = {
  super_admin: ShieldCheck,
  admin: Shield,
  manager: UserCog,
  viewer: Eye,
};

const roleColors = {
  super_admin: 'bg-primary/20 text-primary border-primary/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  manager: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  viewer: 'bg-muted text-muted-foreground border-border',
};

export function AdminsView() {
  const { admin: currentAdmin } = useAdminAuthContext();
  const { data: admins, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const resendInvitation = useResendInvitation();
  const deleteAdminPermanently = useDeleteAdminPermanently();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [activationLink, setActivationLink] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const createForm = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'viewer',
    },
  });

  const editForm = useForm<EditAdminFormData>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      name: '',
      role: 'viewer',
    },
  });

  const handleCreate = async (data: CreateAdminFormData) => {
    const result = await createAdmin.mutateAsync(data as CreateAdminInput);
    if (result.activationLink) {
      setActivationLink(result.activationLink);
      setInvitedEmail(data.email);
    }
    createForm.reset();
    setIsCreateOpen(false);
  };

  const handleEdit = async (data: EditAdminFormData) => {
    if (!editingAdmin) return;
    await updateAdmin.mutateAsync({
      id: editingAdmin.id,
      name: data.name,
      role: data.role,
    });
    setEditingAdmin(null);
  };

  const handleDelete = async (id: string) => {
    await deleteAdmin.mutateAsync(id);
  };

  const handleResendInvitation = async (admin: Admin) => {
    const result = await resendInvitation.mutateAsync({
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
    if (result.activationLink) {
      setActivationLink(result.activationLink);
      setInvitedEmail(admin.email);
    }
  };

  const openEditDialog = (admin: Admin) => {
    editForm.reset({
      name: admin.name,
      role: admin.role,
    });
    setEditingAdmin(admin);
  };

  const copyToClipboard = async () => {
    if (!activationLink) return;
    await navigator.clipboard.writeText(activationLink);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Activation link copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const closeActivationDialog = () => {
    setActivationLink(null);
    setInvitedEmail('');
    setCopied(false);
  };

  const handleSendViaEmail = () => {
    if (!activationLink || !invitedEmail) return;
    const subject = encodeURIComponent("You've been invited as an Admin - Rise Loyalty");
    const body = encodeURIComponent(
      `Hello,\n\n` +
      `You've been invited to join as an administrator for Rise Loyalty.\n\n` +
      `Please click the link below to set your password and activate your account:\n\n` +
      `${activationLink}\n\n` +
      `This link expires in 24 hours.\n\n` +
      `Best regards,\nRise Loyalty Team`
    );
    window.open(`mailto:${invitedEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  // Only super_admins can access this view
  if (currentAdmin?.role !== 'super_admin') {
    return (
      <div className="p-8">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              Only super administrators can manage admin users.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Admin Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage administrator accounts and permissions
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Admin</DialogTitle>
              <DialogDescription>
                Create an invitation for a new administrator.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAdmin.isPending}>
                    {createAdmin.isPending ? 'Creating...' : 'Create Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.map((admin) => {
                const RoleIcon = roleIcons[admin.role];
                const isSelf = admin.id === currentAdmin?.id;
                
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 ${roleColors[admin.role]}`}>
                        <RoleIcon className="h-3 w-3" />
                        {admin.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {admin.last_login_at 
                        ? format(new Date(admin.last_login_at), 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Resend invitation button - only for inactive admins who never logged in */}
                        {!admin.is_active && !admin.last_login_at && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResendInvitation(admin)}
                            disabled={resendInvitation.isPending}
                            title="Regenerate activation link"
                            className="text-primary hover:text-primary"
                          >
                            <RefreshCw className={`h-4 w-4 ${resendInvitation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(admin)}
                          disabled={isSelf}
                          title={isSelf ? "Can't edit yourself" : 'Edit admin'}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        {/* Deactivate button - only for active admins */}
                        {admin.is_active && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={isSelf}
                                title={isSelf ? "Can't deactivate yourself" : 'Deactivate admin'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate Admin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will deactivate {admin.name}'s admin access. They will no longer be able to log in to the dashboard.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(admin.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {/* Permanent delete button - only for inactive admins who never logged in */}
                        {!admin.is_active && !admin.last_login_at && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={deleteAdminPermanently.isPending}
                                title="Permanently delete orphaned admin"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently Delete Admin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {admin.name}'s admin record and auth account. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAdminPermanently.mutateAsync(admin.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {admins?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No administrators found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update administrator details for {editingAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingAdmin(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAdmin.isPending}>
                  {updateAdmin.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Activation Link Dialog */}
      <Dialog open={!!activationLink} onOpenChange={(open) => !open && closeActivationDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Activation Link Generated
            </DialogTitle>
            <DialogDescription>
              Share this link with <strong>{invitedEmail}</strong> to complete their account setup.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Activation Link:</p>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={activationLink || ''} 
                  className="font-mono text-xs bg-background"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy the link above</li>
                <li>Send it to the new admin via WhatsApp, SMS, or other secure channel</li>
                <li>They will use the link to set their password and activate their account</li>
              </ol>
              <p className="text-amber-500 text-xs mt-3">
                ⚠️ This link expires in 24 hours.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSendViaEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              Send via Email
            </Button>
            <Button onClick={closeActivationDialog}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
