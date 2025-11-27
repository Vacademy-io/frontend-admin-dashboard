import { useEffect, useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import type { PlanningFormData, IntervalType } from '../-types/types';
import { generateIntervalTypeId } from '../-utils/intervalTypeIdGenerator';
import PlanningHTMLEditor from './PlanningHTMLEditor';
import IntervalSelector from './IntervalSelector';
import { MyDropdown } from '@/components/design-system/dropdown';
import { MyInput } from '@/components/design-system/input';
import { MyLabel } from '@/components/design-system/my-lable';
import { UploadFileInS3 } from '@/services/upload_file';
import { getUserId } from '@/utils/userDetails';
import { Button } from '@/components/ui/button';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';

interface PlanningFormSection2Props {
    data: PlanningFormData;
    onChange: (data: Partial<PlanningFormData>) => void;
}

export default function PlanningFormSection2({ data, onChange }: PlanningFormSection2Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string }>>([]);

    // Auto-generate interval_type_id when interval type or date changes
    useEffect(() => {
        if (data.interval_type && data.selectedDate) {
            const generatedId = generateIntervalTypeId(data.interval_type, data.selectedDate);
            onChange({ interval_type_id: generatedId });
        }
    }, [data.interval_type, data.selectedDate]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const userId = getUserId();
            const fileId = await UploadFileInS3(
                file,
                () => {},
                userId,
                'PLANNING',
                'PLANNING_LOGS',
                true
            );

            if (fileId) {
                const newFile = { id: fileId, name: file.name };
                setUploadedFiles([...uploadedFiles, newFile]);
                onChange({ uploadedFileIds: [...data.uploadedFileIds, fileId] });
            }
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        const newFileIds = data.uploadedFileIds.filter((_, i) => i !== index);
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        onChange({ uploadedFileIds: newFileIds });
    };

    const intervalOptions = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly (Day)', value: 'weekly' },
        { label: 'Weekly (Week of Month)', value: 'monthly' },
        { label: 'Monthly', value: 'yearly_month' },
        { label: 'Quarterly', value: 'yearly_quarter' },
    ];

    const currentInterval = intervalOptions.find((opt) => opt.value === data.interval_type);

    return (
        <div className="grid gap-4">
            {/* Content HTML Editor */}
            <div className="space-y-2">
                <MyLabel required>Content</MyLabel>
                <PlanningHTMLEditor
                    value={data.content_html}
                    onChange={(html) => onChange({ content_html: html })}
                />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
                <MyLabel>Add Files</MyLabel>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors"
                >
                    <div className="flex flex-col items-center justify-center gap-2">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Click to upload file
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Uploaded Files:</p>
                        <div className="space-y-1">
                            {uploadedFiles.map((file, index) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between rounded-md border bg-muted/50 p-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{file.name}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFile(index)}
                                        className="h-6 w-6"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
