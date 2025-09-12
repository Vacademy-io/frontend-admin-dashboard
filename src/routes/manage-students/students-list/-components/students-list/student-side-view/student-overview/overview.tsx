import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
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
}: {
    selectedStudent: StudentTable | null;
    packageSessionDetails: BatchForSessionType | null;
    password: string;
}) => {
    if (selectedStudent == null) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const na = (value: any) => (value ? value : 'N/A');

    const overviewSections: OverviewDetailsType[] = [
        {
            heading: `Account Credentials`,
            content: [`Username: ${na(selectedStudent.username)}`, `Password: ${password}`],
        },
        {
            heading: `General Details`,
            content: [
                `${getTerminology(ContentTerms.Course, SystemTerms.Course)}: ${na(
                    packageSessionDetails?.package_dto.package_name
                )}`,
                `Overall Attendance: ${na(selectedStudent.attendance_percent + '%')}`,
                `${getTerminology(ContentTerms.Level, SystemTerms.Level)}: ${na(
                    packageSessionDetails?.level.level_name
                )}`,
                `${getTerminology(ContentTerms.Session, SystemTerms.Session)}: ${na(
                    packageSessionDetails?.session.session_name
                )}`,
                `Enrollment No: ${na(selectedStudent.institute_enrollment_id)}`,
                `Gender: ${na(selectedStudent.gender)}`,
                `School: ${na(selectedStudent.linked_institute_name)}`,
            ],
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
            content: [
                `State: ${na(selectedStudent.region)}`,
                `City: ${na(selectedStudent.city)}`,
                `Pincode: ${na(selectedStudent.pin_code)}`,
                `Address: ${na(selectedStudent.address_line)}`,
            ],
        },
        {
            heading: "Parent/Guardian's Details",
            content: [
                `Father/Male Guardian's Name: ${na(selectedStudent.father_name)}`,
                `Father/Male Guardian's Mobile No.: ${na(selectedStudent.parents_mobile_number)}`,
                `Father/Male Guardian's Email Id: ${na(selectedStudent.parents_email)}`,
                `Mother/Female Guardian's Name: ${na(selectedStudent.mother_name)}`,
                `Mother/Female Guardian's Mobile No: ${na(selectedStudent.parents_to_mother_mobile_number)}`,
                `Mother/Female Guardian's Email Id: ${na(selectedStudent.parents_to_mother_email)}`,
            ],
        },
    ];

    return overviewSections;
};
