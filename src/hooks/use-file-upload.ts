import { useMutation } from "@tanstack/react-query";
import { UploadFileInS3, getPublicUrl } from "@/services/upload_file";

export const useFileUpload = () => {
    const uploadMutation = useMutation({
        mutationFn: async ({
            file,
            setIsUploading,
            userId,
            source,
            sourceId,
        }: {
            file: File;
            setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
            userId: string;
            source?: string;
            sourceId?: string;
        }) => {
            try {
                return await UploadFileInS3(file, setIsUploading, userId, source, sourceId);
            } catch (error) {
                console.error("Upload error:", error);
                throw error;
            }
        },
    });

    const getUrlMutation = useMutation({
        mutationFn: async (fileId: string) => {
            try {
                return await getPublicUrl(fileId);
            } catch (error) {
                console.error("Get URL error:", error);
                throw error;
            }
        },
    });

    return {
        uploadFile: uploadMutation.mutateAsync,
        getPublicUrl: getUrlMutation.mutateAsync,
        isUploading: uploadMutation.isPending,
        isGettingUrl: getUrlMutation.isPending,
        error: uploadMutation.error || getUrlMutation.error,
    };
};
