// components/session-dropdown.tsx
import { MyDropdown } from '../design-system/dropdown';
import { useSessionDropdown } from '@/routes/manage-students/students-list/-hooks/useSessionDropdown';

interface SessionDropdownProps {
    sessionDirection?: string;
    className?: string;
    defaultSession?: string;
    onSessionChange?: (session: string) => void;
}

export const SessionDropdown = ({
    sessionDirection,
    className,
    defaultSession,
    onSessionChange,
}: SessionDropdownProps) => {
    const { sessionList, currentSession, handleSessionChange } = useSessionDropdown({
        defaultSession,
        onSessionChange,
    });

    return (
        <div className={`flex items-center gap-2 ${sessionDirection}`}>
            <p className={`${className}`}>Session</p>
            <MyDropdown
                currentValue={currentSession}
                dropdownList={sessionList}
                placeholder="Select Session"
                handleChange={handleSessionChange}
            />
        </div>
    );
};
