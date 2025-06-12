// src/stores/faculty-batches-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Match the API response structure exactly
export interface FacultyAssignmentsResponse {
    faculty_id: string;
    batch_subject_assignments: {
        batch_id: string;
        subject_assignments: { subjectId: string }[];
    }[];
}

interface FacultyBatchesState {
    facultyId: string;
    batchAssignments: FacultyAssignmentsResponse['batch_subject_assignments'];
    isLoaded: boolean;
    setBatchAssignments: (data: FacultyAssignmentsResponse) => void;
    clearAssignments: () => void;
    hasBatchAccess: (batchId: string) => boolean;
    getSubjectsForBatch: (batchId: string) => string[];
}

export const useFacultyBatchesStore = create<FacultyBatchesState>()(
    persist(
        (set, get) => ({
            facultyId: '',
            batchAssignments: [],
            isLoaded: false,

            setBatchAssignments: (data) =>
                set({
                    facultyId: data.faculty_id,
                    batchAssignments: data.batch_subject_assignments,
                    isLoaded: true,
                }),

            clearAssignments: () =>
                set({
                    facultyId: '',
                    batchAssignments: [],
                    isLoaded: false,
                }),

            hasBatchAccess: (batchId) => {
                // Check if the faculty has access to this batch
                return get().batchAssignments.some((assignment) => assignment.batch_id === batchId);
            },

            getSubjectsForBatch: (batchId) => {
                // Get subjects assigned to the faculty for this batch
                const assignment = get().batchAssignments.find((a) => a.batch_id === batchId);
                return assignment ? assignment.subject_assignments.map((sa) => sa.subjectId) : [];
            },
        }),
        {
            name: 'faculty-batches-storage',
            partialize: (state) => ({
                facultyId: state.facultyId,
                batchAssignments: state.batchAssignments,
                isLoaded: state.isLoaded,
            }),
        }
    )
);
