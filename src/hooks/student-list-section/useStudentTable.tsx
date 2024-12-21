// hooks/useStudentTable.ts
import { useState } from "react";
import { StudentFilterRequest } from "@/schemas/student-list/table-schema";
import { useStudentList } from "@/services/student-list-section/getStudentTable";

export const useStudentTable = (
    appliedFilters: StudentFilterRequest,
    onFiltersUpdate: (newFilters: StudentFilterRequest) => void,
) => {
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [sortColumns, setSortColumns] = useState<Record<string, string>>({});

    const {
        data: studentTableData,
        isLoading,
        error,
        refetch,
    } = useStudentList(appliedFilters, page, pageSize);

    const handleSort = async (columnId: string, direction: string) => {
        const newSortColumns = {
            [columnId]: direction,
        };
        setSortColumns(newSortColumns);
        onFiltersUpdate({
            ...appliedFilters,
            sort_columns: newSortColumns,
        });
    };

    const handlePageChange = async (newPage: number) => {
        setPage(newPage);
        await refetch();
    };

    return {
        studentTableData,
        isLoading,
        error,
        page,
        sortColumns,
        refetch,
        handleSort,
        handlePageChange,
    };
};
