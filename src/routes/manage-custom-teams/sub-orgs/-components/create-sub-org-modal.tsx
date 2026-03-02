import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createSubOrg } from '../../-services/custom-team-services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import PhoneInputField from '@/components/design-system/phone-input-field';

const subOrgSchema = z.object({
    instituteName: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    instituteLogoFileId: z.string().optional(),
});

type SubOrgFormValues = z.infer<typeof subOrgSchema>;

interface CreateSubOrgModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateSubOrgModal({ open, onOpenChange, onSuccess }: CreateSubOrgModalProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile, isUploading } = useFileUpload();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [, setLocalUploading] = useState(false);

    const token = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(token);
    const currentUserId = tokenData?.user ?? '';
    const instituteId = getCurrentInstituteId();

    const form = useForm<SubOrgFormValues>({
        resolver: zodResolver(subOrgSchema),
        defaultValues: {
            phone: '',
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = form;

    const mutation = useMutation({
        mutationFn: createSubOrg,
        onSuccess: () => {
            toast.success('Sub-organization created successfully');
            queryClient.invalidateQueries({ queryKey: ['sub-orgs-list', instituteId] });
            reset();
            setLogoPreview(null);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create sub-organization');
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const fileId = await uploadFile({
                file,
                setIsUploading: setLocalUploading,
                userId: currentUserId || 'admin',
                source: instituteId || 'FLOOR_DOCUMENTS',
                sourceId: 'STUDENTS',
                publicUrl: true,
            });

            if (fileId && typeof fileId === 'string') {
                setValue('instituteLogoFileId', fileId);
                toast.success('Logo uploaded successfully');
            } else {
                toast.error('Upload did not return a file ID');
            }
        } catch (err) {
            toast.error('Failed to upload logo');
            console.error(err);
        }
        e.target.value = '';
    };

    const onSubmit = (data: SubOrgFormValues) => {
        mutation.mutate({
            institute_name: data.instituteName,
            email: data.email,
            phone: data.phone,
            institute_logo_file_id: data.instituteLogoFileId,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[600px] md:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Create Sub-Organization</DialogTitle>
                    <DialogDescription>
                        Add a new sub-organization to your institute.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex flex-col items-center gap-2 sm:col-span-2">
                                <Label className="text-sm font-medium">Logo</Label>
                                <div className="relative flex h-28 w-28 flex-col items-center justify-center overflow-hidden rounded-full border border-input bg-muted">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-muted-foreground">
                                            <UploadCloud size={36} />
                                        </span>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    aria-label="Upload logo"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UploadCloud className="mr-2 h-4 w-4" />
                                    )}
                                    {isUploading ? 'Uploading…' : 'Upload Logo'}
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    {...register('instituteName')}
                                    placeholder="Sub-Org Name"
                                />
                                {errors.instituteName && (
                                    <p className="text-sm text-destructive">
                                        {errors.instituteName.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="admin@suborg.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <PhoneInputField
                                    label="Phone"
                                    name="phone"
                                    placeholder="123 456 7890"
                                    control={control}
                                    country="in"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending || isUploading}
                            >
                                {(mutation.isPending || isUploading) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
