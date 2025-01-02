import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { ModuleType } from "./modules";

const formSchema = z.object({
    moduleName: z.string().min(1, "Module name is required"),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddModulesFormProps {
    initialValues?: ModuleType;
    onSubmitSuccess: (module: ModuleType) => void;
}

export const AddModulesForm = ({ initialValues, onSubmitSuccess }: AddModulesFormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            moduleName: initialValues?.name || "",
            description: initialValues?.description || "",
        },
    });

    const onSubmit = (data: FormValues) => {
        const newModule = {
            name: data.moduleName,
            description: data.description || "",
        };
        onSubmitSuccess(newModule);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="moduleName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Module Name"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Enter Module Name"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Description"
                                    inputType="text"
                                    inputPlaceholder="Briefly describe module"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex w-full items-center justify-center px-6 py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                    >
                        Add
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
