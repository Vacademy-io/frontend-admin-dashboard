import { BatchForSessionType } from '@/schemas/student/student-list/institute-schema';
import { StudentTable } from '@/types/student-table-types';

export interface OverviewDetailsType {
    heading: string;
    content: string[];
}

export const OverViewData = ({
    selectedStudent,
    packageSessionDetails,
    password,
    isShow = true,
}: {
    selectedStudent: StudentTable | null;
    packageSessionDetails: BatchForSessionType | null;
    password: string;
    isShow?: boolean;
}) => {
    if (selectedStudent == null) return [];

    /* eslint-disable-next-line */
    const na = (value: any) => (value ? value : 'N/A');

    // General Details - conditionally exclude School for holistic
    const generalDetailsContent = isShow
        ? [
              `Session: ${na(packageSessionDetails?.session.session_name)}`,
              `Enrollment No: ${na(selectedStudent.institute_enrollment_id)}`,
              `Gender: ${na(selectedStudent.gender)}`,
          ]
        : [
              `Course: ${na(packageSessionDetails?.package_dto.package_name)}`,
              `Level: ${na(packageSessionDetails?.level.level_name)}`,
              `Session: ${na(packageSessionDetails?.session.session_name)}`,
              `Enrollment No: ${na(selectedStudent.institute_enrollment_id)}`,
              `Gender: ${na(selectedStudent.gender)}`,
              `School: ${na(selectedStudent.linked_institute_name)}`,
          ];

    const locationDetailsContent = isShow
        ? [
              // For holistic: only show Country
              `Country: ${na(selectedStudent.country)}`,
          ]
        : [
              // For non-holistic: show State and City (original behavior)
              `State: ${na(selectedStudent.region)}`,
              `City: ${na(selectedStudent.city)}`,
          ];

    const overviewSections: OverviewDetailsType[] = [
        {
            heading: `Account Credentials`,
            content: [`Username: ${na(selectedStudent.username)}`, `Password: ${password}`],
        },
        {
            heading: `General Details`,
            content: generalDetailsContent,
        },
        {
            heading: `Contact Information`,
            content: [
                `Mobile No.: ${na(selectedStudent.mobile_number)}`,
                `Email Id: ${na(selectedStudent.email)}`,
            ],
        },
        {
            heading: `Location Details`,
            content: locationDetailsContent,
        },
    ];

    // Only add Parent/Guardian's Details section if NOT a holistic institute
    if (!isShow) {
        overviewSections.push({
            heading: "Parent/Guardian's Details",
            content: [
                `Father's Name: ${na(selectedStudent.father_name)}`,
                `Mother's Name: ${na(selectedStudent.mother_name)}`,
                `Guardian's Name: -`,
                `Mobile No.: ${na(selectedStudent.parents_mobile_number)}`,
                `Email Id: ${na(selectedStudent.parents_email)}`,
            ],
        });
    }

    return overviewSections;
};
