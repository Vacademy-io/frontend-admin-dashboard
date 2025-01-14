import { useEffect, useState } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";
import { GetFilterData } from "@/constants/student-list/all-filters";
import { MyTable, TableData } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { useStudentFilters } from "@/hooks/student-list-section/useStudentFilters";
import { useStudentTable } from "@/hooks/student-list-section/useStudentTable";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { myColumns } from "@/components/design-system/utils/constants/table-column-data";
import {
    STUDENT_LIST_ASSESSMENT_COLUMN_WIDTHS,
    STUDENT_LIST_COLUMN_WIDTHS,
} from "@/components/design-system/utils/constants/table-layout";
import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import RootErrorComponent from "@/components/core/deafult-error";
import { StudentListHeader } from "@/components/common/students/students-list/student-list-header";
import { StudentFilters } from "@/components/common/students/students-list/student-filters";
import { BulkActions } from "@/components/common/students/students-list/bulk-actions";
import { myAssessmentColumns } from "./assessment-columns";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import testAccessSchema from "../-utils/add-participants-schema";
type TestAccessFormType = z.infer<typeof testAccessSchema>;

export const getCurrentSession = (): string => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return `${currentYear}-${currentYear + 1}`;
};

export const StudentListTab = ({ form }: { form: UseFormReturn<TestAccessFormType> }) => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useSuspenseQuery(useInstituteQuery());
    const sessions = useGetSessions();
    const filters = GetFilterData(getCurrentSession());
    const [isAssessment] = useState(true);
    const { setValue, getValues } = form;
    console.log(getValues());

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    const {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        getActiveFiltersState,
        handleFilterChange,
        handleFilterClick,
        handleClearFilters,
        handleSearchInputChange,
        handleSearchEnter,
        handleClearSearch,
        setAppliedFilters,
        handleSessionChange,
    } = useStudentFilters(getCurrentSession());

    const {
        studentTableData,
        isLoading: loadingData,
        error: loadingError,
        page,
        handleSort,
        handlePageChange,
    } = useStudentTable(appliedFilters, setAppliedFilters);
    const studentTableFilteredData = isAssessment
        ? {
              ...studentTableData,
              content:
                  studentTableData?.content
                      ?.filter((item) => item.status === "ACTIVE") // Filter for "ACTIVE" status
                      .map((item) => ({
                          id: item.id,
                          full_name: item.full_name,
                          package_session_id: item.package_session_id,
                          institute_enrollment_id: item.institute_enrollment_id,
                          linked_institute_name: item.linked_institute_name,
                          gender: item.gender,
                          mobile_number: item.mobile_number,
                          email: item.email,
                          city: item.city,
                          state: item.region,
                      })) || [],
          }
        : studentTableData;

    const [allPagesData, setAllPagesData] = useState<Record<number, StudentTable[]>>({});
    useEffect(() => {
        if (studentTableData?.content) {
            setAllPagesData((prev) => ({
                ...prev,
                [page]: studentTableData.content,
            }));
        }
    }, [studentTableData?.content, page]);

    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
        const newSelection =
            typeof updaterOrValue === "function"
                ? updaterOrValue(rowSelections[page] || {})
                : updaterOrValue;

        setRowSelections((prev) => ({
            ...prev,
            [page]: newSelection,
        }));
    };

    const handleResetSelections = () => {
        setRowSelections({});
    };

    const getSelectedStudents = (): StudentTable[] => {
        return Object.entries(rowSelections).flatMap(([pageNum, selections]) => {
            const pageData = allPagesData[parseInt(pageNum)];
            if (!pageData) return [];

            return Object.entries(selections)
                .filter(([, isSelected]) => isSelected)
                .map(([index]) => pageData[parseInt(index)])
                .filter((student): student is StudentTable => student !== undefined);
        });
    };

    const getSelectedStudentIds = (): string[] => {
        // Setting the selected student details
        setValue(
            "select_individually.student_details",
            getSelectedStudents().map((student) => ({
                username: student.username || "",
                user_id: student.user_id,
                email: student.email,
                full_name: student.full_name,
                mobile_number: student.mobile_number,
                guardian_email: student.parents_email,
                guardian_mobile_number: student.parents_mobile_number,
                file_id: "",
                reattempt_count: 0,
            })),
        );

        // Returning the IDs of the selected students
        return getSelectedStudents().map((student) => student.id);
    };

    console.log(getSelectedStudents());

    const currentPageSelection = rowSelections[page] || {};
    const totalSelectedCount = Object.values(rowSelections).reduce(
        (count, pageSelection) => count + Object.keys(pageSelection).length,
        0,
    );

    if (isLoading) return <DashboardLoader />;
    if (isError) return <RootErrorComponent />;

    return (
        <section className="flex max-w-full flex-col gap-8 overflow-visible">
            <div className="flex flex-col gap-5">
                {!isAssessment && <StudentListHeader />}
                <StudentFilters
                    currentSession={currentSession} // Now this will work
                    sessions={sessions}
                    filters={filters}
                    searchInput={searchInput}
                    searchFilter={searchFilter}
                    columnFilters={columnFilters}
                    clearFilters={clearFilters}
                    getActiveFiltersState={getActiveFiltersState}
                    onSessionChange={handleSessionChange}
                    onSearchChange={handleSearchInputChange}
                    onSearchEnter={handleSearchEnter}
                    onClearSearch={handleClearSearch}
                    onFilterChange={handleFilterChange}
                    onFilterClick={handleFilterClick}
                    onClearFilters={handleClearFilters}
                    appliedFilters={appliedFilters}
                    page={page}
                    pageSize={10}
                    isAssessment={isAssessment}
                />
                <div className="max-w-full">
                    <MyTable<StudentTable>
                        data={studentTableFilteredData as TableData<StudentTable>}
                        columns={isAssessment ? myAssessmentColumns : myColumns}
                        isLoading={loadingData}
                        error={loadingError}
                        onSort={handleSort}
                        columnWidths={
                            isAssessment
                                ? STUDENT_LIST_ASSESSMENT_COLUMN_WIDTHS
                                : STUDENT_LIST_COLUMN_WIDTHS
                        }
                        rowSelection={currentPageSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        currentPage={page}
                    />
                </div>
                <div className="flex">
                    <BulkActions
                        selectedCount={totalSelectedCount}
                        selectedStudentIds={getSelectedStudentIds()}
                        selectedStudents={getSelectedStudents()}
                        onReset={handleResetSelections}
                        isAssessment={isAssessment}
                    />
                    <MyPagination
                        currentPage={page}
                        totalPages={studentTableData?.total_pages || 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </section>
    );
};
