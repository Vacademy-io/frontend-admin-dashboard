// src/components/design-system/image-cropper-dialog.tsx
import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { Cropper, CropperRef, RectangleStencil } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

export interface ImageCropperDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    src: string;
    aspectRatio?: number; // e.g., 2 for 2:1, 2.64 for 2.64:1
    title?: string;
    outputMimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
    outputQuality?: number; // 0..1 for jpeg/webp
    confirmLabel?: string;
    cancelLabel?: string;
    onCropped: (file: File) => void;
}

export const ImageCropperDialog = ({
    open,
    onOpenChange,
    src,
    aspectRatio,
    title = 'Crop Image',
    outputMimeType = 'image/jpeg',
    outputQuality = 0.92,
    confirmLabel = 'Save',
    cancelLabel = 'Cancel',
    onCropped,
}: ImageCropperDialogProps) => {
    const cropperRef = useRef<CropperRef>(null);

    const handleConfirm = () => {
        const canvas = cropperRef.current?.getCanvas();
        if (!canvas) return;
        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], 'cropped-image.' + mimeToExt(outputMimeType), {
                    type: outputMimeType,
                });
                onCropped(file);
                onOpenChange(false);
            },
            outputMimeType,
            outputQuality
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="z-[10000] flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col p-0">
                <DialogHeader className="p-4">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden px-4 pb-4">
                    <div className="size-full">
                        <Cropper
                            ref={cropperRef}
                            src={src}
                            className={'size-full'}
                            stencilComponent={RectangleStencil}
                            stencilProps={{
                                aspectRatio,
                                previewClassName: 'rounded-md',
                            }}
                            backgroundClassName={'bg-neutral-100'}
                            transitions={true}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t p-4">
                    <MyButton
                        type="button"
                        buttonType="secondary"
                        layoutVariant="default"
                        scale="medium"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </MyButton>
                    <MyButton
                        type="button"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="medium"
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

function mimeToExt(mime: string) {
    if (mime === 'image/png') return 'png';
    if (mime === 'image/webp') return 'webp';
    return 'jpg';
}

export default ImageCropperDialog;
