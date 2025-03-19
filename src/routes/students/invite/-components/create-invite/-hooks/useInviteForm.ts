import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inviteFormSchema, InviteFormType, defaultFormValues } from "../-schema/InviteFormSchema";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const useInviteForm = (initialValues?: InviteFormType) => {
    const { instituteDetails, getCourseFromPackage, getLevelsFromPackage, getSessionFromPackage } =
        useInstituteDetailsStore();
    const [courseList, setCourseList] = useState(getCourseFromPackage());
    const [sessionList, setSessionList] = useState(getSessionFromPackage());
    const [levelList, setLevelList] = useState(getLevelsFromPackage());
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // Initialize form
    const form = useForm<InviteFormType>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: initialValues || defaultFormValues,
    });
    const { setValue, getValues, watch } = form;

    // Functions to handle custom fields
    const toggleIsRequired = (id: number) => {
        const customFields = getValues("custom_fields");
        const updatedFields = customFields?.map((field) =>
            field.id === id ? { ...field, isRequired: !field.isRequired } : field,
        );
        setValue("custom_fields", updatedFields);
    };

    const handleAddOpenFieldValues = (type: string, name: string, oldKey: boolean) => {
        const customFields = getValues("custom_fields");
        // Add the new field to the array
        const updatedFields = [
            ...customFields,
            {
                id: customFields.length,
                type,
                name,
                oldKey,
                isRequired: true,
            },
        ];

        // Update the form state with the new array
        setValue("custom_fields", updatedFields);
    };

    const handleDeleteOpenField = (id: number) => {
        const customFields = getValues("custom_fields");
        const updatedFields = customFields?.filter((field) => field.id !== id);
        setValue("custom_fields", updatedFields);
    };

    const handleCopyClick = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopySuccess(link);
                setTimeout(() => {
                    setCopySuccess(null);
                }, 2000);
            })
            .catch((err) => {
                console.log("Failed to copy link: ", err);
                toast.error("Copy failed");
            });
    };

    // Watch for selected values to update dependent dropdowns
    const selectedCourse = watch("selectedCourse") || [];
    const selectedSession = watch("selectedSession") || [];

    // Helper to get IDs from an array of values
    const getIdsFromValues = (values: string[] | { id: string; name: string }[]): string[] => {
        if (!values || !Array.isArray(values)) return [];

        return values
            .map((value) => {
                if (typeof value === "string") return value;
                if (typeof value === "object" && "id" in value) return value.id;
                return "";
            })
            .filter((id) => id !== "");
    };

    // Update sessionList when selectedCourse changes
    useEffect(() => {
        // Store current state for comparison to avoid unnecessary updates
        const currentCourseIds = getIdsFromValues(selectedCourse);

        if (currentCourseIds.length > 0) {
            // Get sessions for all selected courses
            const allSessions = currentCourseIds.flatMap((courseId) =>
                getSessionFromPackage({ courseId }),
            );

            // Filter out duplicates
            const uniqueSessions = allSessions.filter(
                (session, index, self) => index === self.findIndex((s) => s.id === session.id),
            );

            // Only update if there's a change to avoid recursion
            setSessionList(uniqueSessions);
        } else {
            // If no courses selected, show all sessions
            setSessionList(getSessionFromPackage());
        }
        // Only depend on the stringified version of selectedCourse and the functions
        // This prevents unnecessary re-runs
    }, [JSON.stringify(selectedCourse)]);

    // Update levelList when selectedCourse or selectedSession changes
    useEffect(() => {
        const currentCourseIds = getIdsFromValues(selectedCourse);
        const currentSessionIds = getIdsFromValues(selectedSession);

        // Both course and session are selected
        if (currentCourseIds.length > 0 && currentSessionIds.length > 0) {
            const allLevels = currentCourseIds.flatMap((courseId) =>
                currentSessionIds.flatMap((sessionId) =>
                    getLevelsFromPackage({ courseId, sessionId }),
                ),
            );

            const uniqueLevels = allLevels.filter(
                (level, index, self) => index === self.findIndex((l) => l.id === level.id),
            );

            setLevelList(uniqueLevels);
        }
        // Only course is selected
        else if (currentCourseIds.length > 0) {
            const allLevels = currentCourseIds.flatMap((courseId) =>
                getLevelsFromPackage({ courseId }),
            );

            const uniqueLevels = allLevels.filter(
                (level, index, self) => index === self.findIndex((l) => l.id === level.id),
            );

            setLevelList(uniqueLevels);
        }
        // Only session is selected
        else if (currentSessionIds.length > 0) {
            const allLevels = currentSessionIds.flatMap((sessionId) =>
                getLevelsFromPackage({ sessionId }),
            );

            const uniqueLevels = allLevels.filter(
                (level, index, self) => index === self.findIndex((l) => l.id === level.id),
            );

            setLevelList(uniqueLevels);
        }
        // Neither is selected
        else {
            setLevelList(getLevelsFromPackage());
        }
        // Use stringified versions to prevent infinite loops
    }, [JSON.stringify(selectedCourse), JSON.stringify(selectedSession)]);

    // Reset dependencies when parent selections change
    useEffect(() => {
        const courseSelectionMode = watch("courseSelectionMode");
        const previousSelectedCourse = getValues("selectedCourse") || [];

        // Only run this logic if the selection mode is institute or both
        // AND we're detecting a change in the course selection
        if (
            (courseSelectionMode === "institute" || courseSelectionMode === "both") &&
            previousSelectedCourse.length > 0 &&
            selectedCourse.length === 0
        ) {
            // Clear session and level selections
            setValue("selectedSession", []);
            setValue("selectedLevel", []);
        }
    }, [JSON.stringify(selectedCourse)]);

    // Reset level when session changes
    useEffect(() => {
        const sessionSelectionMode = watch("sessionSelectionMode");
        const previousSelectedSession = getValues("selectedSession") || [];

        // Only run this logic if the selection mode is institute or both
        // AND we're detecting a change in the session selection
        if (
            (sessionSelectionMode === "institute" || sessionSelectionMode === "both") &&
            previousSelectedSession.length > 0 &&
            selectedSession.length === 0
        ) {
            // Clear level selections
            setValue("selectedLevel", []);
        }
    }, [JSON.stringify(selectedSession)]);

    // Initialize data when instituteDetails changes
    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
    }, [instituteDetails, getCourseFromPackage, getSessionFromPackage, getLevelsFromPackage]);
    // Initialize data when instituteDetails changes
    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
    }, [instituteDetails]);

    return {
        form,
        courseList,
        sessionList,
        levelList,
        toggleIsRequired,
        handleAddOpenFieldValues,
        handleDeleteOpenField,
        handleCopyClick,
        copySuccess,
    };
};
