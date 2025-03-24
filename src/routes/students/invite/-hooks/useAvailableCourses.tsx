import { InviteFormType } from "../-schema/InviteFormSchema";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

/**
 * Custom hook that provides utility functions to work with available courses
 *
 * @returns Object containing utility functions for course management
 */
export const useCoursesUtility = () => {
    // Get the getCourseFromPackage function from the store
    const getCourseFromPackage = useInstituteDetailsStore((state) => state.getCourseFromPackage);

    /**
     * Filters out courses that are already selected in the form's batches
     *
     * @param formBatches The batches object from the form
     * @param params Optional parameters for filtering courses
     * @returns Array of available courses that haven't been selected yet
     */
    const getAvailableCourses = (
        formBatches: InviteFormType["batches"] | undefined,
        params?: {
            levelId?: string;
            sessionId?: string;
        },
    ) => {
        // Get all courses based on the provided params
        const allCourses = getCourseFromPackage(params);

        // If no batches in form, return all courses
        if (!formBatches) {
            return allCourses;
        }

        // Create a Set of all course IDs that are already selected
        const selectedCourseIds = new Set<string>();

        // Add preSelectedCourses IDs to the Set
        if (formBatches.preSelectedCourses) {
            formBatches.preSelectedCourses.forEach((course) => {
                selectedCourseIds.add(course.id);
            });
        }

        // Add learnerChoiceCourses IDs to the Set
        if (formBatches.learnerChoiceCourses) {
            formBatches.learnerChoiceCourses.forEach((course) => {
                selectedCourseIds.add(course.id);
            });
        }

        // Filter out courses that are already selected
        return allCourses.filter((course) => !selectedCourseIds.has(course.id));
    };

    return {
        getAvailableCourses,
    };
};

/**
 * Example usage:
 *
 * // In a component:
 * const { getAvailableCourses } = useCoursesUtility();
 * const formBatches = form.getValues('batches');
 * const availableCourses = getAvailableCourses(formBatches, { levelId: 'some-level-id' });
 */
