import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { MyDropdown } from "../../students/enroll-manually/dropdownForPackageItems";
import { MyButton } from "@/components/design-system/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects";
import { ModulesWithChaptersProvider } from "@/providers/study-library/modules-with-chapters-provider";
import {
    ChapterWithSlides,
    ModulesWithChapters,
    useModulesWithChaptersStore,
} from "@/stores/study-library/use-modules-with-chapters-store";
import { useEffect, useState } from "react";
import { getChaptersByModuleId } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getChaptersByModuleId";
import { useNavigate } from "@tanstack/react-router";
import { useDialogStore } from "@/stores/study-library/slide-add-dialogs-store";

export type AvailableFields =
    | "course"
    | "session"
    | "level"
    | "subject"
    | "module"
    | "chapter"
    | "file_type";

export type FieldValue = {
    id: string;
    name: string;
};

export type StudyMaterialDetailsFormProps = {
    fields: AvailableFields[];
    onFormSubmit: (data: FieldValue[]) => void;
    submitButtonName: string;
};

// Form validation schema
const createFormSchema = (fields: AvailableFields[]) => {
    const schemaObject: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
        if (field === "file_type") {
            schemaObject[field] = z.object({
                id: z.string(),
                name: z.string(),
            });
        } else {
            schemaObject[field] = z
                .object({
                    id: z.string(),
                    name: z.string(),
                })
                .optional();
        }
    });

    return z.object(schemaObject);
};

