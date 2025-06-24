// components/StudentFilters.tsx
import { MyButton } from '@/components/design-system/button';
import { Export, Plus, Funnel, X } from '@phosphor-icons/react';
import { Filters } from './myFilter';
import { StudentSearchBox } from '../../../../../../components/common/student-search-box';
import { StudentFiltersProps } from '@/routes/manage-students/students-list/-types/students-list-types';
import { useMemo, useRef, useState } from 'react';
import { exportStudentsCsv } from '../../../-services/exportStudentsCsv';
import { exportAccountDetails } from '../../../-services/exportAccountDetails';
import { MyDropdown } from '@/components/common/students/enroll-manually/dropdownForPackageItems';
import { AddSessionDialog } from '@/routes/manage-institute/sessions/-components/session-operations/add-session/add-session-dialog';
import { useAddSession } from '@/services/study-library/session-management/addSession';
import { AddSessionDataType } from '@/routes/manage-institute/sessions/-components/session-operations/add-session/add-session-form';
import { toast } from 'sonner';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

export const StudentFilters = ({
    currentSession,
    filters,
    searchInput,
    searchFilter,
    columnFilters,
    clearFilters,
    getActiveFiltersState,
    onSessionChange,
    onSearchChange,
    onSearchEnter,
    onClearSearch,
    onFilterChange,
    onFilterClick,
    onClearFilters,
    totalElements,
    appliedFilters,
    sessionList,
}: StudentFiltersProps) => {
    const [isAddSessionDiaogOpen, setIsAddSessionDiaogOpen] = useState(false);
    const handleOpenAddSessionDialog = () => {
        if (!instituteDetails?.batches_for_sessions.length) return;
        setIsAddSessionDiaogOpen(!isAddSessionDiaogOpen);
    };
    const addSessionMutation = useAddSession();
    const [disableAddButton, setDisableAddButton] = useState(true);
    const { instituteDetails } = useInstituteDetailsStore();

    const handleAddSession = (sessionData: AddSessionDataType) => {
        const processedData = structuredClone(sessionData);

        const transformedData = {
            ...processedData,
            levels: processedData.levels.map((level) => ({
                id: level.level_dto.id,
                new_level: level.level_dto.new_level === true,
                level_name: level.level_dto.level_name,
                duration_in_days: level.level_dto.duration_in_days,
                thumbnail_file_id: level.level_dto.thumbnail_file_id,
                package_id: level.level_dto.package_id,
            })),
        };

        // Use type assertion since we know this is the correct format for the API
        addSessionMutation.mutate(
            { requestData: transformedData as unknown as AddSessionDataType },
            {
                onSuccess: () => {
                    toast.success('Session added successfully');
                    setIsAddSessionDiaogOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to add session');
                },
            }
        );
    };

    const formSubmitRef = useRef(() => {});

    const submitButton = (
        <div className="flex items-center justify-end">
            <MyButton
                type="submit"
                buttonType="primary"
                layoutVariant="default"
                scale="large"
                className="w-[140px]"
                disable={disableAddButton}
                onClick={() => formSubmitRef.current()}
            >
                Add
            </MyButton>
        </div>
    );

    const submitFn = (fn: () => void) => {
        formSubmitRef.current = fn;
    };

    const isFilterActive = useMemo(() => {
        return getActiveFiltersState();
    }, [columnFilters, searchFilter]);

    const handleExportClick = () => {
        exportStudentsCsv({ pageNo: 0, pageSize: totalElements || 0, filters: appliedFilters });
    };

    const handleExportAccountDetails = () => {
        exportAccountDetails({ pageNo: 0, pageSize: totalElements || 0, filters: appliedFilters });
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Top section with session selector and export buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Session selector */}
                <div className="flex-1 max-w-xs">
                    {sessionList.length == 0 ? (
                        <AddSessionDialog
                            isAddSessionDiaogOpen={isAddSessionDiaogOpen}
                            handleOpenAddSessionDialog={handleOpenAddSessionDialog}
                            handleSubmit={handleAddSession}
                            trigger={
                                <div className="group relative">
                                    <MyButton
                                        buttonType="text"
                                        className="group flex items-center gap-2 text-primary-500 disabled:text-primary-300 hover:scale-102 transition-all duration-200"
                                        disable={!instituteDetails?.batches_for_sessions.length}
                                    >
                                        <Plus className="size-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="hidden sm:inline">Add New Session</span>
                                        <span className="sm:hidden">Add Session</span>
                                    </MyButton>
                                    {!instituteDetails?.batches_for_sessions.length && (
                                        <p className="-mt-1 text-[10px] text-neutral-400 text-center">
                                            (Create a course first)
                                        </p>
                                    )}
                                </div>
                            }
                            submitButton={submitButton}
                            setDisableAddButton={setDisableAddButton}
                            submitFn={submitFn}
                        />
                    ) : (
                        <div className="group">
                            <MyDropdown
                                currentValue={currentSession}
                                dropdownList={sessionList}
                                placeholder="Select Session"
                                handleChange={onSessionChange}
                            />
                        </div>
                    )}
                </div>

                {/* Export buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <MyButton
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        onClick={handleExportAccountDetails}
                        className="group flex items-center gap-2 hover:scale-102 transition-all duration-200 bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200"
                    >
                        <Export className="size-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="hidden md:inline">Export account details</span>
                        <span className="md:hidden">Account Details</span>
                    </MyButton>
                    <MyButton
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        id="export-data"
                        onClick={handleExportClick}
                        className="group flex items-center gap-2 hover:scale-102 transition-all duration-200 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-200 text-emerald-700"
                    >
                        <Export className="size-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="hidden md:inline">Export Data</span>
                        <span className="md:hidden">Export</span>
                    </MyButton>
                </div>
            </div>

            {/* Filters and search section */}
            <div className="bg-gradient-to-r from-white to-neutral-50/30 rounded-xl p-4 border border-neutral-200/50 shadow-sm">
                <div className="flex flex-col gap-4">
                    {/* Search box */}
                    <div className="w-full lg:max-w-md">
                        <StudentSearchBox
                            searchInput={searchInput}
                            searchFilter={searchFilter}
                            onSearchChange={onSearchChange}
                            onSearchEnter={onSearchEnter}
                            onClearSearch={onClearSearch}
                        />
                    </div>

                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-3">
                        {filters.map((filter, index) => (
                            <div 
                                key={filter.id}
                                className="animate-slideInRight"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <Filters
                                    filterDetails={{
                                        label: filter.title,
                                        filters: filter.filterList.map((filter) => ({
                                            id: filter.id,
                                            label: filter.label,
                                        })),
                                    }}
                                    onFilterChange={(values) => onFilterChange(filter.id, values)}
                                    clearFilters={clearFilters}
                                    filterId={filter.id}
                                    columnFilters={columnFilters}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Filter action buttons */}
                    {(columnFilters.length > 0 || isFilterActive) && (
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-200/50 animate-scaleIn">
                            <MyButton
                                buttonType="primary"
                                scale="small"
                                layoutVariant="default"
                                className="group flex items-center gap-2 h-8 hover:scale-102 transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md"
                                onClick={onFilterClick}
                            >
                                <Funnel className="size-3.5 group-hover:scale-110 transition-transform duration-200" />
                                Apply Filters
                            </MyButton>
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                layoutVariant="default"
                                className="group flex items-center gap-2 h-8 border border-neutral-300 bg-neutral-100 hover:border-neutral-400 hover:bg-neutral-200 active:border-neutral-500 active:bg-neutral-300 hover:scale-102 transition-all duration-200"
                                onClick={onClearFilters}
                            >
                                <X className="size-3.5 group-hover:scale-110 transition-transform duration-200" />
                                Reset All
                            </MyButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
