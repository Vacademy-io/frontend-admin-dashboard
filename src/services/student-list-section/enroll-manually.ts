// services/api/studentApi.ts
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ENROLL_STUDENT_MANUALLY, INSTITUTE_ID } from "@/constants/urls";
import { EnrollStudentRequest } from "@/types/students/type-enroll-student-manually";

export const enrollStudent = async ({
    formData,
    packageSessionId,
}: EnrollStudentRequest): Promise<string> => {
    const requestBody = {
        user_details: {
            username: formData.stepFiveData?.username || "",
            email: formData.stepThreeData?.email || "",
            full_name: formData.stepTwoData?.fullName || "",
            address_line: "N/A",
            city: formData.stepThreeData?.city || "",
            mobile_number: formData.stepThreeData?.mobileNumber || "",
            date_of_birth: formData.stepTwoData?.dateOfBirth || "",
            gender: formData.stepTwoData?.gender || "",
            password: formData.stepFiveData?.password || "",
            profile_pic_file_id: formData.stepOneData?.profilePicture || "",
            roles: ["STUDENT"],
            root_user: false,
        },
        student_extra_details: {
            fathers_name: formData.stepFourData?.fatherName || "",
            mothers_name: formData.stepFourData?.motherName || "",
            parents_mobile_number: formData.stepFourData?.guardianMobileNumber || "",
            parents_email: formData.stepFourData?.guardianEmail || "",
            linked_institute_name: formData.stepTwoData?.collegeName || "",
        },
        institute_student_details: {
            institute_id: INSTITUTE_ID,
            package_session_id: packageSessionId,
            enrollment_id: formData.stepTwoData?.enrollmentNumber || "",
            enrollment_status: "ACTIVE",
            enrollment_date: new Date().toISOString(),
        },
    };

    const response = await authenticatedAxiosInstance.post(ENROLL_STUDENT_MANUALLY, requestBody);
    return response.data;
};