export const StudyMaterialDetailsForm = ({
    fields,
    onFormSubmit,
    submitButtonName,
}: StudyMaterialDetailsFormProps) => {
    const {
        getCourseFromPackage,
        getSessionFromPackage,
        getLevelsFromPackage,
        getPackageSessionId,
    } = useInstituteDetailsStore();

    const formSchema = createFormSchema(fields);
    type FormValues = z.infer<typeof formSchema>;

    const { openDocUploadDialog, openPdfDialog, openVideoDialog } = useDialogStore();

    const navigate = useNavigate();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: fields.reduce<Record<string, unknown>>(
            (acc, field) => ({
                ...acc,
                [field]: field === "file_type" ? { id: "", name: "" } : undefined,
            }),
            {},
        ),
        mode: "onTouched",
    });

    const { watch, getValues } = form;

    // Get course list
    const courseList = getCourseFromPackage();

    // Get session list based on selected course
    const sessionList = getSessionFromPackage({
        courseId: getValues("course")?.id,
    });

    // Get level list based on selected course and session
    const levelList = getLevelsFromPackage({
        courseId: getValues("course")?.id,
        sessionId: getValues("session")?.id,
    });

    // Get subject list
    const subjectList = getCourseSubjects(
        getValues("course")?.id || "",
        getValues("session")?.id || "",
        getValues("level")?.id || "",
    );
    const formattedSubjectList = subjectList.map((subject) => ({
        id: subject.id,
        name: subject.subject_name,
    }));

    // Get package session ID for modules
    const fetchPackageSessionId = () => {
        return getPackageSessionId({
            courseId: getValues("course")?.id || "",
            sessionId: getValues("session")?.id || "",
            levelId: getValues("level")?.id || "",
        });
    };

    const [packageSessionId, setPackageSessionId] = useState(fetchPackageSessionId());
    const { modulesWithChaptersData } = useModulesWithChaptersStore();

    // Format module list
    const formatModule = (moduleData: ModulesWithChapters[] | null) => {
        return moduleData?.map((object) => ({
            id: object.module.id,
            name: object.module.module_name,
        }));
    };

    const [formattedModuleList, setFormattedModuleList] = useState(
        formatModule(modulesWithChaptersData),
    );

    // Get chapters list based on selected module
    const chaptersList = getChaptersByModuleId(getValues("module")?.id || "");

    const formatChapter = (chaptersList: ChapterWithSlides[] | null) => {
        if (!chaptersList) return [];
        return chaptersList.map((chapter) => ({
            id: chapter.chapter.id,
            name: chapter.chapter.chapter_name,
        }));
    };

    const [formattedChapterList, setFormattedChapterList] = useState(formatChapter(chaptersList));

    // File type list formatted to match the FieldValue type
    const fileTypeList = [
        { id: "PDF", name: "PDF" },
        { id: "DOC", name: "DOC" },
        { id: "VIDEO", name: "VIDEO" },
    ];

    useEffect(() => {
        setPackageSessionId(fetchPackageSessionId());
        setFormattedModuleList(formatModule(modulesWithChaptersData));
        setFormattedChapterList(
            formatChapter(getChaptersByModuleId(getValues("module")?.id || "")),
        );
    }, [
        watch("course"),
        watch("session"),
        watch("level"),
        watch("subject"),
        watch("module"),
        modulesWithChaptersData,
    ]);

    // Function to determine if a dropdown should be disabled
    const isDropdownDisabled = (fieldName: AvailableFields): boolean => {
        switch (fieldName) {
            case "course":
                return false;
            case "session":
                return !watch("course");
            case "level":
                return !watch("session");
            case "subject":
                return !watch("level");
            case "module":
                return !watch("subject");
            case "chapter":
                return !watch("module");
            case "file_type":
                // File type can be selected at any time or based on your requirements
                return false;
            default:
                return false;
        }
    };

    // Get the appropriate list for each field
    const getListForField = (fieldName: AvailableFields) => {
        switch (fieldName) {
            case "course":
                return courseList;
            case "session":
                return sessionList;
            case "level":
                return levelList;
            case "subject":
                return formattedSubjectList;
            case "module":
                return formattedModuleList || [];
            case "chapter":
                return formattedChapterList || [];
            case "file_type":
                return fileTypeList;
            default:
                return [];
        }
    };

    // Get label and placeholder for each field
    const getFieldConfig = (fieldName: AvailableFields) => {
        const config = {
            course: { label: "Course", placeholder: "Select Course" },
            session: { label: "Session", placeholder: "Select Session" },
            level: { label: "Year/Class", placeholder: "Select Year/Class" },
            subject: { label: "Subject", placeholder: "Select Subject" },
            module: { label: "Module", placeholder: "Select Module" },
            chapter: { label: "Chapter", placeholder: "Select Chapter" },
            file_type: { label: "File Type", placeholder: "Select File Type" },
        };

        return config[fieldName];
    };

    const onSubmit = (data: FormValues) => {
        // Convert the form data object to an array of field values
        const fieldsArray: FieldValue[] = [];

        // Iterate through all fields and add non-undefined values to array
        fields.forEach((fieldName) => {
            const fieldValue = data[fieldName];
            if (fieldValue) {
                fieldsArray.push({
                    id: fieldValue.id,
                    name: fieldValue.name,
                });
            }
        });

        // onFormSubmit(fieldsArray);
        navigate({
            to: "/study-library/courses/levels/subjects/modules/chapters/slides",
            search: {
                courseId: data.course?.id || "",
                levelId: data.level?.id || "",
                subjectId: data.subject?.id || "",
                moduleId: data.module?.id || "",
                chapterId: data.chapter?.id || "",
                slideId: "",
            },
        });
        if (data.file_type?.id == "PDF") openPdfDialog();
        else if (data.file_type?.id == "DOC") openDocUploadDialog();
        else openVideoDialog();

        onFormSubmit(fieldsArray);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((fieldName, index) => {
                    const config = getFieldConfig(fieldName);
                    const list = getListForField(fieldName);

                    return (
                        <ModulesWithChaptersProvider
                            subjectId={getValues("subject")?.id || ""}
                            packageSessionId={packageSessionId || ""}
                            key={index}
                        >
                            <FormField
                                key={fieldName}
                                control={form.control}
                                name={fieldName}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span>{config.label}</span>
                                                    <span className="text-primary-500">*</span>
                                                </div>
                                                <MyDropdown
                                                    placeholder={config.placeholder}
                                                    currentValue={field.value}
                                                    dropdownList={list}
                                                    onSelect={field.onChange}
                                                    disable={isDropdownDisabled(fieldName)}
                                                    error={fieldState.error?.message}
                                                />
                                                <FormMessage className="text-danger-600" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </ModulesWithChaptersProvider>
                    );
                })}
                <div className="w-full px-6 py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                        className="w-full"
                    >
                        {submitButtonName}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
