import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState, useEffect } from 'react';
import { Row } from '@tanstack/react-table';
import {
    SubjectOverviewBatchColumnType,
    ChapterReport,
    ChapterOverviewColumns,
    CHAPTER_OVERVIEW_WIDTH,
} from '../../-types/types';
import { useMutation } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { MyTable } from '@/components/design-system/table';
import { fetchChapterWiseProgress, fetchLearnersChapterWiseProgress } from '../../-services/utils';
import { usePacageDetails } from '../../-store/usePacageDetails';
import dayjs from 'dayjs';
import { formatToTwoDecimalPlaces, convertMinutesToTimeFormat } from '../../-services/helper';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';

export const ViewDetails = ({ row }: { row: Row<SubjectOverviewBatchColumnType> }) => {
    const [viewDetailsState, setViewDetailsState] = useState(false);
    const [chapterReportData, setChapterReportData] = useState<ChapterReport>();
    const { pacageSessionId, course, session, level } = usePacageDetails();
    const ChapterWiseMutation = useMutation({
        mutationFn: fetchChapterWiseProgress,
    });
    const LearnersChapterWiseMutation = useMutation({
        mutationFn: fetchLearnersChapterWiseProgress,
    });
    const { isPending: isChapterPending, error: chapterError } = ChapterWiseMutation;
    const { isPending: isLearnerPending, error: learnerError } = LearnersChapterWiseMutation;
    const date = new Date().toString();
    const currDate = dayjs(date).format('DD/MM/YYYY');
    useEffect(() => {
        if (viewDetailsState) {
            if (row.getValue('user_id')) {
                LearnersChapterWiseMutation.mutate(
                    {
                        userId: row.getValue('user_id'),
                        moduleId: row.getValue('module_id'),
                    },
                    {
                        onSuccess: (data) => {
                            setChapterReportData(data);
                        },
                        onError: (error) => {
                            console.error('Error:', error);
                        },
                    }
                );
            } else {
                ChapterWiseMutation.mutate(
                    {
                        packageSessionId: pacageSessionId,
                        moduleId: row.getValue('module_id'),
                    },
                    {
                        onSuccess: (data) => {
                            setChapterReportData(data);
                        },
                        onError: (error) => {
                            console.error('Error:', error);
                        },
                    }
                );
            }
        }
    }, [viewDetailsState]);

    return (
        <div
            className="cursor-pointer text-primary-500"
            onClick={() => {
                setViewDetailsState(!viewDetailsState);
            }}
        >
            View Details
            <MyDialog
                heading="Module Details Report"
                open={viewDetailsState}
                onOpenChange={setViewDetailsState}
                dialogWidth="w-[800px]"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between">
                        <div>Date: {currDate}</div>
                        <MyButton buttonType="secondary">Export</MyButton>
                    </div>
                    <div className="grid grid-cols-3 items-center justify-between gap-4">
                        <div>
                            {getTerminology(ContentTerms.Course, SystemTerms.Course)}: {course}
                        </div>
                        <div>
                            {getTerminology(ContentTerms.Session, SystemTerms.Session)}: {session}
                        </div>
                        <div>
                            {getTerminology(ContentTerms.Level, SystemTerms.Level)}: {level}
                        </div>
                        <div>
                            {getTerminology(ContentTerms.Subjects, SystemTerms.Subjects)}:{' '}
                            {row.getValue('subject')}
                        </div>
                        <div>
                            {getTerminology(ContentTerms.Modules, SystemTerms.Modules)}:{' '}
                            {row.getValue('module')}
                        </div>
                    </div>
                    {(isChapterPending || isLearnerPending) && <DashboardLoader />}
                    {chapterReportData &&
                        chapterReportData.map((chapter) => (
                            <div key={chapter.chapter_id} className="flex flex-col gap-6">
                                <div className="flex flex-row gap-4">
                                    <div className="text-h3 font-[600]">
                                        {getTerminology(
                                            ContentTerms.Chapters,
                                            SystemTerms.Chapters
                                        )}
                                    </div>
                                    <div className="text-h3 text-primary-500">
                                        {chapter.chapter_name}
                                    </div>
                                </div>
                                <MyTable
                                    key={chapter.chapter_id} // Unique key for React list rendering
                                    data={{
                                        content:
                                            chapter.slides?.map((slide) => ({
                                                study_slide: slide.slide_title,
                                                batch_concentration_score: `${formatToTwoDecimalPlaces(
                                                    slide.avg_concentration_score
                                                )} %`,
                                                average_time_spent: `${convertMinutesToTimeFormat(
                                                    slide.avg_time_spent
                                                )}`,
                                            })) || [],
                                        total_pages: 0,
                                        page_no: 0,
                                        page_size: 10,
                                        total_elements: 0,
                                        last: false,
                                    }}
                                    columns={ChapterOverviewColumns} // Use correct column config
                                    isLoading={isChapterPending || isLearnerPending}
                                    error={chapterError || learnerError}
                                    columnWidths={CHAPTER_OVERVIEW_WIDTH} // Ensure this width config matches
                                    currentPage={0}
                                />
                            </div>
                        ))}
                </div>
            </MyDialog>
        </div>
    );
};
