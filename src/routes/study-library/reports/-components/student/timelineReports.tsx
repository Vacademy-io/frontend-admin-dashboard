import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { LevelType } from "@/schemas/student/student-list/institute-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MyButton } from "@/components/design-system/button";
import ReportRecipientsDialogBox from "./reportRecipientsDialogBox";
import { useMutation } from "@tanstack/react-query";
import { fetchLearnersReport } from "../../-services/utils";
import { useLearnerDetails, UserResponse } from "../../-store/useLearnersDetails";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";

// import { MyTable } from "@/components/design-system/table";
// import { LineChartComponent } from "../batch/lineChart";

const formSchema = z
    .object({
        course: z.string().min(1, "Course is required"),
        session: z.string().min(1, "Session is required"),
        level: z.string().min(1, "Level is required"),
        student: z.string().min(1, "Student is required"),
        startDate: z.string().min(1, "Start Date is required"),
        endDate: z.string().min(1, "End Date is required"),
    })
    .refine(
        (data) => {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            return diffInDays <= 30;
        },
        {
            message:
                "The difference between Start Date and End Date should be less than one month.",
            path: ["startDate"],
        },
    );

type FormValues = z.infer<typeof formSchema>;

export default function TimelineReports() {
    const {
        getCourseFromPackage,
        getSessionFromPackage,
        getLevelsFromPackage2,
        getPackageSessionId,
    } = useInstituteDetailsStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const courseList = getCourseFromPackage();
    const [sessionList, setSessionList] = useState<{ id: string; name: string }[]>([]);
    const [levelList, setLevelList] = useState<LevelType[]>([]);
    const [studentList, setStudentList] = useState<UserResponse>([]);
    const [reportData, setReportData] = useState(true);
    // const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // setReportData(true); // remove this is only for commid errors
    // setStudentList([]); // remove this is only for commid errors
    const filteredStudents = studentList.filter((student) =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
            student: "",
            startDate: "",
            endDate: "",
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
    const { data } = useLearnerDetails(
        // const { data, isLoading, error } = useLearnerDetails(
        getPackageSessionId({
            courseId: selectedCourse,
            sessionId: selectedSession,
            levelId: selectedLevel,
        }) || "",
        INSTITUTE_ID || "",
    );
    useEffect(() => {
        if (data) {
            setStudentList(data);
        }
    }, [data]);

    const onSubmit = (data: FormValues) => {
        console.log("Submitted Data:", data);
        generateReportMutation.mutate(
            {
                start_date: data.startDate,
                end_date: data.endDate,
                package_session_id:
                    getPackageSessionId({
                        courseId: data.course,
                        sessionId: data.session,
                        levelId: data.level,
                    }) || "",
                user_id: "",
            },
            {
                onSuccess: (data) => {
                    console.log("Success:", data);
                    setReportData(data);
                },
                onError: (error) => {
                    console.error("Error:", error);
                },
            },
        );
        // api call
    };

    // const tableData = {
    //     content: [],
    //     total_pages: 0,
    //     page_no: 0,
    //     page_size: 10,
    //     total_elements: 0,
    //     last: true,
    // };
    const generateReportMutation = useMutation({ mutationFn: fetchLearnersReport });

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

                <div>
                    <div>Student Name</div>
                    <Select
                        onValueChange={(value) => {
                            setValue("student", value);
                        }}
                        {...register("student")}
                        defaultValue=""
                        disabled={!studentList.length}
                    >
                        <SelectTrigger className="h-[40px] w-[320px]">
                            <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent>
                            <Command>
                                {/* Search Input */}
                                <CommandInput
                                    placeholder="Search Student..."
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                />
                                <CommandList>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => (
                                            <SelectItem
                                                key={index}
                                                value={student.user_id}
                                                onSelect={() =>
                                                    setValue("student", student.user_id)
                                                }
                                            >
                                                {student.full_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-gray-500">No students found</div>
                                    )}
                                </CommandList>
                            </Command>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-row items-end justify-between gap-4">
                    <div>
                        <div>Start Date</div>
                        <input
                            className="h-[40px] w-[320px] rounded-md border px-3 py-[10px]"
                            type="date"
                            {...register("startDate")}
                        />
                    </div>
                    <div>
                        <div>End Date</div>
                        <input
                            className="h-[40px] w-[320px] rounded-md border px-3 py-[10px]"
                            type="date"
                            {...register("endDate")}
                        />
                    </div>
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
                    <div className="flex flex-row justify-between gap-10">
                        <div className="flex flex-col gap-6">
                            <div className="text-h3 text-primary-500">Student&lsquo;s Name</div>
                            <div>Date</div>
                        </div>
                        <div className="flex flex-row gap-10">
                            <ReportRecipientsDialogBox />
                            <MyButton buttonType="secondary">Export</MyButton>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-h3 font-[600]">Course Completed by batch</div>
                            <div></div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-h3 font-[600]">
                                Daily Time spent by batch (Avg)
                            </div>
                            <div></div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-h3 font-[600]">
                                Concentration score of batch (Avg)
                            </div>
                            <div></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="text-h3 font-[600] text-primary-500">
                            Concentration score of batch (Avg)
                        </div>
                        <div className="flex flex-row gap-6">
                            {/* <LineChartComponent></LineChartComponent> */}
                            {/* <MyTable
                                data={tableData}
                                columns={activityLogColumns}
                                isLoading={isLoading}
                                error={error}
                                // columnWidths={ACTIVITY_LOG_COLUMN_WIDTHS}
                                currentPage={page}
                            ></MyTable> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
