import { FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { FileUploadComponentProps } from "@/types/file-upload";

export const FileUploadComponent = <T extends FieldValues>({
    fileInputRef,
    onFileSubmit,
    control,
    name,
}: FileUploadComponentProps<T>) => {
    const onSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSubmit(file);
        }
    };

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
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};
