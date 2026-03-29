import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Globe, Heart, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/member/AvatarUpload';
import { useMyMember } from '@/hooks/useMyMember';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  phone: z.string().trim().min(8, 'Phone too short').max(20, 'Phone too long'),
  city: z.enum(['doha', 'riyadh']),
  brand_affinity: z.enum(['noir', 'sasso', 'both']),
  preferred_language: z.enum(['ar', 'en']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function MemberProfileEdit() {
  const navigate = useNavigate();
  const { data: member, isLoading } = useMyMember();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '', email: '', phone: '', city: 'doha', brand_affinity: 'both', preferred_language: 'en',
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setIsSaving(true);
    setTimeout(() => { toast.success('Profile updated'); setIsSaving(false); navigate('/member'); }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-lg mx-auto space-y-4 pt-16">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  const Section = ({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/15 bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/10 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary/70" />
        <h3 className="font-display text-sm font-medium text-foreground tracking-crystal">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/15">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/member')} className="hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-display font-medium text-foreground tracking-crystal">Edit Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-5 pb-8">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/15 bg-card/40 backdrop-blur-sm p-6">
          <AvatarUpload currentAvatarUrl={member?.avatarUrl} name={formData.full_name || 'Member'} />
        </motion.div>

        <Section icon={User} title="Personal Information">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)}
              placeholder="Enter your full name" className={errors.full_name ? 'border-destructive' : ''} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary/60" />Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)}
              placeholder="your@email.com" className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-primary/60" />Phone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)}
              placeholder="+974 XXXX XXXX" className={errors.phone ? 'border-destructive' : ''} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </Section>

        <Section icon={Globe} title="Location">
          <RadioGroup value={formData.city} onValueChange={v => handleChange('city', v)} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doha" id="doha" />
              <Label htmlFor="doha" className="cursor-pointer">Doha, Qatar</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="riyadh" id="riyadh" />
              <Label htmlFor="riyadh" className="cursor-pointer">Riyadh, Saudi Arabia</Label>
            </div>
          </RadioGroup>
        </Section>

        <Section icon={Heart} title="Preferences">
          <div className="space-y-2">
            <Label>Preferred Brand</Label>
            <RadioGroup value={formData.brand_affinity} onValueChange={v => handleChange('brand_affinity', v)} className="flex flex-wrap gap-4">
              {['noir', 'sasso', 'both'].map(b => (
                <div key={b} className="flex items-center space-x-2">
                  <RadioGroupItem value={b} id={b} />
                  <Label htmlFor={b} className="cursor-pointer capitalize">{b}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={formData.preferred_language} onValueChange={v => handleChange('preferred_language', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <button type="submit" disabled={isSaving}
          className="w-full py-3 rounded-xl text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-shadow)))' }}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
