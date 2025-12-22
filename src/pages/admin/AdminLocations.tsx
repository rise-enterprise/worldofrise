import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { MapPin, Plus, Edit, Coffee, Utensils } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  name_ar: string | null;
  brand: string;
  city: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminLocations() {
  const { hasPermission, logAudit } = useAdminAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    brand: 'noir',
    city: 'doha',
    address: '',
    is_active: true,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('brand', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      logger.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      name_ar: '',
      brand: 'noir',
      city: 'doha',
      address: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      name_ar: location.name_ar || '',
      brand: location.brand,
      city: location.city,
      address: location.address || '',
      is_active: location.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!hasPermission('locations')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to manage locations',
        variant: 'destructive',
      });
      return;
    }

    try {
      const locationData = {
        name: formData.name,
        name_ar: formData.name_ar || null,
        brand: formData.brand as 'noir' | 'sasso',
        city: formData.city as 'doha' | 'riyadh',
        address: formData.address || null,
        is_active: formData.is_active,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', editingLocation.id);

        if (error) throw error;
        await logAudit('update', 'location', editingLocation.id, editingLocation, locationData);
        toast({ title: 'Location Updated', description: 'Location saved successfully' });
      } else {
        const { error } = await supabase
          .from('locations')
          .insert(locationData);

        if (error) throw error;
        await logAudit('create', 'location');
        toast({ title: 'Location Created', description: 'New location added successfully' });
      }

      setDialogOpen(false);
      fetchLocations();
    } catch (error) {
      logger.error('Error saving location:', error);
      toast({
        title: 'Error',
        description: 'Failed to save location',
        variant: 'destructive',
      });
    }
  };

  const noirLocations = locations.filter(l => l.brand === 'noir');
  const sassoLocations = locations.filter(l => l.brand === 'sasso');

  const brandColors: Record<string, string> = {
    noir: 'bg-noir border-noir-accent',
    sasso: 'bg-sasso border-sasso-accent',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage Noir and SASSO branch locations</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Locations</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-noir-accent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Noir Branches</p>
                <p className="text-2xl font-bold">{noirLocations.length}</p>
              </div>
              <Coffee className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sasso-accent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SASSO Branches</p>
                <p className="text-2xl font-bold">{sassoLocations.length}</p>
              </div>
              <Utensils className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations by Brand */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Noir Locations */}
          <Card className="border-t-4 border-t-noir-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Noir Café / Chocolatier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {noirLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{location.city}</span>
                          {location.name_ar && (
                            <span dir="rtl">• {location.name_ar}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={location.is_active ? 'default' : 'secondary'}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(location)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {noirLocations.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No Noir locations</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SASSO Locations */}
          <Card className="border-t-4 border-t-sasso-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                SASSO Italian Fine Dining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sassoLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{location.city}</span>
                          {location.name_ar && (
                            <span dir="rtl">• {location.name_ar}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={location.is_active ? 'default' : 'secondary'}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(location)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {sassoLocations.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No SASSO locations</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Create Location'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="West Walk"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="ويست ووك"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noir">Noir Café</SelectItem>
                    <SelectItem value="sasso">SASSO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doha">Doha, Qatar</SelectItem>
                    <SelectItem value="riyadh">Riyadh, Saudi Arabia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingLocation ? 'Save Changes' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
