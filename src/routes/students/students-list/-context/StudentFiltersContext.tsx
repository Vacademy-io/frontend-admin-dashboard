// StudentFiltersContext.tsx
import React, { createContext, useState, useContext } from "react";
import { FilterId } from "@/routes/students/students-list/-types/students-list-types";

type SelectedFilterListType = Record<FilterId, string[]>;

interface StudentFiltersContextType {
    selectedFilterList: SelectedFilterListType;
    setSelectedFilterList: React.Dispatch<React.SetStateAction<SelectedFilterListType>>;
}

const StudentFiltersContext = createContext<StudentFiltersContextType | undefined>(undefined);

export const StudentFiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedFilterList, setSelectedFilterList] = useState<SelectedFilterListType>({
        session: [],
        batch: [],
        statuses: [],
        gender: [],
        session_expiry_days: [],
    });

    return (
        <StudentFiltersContext.Provider value={{ selectedFilterList, setSelectedFilterList }}>
            {children}
        </StudentFiltersContext.Provider>
    );
};

export const useStudentFiltersContext = () => {
    const context = useContext(StudentFiltersContext);
    if (context === undefined) {
        throw new Error("useStudentFiltersContext must be used within a StudentFiltersProvider");
    }
    return context;
};
