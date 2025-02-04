import { SubjectDefaultImage } from "@/assets/svgs";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { MyInput } from "@/components/design-system/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { INSTITUTE_ID } from "@/constants/urls";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Session {
    id: string;
    session_name: string;
    status: string;
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
    course_name: z.string(),
    thumbnail_file_id: z.string(),
    contain_levels: z.boolean(),
    levels: z.array(
        z.object({
            id: z.string(),
            level_name: z.string(),
            duration_in_days: z.number().nullable(),
            thumbnail_id: z.string().nullable(),
            sessions: z.array(z.string()).optional(),
        }),
    ),
});

type FormValues = z.infer<typeof formSchema>;

export const AddCourseForm = ({ initialValues }: { initialValues?: FormValues }) => {
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileId, setFileId] = useState<string | null>(initialValues?.thumbnail_file_id || null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

    const { instituteDetails, getAllLevels, getAllSessions } = useInstituteDetailsStore();

    const [levelList, setLevelList] = useState<Level[]>(getAllLevels);
    const [sessionList, setSessionList] = useState<Session[]>(getAllSessions);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_name: initialValues?.course_name || "",
            thumbnail_file_id: initialValues?.thumbnail_file_id || "",
            contain_levels: initialValues?.contain_levels || false,
            levels: [],
        },
    });

    useEffect(() => {
        setLevelList(getAllLevels);
        setSessionList(getAllSessions);
    }, [instituteDetails]);

    // const [imageUrl, setImageUrl] = useState("");

    // const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement> ) => {
    //     setImageUrl(e.target.value);
    // }

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

    const onSubmit = () => {
        console.log("file", fileId);
    };

    const containLevels = form.watch("contain_levels");

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                                                            checked={field.value?.some(
                                                                (l) => l.id === level.id,
                                                            )}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    const newValue = [
                                                                        ...(field.value || []),
                                                                        level,
                                                                    ];
                                                                    field.onChange(newValue);
                                                                } else {
                                                                    const newValue =
                                                                        field.value?.filter(
                                                                            (l) =>
                                                                                l.id !== level.id,
                                                                        );
                                                                    field.onChange(newValue);
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {level.level_name}
                                                        </span>
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
                                                                <Checkbox className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white" />
                                                                <span className="text-sm">
                                                                    {session.session_name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </form>
        </Form>
    );
};
