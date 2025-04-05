import { useEffect, useState } from "react";
import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { MyDropdown } from "../enroll-manually/dropdownForPackageItems";
import { DropdownItemType } from "../enroll-manually/dropdownTypesForPackageItems";
import { CSVFormatDialog } from "./csv-format-dialog";
import {
    enrollBulkFormSchema,
    enrollBulkFormType,
} from "@/schemas/student/student-bulk-enroll/enroll-bulk-schema";

import { MyButton } from "@/components/design-system/button";

export const EnrollBulkDialog = () => {
    const { getCourseFromPackage, getSessionFromPackage, getLevelsFromPackage } =
        useInstituteDetailsStore();
    const [openSetFormatDialog, setOpenSetFormatDialog] = useState(false);

    const defaultFormValues = {
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
    };
    const [formValues, setFormValues] = useState<enrollBulkFormType>(defaultFormValues);

    const [courseList, setCourseList] = useState<DropdownItemType[]>(getCourseFromPackage());
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(getSessionFromPackage());
    const [levelList, setLevelList] = useState<DropdownItemType[]>(getLevelsFromPackage());

    const form = useForm<enrollBulkFormType>({
        resolver: zodResolver(enrollBulkFormSchema),
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        const values = form.watch();

        // Update course list when session or level changes
        setCourseList(
            getCourseFromPackage({
                sessionId: values.session.id,
                levelId: values.level.id,
            }),
        );

        // Update session list when course or level changes
        setSessionList(
            getSessionFromPackage({
                courseId: values.course.id,
                levelId: values.level.id,
            }),
        );

        // Update level list when course or session changes
        setLevelList(
            getLevelsFromPackage({
                courseId: values.course.id,
                sessionId: values.session.id,
            }),
        );
    }, [form.watch("course"), form.watch("session"), form.watch("level")]);

    const onSubmitEnrollBulkForm = (values: enrollBulkFormType) => {
        setFormValues(values);
        setOpenSetFormatDialog(true);
    };

    // This handles form submission without page reload
    const handleDoneClick = () => {
        form.handleSubmit(onSubmitEnrollBulkForm)();
    };

    return (
        <>
            <Form {...form} className="w-full">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitEnrollBulkForm)}>
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
                            <MyButton
                                buttonType="primary"
                                layoutVariant="default"
                                scale="large"
                                type="button"
                                onClick={handleDoneClick}
                            >
                                Done
                            </MyButton>
                        </div>
                    </form>
                </FormProvider>
            </Form>
            <CSVFormatDialog
                packageDetails={formValues}
                openDialog={openSetFormatDialog}
                setOpenDialog={setOpenSetFormatDialog}
            />
        </>
    );
};
