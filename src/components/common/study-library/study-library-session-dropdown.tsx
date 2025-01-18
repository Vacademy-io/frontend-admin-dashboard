// components/session-dropdown.tsx
import { MyDropdown } from "@/components/design-system/dropdown";
import { getSessionNames } from "@/services/study-library/getStudyLibrarySessions";

interface SessionDropdownProps {
    sessionDirection?: string;
    className?: string;
    currentSession?: string;
    onSessionChange?: (session: string) => void;
}

export const SessionDropdown = ({
    sessionDirection,
    className,
    currentSession,
    onSessionChange,
}: SessionDropdownProps) => {
    const sessionList = getSessionNames();

    return (
        <div className={`flex items-center gap-2 ${sessionDirection}`}>
            <p className={`${className}`}>Session</p>
            <MyDropdown
                currentValue={currentSession}
                dropdownList={sessionList}
                placeholder="Select Session"
                handleChange={onSessionChange}
            />
        </div>
    );
};
