import { create } from "zustand";

interface TestInputField {
    id: number;
    type: string;
    name: string;
    oldKey: boolean;
    isRequired: boolean;
    options?: {
        id: number;
        value: string;
    }[];
}

interface Student {
    username: string;
    user_id: string;
    email: string;
    full_name: string;
    mobile_number: string;
    guardian_email: string;
    guardian_mobile_number: string;
    file_id: string;
    reattempt_count: number;
}

interface NotifyBeforeAssessmentGoLive {
    checked: boolean;
    value: string;
}

interface TestAccessState {
    status: string;
    closed_test: boolean;
    open_test: {
        checked: boolean;
        start_date: string;
        end_date: string;
        instructions: string;
        name: string;
        email: string;
        phone: string;
        custom_fields: Record<string, TestInputField>;
    };
    select_batch: {
        checked: boolean;
        batch_details: Record<string, string[]>;
    };
    select_individually: {
        checked: boolean;
        student_details: Student[];
    };
    join_link: string;
    show_leaderboard: boolean;
    notify_student: {
        when_assessment_created: boolean;
        before_assessment_goes_live: NotifyBeforeAssessmentGoLive;
        when_assessment_live: boolean;
        when_assessment_report_generated: boolean;
    };
    notify_parent: {
        when_assessment_created: boolean;
        before_assessment_goes_live: NotifyBeforeAssessmentGoLive;
        when_assessment_live: boolean;
        when_student_appears: boolean;
        when_student_finishes_test: boolean;
        when_assessment_report_generated: boolean;
    };
    setTestAccessInfo: (data: Partial<TestAccessState>) => void;
    getTestAccessInfo: () => TestAccessState;
}

export const useTestAccessStore = create<TestAccessState>((set, get) => ({
    status: "",
    closed_test: false,
    open_test: {
        checked: false,
        start_date: "",
        end_date: "",
        instructions: "",
        name: "",
        email: "",
        phone: "",
        custom_fields: {},
    },
    select_batch: {
        checked: false,
        batch_details: {},
    },
    select_individually: {
        checked: false,
        student_details: [],
    },
    join_link: "",
    show_leaderboard: false,
    notify_student: {
        when_assessment_created: false,
        before_assessment_goes_live: { checked: false, value: "" },
        when_assessment_live: false,
        when_assessment_report_generated: false,
    },
    notify_parent: {
        when_assessment_created: false,
        before_assessment_goes_live: { checked: false, value: "" },
        when_assessment_live: false,
        when_student_appears: false,
        when_student_finishes_test: false,
        when_assessment_report_generated: false,
    },
    setTestAccessInfo: (data) => set((state) => ({ ...state, ...data })),
    getTestAccessInfo: () => get(),
}));
