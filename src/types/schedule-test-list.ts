interface ScheduleTestData {
    id: string;
    questionPaperTitle: string;
    mode: string;
    type: string;
    status: string;
    batchDetails: string[];
    createdOn: string;
    startDate: string;
    endDate: string;
    subject: string;
    duration: number;
    totalParticipants: number;
    attemptedParticipants: number;
    remainingParticipants: number;
    joinLink: string;
}

interface ScheduleTestTab {
    value: string;
    message: string;
    data: ScheduleTestData[];
}

export interface ScheduleTestListsProps {
    tab: ScheduleTestTab;
    pageNo: number;
    handlePageChange: (page: number) => void;
}
