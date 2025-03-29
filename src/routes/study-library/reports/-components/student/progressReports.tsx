import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LevelType } from "@/schemas/student/student-list/institute-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MyButton } from "@/components/design-system/button";
import ReportRecipientsDialogBox from "./reportRecipientsDialogBox";

const formSchema = z.object({
    course: z.string().min(1, "Course is required"),
    session: z.string().min(1, "Session is required"),
    level: z.string().min(1, "Level is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProgressReports() {
    const { getCourseFromPackage, getSessionFromPackage, getLevelsFromPackage2 } =
        useInstituteDetailsStore();

    const courseList = getCourseFromPackage();
    const [sessionList, setSessionList] = useState<{ id: string; name: string }[]>([]);
    const [levelList, setLevelList] = useState<LevelType[]>([]);
    // const [reportData, setReportData] = useState(true);
    const reportData = true;
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course: "",
            session: "",
            level: "",
        },
    });

    const selectedCourse = watch("course");
    const selectedSession = watch("session");
    const selectedLevel = watch("level");

    useEffect(() => {
        if (selectedCourse) {
            setSessionList(getSessionFromPackage({ courseId: selectedCourse }));
            setValue("session", "");
            setValue("level", "");
        } else {
            setSessionList([]);
            setLevelList([]);
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedCourse && selectedSession) {
            setLevelList(
                getLevelsFromPackage2({ courseId: selectedCourse, sessionId: selectedSession }),
            );
        } else {
            setLevelList([]);
        }
    }, [selectedSession]);

    const onSubmit = (data: FormValues) => {
        console.log("Submitted Data:", data);
        // api call
    };

    return (
        <div className="mt-10 flex flex-col gap-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <div>Course</div>
                        <Select
                            onValueChange={(value) => {
                                setValue("course", value);
                                trigger("course");
                            }}
                            {...register("course")}
                            defaultValue=""
                        >
                            <SelectTrigger className="h-[40px] w-[320px]">
                                <SelectValue placeholder="Select a Course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courseList.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div>Session</div>
                        <Select
                            onValueChange={(value) => {
                                setValue("session", value);
                                trigger("session");
                            }}
                            {...register("session")}
                            defaultValue=""
                            disabled={!sessionList.length}
                        >
                            <SelectTrigger className="h-[40px] w-[320px]">
                                <SelectValue placeholder="Select a Session" />
                            </SelectTrigger>
                            <SelectContent>
                                {sessionList.map((session) => (
                                    <SelectItem key={session.id} value={session.id}>
                                        {session.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div>Level</div>
                        <Select
                            onValueChange={(value) => {
                                setValue("level", value);
                                trigger("level");
                            }}
                            defaultValue=""
                            disabled={!levelList.length}
                            {...register("level")}
                        >
                            <SelectTrigger className="h-[40px] w-[320px]">
                                <SelectValue placeholder="Select a Level" />
                            </SelectTrigger>
                            <SelectContent>
                                {levelList.map((level) => (
                                    <SelectItem key={level.id} value={level.id}>
                                        {level.level_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-row items-end justify-between gap-4">
                    <div>
                        <MyButton buttonType="secondary">Generate Report</MyButton>
                    </div>
                </div>

                {/* Error Message at One Place */}
                {Object.keys(errors).length > 0 && (
                    <div className="mt-4 text-red-500">
                        <h4 className="font-semibold">Please fix the following errors:</h4>
                        <ul className="ml-4 list-disc">
                            {Object.entries(errors).map(([key, error]) => (
                                <li key={key}>{error.message}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </form>
            {reportData && <div className="border"></div>}
            {reportData && (
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row justify-between gap-10">
                            <div className="flex flex-col gap-6">
                                <div className="text-h3 text-primary-500">Student Name</div>
                            </div>
                            <div className="flex flex-row gap-10">
                                <ReportRecipientsDialogBox />
                                <MyButton buttonType="secondary">Export</MyButton>
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                Course:{" "}
                                {courseList.find((course) => course.id === selectedCourse)?.name}
                            </div>
                            <div>
                                Session:{" "}
                                {
                                    sessionList.find((session) => session.id === selectedSession)
                                        ?.name
                                }
                            </div>
                            <div>
                                Level:{" "}
                                {levelList.find((level) => level.id === selectedLevel)?.level_name}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
