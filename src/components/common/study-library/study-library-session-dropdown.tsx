import { MyDropdown } from "@/components/design-system/study-library-dropdown";
import { StudyLibrarySessionType } from "@/stores/study-library/use-study-library-store";

interface SessionDropdownProps {
    sessionDirection?: string;
    className?: string;
    currentSession?: string | StudyLibrarySessionType;
    onSessionChange?: (session: string | StudyLibrarySessionType) => void;
    sessionList: StudyLibrarySessionType[];
}

export const SessionDropdown = ({
    sessionDirection,
    className,
    currentSession,
    onSessionChange,
    sessionList,
}: SessionDropdownProps) => {
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
