// components/FileUploadComponent.tsx
import { FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { FileUploadComponentProps } from "@/types/file-upload";

export const FileUploadComponent = <T extends FieldValues>({
    fileInputRef,
    onFileSubmit,
    control,
    name,
    acceptedFileTypes,
}: FileUploadComponentProps<T>) => {
    const onSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileSubmit(file);
    };

    const accept = acceptedFileTypes
        ? Array.isArray(acceptedFileTypes)
            ? acceptedFileTypes.join(",")
            : acceptedFileTypes
        : undefined;

    return (
        <FormField
            control={control}
            name={name}
            render={() => (
                <FormItem>
                    <FormControl>
                        <Input
                            type="file"
                            onChange={onSubmit}
                            className="hidden"
                            ref={fileInputRef}
                            accept={accept}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};
