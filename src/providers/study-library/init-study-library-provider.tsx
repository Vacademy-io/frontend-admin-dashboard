import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useStudyLibraryQuery } from '@/routes/study-library/courses/-services/getStudyLibraryDetails';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, createContext, useContext } from 'react';

interface StudyLibraryContextType {
    isInitLoading: boolean;
}

const StudyLibraryContext = createContext<StudyLibraryContextType>({
    isInitLoading: false,
});

export const useStudyLibraryContext = () => {
    const context = useContext(StudyLibraryContext);
    if (!context) {
        throw new Error('useStudyLibraryContext must be used within InitStudyLibraryProvider');
    }
    return context;
};

export const InitStudyLibraryProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();

    const { studyLibraryData, isInitLoading } = useStudyLibraryStore();

    // Trigger refetch manually on mount
    useEffect(() => {
        if (studyLibraryData == null)
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_STUDY_LIBRARY'] });
    }, [queryClient]);

    const { isLoading: queryLoading } = useQuery({
        ...useStudyLibraryQuery(),
    });

    // Only show full page loader on initial load, not on subsequent refreshes
    const showFullPageLoader = queryLoading && studyLibraryData == null;

    return (
        <StudyLibraryContext.Provider value={{ isInitLoading }}>
            <div className="flex flex-1 flex-col">
                {showFullPageLoader ? <DashboardLoader /> : children}
            </div>
        </StudyLibraryContext.Provider>
    );
};
