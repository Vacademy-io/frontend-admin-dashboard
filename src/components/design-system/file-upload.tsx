// // components/FileUploadComponent.tsx
// import { FieldValues } from "react-hook-form";
// import { FormControl, FormField, FormItem } from "../ui/form";
// import { Input } from "../ui/input";
// import { FileUploadComponentProps } from "@/types/file-upload";
// import { useDropzone } from "react-dropzone";
// import { useCallback } from "react";

// export const FileUploadComponent = <T extends FieldValues>({
//     fileInputRef,
//     onFileSubmit,
//     control,
//     name,
//     acceptedFileTypes,
//     children,
//     isUploading,
//     error,
// }: FileUploadComponentProps<T>) => {
//     const onDrop = useCallback((acceptedFiles: File[]) => {
//         const file = acceptedFiles[0];
//         if (file) {
//             onFileSubmit(file);
//         }
//     }, [onFileSubmit]);

//     // Convert acceptedFileTypes to the format expected by react-dropzone
//     const getAcceptObject = () => {
//         if (!acceptedFileTypes) return undefined;

//         const types = Array.isArray(acceptedFileTypes) ? acceptedFileTypes : [acceptedFileTypes];
//         return types.reduce((acc, type) => ({
//             ...acc,
//             [type]: []
//         }), {});
//     };

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         onDrop,
//         accept: getAcceptObject(),
//         maxFiles: 1,
//         multiple: false,
//         disabled: isUploading
//     });

//     return (
//         <FormField
//             control={control}
//             name={name}
//             render={() => (
//                 <FormItem>
//                     <FormControl>
//                         <div
//                             {...getRootProps()}
//                             className={`
//                                 relative border-2 border-dashed rounded-lg p-6
//                                 min-h-[200px] flex flex-col items-center justify-center
//                                 cursor-pointer transition-all duration-200
//                                 ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}
//                                 ${error ? 'border-red-500' : ''}
//                                 ${isUploading ? 'cursor-not-allowed opacity-60' : ''}
//                             `}
//                         >
//                             <input
//                                 {...getInputProps()}
//                                 ref={fileInputRef}
//                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                             />
//                             {children}
//                             {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
//                         </div>
//                     </FormControl>
//                 </FormItem>
//             )}
//         />
//     );
// };
import { FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem } from "../ui/form";
import { FileUploadComponentProps } from "@/types/file-upload";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

export const FileUploadComponent = <T extends FieldValues>({
    fileInputRef,
    onFileSubmit,
    control,
    name,
    acceptedFileTypes,
    children,
    isUploading,
    error,
}: FileUploadComponentProps<T>) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                onFileSubmit(file);
            }
        },
        [onFileSubmit],
    );

    const getAcceptObject = () => {
        if (!acceptedFileTypes) return undefined;

        const types = Array.isArray(acceptedFileTypes) ? acceptedFileTypes : [acceptedFileTypes];
        return types.reduce(
            (acc, type) => ({
                ...acc,
                [type]: [],
            }),
            {},
        );
    };

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: getAcceptObject(),
        maxFiles: 1,
        multiple: false,
        disabled: isUploading,
        noClick: true,
    });

    const handleClick = () => {
        if (!isUploading) {
            open();
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={() => (
                <FormItem>
                    <FormControl>
                        <div
                            {...getRootProps()}
                            onClick={handleClick}
                            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-200 ${
                                isDragActive
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-gray-300 hover:border-primary-500"
                            } ${error ? "border-red-500" : ""} ${
                                isUploading ? "cursor-not-allowed opacity-60" : ""
                            } `}
                        >
                            <input
                                {...getInputProps()}
                                ref={(instance) => {
                                    if (instance) {
                                        fileInputRef.current = instance;
                                    }
                                }}
                                className="hidden"
                            />
                            {children}
                            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>
                    </FormControl>
                </FormItem>
            )}
        />
    );
};
