import { useMutation, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ADD_COURSE } from "@/constants/urls";
import { AddCourseData } from "@/components/common/study-library/course-material/add-course-form";
import { INSTITUTE_ID } from "@/constants/urls";

export const useAddCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ requestData }: { requestData: AddCourseData }) => {
            const payload = requestData;

            return authenticatedAxiosInstance.post(`${ADD_COURSE}/${INSTITUTE_ID}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_STUDY_LIBRARY"] });
        },
    });
};
