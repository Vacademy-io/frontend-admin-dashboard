// add-course-form.tsx
import { SubjectDefaultImage } from "@/assets/svgs";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { MyInput } from "@/components/design-system/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { TokenKey } from "@/constants/auth/tokens";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { DotsThree } from "@phosphor-icons/react";
import { Plus } from "phosphor-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AddLevelInput } from "../../../../design-system/add-level-input";
import { AddSessionInput } from "../../../../design-system/add-session-input";
import { LevelInSessionField } from "./level-field";
import { SessionType } from "@/schemas/student/student-list/institute-schema";

// Updated Session interface with levels array
export interface Session {
    id: string;
    session_name: string;
    status: string;
    start_date?: string;
    new_session?: boolean;
    levels: Level[]; // Add levels array to sessions
}

// Update Level interface (remove sessions)
export interface Level {
    id: string;
    level_name: string;
    duration_in_days: number | null;
    thumbnail_id: string | null;
    new_level?: boolean;
}

// Update CourseFormData
export interface CourseFormData {
    course_name: string;
    id?: string;
    thumbnail_file_id?: string;
    contain_levels?: boolean;
    status?: string;
    sessions?: Session[]; // Changed from levels to sessions at top level
}

// Update the form schema
const formSchema = z.object({
    id: z.string().optional(),
    course_name: z.string(),
    thumbnail_file_id: z.string().optional(),
    contain_levels: z.boolean().optional(),
    status: z.string().optional(),
    sessions: z
        .array(
            z.object({
                id: z.string(),
                new_session: z.boolean().optional(),
                session_name: z.string(),
                status: z.string(),
                start_date: z.string().optional(),
                levels: z.array(
                    z.object({
                        id: z.string(),
                        new_level: z.boolean().optional(),
                        level_name: z.string(),
                        duration_in_days: z.number().nullable(),
                        thumbnail_id: z.string().nullable(),
                    }),
                ),
            }),
        )
        .optional(),
});

export type AddCourseData = z.infer<typeof formSchema>;

interface AddCourseFormProps {
    initialValues?: AddCourseData;
    onSubmitCourse: ({
        courseId,
        requestData,
    }: {
        courseId?: string;
        requestData: AddCourseData;
    }) => void;
    setOpenDialog: Dispatch<SetStateAction<boolean>>;
}

