// enroll-student.tsx
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ENROLL_STUDENT_MANUALLY, INSTITUTE_ID } from "@/constants/urls";
import { useMutation } from "@tanstack/react-query";
import {
    StepOneData,
    StepTwoData,
    StepThreeData,
    StepFourData,
    StepFiveData,
} from "@/types/students/schema-enroll-students-manually";

// Define the request schema
// const enrollStudentRequestSchema = z.object({
//   user_details: z.object({
//     username: z.string(),
//     email: z.string(),
//     full_name: z.string(),
//     address_line: z.string(),
//     city: z.string(),
//     mobile_number: z.string(),
//     date_of_birth: z.string(),
//     gender: z.string(),
//     password: z.string(),
//     profile_pic_file_id: z.string().optional(),
//     roles: z.array(z.string()),
//     root_user: z.boolean()
//   }),
//   student_extra_details: z.object({
//     fathers_name: z.string(),
//     mothers_name: z.string(),
//     parents_mobile_number: z.string(),
//     parents_email: z.string(),
//     linked_institute_name: z.string()
//   }),
//   institute_student_details: z.object({
//     institute_id: z.string(),
//     package_session_id: z.string(),
//     enrollment_id: z.string(),
//     enrollment_status: z.string(),
//     enrollment_date: z.string(),
//   })
// });

interface EnrollStudentParams {
    formData: {
        stepOneData: StepOneData | null;
        stepTwoData: StepTwoData | null;
        stepThreeData: StepThreeData | null;
        stepFourData: StepFourData | null;
        stepFiveData: StepFiveData | null;
    };
    packageSessionId: string;
}

export const useEnrollStudent = () => {
    return useMutation({
        mutationFn: async ({ formData, packageSessionId }: EnrollStudentParams) => {
            const requestBody = {
                user_details: {
                    username: formData.stepFiveData?.username || "",
                    email: formData.stepThreeData?.email || "",
                    full_name: formData.stepTwoData?.fullName || "",
                    address_line: "N/A",
                    city: formData.stepThreeData?.city || "",
                    mobile_number: formData.stepThreeData?.mobileNumber || "",
                    // date_of_birth: formData.stepTwoData.dateOfBirth || "",
                    date_of_birth: "",
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

            const response = await authenticatedAxiosInstance.post(
                ENROLL_STUDENT_MANUALLY,
                requestBody,
            );

            return response.data;
        },
    });
};
