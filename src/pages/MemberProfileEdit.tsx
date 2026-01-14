import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Globe, Heart, Save } from 'lucide-react';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/member/AvatarUpload';
import { useDemoMember } from '@/hooks/useMembers';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long').optional().or(z.literal('')),
  phone: z.string().trim().min(8, 'Phone number too short').max(20, 'Phone number too long'),
  city: z.enum(['doha', 'riyadh']),
  brand_affinity: z.enum(['noir', 'sasso', 'both']),
  preferred_language: z.enum(['ar', 'en']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function MemberProfileEdit() {
  const navigate = useNavigate();
  const { data: member, isLoading } = useDemoMember();

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    city: 'doha',
    brand_affinity: 'both',
    preferred_language: 'en',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        city: member.country === 'doha' ? 'doha' : 'riyadh',
        brand_affinity: member.favoriteBrand === 'noir' ? 'noir' : member.favoriteBrand === 'sasso' ? 'sasso' : 'both',
        preferred_language: 'en',
      });
    }
  }, [member]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      toast.success('Profile updated successfully');
      setIsSaving(false);
      navigate('/member');
    }, 500);
  };

  if (isLoading) {
    return (
      <CrystalPageWrapper variant="subtle" sparkleCount={10}>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </CrystalPageWrapper>
    );
  }

  return (
    <CrystalPageWrapper variant="subtle" sparkleCount={15}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-primary/10">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/member')} className="hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-display font-semibold text-foreground tracking-crystal">Edit Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-6 pb-8">
        {/* Avatar Upload */}
        <Card className="crystal-panel">
          <CardContent className="py-6">
            <AvatarUpload 
              currentAvatarUrl={member?.avatarUrl}
              name={formData.full_name || 'Member'}
            />
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="crystal-panel">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 font-display tracking-crystal">
              <User className="h-4 w-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className={`bg-background/50 border-primary/20 focus:border-primary/50 ${errors.full_name ? 'border-destructive' : ''}`}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-primary" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                className={`bg-background/50 border-primary/20 focus:border-primary/50 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+974 XXXX XXXX"
                className={`bg-background/50 border-primary/20 focus:border-primary/50 ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="crystal-panel">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 font-display tracking-crystal">
              <Globe className="h-4 w-4 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.city}
              onValueChange={(value) => handleChange('city', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="doha" id="doha" className="border-primary/30" />
                <Label htmlFor="doha" className="cursor-pointer">Doha, Qatar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="riyadh" id="riyadh" className="border-primary/30" />
                <Label htmlFor="riyadh" className="cursor-pointer">Riyadh, Saudi Arabia</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="crystal-panel">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 font-display tracking-crystal">
              <Heart className="h-4 w-4 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Brand</Label>
              <RadioGroup
                value={formData.brand_affinity}
                onValueChange={(value) => handleChange('brand_affinity', value)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="noir" id="noir" className="border-primary/30" />
                  <Label htmlFor="noir" className="cursor-pointer">Noir</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sasso" id="sasso" className="border-primary/30" />
                  <Label htmlFor="sasso" className="cursor-pointer">Sasso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" className="border-primary/30" />
                  <Label htmlFor="both" className="cursor-pointer">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select
                value={formData.preferred_language}
                onValueChange={(value) => handleChange('preferred_language', value)}
              >
                <SelectTrigger className="bg-background/50 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="vip-gold"
          className="w-full gap-2" 
          size="lg"
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </CrystalPageWrapper>
  );
}
