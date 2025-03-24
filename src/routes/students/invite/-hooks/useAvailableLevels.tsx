import { InviteFormType } from "../-schema/InviteFormSchema";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

/**
 * Custom hook that provides utility functions to work with available levels
 *
 * @returns Object containing utility functions for level management
 */
export const useLevelsUtility = () => {
    // Get the getLevelsFromPackage function from the store
    const getLevelsFromPackage = useInstituteDetailsStore((state) => state.getLevelsFromPackage);

    /**
     * Filters out levels that are already selected in the form's batches
     *
     * @param courseId The ID of the course to get levels for
     * @param sessionId The ID of the session to get levels for
     * @param formBatches The batches object from the form
     * @returns Array of available levels that haven't been selected yet
     */
    const getAvailableLevels = (
        courseId: string,
        sessionId: string,
        formBatches: InviteFormType["batches"] | undefined,
    ) => {
        // If courseId or sessionId is not provided, return empty array
        if (!courseId || !sessionId) {
            return [];
        }

        // Get all levels based on the courseId and sessionId
        const allLevels = getLevelsFromPackage({ courseId, sessionId });

        // If no batches in form, return all levels
        if (!formBatches) {
            return allLevels;
        }

        // Create a Set of all level IDs that are already selected for this course and session
        const selectedLevelIds = new Set<string>();

        // Check preSelectedCourses
        if (formBatches.preSelectedCourses) {
            formBatches.preSelectedCourses.forEach((course) => {
                if (course.id === courseId) {
                    // Check preSelectedSessions
                    course.preSelectedSessions?.forEach((session) => {
                        if (session.id === sessionId) {
                            // Add preSelectedLevels IDs to the Set
                            session.preSelectedLevels?.forEach((level) => {
                                selectedLevelIds.add(level.id);
                            });

                            // Also add learnerChoiceLevels from this session
                            session.learnerChoiceLevels?.forEach((level) => {
                                selectedLevelIds.add(level.id);
                            });
                        }
                    });

                    // Check learnerChoiceSessions within preSelectedCourses
                    course.learnerChoiceSessions?.forEach((session) => {
                        if (session.id === sessionId) {
                            // Add learnerChoiceLevels IDs to the Set
                            session.learnerChoiceLevels?.forEach((level) => {
                                selectedLevelIds.add(level.id);
                            });
                        }
                    });
                }
            });
        }

        // Check learnerChoiceCourses
        if (formBatches.learnerChoiceCourses) {
            formBatches.learnerChoiceCourses.forEach((course) => {
                if (course.id === courseId) {
                    // Check learnerChoiceSessions within learnerChoiceCourses
                    course.learnerChoiceSessions?.forEach((session) => {
                        if (session.id === sessionId) {
                            // Add learnerChoiceLevels IDs to the Set
                            session.learnerChoiceLevels?.forEach((level) => {
                                selectedLevelIds.add(level.id);
                            });
                        }
                    });
                }
            });
        }

        // Filter out levels that are already selected
        return allLevels.filter((level) => !selectedLevelIds.has(level.id));
    };

    return {
        getAvailableLevels,
    };
};

/**
 * Example usage:
 *
 * // In a component:
 * const { getAvailableLevels } = useLevelsUtility();
 * const formBatches = form.getValues('batches');
 * const availableLevels = getAvailableLevels('course-id', 'session-id', formBatches);
 */
