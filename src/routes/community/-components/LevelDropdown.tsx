// components/session-dropdown.tsx
import { MyDropdown } from "@/components/design-system/dropdown";
import { useSessionDropdown } from "@/hooks/student-list-section/useSessionDropdown";

interface LevelDropdownProps {
    sessionDirection?: string;
    defaultSession?: string;
    onSessionChange?: (session: string) => void;
}

export const LevelDropdown = ({
    sessionDirection,
    defaultSession,
    onSessionChange,
}: LevelDropdownProps) => {
    const { sessionList, currentSession, handleSessionChange } = useSessionDropdown({
        defaultSession,
        onSessionChange,
    });

    return (
        <div className={`flex items-center gap-2 ${sessionDirection}`}>
            <MyDropdown
                currentValue={currentSession}
                dropdownList={sessionList}
                placeholder="Select Session"
                handleChange={handleSessionChange}
            />
        </div>
    );
};
