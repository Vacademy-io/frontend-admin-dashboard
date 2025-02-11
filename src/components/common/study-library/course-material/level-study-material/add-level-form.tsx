// add-subject-form.tsx
import { SubjectDefaultImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useFileUpload } from "@/hooks/use-file-upload";
import { INSTITUTE_ID } from "@/constants/urls";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useRouter } from "@tanstack/react-router";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "phosphor-react";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

const formSchema = z.object({
    id: z.string().optional(),
    new_level: z.boolean(),
    level_name: z.string(),
    duration_in_days: z.number(),
    thumbnail_file_id: z.string().optional(),
    sessions: z.array(
        z.object({
            id: z.string(),
            new_session: z.boolean().optional(),
            session_name: z.string(),
            status: z.string(),
            start_date: z.string().optional(),
        }),
    ),
});

export type AddLevelData = z.infer<typeof formSchema>;

interface Session {
    id: string;
    session_name: string;
    status: string;
}

interface AddLevelFormProps {
    onSubmitSuccess: ({
        requestData,
        packageId,
        sessionId,
    }: {
        requestData: AddLevelData;
        packageId: string;
        sessionId: string;
    }) => void;
    initialValues?: AddLevelData;
    setOpenDialog: Dispatch<SetStateAction<boolean>>;
}

export const AddLevelForm = ({
    onSubmitSuccess,
    initialValues,
    setOpenDialog,
}: AddLevelFormProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileId, setFileId] = useState<string | null>(initialValues?.thumbnail_file_id || null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [showNewSessionInput, setShowNewSessionInput] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
    const { instituteDetails, getAllSessions } = useInstituteDetailsStore();
    const [sessionList, setSessionList] = useState<Session[]>(getAllSessions);

    const route = useRouter();
    const search = route.state.location.search;
    const courseId: string = search.courseId || "";
    const { selectedSession } = useSelectedSessionStore();

    const handleAddSession = (sessionName: string) => {
        const newSession = {
            id: "",
            new_session: true,
            session_name: sessionName,
            status: "INACTIVE",
            start_date: new Date().toISOString(),
        };
        setSessionList((prevSessionList) => [...prevSessionList, newSession]);
    };

    useEffect(() => {
        setSessionList(getAllSessions);
    }, [instituteDetails]);

    const form = useForm<AddLevelData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialValues?.id || "",
            level_name: initialValues?.level_name || "",
            thumbnail_file_id: initialValues?.thumbnail_file_id || fileId || undefined,
            new_level: initialValues?.new_level || true,
            duration_in_days: initialValues?.duration_in_days || 0,
            sessions: [],
        },
    });

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
                const publicUrl = await getPublicUrl(uploadedFileId);
                setPreviewUrl(publicUrl);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: AddLevelData) => {
        const submissionData = {
            ...data,
            status: "ACTIVE",
        };
        console.log("Form submitted with data:", submissionData);
        onSubmitSuccess({
            packageId: courseId,
            sessionId: selectedSession?.id || "",
            requestData: submissionData,
        });
        setOpenDialog(false);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto p-2 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="level_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Level"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Enter level name"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-6">
                    <div className="relative flex w-full flex-col items-center justify-center gap-3">
                        {isUploading ? (
                            <div className="inset-0 flex h-[200px] w-[200px] items-center justify-center bg-white">
                                <DashboardLoader />
                            </div>
                        ) : previewUrl ? (
                            <img
                                src={previewUrl}
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
                        name="sessions"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col gap-2">
                                        {sessionList.map((session) => (
                                            <div
                                                key={session.id}
                                                className="flex items-center gap-3 rounded-md p-2 hover:bg-neutral-50"
                                            >
                                                <Checkbox
                                                    className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                                                    checked={
                                                        field.value?.some(
                                                            (s) => s.id === session.id,
                                                        ) ?? false
                                                    }
                                                    onCheckedChange={(checked) => {
                                                        const sessions = [...(field.value || [])];
                                                        if (checked) {
                                                            sessions.push({
                                                                ...session,
                                                                new_session: session.id === "",
                                                            });
                                                        } else {
                                                            const index = sessions.findIndex(
                                                                (s) => s.id === session.id,
                                                            );
                                                            if (index !== -1) {
                                                                sessions.splice(index, 1);
                                                            }
                                                        }
                                                        field.onChange(sessions);
                                                    }}
                                                />
                                                <span className="text-sm">
                                                    {session.session_name}
                                                </span>
                                            </div>
                                        ))}
                                        {showNewSessionInput ? (
                                            <div className="flex items-center gap-4">
                                                <MyInput
                                                    inputType="text"
                                                    inputPlaceholder="Enter session name"
                                                    className="w-[260px]"
                                                    input={newSessionName}
                                                    onChangeFunction={(e) =>
                                                        setNewSessionName(e.target.value)
                                                    }
                                                />
                                                <MyButton
                                                    onClick={() => {
                                                        if (newSessionName) {
                                                            handleAddSession(newSessionName);
                                                            setNewSessionName("");
                                                            setShowNewSessionInput(false);
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
                                                        setShowNewSessionInput(false);
                                                    }}
                                                    buttonType="secondary"
                                                    layoutVariant="icon"
                                                    scale="small"
                                                >
                                                    <X />
                                                </MyButton>
                                            </div>
                                        ) : (
                                            <MyButton
                                                onClick={() => setShowNewSessionInput(true)}
                                                buttonType="text"
                                                layoutVariant="default"
                                                scale="small"
                                                className="text-primary-500 hover:bg-white"
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

                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                    >
                        {initialValues ? "Save Changes" : "Add"}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
