import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUploadAvatar } from '@/hooks/useUpdateMemberProfile';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  name: string;
  className?: string;
}

export function AvatarUpload({ currentAvatarUrl, name, className }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        toast.success('Avatar updated successfully');
        setPreviewUrl(null);
      },
      onError: () => {
        toast.error('Failed to upload avatar');
        setPreviewUrl(null);
      },
    });
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={displayUrl} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadAvatar.isPending}
        >
          {uploadAvatar.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Tap to change photo
      </p>
    </div>
  );
}
