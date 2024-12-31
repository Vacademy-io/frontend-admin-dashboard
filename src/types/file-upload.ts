import React from "react";
import { Control, FieldValues, Path } from "react-hook-form";

export interface FileUploadComponentProps<T extends FieldValues> {
    fileInputRef?: React.RefObject<HTMLInputElement>;
    onFileSubmit: (file: File) => void;
    control: Control<T>;
    name: Path<T>;
}
