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
     * @param excludedLevelIds Optional array of level IDs to exclude from the results
     * @returns Array of available levels that haven't been selected yet
     */
    const getAvailableLevels = (
        courseId: string,
        sessionId: string,
        formBatches: InviteFormType["batches"] | undefined,
        excludedLevelIds: string[] = [],
    ) => {
        // If courseId or sessionId is not provided, return empty array
        if (!courseId || !sessionId) {
            return [];
        }

        // Get all levels based on the courseId and sessionId
        const allLevels = getLevelsFromPackage({ courseId, sessionId });

        // If no batches in form, filter out only the excluded level IDs
        if (!formBatches) {
            return allLevels.filter((level) => !excludedLevelIds.includes(level.id));
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

        // Add all excluded level IDs to our set
        excludedLevelIds.forEach((id) => selectedLevelIds.add(id));

        // Filter out levels that are already selected or in the excluded list
        return allLevels.filter((level) => !selectedLevelIds.has(level.id));
    };

    /**
     * Gets both compulsory and student preference level lists
     * ensuring levels don't appear in both lists simultaneously
     *
     * @param courseId The ID of the course to get levels for
     * @param sessionId The ID of the session to get levels for
     * @param formBatches The batches object from the form
     * @param compulsoryLevelIds Currently selected compulsory level IDs
     * @param studentPreferenceLevelIds Currently selected student preference level IDs
     * @returns Object containing two arrays of available levels
     */
    const getAvailableLevelsByType = (
        courseId: string,
        sessionId: string,
        formBatches: InviteFormType["batches"] | undefined,
        compulsoryLevelIds: string[] = [],
        studentPreferenceLevelIds: string[] = [],
    ) => {
        // If courseId or sessionId is not provided, return empty arrays
        if (!courseId || !sessionId) {
            return {
                compulsoryLevels: [],
                studentPreferenceLevels: [],
            };
        }

        // Get all available levels first
        const allAvailableLevels = getLevelsFromPackage({ courseId, sessionId });

        // Apply exclusions from the form batches
        const selectedInFormBatches = new Set<string>();

        if (formBatches) {
            // Collect all selected level IDs from the form batches
            // (using the same logic as in getAvailableLevels)
            if (formBatches.preSelectedCourses) {
                formBatches.preSelectedCourses.forEach((course) => {
                    if (course.id === courseId) {
                        course.preSelectedSessions?.forEach((session) => {
                            if (session.id === sessionId) {
                                session.preSelectedLevels?.forEach((level) => {
                                    selectedInFormBatches.add(level.id);
                                });
                                session.learnerChoiceLevels?.forEach((level) => {
                                    selectedInFormBatches.add(level.id);
                                });
                            }
                        });
                        course.learnerChoiceSessions?.forEach((session) => {
                            if (session.id === sessionId) {
                                session.learnerChoiceLevels?.forEach((level) => {
                                    selectedInFormBatches.add(level.id);
                                });
                            }
                        });
                    }
                });
            }

            if (formBatches.learnerChoiceCourses) {
                formBatches.learnerChoiceCourses.forEach((course) => {
                    if (course.id === courseId) {
                        course.learnerChoiceSessions?.forEach((session) => {
                            if (session.id === sessionId) {
                                session.learnerChoiceLevels?.forEach((level) => {
                                    selectedInFormBatches.add(level.id);
                                });
                            }
                        });
                    }
                });
            }
        }

        // Filter available levels, excluding those selected in form batches
        const availableLevels = allAvailableLevels.filter(
            (level) => !selectedInFormBatches.has(level.id),
        );

        // Filter compulsory levels (excluding student preference selections)
        const compulsoryLevels = availableLevels.filter(
            (level) =>
                !studentPreferenceLevelIds.includes(level.id) ||
                compulsoryLevelIds.includes(level.id),
        );

        // Filter student preference levels (excluding compulsory selections)
        const studentPreferenceLevels = availableLevels.filter(
            (level) =>
                !compulsoryLevelIds.includes(level.id) ||
                studentPreferenceLevelIds.includes(level.id),
        );

        return {
            compulsoryLevels,
            studentPreferenceLevels,
        };
    };

    return {
        getAvailableLevels,
        getAvailableLevelsByType,
    };
};

/**
 * Example usage:
 *
 * // In a component:
 * const { getAvailableLevels, getAvailableLevelsByType } = useLevelsUtility();
 *
 * // For single list of levels:
 * const availableLevels = getAvailableLevels('course-id', 'session-id', formBatches);
 *
 * // For separate lists of compulsory and student preference levels:
 * const { compulsoryLevels, studentPreferenceLevels } = getAvailableLevelsByType(
 *   'course-id',
 *   'session-id',
 *   formBatches,
 *   selectedCompulsoryLevelIds,
 *   selectedStudentPreferenceLevelIds
 * );
 */
