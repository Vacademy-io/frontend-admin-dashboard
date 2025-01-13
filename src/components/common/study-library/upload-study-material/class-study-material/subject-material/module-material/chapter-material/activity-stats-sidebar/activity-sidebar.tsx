import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { X } from "phosphor-react";
import {
    ActivityStatsColumns,
    ActivityStatsColumnsType,
} from "@/components/design-system/utils/constants/table-column-data";
import { dummyData } from "./dummy-data";
import { MyPagination } from "@/components/design-system/pagination";
import { usePaginationState } from "@/hooks/pagination";
import { useMemo, useState } from "react";
import { ACTIVITY_STATS_COLUMN_WIDTHS } from "@/components/design-system/utils/constants/table-layout";
import { MyTable } from "@/components/design-system/table";
import { MyButton } from "@/components/design-system/button";
import { StudentSearchBox } from "@/components/common/students/students-list/student-search-box";
import { MyInput } from "@/components/design-system/input";
import { ActivityLogDialog } from "@/components/common/students/students-list/student-side-view/student-learning-progress/chapter-details/topic-details/activity-log-dialog";

export const ActivityStatsSidebar = () => {
    const { toggleSidebar } = useSidebar();
    const [searchInput, setSearchInput] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

    const tableData = useMemo(() => {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedItems = dummyData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(dummyData.length / pageSize);

        return {
            content: paginatedItems,
            total_pages: totalPages,
            page_no: page,
            page_size: pageSize,
            total_elements: dummyData.length,
            last: page === totalPages - 1,
        };
    }, [dummyData, page, pageSize]);

    return (
        <div>
            <Sidebar side="right">
                <SidebarContent
                    className={`sidebar-content flex flex-col border-r-2 border-r-neutral-300 bg-white text-neutral-600`}
                >
                    <SidebarHeader>
                        <div className={`} flex flex-col items-center justify-center gap-10`}>
                            <div
                                className={`flex w-full items-center justify-between bg-primary-50 p-3`}
                            >
                                <div className="text-h3 font-semibold text-primary-500">
                                    Activity Stats
                                </div>
                                <X
                                    className="size-6 cursor-pointer text-neutral-500"
                                    onClick={() => {
                                        toggleSidebar();
                                    }}
                                />
                            </div>
                            <div className="flex w-full flex-wrap gap-6 px-6">
                                <div className="flex w-full items-center justify-between">
                                    <StudentSearchBox
                                        searchInput={searchInput}
                                        searchFilter={""}
                                        onSearchChange={handleSearchChange}
                                        onSearchEnter={() => {}}
                                        onClearSearch={() => {}}
                                    />
                                    {startDate && endDate && (
                                        <div className="flex flex-wrap items-center gap-3">
                                            <MyButton
                                                buttonType="primary"
                                                scale="small"
                                                layoutVariant="default"
                                                className="h-8"
                                            >
                                                Filter
                                            </MyButton>
                                            <MyButton
                                                buttonType="secondary"
                                                scale="small"
                                                layoutVariant="default"
                                                className="h-8 border border-neutral-400 bg-neutral-200 hover:border-neutral-500 hover:bg-neutral-300 active:border-neutral-600 active:bg-neutral-400"
                                            >
                                                Reset
                                            </MyButton>
                                        </div>
                                    )}
                                </div>

                                <div className="flex">
                                    <MyInput
                                        inputType="date"
                                        inputPlaceholder="DD/MM/YY"
                                        input={startDate}
                                        onChangeFunction={handleStartDateChange}
                                        required={true}
                                        label="Start Date"
                                        className="w-fit text-neutral-600"
                                    />
                                    <MyInput
                                        inputType="date"
                                        inputPlaceholder="DD/MM/YY"
                                        input={endDate}
                                        onChangeFunction={handleEndDateChange}
                                        required={true}
                                        label="End Date"
                                        className="w-fit text-neutral-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarMenu className="no-scrollbar flex w-full flex-col gap-10 overflow-y-scroll">
                        <SidebarMenuItem className="flex w-full flex-col gap-6 p-6">
                            <div>
                                <MyTable<ActivityStatsColumnsType>
                                    data={tableData}
                                    columns={ActivityStatsColumns}
                                    isLoading={false}
                                    error={null}
                                    columnWidths={ACTIVITY_STATS_COLUMN_WIDTHS}
                                    currentPage={page}
                                />

                                <div className="mt-6">
                                    <MyPagination
                                        currentPage={page}
                                        totalPages={tableData.total_pages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <ActivityLogDialog />
        </div>
    );
};
