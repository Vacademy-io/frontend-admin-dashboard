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

    // Function to filter selections based on available lists
    // Function to filter selections based on available lists
    // Function to filter selections based on available lists
    const filterSelectionsBasedOnAvailableLists = () => {
        // Filter selectedCourse to only include items that exist in courseList
        const currentSelectedCourse = getValues("selectedCourse") || [];
        if (Array.isArray(currentSelectedCourse) && currentSelectedCourse.length > 0) {
            // Determine if we're dealing with an array of strings or objects
            const isObjectArray =
                currentSelectedCourse.length > 0 && typeof currentSelectedCourse[0] !== "string";

            const filteredCourses = (
                currentSelectedCourse as Array<string | { id: string; name: string }>
            ).filter((course) => {
                const courseId = typeof course === "string" ? course : course.id;
                return courseList.some((availableCourse) => availableCourse.id === courseId);
            });

            if (filteredCourses.length !== currentSelectedCourse.length) {
                // Convert to appropriate type before setting
                if (isObjectArray) {
                    const typedFilteredCourses = filteredCourses.map(
                        (course): { id: string; name: string } => {
                            if (typeof course === "string") {
                                const foundCourse = courseList.find((c) => c.id === course);
                                return foundCourse || { id: course, name: course };
                            }
                            return course;
                        },
                    );
                    setValue("selectedCourse", typedFilteredCourses);
                } else {
                    const typedFilteredCourses = filteredCourses.map((course): string => {
                        return typeof course === "string" ? course : course.id;
                    });
                    setValue("selectedCourse", typedFilteredCourses);
                }
            }
        }

        // Filter selectedSession to only include items that exist in sessionList
        const currentSelectedSession = getValues("selectedSession") || [];
        if (Array.isArray(currentSelectedSession) && currentSelectedSession.length > 0) {
            // Determine if we're dealing with an array of strings or objects
            const isObjectArray =
                currentSelectedSession.length > 0 && typeof currentSelectedSession[0] !== "string";

            const filteredSessions = (
                currentSelectedSession as Array<string | { id: string; name: string }>
            ).filter((session) => {
                const sessionId = typeof session === "string" ? session : session.id;
                return sessionList.some((availableSession) => availableSession.id === sessionId);
            });

            if (filteredSessions.length !== currentSelectedSession.length) {
                // Convert to appropriate type before setting
                if (isObjectArray) {
                    const typedFilteredSessions = filteredSessions.map(
                        (session): { id: string; name: string } => {
                            if (typeof session === "string") {
                                const foundSession = sessionList.find((s) => s.id === session);
                                return foundSession || { id: session, name: session };
                            }
                            return session;
                        },
                    );
                    setValue("selectedSession", typedFilteredSessions);
                } else {
                    const typedFilteredSessions = filteredSessions.map((session): string => {
                        return typeof session === "string" ? session : session.id;
                    });
                    setValue("selectedSession", typedFilteredSessions);
                }
            }
        }

        // Filter selectedLevel to only include items that exist in levelList
        const currentSelectedLevel = getValues("selectedLevel") || [];
        if (Array.isArray(currentSelectedLevel) && currentSelectedLevel.length > 0) {
            // Determine if we're dealing with an array of strings or objects
            const isObjectArray =
                currentSelectedLevel.length > 0 && typeof currentSelectedLevel[0] !== "string";

            const filteredLevels = (
                currentSelectedLevel as Array<string | { id: string; name: string }>
            ).filter((level) => {
                const levelId = typeof level === "string" ? level : level.id;
                return levelList.some((availableLevel) => availableLevel.id === levelId);
            });

            if (filteredLevels.length !== currentSelectedLevel.length) {
                // Convert to appropriate type before setting
                if (isObjectArray) {
                    const typedFilteredLevels = filteredLevels.map(
                        (level): { id: string; name: string } => {
                            if (typeof level === "string") {
                                const foundLevel = levelList.find((l) => l.id === level);
                                return foundLevel || { id: level, name: level };
                            }
                            return level;
                        },
                    );
                    setValue("selectedLevel", typedFilteredLevels);
                } else {
                    const typedFilteredLevels = filteredLevels.map((level): string => {
                        return typeof level === "string" ? level : level.id;
                    });
                    setValue("selectedLevel", typedFilteredLevels);
                }
            }
        }
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

        // After session list is updated, filter the selections
        setTimeout(() => filterSelectionsBasedOnAvailableLists(), 0);
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

        // After level list is updated, filter the selections
        setTimeout(() => filterSelectionsBasedOnAvailableLists(), 0);
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

    // Add a specific effect to run filterSelectionsBasedOnAvailableLists when lists change
    useEffect(() => {
        filterSelectionsBasedOnAvailableLists();
    }, [courseList, sessionList, levelList]);

    // Initialize data when instituteDetails changes
    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
        // After lists are updated, filter the selections
        setTimeout(() => filterSelectionsBasedOnAvailableLists(), 0);
    }, [instituteDetails, getCourseFromPackage, getSessionFromPackage, getLevelsFromPackage]);

    // This duplicate effect is in the original code - keeping it but it could be combined with the above
    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
        // After lists are updated, filter the selections
        setTimeout(() => filterSelectionsBasedOnAvailableLists(), 0);
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
