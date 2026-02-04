import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LevelType } from '@/schemas/student/student-list/institute-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MyButton } from '@/components/design-system/button';
import { fetchSubjectWiseProgress, exportLearnersSubjectReport } from '../../-services/utils';
import {
    SubjectProgressResponse,
    SubjectOverviewBatchColumns,
    SUBJECT_OVERVIEW_BATCH_WIDTH,
    SubjectOverviewBatchColumnType,
} from '../../-types/types';
import { useMutation } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { MyTable } from '@/components/design-system/table';
import { usePacageDetails } from '../../-store/usePacageDetails';
import { formatToTwoDecimalPlaces } from '../../-services/helper';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { convertCapitalToTitleCase } from '@/lib/utils';
import { toast } from 'sonner';

const formSchema = z.object({
    course: z.string().min(1, 'Course is required'),
    session: z.string().min(1, 'Session is required'),
    level: z.string().min(1, 'Level is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProgressReports() {
    const {
        getCourseFromPackage,
        getSessionFromPackage,
        getLevelsFromPackage2,
        getPackageSessionId,
    } = useInstituteDetailsStore();
    const { setPacageSessionId, setCourse, setSession, setLevel } = usePacageDetails();
    const courseList = getCourseFromPackage();
    const [sessionList, setSessionList] = useState<{ id: string; name: string }[]>([]);
    const [levelList, setLevelList] = useState<LevelType[]>([]);
    const [subjectReportData, setSubjectReportData] = useState<SubjectProgressResponse>();
    const tableState = { columnVisibility: { module_id: false, user_id: false } };
    const { register, handleSubmit, setValue, watch, trigger } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course: '',
            session: '',
            level: '',
        },
    });
    const selectedCourse = watch('course');
    const selectedSession = watch('session');
    const selectedLevel = watch('level');
    const transformToSubjectOverview = (
        data: SubjectProgressResponse
    ): SubjectOverviewBatchColumnType[] => {
        return data.flatMap((subject) => {
            return subject.modules.map((module, index) => ({
                subject: index === 0 ? subject.subject_name : '', // Only first row gets the subject name
                module: module.module_name,
                module_id: module.module_id,
                module_completed_by_batch: `${formatToTwoDecimalPlaces(module.module_completion_percentage)}%`,
                average_time_spent_by_batch: `${formatToTwoDecimalPlaces(module.avg_time_spent_minutes)} min`,
            }));
        });
    };

    const subjectWiseData = {
        content: subjectReportData ? transformToSubjectOverview(subjectReportData) : [],
        total_pages: 0,
        page_no: 0,
        page_size: 10,
        total_elements: 0,
        last: false,
    };

    const SubjectWiseMutation = useMutation({
        mutationFn: fetchSubjectWiseProgress,
    });
    const { isPending, error } = SubjectWiseMutation;

    const getBatchProgressReportPDF = useMutation({
        mutationFn: () =>
            exportLearnersSubjectReport({
                startDate: '',
                endDate: '',
                packageSessionId:
                    getPackageSessionId({
                        courseId: selectedCourse || '',
                        sessionId: selectedSession || '',
                        levelId: selectedLevel || '',
                    }) || '',
            }),
        onSuccess: async (response) => {
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `batch_progress_report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Batch Progress Report PDF exported successfully');
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleExportPDF = () => {
        getBatchProgressReportPDF.mutate();
    };

    const isExporting = getBatchProgressReportPDF.isPending;

    useEffect(() => {
        if (selectedCourse) {
            setSessionList(getSessionFromPackage({ courseId: selectedCourse }));
            setValue('session', '');
        } else {
            setSessionList([]);
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedSession === '') {
            setValue('level', '');
            setLevelList([]);
        } else if (selectedCourse && selectedSession) {
            setLevelList(
                getLevelsFromPackage2({ courseId: selectedCourse, sessionId: selectedSession })
            );
        }
    }, [selectedSession]);

    const onSubmit = (data: FormValues) => {
        // api call
        SubjectWiseMutation.mutate(
            {
                packageSessionId:
                    getPackageSessionId({
                        courseId: data.course,
                        sessionId: data.session,
                        levelId: data.level,
                    }) || '',
            },
            {
                onSuccess: (data) => {
                    setSubjectReportData(data);
                },
                onError: (error) => {
                    console.error('Error:', error);
                },
            }
        );
        setCourse(courseList.find((course) => (course.id = data.course))?.name || '');
        setSession(sessionList.find((course) => (course.id = data.session))?.name || '');
        setLevel(levelList.find((course) => (course.id = data.level))?.level_name || '');
        setPacageSessionId(
            getPackageSessionId({
                courseId: data.course,
                sessionId: data.session,
                levelId: data.level,
            }) || ''
        );
    };

    return (
        <div className="mt-10 flex flex-col gap-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="w-full sm:w-auto">
                        <div>{getTerminology(ContentTerms.Course, SystemTerms.Course)}</div>
                        <Select
                            onValueChange={(value) => {
                                setValue('course', value);
                            }}
                            {...register('course')}
                            defaultValue=""
                        >
                            <SelectTrigger className="h-[40px] w-full sm:w-[320px]">
                                <SelectValue
                                    placeholder={`Select a ${getTerminology(
                                        ContentTerms.Course,
                                        SystemTerms.Course
                                    )}`}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {courseList.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {convertCapitalToTitleCase(course.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-auto">
                        <div>{getTerminology(ContentTerms.Session, SystemTerms.Session)}</div>
                        <Select
                            onValueChange={(value) => {
                                setValue('session', value);
                            }}
                            {...register('session')}
                            defaultValue=""
                            value={selectedSession}
                            disabled={!sessionList.length}
                        >
                            <SelectTrigger className="h-[40px] w-full sm:w-[320px]">
                                <SelectValue
                                    placeholder={`Select a ${getTerminology(
                                        ContentTerms.Session,
                                        SystemTerms.Session
                                    )}`}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {sessionList.map((session) => (
                                    <SelectItem key={session.id} value={session.id}>
                                        {convertCapitalToTitleCase(session.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-auto">
                        <div>{getTerminology(ContentTerms.Level, SystemTerms.Level)}</div>
                        <Select
                            onValueChange={(value) => {
                                setValue('level', value);
                                trigger('level');
                            }}
                            defaultValue=""
                            value={selectedLevel}
                            disabled={!levelList.length}
                            {...register('level')}
                        >
                            <SelectTrigger className="h-[40px] w-full sm:w-[320px]">
                                <SelectValue
                                    placeholder={`Select a ${getTerminology(
                                        ContentTerms.Level,
                                        SystemTerms.Level
                                    )}`}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {levelList.map((level) => (
                                    <SelectItem key={level.id} value={level.id}>
                                        {convertCapitalToTitleCase(level.level_name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <div className="w-full sm:w-auto">
                        <MyButton buttonType="secondary" className="w-full sm:w-auto">
                            Generate Report
                        </MyButton>
                    </div>
                </div>
                {/* <FormMessage/> */}
            </form>
            {isPending && <DashboardLoader />}
            {subjectReportData && !isPending && <div className="border"></div>}
            {subjectReportData && (
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-10">
                        <div className="flex flex-col gap-2 sm:gap-6">
                            <div className="text-h3 text-primary-500">
                                {courseList.find((course) => course.id === selectedCourse)?.name ||
                                    ''}
                            </div>
                        </div>
                        <MyButton
                            buttonType="secondary"
                            onClick={() => {
                                handleExportPDF();
                            }}
                            className="w-full sm:w-auto"
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500"></div>
                                    <span>Exporting...</span>
                                </div>
                            ) : (
                                'Export'
                            )}
                        </MyButton>
                    </div>
                    <div className="flex flex-col justify-between gap-6">
                        <div className="text-h3 text-primary-500">
                            {getTerminology(ContentTerms.Subjects, SystemTerms.Subjects)}-wise
                            Overview
                        </div>
                        <MyTable
                            data={subjectWiseData}
                            columns={SubjectOverviewBatchColumns}
                            isLoading={isPending}
                            error={error}
                            columnWidths={SUBJECT_OVERVIEW_BATCH_WIDTH}
                            currentPage={0}
                            tableState={tableState}
                        ></MyTable>
                    </div>
                </div>
            )}
        </div>
    );
}
