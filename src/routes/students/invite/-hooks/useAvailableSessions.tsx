import { InviteFormType } from "../-schema/InviteFormSchema";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

/**
 * Custom hook that provides utility functions to work with available sessions
 *
 * @returns Object containing utility functions for session management
 */
export const useSessionsUtility = () => {
    // Get the getSessionFromPackage function from the store
    const getSessionFromPackage = useInstituteDetailsStore((state) => state.getSessionFromPackage);

    /**
     * Filters out sessions that are already selected in the form's batches
     *
     * @param courseId The ID of the course to get sessions for
     * @param formBatches The batches object from the form
     * @returns Array of available sessions that haven't been selected yet
     */
    const getAvailableSessions = (
        courseId: string,
        formBatches: InviteFormType["batches"] | undefined,
    ) => {
        // If courseId is not provided, return empty array
        if (!courseId) {
            return [];
        }

        // Get all sessions based on the courseId
        const allSessions = getSessionFromPackage({ courseId });

        // If no batches in form, return all sessions
        if (!formBatches) {
            return allSessions;
        }

        // Create a Set of all session IDs that are already selected for this course
        const selectedSessionIds = new Set<string>();

        // Check preSelectedCourses for this courseId and get its sessions
        if (formBatches.preSelectedCourses) {
            formBatches.preSelectedCourses.forEach((course) => {
                if (course.id === courseId) {
                    // Add preSelectedSessions IDs to the Set
                    course.preSelectedSessions?.forEach((session) => {
                        selectedSessionIds.add(session.id);
                    });

                    // Add learnerChoiceSessions IDs to the Set from this preSelectedCourse
                    course.learnerChoiceSessions?.forEach((session) => {
                        selectedSessionIds.add(session.id);
                    });
                }
            });
        }

        // Check learnerChoiceCourses for this courseId and get its sessions
        if (formBatches.learnerChoiceCourses) {
            formBatches.learnerChoiceCourses.forEach((course) => {
                if (course.id === courseId) {
                    // Add all learnerChoiceSessions IDs to the Set
                    course.learnerChoiceSessions?.forEach((session) => {
                        selectedSessionIds.add(session.id);
                    });
                }
            });
        }

        // Filter out sessions that are already selected
        return allSessions.filter((session) => !selectedSessionIds.has(session.id));
    };

    return {
        getAvailableSessions,
    };
};

/**
 * Example usage:
 *
 * // In a component:
 * const { getAvailableSessions } = useSessionsUtility();
 * const formBatches = form.getValues('batches');
 * const availableSessions = getAvailableSessions('course-id', formBatches);
 */
