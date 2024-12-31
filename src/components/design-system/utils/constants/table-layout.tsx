// utils/table-config.ts
export type ColumnWidthConfig = Record<string, string>;

// Default widths for student list columns
export const STUDENT_LIST_COLUMN_WIDTHS: ColumnWidthConfig = {
    checkbox: "min-w-[56px] sticky left-0",
    details: "min-w-[80px] sticky left-[52px]",
    full_name: "min-w-[180px] sticky left-[130px]",
    username: "min-w-[180px]",
    package_session_id: "min-w-[240px]",
    institute_enrollment_id: "min-w-[200px]",
    linked_institute_name: "min-w-[240px]",
    gender: "min-w-[120px]",
    mobile_number: "min-w-[180px]",
    email: "min-w-[240px]",
    father_name: "min-w-[180px]",
    mother_name: "min-w-[180px]",
    guardian_name: "min-w-[180px]",
    parents_mobile_number: "min-w-[180px]",
    parents_email: "min-w-[240px]",
    city: "min-w-[180px]",
    region: "min-w-[180px]",
    expiry_date: "min-w-[180px]",
    status: "min-w-[180px]",
    options: "min-w-[56px] sticky right-0",
};

// Activity log column widths
export const ACTIVITY_LOG_COLUMN_WIDTHS: ColumnWidthConfig = {
    activityDate: "min-w-[120px]",
    startTime: "min-w-[100px]",
    endTime: "min-w-[100px]",
    duration: "min-w-[100px]",
    lastPageRead: "min-w-[120px]",
};
