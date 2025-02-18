import { SubjectDefaultImage } from "@/assets/svgs";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { MyInput } from "@/components/design-system/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TokenKey } from "@/constants/auth/tokens";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Plus, X } from "phosphor-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Session {
    id: string;
    session_name: string;
    status: string;
    start_date?: string;
}

interface Level {
    id: string;
    level_name: string;
    duration_in_days: number | null;
    thumbnail_id: string | null;
    sessions?: string[]; // Array of session IDs
}

// Update the form schema
const formSchema = z.object({
    id: z.string().optional(),
    course_name: z.string(),
    thumbnail_file_id: z.string().optional(),
    contain_levels: z.boolean().optional(),
    status: z.string().optional(),
    levels: z
        .array(
            z.object({
                id: z.string(),
                new_level: z.boolean().optional(),
                level_name: z.string(),
                duration_in_days: z.number().nullable(),
                thumbnail_id: z.string().nullable(),
                sessions: z.array(
                    z.object({
                        id: z.string(),
                        new_session: z.boolean().optional(),
                        session_name: z.string(),
                        status: z.string(),
                        start_date: z.string().optional(),
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

    const { instituteDetails, getAllLevels, getAllSessions } = useInstituteDetailsStore();

    const [levelList, setLevelList] = useState<Level[]>(getAllLevels);
    const [sessionList, setSessionList] = useState<Session[]>(getAllSessions);
    const [newLevelDuration, setNewLevelDuration] = useState<number | null>(null);
    const [newSessionStartDate, setNewSessionStartDate] = useState<string>("");

    const form = useForm<AddCourseData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialValues?.id || "",
            course_name: initialValues?.course_name || "",
            thumbnail_file_id: initialValues?.thumbnail_file_id || fileId,
            contain_levels: initialValues?.contain_levels || false,
            status: initialValues?.status || "ACTIVE",
            levels: [],
        },
    });

    const handleAddLevel = (levelName: string, durationInDays: number | null) => {
        const newLevel = {
            id: "",
            new_level: true,
            level_name: levelName,
            duration_in_days: durationInDays,
            thumbnail_id: null,
        };

        setLevelList((prevLevelList) => [...prevLevelList, newLevel]);
    };

    const handleAddSession = (sessionName: string, startDate: string) => {
        const newSession = {
            id: "",
            new_session: true,
            session_name: sessionName,
            status: "INACTIVE",
            start_date: startDate,
        };
        setSessionList((prevSessionList) => [...prevSessionList, newSession]);
    };

    useEffect(() => {
        setLevelList(getAllLevels);
        setSessionList(getAllSessions);
    }, [instituteDetails]);

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
        const submissionData = {
            ...data,
            status: "ACTIVE",
        };
        console.log("Form submitted with data:", submissionData);
        onSubmitCourse({ courseId: submissionData.id, requestData: submissionData });
        setOpenDialog(false);
    };

    const containLevels = form.watch("contain_levels");

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    form.handleSubmit(onSubmit)(e);
                }}
                className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto p-2 text-neutral-600"
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
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="relative flex w-full flex-col items-center justify-center gap-3">
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
                        {/* <div className="w-full flex gap-6 items-end">
                                <MyInput
                                    label="Image link"
                                    inputPlaceholder="Paste link to an image..."
                                    inputType="text"
                                    className="w-[300px]"
                                    input={imageUrl}
                                    onChangeFunction={handleImageUrlChange}
                                />
                                <MyButton
                                   onClick={() => fileInputRef.current?.click()}
                                   disabled={isUploading || isUploadingFile}
                                   buttonType="primary"
                                   layoutVariant="icon"
                                   scale="small"
                                   type="button"
                                   className="mb-2"
                                >
                                    <Check />
                                </MyButton>
                            </div>
                            <p>OR</p> */}
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

                <FormField
                    control={form.control}
                    name="contain_levels"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <label className="text-sm font-medium">Contains Levels?</label>
                            <FormControl>
                                <RadioGroup
                                    value={field.value ? "true" : "false"}
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" id="contain_levels_true" />
                                        <label htmlFor="contain_levels_true" className="text-sm">
                                            Yes
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" id="contain_levels_false" />
                                        <label htmlFor="contain_levels_false" className="text-sm">
                                            No
                                        </label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {containLevels && (
                    <FormField
                        control={form.control}
                        name="levels"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col gap-4">
                                        {levelList.map((level) => (
                                            <Collapsible key={level.id}>
                                                <CollapsibleTrigger className="flex w-[352px] items-center justify-between rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                                                            checked={
                                                                ((field.value || []).find(
                                                                    (l) => l.id === level.id,
                                                                )?.sessions?.length ?? 0) > 0
                                                            }
                                                            onCheckedChange={(checked) => {
                                                                const levels = [
                                                                    ...(field.value || []),
                                                                ];

                                                                if (!checked) {
                                                                    field.onChange(
                                                                        levels.filter(
                                                                            (l) =>
                                                                                l.id !== level.id,
                                                                        ),
                                                                    );
                                                                } else {
                                                                    // Add level with duration when checked
                                                                    const newLevel = {
                                                                        ...level,
                                                                        new_level: level.id === "",
                                                                        duration_in_days:
                                                                            level.duration_in_days,
                                                                        sessions: [],
                                                                    };
                                                                    field.onChange([
                                                                        ...levels,
                                                                        newLevel,
                                                                    ]);
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {level.level_name}
                                                            </span>
                                                            {level.duration_in_days && (
                                                                <span className="text-xs text-neutral-500">
                                                                    Duration:{" "}
                                                                    {level.duration_in_days} days
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="ml-8 mt-2">
                                                    <div className="flex flex-col gap-2">
                                                        {sessionList.map((session) => (
                                                            <div
                                                                key={session.id}
                                                                className="flex items-center gap-3 rounded-md p-2 hover:bg-neutral-50"
                                                            >
                                                                <Checkbox
                                                                    className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                                                                    checked={
                                                                        (
                                                                            (
                                                                                field.value || []
                                                                            ).find(
                                                                                (l) =>
                                                                                    l.id ===
                                                                                    level.id,
                                                                            )?.sessions || []
                                                                        ).some(
                                                                            (s) =>
                                                                                s.id === session.id,
                                                                        ) ?? false
                                                                    }
                                                                    onCheckedChange={(checked) => {
                                                                        const levels = [
                                                                            ...(field.value || []),
                                                                        ];
                                                                        const levelIndex =
                                                                            levels.findIndex(
                                                                                (l) =>
                                                                                    l.id ===
                                                                                    level.id,
                                                                            );

                                                                        if (
                                                                            levelIndex === -1 &&
                                                                            checked
                                                                        ) {
                                                                            levels.push({
                                                                                ...level,
                                                                                new_level:
                                                                                    level.id === "",
                                                                                sessions: [
                                                                                    {
                                                                                        ...session,
                                                                                        new_session:
                                                                                            session.id ===
                                                                                            "",
                                                                                        start_date:
                                                                                            session.start_date, // Include start_date
                                                                                    },
                                                                                ],
                                                                            });
                                                                        } else if (
                                                                            levelIndex !== -1 &&
                                                                            levels[levelIndex]
                                                                        ) {
                                                                            const currentLevel =
                                                                                levels[levelIndex];
                                                                            if (currentLevel) {
                                                                                const currentSessions =
                                                                                    currentLevel.sessions ||
                                                                                    [];
                                                                                currentLevel.sessions =
                                                                                    checked
                                                                                        ? [
                                                                                              ...currentSessions,
                                                                                              {
                                                                                                  ...session,
                                                                                                  new_session:
                                                                                                      session.id ===
                                                                                                      "",
                                                                                                  start_date:
                                                                                                      session.start_date, // Include start_date
                                                                                              },
                                                                                          ]
                                                                                        : currentSessions.filter(
                                                                                              (s) =>
                                                                                                  s.id !==
                                                                                                  session.id,
                                                                                          );
                                                                                currentLevel.new_level =
                                                                                    currentLevel.id ===
                                                                                    "";
                                                                            }
                                                                        }

                                                                        field.onChange(levels);
                                                                    }}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm">
                                                                        {session.session_name}
                                                                    </span>
                                                                    {session.start_date && (
                                                                        <span className="text-xs text-neutral-500">
                                                                            Starts:{" "}
                                                                            {new Date(
                                                                                session.start_date,
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {showNewSessionInput ? (
                                                            <div className="flex items-end gap-4">
                                                                <div className="flex flex-col gap-4">
                                                                    <MyInput
                                                                        inputType="text"
                                                                        inputPlaceholder="Enter session name"
                                                                        className="w-[260px]"
                                                                        input={newSessionName}
                                                                        onChangeFunction={(e) =>
                                                                            setNewSessionName(
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                    <MyInput
                                                                        inputType="date"
                                                                        inputPlaceholder="Start Date"
                                                                        className="w-[200px] text-neutral-500"
                                                                        input={newSessionStartDate}
                                                                        onChangeFunction={(e) =>
                                                                            setNewSessionStartDate(
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <MyButton
                                                                        onClick={() => {
                                                                            if (
                                                                                newSessionName &&
                                                                                newSessionStartDate
                                                                            ) {
                                                                                handleAddSession(
                                                                                    newSessionName,
                                                                                    newSessionStartDate,
                                                                                );
                                                                                setNewSessionName(
                                                                                    "",
                                                                                );
                                                                                setNewSessionStartDate(
                                                                                    "",
                                                                                );
                                                                                setShowNewSessionInput(
                                                                                    false,
                                                                                );
                                                                            }
                                                                        }}
                                                                        buttonType="primary"
                                                                        layoutVariant="icon"
                                                                        scale="small"
                                                                    >
                                                                        <Plus />
                                                                    </MyButton>
                                                                    <MyButton
                                                                        onClick={() => {
                                                                            setShowNewSessionInput(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        buttonType="secondary"
                                                                        layoutVariant="icon"
                                                                        scale="small"
                                                                    >
                                                                        <X />
                                                                    </MyButton>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <MyButton
                                                                onClick={() =>
                                                                    setShowNewSessionInput(true)
                                                                }
                                                                buttonType="text"
                                                                layoutVariant="default"
                                                                scale="small"
                                                                className="text-primary-500 hover:bg-white"
                                                            >
                                                                <Plus /> Add Session
                                                            </MyButton>
                                                        )}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                        {showNewLevelInput ? (
                                            <div className="flex items-end gap-4">
                                                <div className="flex flex-col gap-4">
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="Enter level name"
                                                        className="w-[260px]"
                                                        input={newLevelName}
                                                        onChangeFunction={(e) =>
                                                            setNewLevelName(e.target.value)
                                                        }
                                                    />
                                                    <MyInput
                                                        inputType="number"
                                                        inputPlaceholder="Duration (days)"
                                                        className="w-[150px]"
                                                        input={newLevelDuration?.toString() || ""}
                                                        onChangeFunction={(e) =>
                                                            setNewLevelDuration(
                                                                Number(e.target.value),
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <MyButton
                                                        onClick={() => {
                                                            if (newLevelName) {
                                                                handleAddLevel(
                                                                    newLevelName,
                                                                    newLevelDuration,
                                                                );
                                                                setNewLevelName("");
                                                                setNewLevelDuration(null);
                                                                setShowNewLevelInput(false);
                                                            }
                                                        }}
                                                        buttonType="primary"
                                                        layoutVariant="icon"
                                                        scale="small"
                                                    >
                                                        <Plus />
                                                    </MyButton>
                                                    <MyButton
                                                        onClick={() => {
                                                            setShowNewLevelInput(false);
                                                        }}
                                                        buttonType="secondary"
                                                        layoutVariant="icon"
                                                        scale="small"
                                                    >
                                                        <X />
                                                    </MyButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <MyButton
                                                onClick={() => setShowNewLevelInput(true)}
                                                buttonType="text"
                                                layoutVariant="default"
                                                scale="small"
                                                className="text-primary-500 hover:bg-white"
                                            >
                                                <Plus /> Add Level
                                            </MyButton>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <MyButton type="submit" buttonType="primary" layoutVariant="default" scale="large">
                    {initialValues ? "Save Changes" : "Add"}
                </MyButton>
            </form>
        </Form>
    );
};
