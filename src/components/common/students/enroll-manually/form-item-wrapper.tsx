// form-item-wrapper.tsx
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";

interface FormItemWrapperProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    children: React.ReactNode;
}

export const FormItemWrapper = <T extends FieldValues>({
    children,
    control,
    name,
}: FormItemWrapperProps<T>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={() => (
                <FormItem>
                    <FormControl>{children}</FormControl>
                </FormItem>
            )}
        />
    );
};
