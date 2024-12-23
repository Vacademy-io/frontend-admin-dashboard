import { InstituteDetailsType } from "@/schemas/student-list/institute-schema";
import { useMemo } from "react";

export const useFilterDataForAssesment = (initData: InstituteDetailsType) => {
    const BatchesFilterData = useMemo(() => {
        return (
            initData?.batches_for_sessions
                ?.map((item) => ({
                    id: String(item.id),
                    name: `${item.level.level_name} ${item.package_dto.package_name}`,
                }))
                .sort((a, b) => Number(a.id) - Number(b.id)) || []
        );
    }, [initData]);

    const SubjectFilterData = useMemo(() => {
        return (
            initData?.subjects?.map((subject) => ({
                id: subject.id,
                name: subject.subject_name,
            })) || []
        );
    }, [initData]);

    const StatusData = useMemo(() => {
        return (
            initData?.student_statuses?.map((status, index) => ({
                id: String(index),
                name: status,
            })) || []
        );
    }, [initData]);

    return {
        BatchesFilterData,
        SubjectFilterData,
        StatusData,
    };
};
