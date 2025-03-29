import { useInviteFormContext } from "@/routes/students/invite/-context/useInviteFormContext";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import {
    LearnerChoiceCourse,
    PreSelectedCourse,
    SelectionMode,
} from "@/routes/students/invite/-schema/InviteFormSchema";

export function useCourseManager() {
    const { form } = useInviteFormContext();
    const { getValues, setValue } = form;
    const { getCourseFromPackage } = useInstituteDetailsStore();

    // Get all available courses that aren't already selected
    const getAllAvailableCourses = () => {
        const batch = getValues("batches");

        // Get all courses from the institute store
        const allCourses = getCourseFromPackage();

        // Get lists of already selected courses
        const preSelectedCourses = batch?.preSelectedCourses || [];
        const learnerChoiceCourses = batch?.learnerChoiceCourses || [];

        // Filter out courses that are already selected in either array
        const availableCourses = allCourses.filter((course) => {
            const isInPreSelected = preSelectedCourses.some((c) => c.id === course.id);
            const isInLearnerChoice = learnerChoiceCourses.some((c) => c.id === course.id);
            return !isInPreSelected && !isInLearnerChoice;
        });

        return availableCourses;
    };

    // Add or update a course
    const addOrUpdateCourse = (
        newCourse: Partial<LearnerChoiceCourse | PreSelectedCourse>,
        selectionMode: SelectionMode,
        courseIdToReplace?: string,
    ) => {
        const batch = getValues("batches");

        // If courseIdToReplace is provided, delete that course first
        if (courseIdToReplace) {
            deleteCourse(courseIdToReplace);
        }

        // For institute selection mode (preSelectedCourses)
        if (selectionMode === "institute") {
            // Add to preSelectedCourses array
            const currentCourses = [...(batch?.preSelectedCourses || [])];

            // Create a course object with all required fields
            const courseToAdd: PreSelectedCourse = {
                id: newCourse.id || "",
                name: newCourse.name || "",
                maxSessions: newCourse.maxSessions || 1,
                sessionSelectionMode: newCourse.sessionSelectionMode || "institute",
                learnerChoiceSessions: newCourse.learnerChoiceSessions || [],
                preSelectedSessions: (newCourse as PreSelectedCourse).preSelectedSessions || [],
            };

            currentCourses.push(courseToAdd);
            setValue("batches.preSelectedCourses", currentCourses);
            return true;
        }
        // For student selection mode (learnerChoiceCourses)
        else if (selectionMode === "student") {
            // Add to learnerChoiceCourses
            const currentCourses = [...(batch?.learnerChoiceCourses || [])];

            // Create a course object with all required fields
            const courseToAdd: LearnerChoiceCourse = {
                id: newCourse.id || "",
                name: newCourse.name || "",
                maxSessions: newCourse.maxSessions || 1,
                sessionSelectionMode: newCourse.sessionSelectionMode || "student",
                learnerChoiceSessions: newCourse.learnerChoiceSessions || [],
            };

            currentCourses.push(courseToAdd);
            setValue("batches.learnerChoiceCourses", currentCourses);
            return true;
        }

        return false;
    };

    // Delete a course with ID
    const deleteCourse = (courseId: string) => {
        const batch = getValues("batches");
        let deleted = false;

        // Check preSelectedCourses
        if (batch?.preSelectedCourses) {
            const currentPreSelectedCourses = (batch && [...batch.preSelectedCourses]) || [];
            const updatedPreSelectedCourses = currentPreSelectedCourses.filter(
                (course) => course.id !== courseId,
            );

            if (currentPreSelectedCourses.length !== updatedPreSelectedCourses.length) {
                setValue("batches.preSelectedCourses", updatedPreSelectedCourses);
                deleted = true;
            }
        }

        // Check learnerChoiceCourses
        if (batch?.learnerChoiceCourses) {
            const currentLearnerChoiceCourses = (batch && [...batch.learnerChoiceCourses]) || [];
            const updatedLearnerChoiceCourses = currentLearnerChoiceCourses.filter(
                (course) => course.id !== courseId,
            );

            if (currentLearnerChoiceCourses.length !== updatedLearnerChoiceCourses.length) {
                setValue("batches.learnerChoiceCourses", updatedLearnerChoiceCourses);
                deleted = true;
            }
        }

        return deleted;
    };

    // Find a course by ID
    const findCourseById = (courseId: string) => {
        const batch = getValues("batches");

        // Check in preSelectedCourses
        if (batch?.preSelectedCourses) {
            const course = batch?.preSelectedCourses.find((c) => c.id === courseId);
            if (course) return { course, isPreSelected: true };
        }

        // Check in learnerChoiceCourses
        if (batch?.learnerChoiceCourses) {
            const course = batch?.learnerChoiceCourses.find((c) => c.id === courseId);
            if (course) return { course, isPreSelected: false };
        }

        return null;
    };

    // Set max courses
    const setMaxCourses = (newMaxCourses: number) => {
        setValue("batches.maxCourses", newMaxCourses);
        return true;
    };

    // Change course selection mode
    const changeCourseSelectionMode = (newMode: SelectionMode) => {
        setValue("batches.courseSelectionMode", newMode);
        return true;
    };

    return {
        getAllAvailableCourses,
        addOrUpdateCourse,
        deleteCourse,
        findCourseById,
        setMaxCourses,
        changeCourseSelectionMode,
    };
}
