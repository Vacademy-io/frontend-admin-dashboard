import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MyButton } from '@/components/design-system/button';
import { TagInput } from '@/components/ui/tag-input';
import { Image as ImageIcon, Upload, Link, X } from 'lucide-react';

interface CourseMetadata {
    courseName?: string;
    courseDescription?: string;
    mediaImageUrl?: string;
    tags?: string[];
    [key: string]: any;
}

interface MetadataDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    metadata: CourseMetadata | null;
    onSave: (metadata: CourseMetadata) => void;
}

export const MetadataDialog: React.FC<MetadataDialogProps> = ({
    open,
    onOpenChange,
    metadata,
    onSave,
}) => {
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [mediaImageUrl, setMediaImageUrl] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');

    useEffect(() => {
        if (metadata) {
            setCourseName(metadata.courseName || '');
            setCourseDescription(metadata.courseDescription || '');
            setMediaImageUrl(metadata.mediaImageUrl || '');
            setTags(metadata.tags || []);
        }
    }, [metadata, open]);

    const handleSave = () => {
        onSave({
            ...metadata,
            courseName,
            courseDescription,
            mediaImageUrl,
            tags,
        });
        onOpenChange(false);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col p-0 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Course Details</DialogTitle>
                    <DialogDescription>
                        Edit your course metadata and thumbnail
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {/* Course Thumbnail */}
                    <div>
                        <Label className="mb-2 block">Course Thumbnail</Label>
                        <div className="space-y-3">
                            {/* Preview */}
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                                {mediaImageUrl ? (
                                    <>
                                        <img
                                            src={mediaImageUrl}
                                            alt="Course thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => setMediaImageUrl('')}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-neutral-400" />
                                    </div>
                                )}
                            </div>

                            {/* Input Mode Toggle */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setImageInputMode('url')}
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                                        imageInputMode === 'url'
                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                            : 'bg-neutral-100 text-neutral-600 border border-transparent hover:bg-neutral-200'
                                    }`}
                                >
                                    <Link className="h-3.5 w-3.5 inline mr-1" />
                                    URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageInputMode('upload')}
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                                        imageInputMode === 'upload'
                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                            : 'bg-neutral-100 text-neutral-600 border border-transparent hover:bg-neutral-200'
                                    }`}
                                >
                                    <Upload className="h-3.5 w-3.5 inline mr-1" />
                                    Upload
                                </button>
                            </div>

                            {/* URL Input or Upload */}
                            {imageInputMode === 'url' ? (
                                <Input
                                    value={mediaImageUrl}
                                    onChange={(e) => setMediaImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            ) : (
                                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="thumbnail-upload"
                                    />
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="cursor-pointer text-sm text-neutral-600"
                                    >
                                        <Upload className="h-5 w-5 mx-auto mb-2 text-neutral-400" />
                                        Click to upload image
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course Name */}
                    <div>
                        <Label htmlFor="courseName" className="mb-2 block">
                            Course Name
                        </Label>
                        <Input
                            id="courseName"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Enter course name"
                        />
                    </div>

                    {/* Course Description */}
                    <div>
                        <Label htmlFor="courseDescription" className="mb-2 block">
                            Course Description
                        </Label>
                        <Textarea
                            id="courseDescription"
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            placeholder="Enter course description"
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <Label className="mb-2 block">Tags</Label>
                        <TagInput
                            tags={tags}
                            onChange={setTags}
                            placeholder="Add tags..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <MyButton buttonType="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </MyButton>
                    <MyButton buttonType="primary" onClick={handleSave}>
                        Save Changes
                    </MyButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
