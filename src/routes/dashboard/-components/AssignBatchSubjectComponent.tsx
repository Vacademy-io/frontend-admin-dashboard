// src/routes/dashboard/-components/AssignBatchSubjectComponent.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useStudyLibraryQuery } from '@/routes/study-library/courses/-services/getStudyLibraryDetails';
import { useSuspenseQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCourseSubjects } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects';
import { MultiSelect } from '@/components/design-system/multi-select';
import { MyButton } from '@/components/design-system/button';
import { DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { GET_FACULTY_BATCHES_URL, UPDATE_FACULTY_BATCHES_URL } from '@/constants/urls';

const facultyAssignmentsSchema = z.object({
    batch_subject_mappings: z
        .array(
            z.object({
                batch_id: z.string(),
                subject_ids: z
                    .array(z.string())
                    .min(1, 'Each selected batch must have at least one subject.'),
            })
        )
        .min(0),
});

type FacultyAssignmentsFormValues = z.infer<typeof facultyAssignmentsSchema>;

interface FacultyAssignmentPayloadEntry {
    batch_id: string;
    subject_assignments: { subjectId: string; newAssignment: boolean }[];
}

interface FacultyAssignmentsResponse {
    faculty_id: string;
    batch_subject_assignments: {
        batch_id: string;
        subject_assignments: { subjectId: string }[];
    }[];
}

interface AssignBatchSubjectComponentProps {
    teacher: UserRolesDataEntry;
    onClose: () => void;
    refetchData: () => void;
}

const fetchFacultyAssignments = async (facultyId: string): Promise<FacultyAssignmentsResponse> => {
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: GET_FACULTY_BATCHES_URL,
        params: { userId: facultyId },
        headers: { Authorization: `Bearer ${getTokenFromCookie(TokenKey.accessToken)}` },
    });
    return response.data;
};

const updateFacultyAssignmentsAPI = async (payload: {
    faculty_id: string;
    batch_subject_assignments: FacultyAssignmentPayloadEntry[];
}) => {
    const response = await authenticatedAxiosInstance({
        method: 'PUT',
        url: UPDATE_FACULTY_BATCHES_URL,
        data: payload,
        headers: { Authorization: `Bearer ${getTokenFromCookie(TokenKey.accessToken)}` },
    });
    return response.data;
};

