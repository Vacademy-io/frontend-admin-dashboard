import { MyDropdown } from "../design-system/dropdown";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";
// import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";

interface SessionDropdownProps {
    sessionDirection?: string;
    className?: string;
}

export const SessionDropdown = ({ sessionDirection, className }: SessionDropdownProps) => {
    // const { isError, isLoading } = useInstituteQuery();
    // const data = useInstituteQuery();

    const sessionList = useGetSessions();

    // if (isError) return <div>Error</div>;
    // if (isLoading) return <div>Loading...</div>;

    return (
        <div className={`flex items-center gap-2 ${sessionDirection}`}>
            <div className={`${className}`}>Session</div>
            <MyDropdown
                currentValue={sessionList[0]}
                dropdownList={sessionList}
                placeholder="Select Session"
            />
        </div>
    );
};
