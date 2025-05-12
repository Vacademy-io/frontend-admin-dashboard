// hooks/useSessionDropdown.ts
import { useState, useCallback } from 'react';
import { useGetSessions } from '@/routes/manage-students/students-list/-hooks/useFilters';

interface UseSessionDropdownProps {
    defaultSession?: string;
    onSessionChange?: (session: string) => void;
}

export const useSessionDropdown = ({
    defaultSession,
    onSessionChange,
}: UseSessionDropdownProps = {}) => {
    const sessionList = useGetSessions();
    const initialSession = defaultSession || sessionList[0] || '';
    const [currentSession, setCurrentSession] = useState(initialSession);

    const handleSessionChange = useCallback(
        (session: string) => {
            setCurrentSession(session);
            onSessionChange?.(session);
        },
        [onSessionChange]
    );

    return {
        sessionList,
        currentSession,
        handleSessionChange,
    };
};
