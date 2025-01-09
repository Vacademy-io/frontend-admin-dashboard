// // types/file-upload.ts
// import { Control, FieldValues, Path } from "react-hook-form";

// export type FileType = 'image/*' | 'application/pdf' | 'video/*' | 'audio/*';

// export interface FileUploadComponentProps<T extends FieldValues> {
//     fileInputRef: React.RefObject<HTMLInputElement>;
//     onFileSubmit: (file: File) => void;
//     control: Control<T>;
//     name: Path<T>;
//     acceptedFileTypes?: FileType | FileType[];
//     children?: React.ReactNode;
//     isUploading?: boolean;
//     error?: string | null;
// }

import { Control, FieldValues, Path } from "react-hook-form";
import { MutableRefObject } from "react";

export type FileType = "image/*" | "application/pdf" | "video/*" | "audio/*";

export interface FileUploadComponentProps<T extends FieldValues> {
    fileInputRef: MutableRefObject<HTMLInputElement | null>; // Changed from RefObject to MutableRefObject
    onFileSubmit: (file: File) => void;
    control: Control<T>;
    name: Path<T>;
    acceptedFileTypes?: FileType | FileType[];
    children?: React.ReactNode;
    isUploading?: boolean;
    error?: string | null;
}