export const AssignBatchSubjectComponent: React.FC<AssignBatchSubjectComponentProps> = ({
    teacher,
    onClose,
    refetchData,
}) => {
    const queryClient = useQueryClient();
    const { instituteDetails, getDetailsFromPackageSessionId } = useInstituteDetailsStore();
    const { isLoading: isStudyLibraryLoading } = useSuspenseQuery(useStudyLibraryQuery());

    const form = useForm<FacultyAssignmentsFormValues>({
        resolver: zodResolver(facultyAssignmentsSchema),
        defaultValues: { batch_subject_mappings: [] },
        mode: 'onChange',
    });

    const { data: facultyAssignmentsData, isLoading: isLoadingAssignments } = useQuery<
        FacultyAssignmentsResponse,
        Error
    >({
        queryKey: ['facultyAssignments', teacher.id],
        queryFn: () => fetchFacultyAssignments(teacher.id),
        enabled: !!teacher.id,
    });

    const updateMutation = useMutation<
        unknown,
        Error,
        { faculty_id: string; batch_subject_assignments: FacultyAssignmentPayloadEntry[] }
    >({
        mutationFn: updateFacultyAssignmentsAPI,
        onSuccess: () => {
            toast.success('Assignments updated successfully!');
            refetchData();
            queryClient.invalidateQueries({ queryKey: ['facultyAssignments', teacher.id] });
            onClose();
        },
        onError: (error) => {
            toast.error(`Failed to update assignments: ${error.message || 'Unknown error'}`);
            console.error(error);
        },
    });

    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
    const [subjectSelections, setSubjectSelections] = useState<Record<string, string[]>>({});

    const initialAssignmentsMap = useMemo(() => {
        const map = new Map<string, Set<string>>(); // batchId -> Set of subjectIds
        if (facultyAssignmentsData?.batch_subject_assignments) {
            for (const assignment of facultyAssignmentsData.batch_subject_assignments) {
                map.set(
                    assignment.batch_id,
                    new Set(assignment.subject_assignments.map((sa) => sa.subjectId))
                );
            }
        }
        return map;
    }, [facultyAssignmentsData]);

    useEffect(() => {
        if (facultyAssignmentsData?.batch_subject_assignments) {
            const initialSelectedBatchesFromAPI: string[] = [];
            const initialSubjectSelectionsFromAPI: Record<string, string[]> = {};

            facultyAssignmentsData.batch_subject_assignments.forEach((assignment) => {
                initialSelectedBatchesFromAPI.push(assignment.batch_id);
                initialSubjectSelectionsFromAPI[assignment.batch_id] =
                    assignment.subject_assignments.map((sa) => sa.subjectId);
            });

            setSelectedBatches(initialSelectedBatchesFromAPI);
            setSubjectSelections(initialSubjectSelectionsFromAPI);

            form.reset({
                batch_subject_mappings: initialSelectedBatchesFromAPI.map((batchId) => ({
                    batch_id: batchId,
                    subject_ids: initialSubjectSelectionsFromAPI[batchId] || [],
                })),
            });
        } else if (!isLoadingAssignments) {
            setSelectedBatches([]);
            setSubjectSelections({});
            form.reset({ batch_subject_mappings: [] });
        }
    }, [facultyAssignmentsData, form.reset, teacher.id, isLoadingAssignments]);

    useEffect(() => {
        const currentMappings = selectedBatches.map((batchId) => ({
            batch_id: batchId,
            subject_ids: subjectSelections[batchId] || [],
        }));
        form.setValue('batch_subject_mappings', currentMappings, {
            shouldValidate: true,
            shouldDirty: true,
        });
    }, [selectedBatches, subjectSelections, form.setValue]);

    const availableBatches =
        instituteDetails?.batches_for_sessions?.map((batch) => ({
            id: batch.id,
            name: `${batch.level.level_name} ${batch.package_dto.package_name}, ${batch.session.session_name}`,
        })) || [];

    const getSubjectsByBatchId = useCallback(
        (batchId: string) => {
            const batchDetails = getDetailsFromPackageSessionId({ packageSessionId: batchId });
            if (!batchDetails) return [];
            const subjects = getCourseSubjects(
                batchDetails.package_dto?.id ?? '',
                batchDetails.session?.id ?? '',
                batchDetails.level?.id ?? ''
            );
            return subjects.map((subject) => ({ label: subject.subject_name, value: subject.id }));
        },
        [getDetailsFromPackageSessionId]
    );

    const toggleBatchSelection = (batchId: string) => {
        setSelectedBatches((prevSelectedBatches) => {
            const newSelectedBatches = prevSelectedBatches.includes(batchId)
                ? prevSelectedBatches.filter((id) => id !== batchId)
                : [...prevSelectedBatches, batchId];
            return newSelectedBatches;
        });
    };

    const handleSubjectChange = (batchId: string, selectedSubjectIds: string[]) => {
        setSubjectSelections((prev) => ({ ...prev, [batchId]: selectedSubjectIds }));
    };

    const onSubmit = () => {
        const finalBatchSubjectAssignments: FacultyAssignmentPayloadEntry[] = [];

        const allProcessedBatchIds = new Set([...initialAssignmentsMap.keys(), ...selectedBatches]);

        for (const batchId of allProcessedBatchIds) {
            const initialSubjectsForThisBatch =
                initialAssignmentsMap.get(batchId) || new Set<string>();

            const currentUISubjectsForThisBatch = selectedBatches.includes(batchId)
                ? new Set(subjectSelections[batchId] || [])
                : new Set<string>();

            const subjectAssignmentsPayload: { subjectId: string; newAssignment: boolean }[] = [];

            for (const subjectId of currentUISubjectsForThisBatch) {
                subjectAssignmentsPayload.push({ subjectId, newAssignment: true });
            }

            for (const subjectId of initialSubjectsForThisBatch) {
                if (!currentUISubjectsForThisBatch.has(subjectId)) {
                    subjectAssignmentsPayload.push({ subjectId, newAssignment: false });
                }
            }

            if (subjectAssignmentsPayload.length > 0) {
                finalBatchSubjectAssignments.push({
                    batch_id: batchId,
                    subject_assignments: subjectAssignmentsPayload,
                });
            }
        }

        const payload = {
            faculty_id: teacher.id,
            batch_subject_assignments: finalBatchSubjectAssignments.filter(
                (b) => b.subject_assignments.length > 0
            ),
        };

        updateMutation.mutate(payload);
    };

    if (isStudyLibraryLoading || isLoadingAssignments) {
        return (
            <DialogContent className="flex h-60 w-fit items-center justify-center p-0">
                <Loader className="size-8 animate-spin text-primary-500" />
            </DialogContent>
        );
    }

    return (
        <DialogContent className="flex max-h-[38rem] w-full max-w-2xl flex-col p-0">
            <h1 className="shrink-0 rounded-t-md bg-primary-50 p-4 text-lg font-semibold text-primary-500">
                Assign Batches and Subjects to {teacher.full_name}
            </h1>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex grow flex-col overflow-hidden p-6"
                >
                    <div className="grow space-y-4 overflow-y-auto pb-4 pr-2">
                        <Card className="w-full border-none shadow-none">
                            <CardContent className="p-0.5">
                                {availableBatches.length === 0 && !isStudyLibraryLoading && (
                                    <div className="py-4 text-center text-muted-foreground">
                                        No batches available to assign. Please create batches first.
                                    </div>
                                )}
                                {availableBatches.map((batch) => (
                                    <div
                                        key={batch.id}
                                        className="mb-3 space-y-3 rounded-md border p-3"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`batch-${batch.id}-${teacher.id}`}
                                                checked={selectedBatches.includes(batch.id)}
                                                onCheckedChange={() =>
                                                    toggleBatchSelection(batch.id)
                                                }
                                                className="size-5 border-2 data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500"
                                            />
                                            <label
                                                htmlFor={`batch-${batch.id}-${teacher.id}`}
                                                className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {batch.name}
                                            </label>
                                        </div>

                                        {selectedBatches.includes(batch.id) && (
                                            <div className="ml-8">
                                                <FormLabel className="text-primary-600 text-sm">
                                                    Select Subjects for this batch
                                                </FormLabel>
                                                <MultiSelect
                                                    selected={subjectSelections[batch.id] || []}
                                                    options={getSubjectsByBatchId(batch.id)}
                                                    onChange={(selected) =>
                                                        handleSubjectChange(batch.id, selected)
                                                    }
                                                    placeholder="Select subjects..."
                                                    className="mt-1"
                                                />
                                                {/* Validation message based on form state */}
                                                {subjectSelections[batch.id]?.length === 0 && (
                                                    <p className="mt-1 text-xs text-destructive">
                                                        At least one subject must be selected for an
                                                        assigned batch.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <FormField
                                    control={form.control}
                                    name="batch_subject_mappings"
                                    render={({ fieldState }) =>
                                        fieldState.error?.message ? (
                                            <FormMessage className="mt-2">
                                                {fieldState.error.message}
                                            </FormMessage>
                                        ) : (
                                            <></>
                                        )
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="mt-auto shrink-0 justify-end gap-3 border-t pt-4 sm:flex">
                        <MyButton
                            type="button"
                            scale="medium"
                            buttonType="secondary"
                            onClick={onClose}
                            disable={updateMutation.isPending}
                        >
                            Cancel
                        </MyButton>
                        <MyButton
                            type="submit"
                            scale="medium"
                            buttonType="primary"
                            disable={
                                updateMutation.isPending ||
                                (!form.formState.isDirty && initialAssignmentsMap.size > 0)
                            }
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Assignments'}
                        </MyButton>
                    </div>
                </form>
            </FormProvider>
        </DialogContent>
    );
};
