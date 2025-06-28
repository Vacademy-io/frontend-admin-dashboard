import { ImportFileImage } from '@/assets/svgs';
import { MyButton } from '@/components/design-system/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useSlides } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { useRouter } from '@tanstack/react-router';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { MyInput } from '@/components/design-system/input';
import * as pdfjs from 'pdfjs-dist';
import { CheckCircle, FilePdf } from '@phosphor-icons/react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

// Set the workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FormData {
    pdfFile: FileList | null;
    pdfTitle: string;
}

export const AddPdfDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const route = useRouter();
    const { courseId, levelId, chapterId, moduleId, subjectId, sessionId } =
        route.state.location.search;
    const { getPackageSessionId } = useInstituteDetailsStore();
    const { addUpdateDocumentSlide } = useSlides(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );
    const { setActiveItem, getSlideById } = useContentStore();

    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            pdfFile: null,
            pdfTitle: '',
        },
    });

    const { uploadFile, getPublicUrl } = useFileUpload();

    const handleFileSubmit = async (selectedFile: File) => {
        if (!selectedFile.type.includes('pdf')) {
            setError('Please upload only PDF files');
            return;
        }

        setError(null);
        setFile(selectedFile);
        form.setValue('pdfFile', [selectedFile] as unknown as FileList);

        // Auto-populate title from filename
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
        form.setValue('pdfTitle', fileName);

        // Get PDF page count
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            setPdfPageCount(numPages);
            toast.success(
                `PDF selected successfully. ${numPages} page${numPages > 1 ? 's' : ''} detected.`
            );
        } catch (err) {
            console.error('Error reading PDF:', err);
            setPdfPageCount(null);
            toast.success('PDF selected successfully');
        }
    };

    const handleUpload = async (data: FormData) => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            // Get PDF page count
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdf.numPages;

            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: 'your-user-id',
                source: INSTITUTE_ID,
                sourceId: 'PDF_DOCUMENTS',
            });

            if (fileId) {
                const url = await getPublicUrl(fileId);
                setFileUrl(url);
                setFile(null);
                form.reset();
                const slideId = crypto.randomUUID();

                const response: string = await addUpdateDocumentSlide({
                    id: slideId,
                    title: data.pdfTitle,
                    image_file_id: '',
                    description: null,
                    slide_order: 0,
                    document_slide: {
                        id: crypto.randomUUID(),
                        type: 'PDF',
                        data: fileId,
                        title: data.pdfTitle,
                        cover_file_id: '',
                        total_pages: totalPages,
                        published_data: null,
                        published_document_total_pages: 0,
                    },
                    status: 'DRAFT',
                    new_slide: true,
                    notify: false,
                });

                if (response) {
                    setTimeout(() => {
                        setActiveItem(getSlideById(response));
                    }, 500);
                    openState?.(false);
                    toast.success('PDF uploaded successfully!');
                }
            }

            clearInterval(progressInterval);
            setUploadProgress(100);
            openState && openState(false);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Upload failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        setFile(null);
        setError(null);
        setUploadProgress(0);
        setFileUrl(null);
        setPdfPageCount(null);
        form.reset();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpload)} className="flex flex-col gap-6 p-6">
                {/* Enhanced File Upload Area */}
                <div className="space-y-4">
                    <FileUploadComponent
                        fileInputRef={fileInputRef}
                        onFileSubmit={handleFileSubmit}
                        control={form.control}
                        name="pdfFile"
                        acceptedFileTypes={['application/pdf']}
                        isUploading={isUploading}
                        error={error}
                        className={`
                            flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-8
                            transition-all duration-300 ease-in-out
                            ${
                                file
                                    ? 'border-green-300 bg-green-50/50'
                                    : 'border-primary-300 bg-primary-50/30 hover:border-primary-400 hover:bg-primary-50/50'
                            }
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20
                        `}
                    >
                        <div className="pointer-events-none flex flex-col items-center gap-4">
                            {file ? (
                                <div className="flex items-center gap-3 duration-500 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="rounded-full bg-green-100 p-3">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-wrap font-medium text-green-700">
                                            {file.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            {pdfPageCount && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                                                        {pdfPageCount} page
                                                        {pdfPageCount > 1 ? 's' : ''}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-center">
                                    <div className="mx-auto w-fit animate-pulse rounded-full bg-primary-100 p-4">
                                        <FilePdf className="text-primary-600 h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="mb-1 font-medium text-neutral-700">
                                            Drop your PDF here, or click to browse
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Supports PDF files up to 10MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FileUploadComponent>

                    {/* Error Display */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 duration-300 animate-in fade-in slide-in-from-top-2">
                            <p className="flex items-center gap-2 text-sm text-red-600">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                {error}
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Display */}
                {isUploading && (
                    <div className="space-y-3 duration-300 animate-in fade-in slide-in-from-bottom-2">
                        <Progress
                            value={uploadProgress}
                            className="[&>div]:to-primary-600 h-2 bg-neutral-200 [&>div]:bg-gradient-to-r [&>div]:from-primary-500"
                        />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Uploading PDF...</span>
                            <span className="text-primary-600 font-medium">{uploadProgress}%</span>
                        </div>
                    </div>
                )}

                {/* Title Input */}
                <FormField
                    control={form.control}
                    name="pdfTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    {...field}
                                    label="Document Title"
                                    required={true}
                                    input={field.value}
                                    inputType="text"
                                    inputPlaceholder="Enter a descriptive title"
                                    onChangeFunction={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Enhanced Footer */}
                <DialogFooter className="flex w-full items-center justify-between border-t border-neutral-100 pt-4">
                    <div className="text-xs text-neutral-500">
                        {file && (
                            <span className="flex items-center gap-1">
                                <FilePdf className="h-3 w-3" />
                                Ready to upload
                            </span>
                        )}
                    </div>
                    <MyButton
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        type="submit"
                        disabled={!file || isUploading || !form.watch('pdfTitle')}
                        className={`
                            transition-all duration-300 ease-in-out
                            ${
                                !file || isUploading || !form.watch('pdfTitle')
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'shadow-lg hover:scale-105 hover:shadow-xl active:scale-95'
                            }
                        `}
                    >
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Uploading...
                            </div>
                        ) : (
                            'Upload PDF'
                        )}
                    </MyButton>
                </DialogFooter>
            </form>
        </Form>
    );
};
