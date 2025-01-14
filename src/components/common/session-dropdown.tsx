// components/session-dropdown.tsx
import { MyDropdown } from "../design-system/dropdown";
import { useSessionDropdown } from "@/hooks/student-list-section/useSessionDropdown";

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
            <div className={`${className}`}>Session</div>
            <MyDropdown
                currentValue={currentSession}
                dropdownList={sessionList}
                placeholder="Select Session"
                handleChange={handleSessionChange}
            />
        </div>
    );
};