export const AddCourseForm = ({
    initialValues,
    onSubmitCourse,
    setOpenDialog,
}: AddCourseFormProps) => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileId, setFileId] = useState<string | undefined>(
        initialValues?.thumbnail_file_id || undefined,
    );
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [showNewLevelInput, setShowNewLevelInput] = useState(false);
    const [newLevelName, setNewLevelName] = useState("");
    const [showNewSessionInput, setShowNewSessionInput] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
    const [disableAddButton, setDisableAddButton] = useState(false);

    const { instituteDetails, getAllLevels, getAllSessions } = useInstituteDetailsStore();

    // Initialize with proper Level objects that include empty sessions arrays
    const [levelList, setLevelList] = useState<Level[]>(
        getAllLevels().map((level) => ({
            ...level,
            sessions: [] as Session[],
        })),
    );
    const [sessionList, setSessionList] = useState<Session[]>([]);
    // Then in useEffect:
    useEffect(() => {
        setSessionList(getAllSessions().map((session) => convertToFormSession(session)));
        setLevelList(getAllLevels());
    }, [instituteDetails]);

    const [newLevelDuration, setNewLevelDuration] = useState<number | null>(null);
    const [newSessionStartDate, setNewSessionStartDate] = useState<string>("");

    // In the form initialization
    const form = useForm<AddCourseData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialValues?.id || "",
            course_name: initialValues?.course_name || "",
            thumbnail_file_id: initialValues?.thumbnail_file_id || fileId,
            contain_levels: initialValues?.contain_levels || true,
            status: initialValues?.status || "ACTIVE",
            sessions: [], // Changed from levels to sessions
        },
    });

    function convertToFormSession(session: SessionType): Session {
        return {
            ...session,
            start_date: new Date().toISOString(), // Default date for existing sessions
            new_session: false,
            levels: [],
        };
    }

    const handleAddLevel = (levelName: string, durationInDays: number | null) => {
        const newLevel: Level = {
            id: "",
            new_level: true,
            level_name: levelName,
            duration_in_days: durationInDays,
            thumbnail_id: null,
        };

        setLevelList((prevLevelList) => [...prevLevelList, newLevel]);
    };

    const handleAddSession = (sessionName: string, startDate: string) => {
        const newSession: Session = {
            id: "",
            new_session: true,
            session_name: sessionName,
            status: "INACTIVE",
            start_date: startDate,
            levels: [], // Initialize with empty levels array
        };
        setSessionList((prevSessionList) => [...prevSessionList, newSession]);
    };

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (initialValues?.thumbnail_file_id) {
                try {
                    const url = await getPublicUrl(initialValues?.thumbnail_file_id);
                    setFileId(url);
                } catch (error) {
                    console.error("Failed to fetch image URL:", error);
                }
            }
        };

        fetchImageUrl();
    }, [initialValues?.thumbnail_file_id]);

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            const uploadedFileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: INSTITUTE_ID,
                sourceId: "SUBJECTS",
            });

            if (uploadedFileId) {
                setFileId(uploadedFileId);
                // Get public URL only for preview purposes
                form.setValue("thumbnail_file_id", uploadedFileId);
                const publicUrl = await getPublicUrl(uploadedFileId);
                setPreviewUrl(publicUrl);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: AddCourseData) => {
        // Filter out any sessions that might have no levels
        const filteredSessions =
            data.sessions?.filter((session) => session.levels && session.levels.length > 0) || [];

        const submissionData = {
            ...data,
            status: "ACTIVE",
            sessions: filteredSessions,
        };

        console.log("Form submitted with data:", submissionData);
        onSubmitCourse({ courseId: submissionData.id, requestData: submissionData });
        setOpenDialog(false);
    };

    const containLevels = form.watch("contain_levels");

    useEffect(() => {
        const containsLevelValue = form.getValues("contain_levels");
        const sessionValue = form.getValues("sessions");
        const courseName = form.getValues("course_name");
        if (courseName == "") {
            setDisableAddButton(true);
        } else if (containsLevelValue == true) {
            if (sessionValue?.length == 0) {
                setDisableAddButton(true);
            } else setDisableAddButton(false);
        } else {
            setDisableAddButton(false);
        }
    }, [form.watch("sessions"), form.watch("course_name")]);

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
                    name="course_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Course"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Enter course name"
                                    className="w-full"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div
                    className={`relative flex w-full flex-col items-center justify-center gap-3 ${
                        initialValues ? "mb-16" : "mb-0"
                    }`}
                >
                    {isUploading ? (
                        <div className="inset-0 flex h-[200px] w-[200px] items-center justify-center bg-white">
                            <DashboardLoader />
                        </div>
                    ) : previewUrl || fileId ? (
                        <img
                            src={previewUrl ? previewUrl : fileId}
                            alt="Subject"
                            className="h-[200px] w-[200px] rounded-lg object-cover"
                        />
                    ) : (
                        <SubjectDefaultImage />
                    )}
                    <FileUploadComponent
                        fileInputRef={fileInputRef}
                        onFileSubmit={handleFileSubmit}
                        control={form.control}
                        name="thumbnail_file_id"
                        acceptedFileTypes="image/*"
                    />
                    <div
                        className={`flex w-full flex-col items-center gap-3 ${
                            isUploading ? "hidden" : "visible"
                        }`}
                    >
                        <MyButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isUploadingFile}
                            buttonType="secondary"
                            layoutVariant="default"
                            scale="large"
                            type="button"
                        >
                            Upload Image
                        </MyButton>
                    </div>
                </div>

                <Separator />

                {!initialValues && (
                    <FormField
                        control={form.control}
                        name="contain_levels"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <label className="text-subtitle font-semibold">
                                    Contains Levels?
                                </label>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value ? "true" : "false"}
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        className="flex gap-8"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="true" id="contain_levels_true" />
                                            <label
                                                htmlFor="contain_levels_true"
                                                className="text-sm"
                                            >
                                                Yes
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="false"
                                                id="contain_levels_false"
                                            />
                                            <label
                                                htmlFor="contain_levels_false"
                                                className="text-sm"
                                            >
                                                No
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {containLevels && !initialValues && (
                    <div className="mb-20 flex flex-col gap-2">
                        <p className="text-body text-neutral-500">
                            Choose sessions to select a level
                        </p>
                        <FormField
                            control={form.control}
                            name="sessions"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            {sessionList.map((session) => {
                                                const isSessionSelected = (field.value || []).some(
                                                    (s) => s.id === session.id,
                                                );
                                                return (
                                                    <div key={session.id}>
                                                        <div
                                                            className={`rounded-lg border border-neutral-200 py-2 ${
                                                                isSessionSelected
                                                                    ? "bg-neutral-100"
                                                                    : "bg-none"
                                                            }`}
                                                        >
                                                            <div className="flex w-full items-center justify-between p-4 pr-8">
                                                                {/* Replace LevelField with SessionField component */}
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex flex-col">
                                                                        <div className="flex flex-col items-start">
                                                                            <p className="text-subtitle font-semibold">
                                                                                {
                                                                                    session.session_name
                                                                                }
                                                                            </p>
                                                                            <p className="text-caption text-neutral-400">
                                                                                Start Date:
                                                                                05/03/2025
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <MyButton
                                                                        buttonType="secondary"
                                                                        layoutVariant="icon"
                                                                        scale="small"
                                                                    >
                                                                        <DotsThree />
                                                                    </MyButton>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 mr-6 mt-2">
                                                                <div>
                                                                    <Separator />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {levelList.map((level) => (
                                                                        /* Create new LevelInSessionField component */
                                                                        <LevelInSessionField
                                                                            key={level.id}
                                                                            level={level}
                                                                            session={session}
                                                                            field={field}
                                                                        />
                                                                    ))}
                                                                    {showNewLevelInput ? (
                                                                        <AddLevelInput
                                                                            newLevelName={
                                                                                newLevelName
                                                                            }
                                                                            setNewLevelName={
                                                                                setNewLevelName
                                                                            }
                                                                            newLevelDuration={
                                                                                newLevelDuration
                                                                            }
                                                                            setNewLevelDuration={
                                                                                setNewLevelDuration
                                                                            }
                                                                            handleAddLevel={
                                                                                handleAddLevel
                                                                            }
                                                                            setShowNewLevelInput={
                                                                                setShowNewLevelInput
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <MyButton
                                                                            onClick={() =>
                                                                                setShowNewLevelInput(
                                                                                    true,
                                                                                )
                                                                            }
                                                                            buttonType="text"
                                                                            layoutVariant="default"
                                                                            scale="small"
                                                                            className="w-fit text-primary-500 hover:bg-white active:bg-white"
                                                                        >
                                                                            <Plus /> Add Level
                                                                        </MyButton>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {showNewSessionInput ? (
                                                <AddSessionInput
                                                    newSessionName={newSessionName}
                                                    setNewSessionName={setNewSessionName}
                                                    newSessionStartDate={newSessionStartDate}
                                                    setNewSessionStartDate={setNewSessionStartDate}
                                                    handleAddSession={handleAddSession}
                                                    setShowNewSessionInput={setShowNewSessionInput}
                                                />
                                            ) : (
                                                <MyButton
                                                    onClick={() => setShowNewSessionInput(true)}
                                                    buttonType="text"
                                                    layoutVariant="default"
                                                    scale="small"
                                                    className="w-fit text-primary-500 hover:bg-white active:bg-white"
                                                >
                                                    <Plus /> Add Session
                                                </MyButton>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                <div
                    className={`absolute bottom-0 flex w-[640px] items-center justify-center bg-white py-4`}
                >
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                        className="w-[140px]"
                        disable={!initialValues ? disableAddButton : false}
                    >
                        {initialValues ? "Save Changes" : "Add"}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
