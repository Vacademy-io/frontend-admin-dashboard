import { useFileUpload } from "@/hooks/use-file-upload";
import { base64ToFile } from "./getBase64ToBlobFormat";
import { useCallback } from "react";

// Custom hook
export function useReplaceBase64ImagesWithNetworkUrls() {
    const { uploadFile, getPublicUrl } = useFileUpload();

    const replaceImages = useCallback(
        async (htmlContent: string): Promise<string> => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
            const images = doc.getElementsByTagName("img");

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const src = img?.getAttribute("src");

                if (src && src.startsWith("data:image")) {
                    try {
                        const file = base64ToFile(src);
                        const uploadedFileId = await uploadFile({
                            file,
                            setIsUploading: () => {},
                            userId: "your-user-id", // Replace with actual user ID
                            source: "YOUR_SOURCE", // Replace with your source
                            sourceId: "YOUR_SOURCE_ID", // Replace with your source ID
                            publicUrl: true,
                        });

                        if (uploadedFileId) {
                            const publicUrl = await getPublicUrl(uploadedFileId);
                            img?.setAttribute("src", publicUrl);
                        }
                    } catch (error) {
                        console.error("Error processing image:", error);
                    }
                }
            }

            return doc.documentElement.outerHTML;
        },
        [uploadFile, getPublicUrl],
    );

    return replaceImages;
}
