import { useFormContext } from "react-hook-form";
import { SelectionMode, InviteForm } from "../-schema/InviteFormSchema";
import { DropdownItemType } from "@/components/common/students/enroll-manually/dropdownTypesForPackageItems";

/**
 * Hook to manage course, session, and level selections in the invite form
 * Handles adding selections to the appropriate places in the batches structure
 */
export const useBatchSelection = () => {
    const { setValue, getValues } = useFormContext<InviteForm>();

    /**
     * Initialize the batches structure if it doesn't exist
     */
    const initializeBatchesIfNeeded = () => {
        const currentBatches = getValues("batches");
        if (!currentBatches) {
            setValue("batches", {
                maxCourses: 0,
                preSelectedCourses: [],
                learnerChoiceCourses: [],
            });
        }
    };

    /**
     * Add a course to the form based on selection mode
     */
    const addCourse = (
        courseId: string,
        courseName: string,
        selectionMode: SelectionMode,
        maxSessions: number = 1,
    ) => {
        initializeBatchesIfNeeded();
        const batches = getValues("batches") || {
            maxCourses: 0,
            preSelectedCourses: [],
            learnerChoiceCourses: [],
        };

        // Create a deep copy to work with
        const batchesCopy = JSON.parse(JSON.stringify(batches));

        if (selectionMode === "institute" || selectionMode === "both") {
            // Check if course already exists in preSelectedCourses
            // eslint-disable-next-line
            const existingIndex = batchesCopy.preSelectedCourses?.findIndex(
                (course: DropdownItemType) => course.id === courseId,
            );

            if (existingIndex === -1 || existingIndex === undefined) {
                // Course doesn't exist, add it
                if (!batchesCopy.preSelectedCourses) {
                    batchesCopy.preSelectedCourses = [];
                }

                batchesCopy.preSelectedCourses.push({
                    id: courseId,
                    name: courseName,
                    maxSessions,
                    learnerChoiceSessions: [],
                    preSelectedSessions: [],
                });
            }
        } else if (selectionMode === "student") {
            // Check if course already exists in learnerChoiceCourses
            // eslint-disable-next-line
            const existingIndex = batchesCopy.learnerChoiceCourses?.findIndex(
                (course: DropdownItemType) => course.id === courseId,
            );

            if (existingIndex === -1 || existingIndex === undefined) {
                // Course doesn't exist, add it
                if (!batchesCopy.learnerChoiceCourses) {
                    batchesCopy.learnerChoiceCourses = [];
                }

                batchesCopy.learnerChoiceCourses.push({
                    id: courseId,
                    name: courseName,
                    maxSessions,
                    learnerChoiceSessions: [],
                });
            }
        }

        // Update maxCourses count
        const totalCourses =
            (batchesCopy.preSelectedCourses?.length || 0) +
            (batchesCopy.learnerChoiceCourses?.length || 0);
        batchesCopy.maxCourses = totalCourses;

        // Update the form
        setValue("batches", batchesCopy);

        // For debugging
        console.log("After addCourse:", JSON.stringify(getValues("batches")));

        return courseId;
    };

    /**
     * Add a session to a specific course based on selection mode
     */
    const addSession = (
        courseId: string,
        sessionId: string,
        sessionName: string,
        selectionMode: SelectionMode,
        courseSelectionMode: SelectionMode,
        maxLevels: number = 1,
    ) => {
        const batches = getValues("batches");
        if (!batches) {
            initializeBatchesIfNeeded();
            return null;
        }

        // Make a deep copy of batches to modify
        const batchesCopy = JSON.parse(JSON.stringify(batches));

        // Find the course based on selection mode
        let courseArray = "preSelectedCourses";
        if (courseSelectionMode === "student") {
            courseArray = "learnerChoiceCourses";
        }

        if (!batchesCopy[courseArray]) {
            batchesCopy[courseArray] = [];
        }

        // eslint-disable-next-line
        const courseIndex = batchesCopy[courseArray]?.findIndex(
            (course: DropdownItemType) => course.id === courseId,
        );
        if (courseIndex === -1 || courseIndex === undefined) {
            console.error("Course not found:", courseId);
            return null;
        }

        // Add session based on selection mode
        if (courseArray === "preSelectedCourses") {
            if (selectionMode === "institute" || selectionMode === "both") {
                // Add to preSelectedSessions if not already present
                if (!batchesCopy.preSelectedCourses[courseIndex].preSelectedSessions) {
                    batchesCopy.preSelectedCourses[courseIndex].preSelectedSessions = [];
                }

                const sessionExists = batchesCopy.preSelectedCourses[
                    courseIndex
                ].preSelectedSessions.some((session: DropdownItemType) => session.id === sessionId);

                if (!sessionExists) {
                    batchesCopy.preSelectedCourses[courseIndex].preSelectedSessions.push({
                        id: sessionId,
                        name: sessionName,
                        maxLevels,
                        learnerChoiceLevels: [],
                        preSelectedLevels: [],
                    });
                }
            } else {
                // Add to learnerChoiceSessions if not already present
                if (!batchesCopy.preSelectedCourses[courseIndex].learnerChoiceSessions) {
                    batchesCopy.preSelectedCourses[courseIndex].learnerChoiceSessions = [];
                }

                const sessionExists = batchesCopy.preSelectedCourses[
                    courseIndex
                ].learnerChoiceSessions.some(
                    (session: DropdownItemType) => session.id === sessionId,
                );

                if (!sessionExists) {
                    batchesCopy.preSelectedCourses[courseIndex].learnerChoiceSessions.push({
                        id: sessionId,
                        name: sessionName,
                        maxLevels,
                        learnerChoiceLevels: [],
                    });
                }
            }
        } else {
            // For learnerChoiceCourses, add to learnerChoiceSessions
            if (!batchesCopy.learnerChoiceCourses[courseIndex].learnerChoiceSessions) {
                batchesCopy.learnerChoiceCourses[courseIndex].learnerChoiceSessions = [];
            }

            const sessionExists = batchesCopy.learnerChoiceCourses[
                courseIndex
            ].learnerChoiceSessions.some((session: DropdownItemType) => session.id === sessionId);

            if (!sessionExists) {
                batchesCopy.learnerChoiceCourses[courseIndex].learnerChoiceSessions.push({
                    id: sessionId,
                    name: sessionName,
                    maxLevels,
                    learnerChoiceLevels: [],
                });
            }
        }

        // Update the form with modified batches
        setValue("batches", batchesCopy);

        // For debugging
        console.log("After addSession:", JSON.stringify(getValues("batches")));

        return sessionId;
    };

    /**
     * Add levels to a specific session based on selection modes
     */
    const addLevels = (
        courseId: string,
        sessionId: string,
        levelIds: string[],
        levelNames: Record<string, string>,
        selectionMode: SelectionMode,
        courseSelectionMode: SelectionMode,
        sessionSelectionMode: SelectionMode,
        packageSessionIds: Record<string, string>,
    ) => {
        if (levelIds.length === 0) return false;

        const batches = getValues("batches");
        if (!batches) {
            initializeBatchesIfNeeded();
            return false;
        }

        // Make a deep copy of batches to modify
        const batchesCopy = JSON.parse(JSON.stringify(batches));

        // Convert level IDs to level objects with packageSessionId
        const levelObjects = levelIds.map((id) => ({
            id,
            name: levelNames[id] || id,
            packageSessionId: packageSessionIds[id] || "",
        }));

        // Determine course array and index
        let courseArray = "preSelectedCourses";
        if (courseSelectionMode === "student") {
            courseArray = "learnerChoiceCourses";
        }

        if (!batchesCopy[courseArray]) {
            batchesCopy[courseArray] = [];
        }

        const courseIndex = batchesCopy[courseArray]?.findIndex(
            (course: DropdownItemType) => course.id === courseId,
        );
        if (courseIndex === -1 || courseIndex === undefined) {
            console.error("Course not found:", courseId);
            return false;
        }

        // Determine session array and index
        let sessionArray = "learnerChoiceSessions";
        if (
            courseArray === "preSelectedCourses" &&
            (sessionSelectionMode === "institute" || sessionSelectionMode === "both")
        ) {
            sessionArray = "preSelectedSessions";
        }

        if (!batchesCopy[courseArray][courseIndex][sessionArray]) {
            batchesCopy[courseArray][courseIndex][sessionArray] = [];
        }

        const sessionIndex = batchesCopy[courseArray][courseIndex][sessionArray]?.findIndex(
            (session: DropdownItemType) => session.id === sessionId,
        );

        if (sessionIndex === -1 || sessionIndex === undefined) {
            console.error("Session not found:", sessionId);
            return false;
        }

        // Update the appropriate level array based on selection mode
        if (selectionMode === "institute" || selectionMode === "both") {
            if (sessionArray === "preSelectedSessions" && courseArray === "preSelectedCourses") {
                // Add to preSelectedLevels
                batchesCopy[courseArray][courseIndex][sessionArray][
                    sessionIndex
                ].preSelectedLevels = levelObjects;
            } else {
                // Add to learnerChoiceLevels
                batchesCopy[courseArray][courseIndex][sessionArray][
                    sessionIndex
                ].learnerChoiceLevels = levelObjects;
            }
        } else {
            // For student selection mode, always add to learnerChoiceLevels
            batchesCopy[courseArray][courseIndex][sessionArray][sessionIndex].learnerChoiceLevels =
                levelObjects;
        }

        // Update the form with modified batches
        setValue("batches", batchesCopy);

        // For debugging
        console.log("After addLevels:", JSON.stringify(getValues("batches")));

        return true;
    };

    const getBatchesData = () => {
        return getValues("batches");
    };

    return {
        addCourse,
        addSession,
        addLevels,
        getBatchesData,
    };
};
