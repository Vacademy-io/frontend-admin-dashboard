// src/types/file-upload.ts

import { Control, FieldValues, Path } from "react-hook-form";
import { MutableRefObject } from "react";

export type FileType = "image/*" | "application/pdf" | "video/*" | "audio/*";
export interface FileUploadComponentProps<T extends FieldValues> {
    fileInputRef: MutableRefObject<HTMLInputElement | null>;
    onFileSubmit: (file: File) => void;
    control: Control<T>;
    name: Path<T>;
    acceptedFileTypes?: FileType | FileType[];
    children?: React.ReactNode;
    isUploading?: boolean;
    error?: string | null;
    className?: string; // Add this line
}
