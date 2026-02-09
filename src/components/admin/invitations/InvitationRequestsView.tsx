import { useState } from 'react';
import { format } from 'date-fns';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import {
  useInvitationRequests,
  useRejectedRequests,
  useConfirmInvitation,
  useRejectInvitation,
  useReconsiderRejection,
} from '@/hooks/useInvitationRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmInvitationDialog } from './ConfirmInvitationDialog';
import { RejectInvitationDialog } from './RejectInvitationDialog';
import { Check, X, RotateCcw, Clock, UserPlus, UserX } from 'lucide-react';

export function InvitationRequestsView() {
  const { admin } = useAdminAuthContext();
  const { data: requests, isLoading: requestsLoading } = useInvitationRequests();
  const { data: rejectedRequests, isLoading: rejectedLoading } = useRejectedRequests();
  const confirmInvitation = useConfirmInvitation();
  const rejectInvitation = useRejectInvitation();
  const reconsiderRejection = useReconsiderRejection();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const pendingRequests = requests?.filter((r) => r.status === 'pending') || [];
  const reviewedRequests = requests?.filter((r) => r.status !== 'pending') || [];
  const reconsiderableRejections = rejectedRequests?.filter((r) => r.can_reconsider) || [];

  const handleConfirmClick = (request: any) => {
    setSelectedRequest(request);
    setConfirmDialogOpen(true);
  };

  const handleRejectClick = (request: any) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedRequest || !admin) return;
    confirmInvitation.mutate({
      requestId: selectedRequest.id,
      adminId: admin.id,
    });
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (reason: string) => {
    if (!selectedRequest || !admin) return;
    rejectInvitation.mutate({
      requestId: selectedRequest.id,
      rejectionReason: reason,
      adminId: admin.id,
    });
    setRejectDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReconsider = (rejectedId: string) => {
    if (!admin) return;
    reconsiderRejection.mutate({
      rejectedId,
      adminId: admin.id,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500/20 text-green-400 border-green-500/30"><Check className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (requestsLoading || rejectedLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">Invitation Requests</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage membership applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{pendingRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">
              {reviewedRequests.filter((r) => r.status === 'approved').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="h-4 w-4 text-destructive" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{reconsiderableRejections.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Can Reconsider ({reconsiderableRejections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Preferred Brand</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{request.email}</TableCell>
                      <TableCell className="text-muted-foreground">{request.phone || '—'}</TableCell>
                      <TableCell>
                        {request.preferred_brand ? (
                          <Badge variant="outline" className="capitalize">
                            {request.preferred_brand}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {request.created_at
                          ? format(new Date(request.created_at), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => handleConfirmClick(request)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRejectClick(request)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No pending requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{request.email}</TableCell>
                      <TableCell>{getStatusBadge(request.status || '')}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {request.reviewed_at
                          ? format(new Date(request.reviewed_at), 'MMM d, yyyy HH:mm')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {reviewedRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No reviewed requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>
                Previously rejected applicants that can be reconsidered for membership
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconsiderableRejections.map((rejection) => (
                    <TableRow key={rejection.id}>
                      <TableCell className="font-medium">{rejection.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{rejection.email}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {rejection.rejection_reason}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {rejection.rejected_at
                          ? format(new Date(rejection.rejected_at), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleReconsider(rejection.id)}
                          disabled={reconsiderRejection.isPending}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reconsider
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reconsiderableRejections.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No rejected requests available for reconsideration.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmInvitationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        request={selectedRequest}
        onConfirm={handleConfirm}
        isLoading={confirmInvitation.isPending}
      />

      <RejectInvitationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        request={selectedRequest}
        onReject={handleReject}
        isLoading={rejectInvitation.isPending}
      />
    </div>
  );
}
