import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    id: z.string().nullable(),
    session_name: z.string(),
    status: z.string(),
    start_date: z.string(),
    new_session: z.boolean(),
    levels: z.array(
        z.object({
            id: z.string().nullable(),
            new_level: z.boolean(),
            level_name: z.string(),
            duration_in_days: z.number(),
            thumbnail_file_id: z.string().nullable(),
            package_id: z.string(),
        }),
    ),
});
export type LevelForSession = z.infer<typeof formSchema>["levels"][number];
export type AddSessionDataType = z.infer<typeof formSchema>;

export const AddSessionForm = ({
    initialValues,
    onSubmit,
}: {
    initialValues?: AddSessionDataType;
    onSubmit: (sessionData: AddSessionDataType) => void;
}) => {
    const { instituteDetails, getPackageWiseLevels } = useInstituteDetailsStore();

    const [packageWithLevels, setPackageWithLevels] = useState(getPackageWiseLevels());

    useEffect(() => {
        setPackageWithLevels(getPackageWiseLevels());
        console.log(packageWithLevels);
    }, [instituteDetails]);

    const form = useForm<AddSessionDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialValues?.id || null,
            session_name: initialValues?.session_name || "",
            status: initialValues?.status || "ACTIVE",
            start_date: initialValues?.start_date || new Date().toISOString(),
            new_session: initialValues ? false : true,
            levels: initialValues?.levels || [], // Changed from levels to sessions
        },
    });
    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    form.handleSubmit(onSubmit)(e);
                }}
                className="flex max-h-[80vh] flex-col gap-8 overflow-y-auto p-2 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="session_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Session Name"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Eg. 2024-2025"
                                    className="w-full"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Start Date"
                                    required={true}
                                    inputType="date"
                                    inputPlaceholder="DD/MM/YYYY"
                                    className="w-full"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {}
            </form>
        </Form>
    );
};
