
import { useDoubtFilters } from "@/routes/engagement/doubt-management/-stores/filter-store";
import { useGetDoubtList } from "@/routes/engagement/doubt-management/-services/get-doubt-list";
import { useState } from "react";

export const useDoubtTable = () => {

    const { filters } = useDoubtFilters();

    const [currentPage, setCurrentPage] = useState(0);

    const {
        data: doubts,
        isLoading,
        refetch,
        error,
    } = useGetDoubtList({ filter: filters, pageNo: currentPage, pageSize: 10 });

    return { currentPage, setCurrentPage, doubts, isLoading, error, refetch}
}

