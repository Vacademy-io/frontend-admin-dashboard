import { DialogHeader } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { MyDropdown } from "../enroll-manually/dropdownForPackageItems";
import { DropdownItemType } from "../enroll-manually/dropdownTypesForPackageItems";
import { CSVFormatDialog } from "./csv-format-dialog";

const enrollBulkFormSchema = z.object({
    course: z.object({
        id: z.string(),
        name: z.string(),
    }),
    session: z.object({
        id: z.string(),
        name: z.string(),
    }),
    level: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

type enrollBulkFormType = z.infer<typeof enrollBulkFormSchema>;

export const EnrollBulkDialog = () => {
    const { getCourseFromPackage, getSessionFromPackage, getLevelsFromPackage } =
        useInstituteDetailsStore();

    const [courseList, setCourseList] = useState<DropdownItemType[]>(getCourseFromPackage());
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(getSessionFromPackage());
    const [levelList, setLevelList] = useState<DropdownItemType[]>(getLevelsFromPackage());

    const form = useForm<enrollBulkFormType>({
        resolver: zodResolver(enrollBulkFormSchema),
        defaultValues: {
            course: {
                id: "",
                name: "",
            },
            session: {
                id: "",
                name: "",
            },
            level: {
                id: "",
                name: "",
            },
        },
    });

    useEffect(() => {
        const values = form.watch();

        // Update course list when session or level changes
        // Helper function to remove duplicates based on id
        const removeDuplicates = (list: DropdownItemType[]) => {
            const seen = new Set();
            return list.filter((item) => {
                if (seen.has(item.id)) {
                    return false;
                }
                seen.add(item.id);
                return true;
            });
        };

        // Update course list when session or level changes
        setCourseList(
            removeDuplicates(
                getCourseFromPackage({
                    sessionId: values.session.id,
                    levelId: values.level.id,
                }),
            ),
        );

        // Update session list when course or level changes
        setSessionList(
            removeDuplicates(
                getSessionFromPackage({
                    courseId: values.course.id,
                    levelId: values.level.id,
                }),
            ),
        );

        // Update level list when course or session changes
        setLevelList(
            removeDuplicates(
                getLevelsFromPackage({
                    courseId: values.course.id,
                    sessionId: values.session.id,
                }),
            ),
        );
    }, [form.watch("course"), form.watch("session"), form.watch("level")]);

    return (
        <DialogHeader className="w-full">
            <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                Enroll in Bulk
            </div>
            <DialogDescription className="flex w-full flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                <Form {...form} className="w-full">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(() => {})}>
                            <div className="flex w-full flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="course"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        Course
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    </div>
                                                    <MyDropdown
                                                        currentValue={value.name}
                                                        dropdownList={courseList}
                                                        handleChange={onChange}
                                                        placeholder="Select Course"
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="session"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        Session{" "}
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    </div>
                                                    <MyDropdown
                                                        currentValue={value.name}
                                                        dropdownList={sessionList}
                                                        handleChange={onChange}
                                                        placeholder="Select Session"
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        Level{" "}
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    </div>
                                                    <MyDropdown
                                                        currentValue={value.name}
                                                        dropdownList={levelList}
                                                        handleChange={onChange}
                                                        placeholder="Select Session"
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </FormProvider>
                </Form>

                {/* <UploadCSVButton /> */}
                <CSVFormatDialog />
            </DialogDescription>
        </DialogHeader>
    );
};
