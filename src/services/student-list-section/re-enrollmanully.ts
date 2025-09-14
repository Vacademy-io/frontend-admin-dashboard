import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { RE_ENROLL_STUDENT_MANUALLY } from '@/constants/urls';
import { EnrollStudentRequest } from '@/types/students/type-enroll-student-manually';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export const reEnrollStudent = async ({
    formData,
    packageSessionId,
}: EnrollStudentRequest): Promise<string> => {
    try {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const tokenData = getTokenDecodedData(accessToken);
        const instituteIds = Object.keys(tokenData?.authorities || {});
        if (instituteIds.length === 0) throw new Error('No institute ID found in token');

        const INSTITUTE_ID = instituteIds[0];

        const requestBody = {
            user_details: {
                username: formData.stepFiveData?.username ?? '',
                email: formData.stepThreeData?.email ?? '',
                full_name: formData.stepTwoData?.fullName ?? '',
                address_line: formData.stepThreeData?.addressLine ?? '',
                city: formData.stepThreeData?.city ?? '',
                region: formData.stepThreeData?.state ?? '',
                pin_code: formData.stepThreeData?.pincode ?? '',
                mobile_number: formData.stepThreeData?.mobileNumber ?? '',
                date_of_birth: '',
                gender: formData.stepTwoData?.gender?.name ?? '',
                password: formData.stepFiveData?.password ?? '',
                profile_pic_file_id: formData.stepOneData?.profilePicture ?? '', // ✅ safe fallback
                roles: ['STUDENT'],
                root_user: false,
            },
            student_extra_details: {
                fathers_name: formData.stepFourData?.fatherName ?? '',
                mothers_name: formData.stepFourData?.motherName ?? '',
                parents_mobile_number: formData.stepFourData?.guardianMobileNumber ?? '',
                parents_email: formData.stepFourData?.guardianEmail ?? '',
                linked_institute_name: formData.stepTwoData?.collegeName ?? '',
                parents_to_mother_mobile_number: formData.stepFourData?.motherMobileNumber ?? '',
                parents_to_mother_email: formData.stepFourData?.motherEmail ?? '',
            },
            institute_student_details: {
                institute_id: INSTITUTE_ID,
                package_session_id: packageSessionId,
                enrollment_id: formData.stepTwoData?.enrollmentNumber ?? '',
                enrollment_status: 'ACTIVE',
                enrollment_date: new Date().toISOString(),
                group_id: null,
                access_days: formData.stepTwoData?.accessDays ?? '',
            },
            status: true,
            status_message: '',
            error_message: '',
        };

        const response = await authenticatedAxiosInstance.post(
            RE_ENROLL_STUDENT_MANUALLY,
            requestBody
        );

        return response.data;
    } catch (error: any) {
        console.error('[ReEnrollStudent Error]', error?.message || error);
        throw new Error(error?.response?.data?.message || 'Failed to re-enroll student.');
    }
};
