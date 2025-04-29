// hooks/useSessionDropdown.ts
import { useState, useCallback } from "react";
import { useGetSessions } from "@/routes/students/students-list/-hooks/useFilters";
import { StudyLibrarySessionType } from "@/stores/study-library/use-study-library-store";

interface UseSessionDropdownProps {
    defaultSession?: string | StudyLibrarySessionType;
    onSessionChange?: (session: string | StudyLibrarySessionType) => void;
}

export const useSessionDropdown = ({
    defaultSession,
    onSessionChange,
}: UseSessionDropdownProps = {}) => {
    const sessionList = useGetSessions();
    const initialSession = defaultSession || sessionList[0] || "";
    const [currentSession, setCurrentSession] = useState(initialSession);

    const handleSessionChange = useCallback(
        (session: string | StudyLibrarySessionType) => {
            setCurrentSession(session);
            onSessionChange?.(session);
        },
        [onSessionChange],
    );

    return {
        sessionList,
        currentSession,
        handleSessionChange,
    };
};
