// types/file-upload.ts
import { Control, FieldValues, Path } from "react-hook-form";

export type FileType = "image/*" | "application/pdf" | "video/*" | "audio/*";

export interface FileUploadComponentProps<T extends FieldValues> {
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSubmit: (file: File) => void;
    control: Control<T>;
    name: Path<T>;
    acceptedFileTypes?: FileType | FileType[]; // Optional prop
}
