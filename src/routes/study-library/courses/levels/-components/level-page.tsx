/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { LevelCard } from './level-card';
import { useRouter } from '@tanstack/react-router';
import { useSidebar } from '@/components/ui/sidebar';
import { getCourseSessions } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForLevels';
import { getCourseLevels } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getLevelWithDetails';
import { AddLevelButton } from './add-level-button';
import { AddLevelData } from './add-level-form';
import { toast } from 'sonner';
import { useAddLevel } from '@/routes/study-library/courses/levels/-services/add-level';
import { useDeleteLevel } from '@/routes/study-library/courses/levels/-services/delete-level';
import useIntroJsTour from '@/hooks/use-intro';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import { studyLibrarySteps } from '@/constants/intro/steps';
import { useUpdateLevel } from '@/routes/study-library/courses/levels/-services/update-level';
import { EmptyLevelPage } from '@/svgs';
import { MyDropdown } from '@/components/common/students/enroll-manually/dropdownForPackageItems';
import {
    DropdownItemType,
    DropdownValueType,
} from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

export const LevelPage = () => {
    const { open } = useSidebar();
    const router = useRouter();
    const searchParams = router.state.location.search;
    const addLevelMutation = useAddLevel();
    const deleteLevelMutation = useDeleteLevel();
    const updateLevelMutation = useUpdateLevel();

    const [instituteType, setInstituteType] = useState('');

    useEffect(() => {
        const type = useInstituteDetailsStore.getState().instituteDetails?.type ?? '';
        console.log(type);
        setInstituteType(type);
    }, []);

    const [sessionList, setSessionList] = useState<DropdownItemType[]>(
        searchParams.courseId
            ? getCourseSessions(searchParams.courseId).map((s) => ({
                  id: s.id,
                  name: s.session_name,
              }))
            : []
    );

    const initialSession: DropdownItemType | undefined = {
        id: sessionList[0]?.id || '',
        name: sessionList[0]?.name || '',
    };

    const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>(
        () => initialSession
    );

    useEffect(() => {
        setSessionList(
            searchParams.courseId
                ? getCourseSessions(searchParams.courseId).map((s) => ({
                      id: s.id,
                      name: s.session_name,
                  }))
                : []
        );
    }, [searchParams.courseId]);

    useEffect(() => {
        setCurrentSession({ id: sessionList[0]?.id || '', name: sessionList[0]?.name || '' });
    }, [sessionList]);

    const [levelList, setLevelList] = useState([]);

    useEffect(() => {
        const fetchedLevels = currentSession
            ? getCourseLevels(searchParams.courseId!, currentSession.id)
            : [];

        const isCorporate = instituteType?.toLowerCase() === 'corporate';
        console.log('isCorporate:', isCorporate);

        const defaultCorporateLevels = [
            { id: 'default-1', name: 'Beginner', duration_in_days: 0, subjects: [] },
            { id: 'default-2', name: 'Intermediate', duration_in_days: 0, subjects: [] },
            { id: 'default-3', name: 'Advanced', duration_in_days: 0, subjects: [] },
        ];

        const combinedLevels = isCorporate
            ? [...defaultCorporateLevels, ...fetchedLevels]
            : fetchedLevels;

        setLevelList(combinedLevels);
    }, [currentSession, searchParams.courseId, instituteType]);

    const handleSessionChange = (value: DropdownValueType) => {
        if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
            setCurrentSession(value as DropdownItemType);
        }
    };

    const handleLeveLDelete = (levelId: string) => {
        deleteLevelMutation.mutate(levelId, {
            onSuccess: () => toast.success('Level deleted successfully'),
            onError: (error) => toast.error(error.message || 'Failed to delete level'),
        });
    };

    const handleAddLevel = ({
        requestData,
        packageId,
        sessionId,
    }: {
        requestData: AddLevelData;
        packageId?: string;
        sessionId?: string;
        levelId?: string;
    }) => {
        addLevelMutation.mutate(
            { requestData, packageId: packageId || '', sessionId: sessionId || '' },
            {
                onSuccess: () => toast.success('Level added successfully'),
                onError: (error) => toast.error(error.message || 'Failed to add course'),
            }
        );
    };

    const handleLevelUpdate = ({ requestData }: { requestData: AddLevelData }) => {
        updateLevelMutation.mutate(
            { requestData },
            {
                onSuccess: () => toast.success('Level updated successfully'),
                onError: (error) => toast.error(error.message || 'Failed to update level'),
            }
        );
    };

    useIntroJsTour({
        key: StudyLibraryIntroKey.assignYearStep,
        steps: studyLibrarySteps.assignYearStep,
    });

    const LevelHeader = () => (
        <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2">
                <div className="text-h3 font-semibold">Level Management</div>
                <div className="text-subtitle">
                    Effortlessly manage classes, subjects, and resources to ensure students have
                    access to the best education materials. Organize, upload, and track study
                    resources for all levels in one place.
                </div>
            </div>
            <div className="flex flex-col items-center gap-4">
                <AddLevelButton onSubmit={handleAddLevel} />
            </div>
        </div>
    );

    return (
        <div className="relative flex flex-1 flex-col gap-8 text-neutral-600">
            {!searchParams.courseId ? (
                <div>Course not found</div>
            ) : sessionList.length === 0 ? (
                <div className="flex flex-1 flex-col">
                    {LevelHeader()}
                    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
                        <div className="w-fit">
                            <EmptyLevelPage />
                        </div>
                        <div className="text-center">No level have been created yet.</div>
                    </div>
                </div>
            ) : (
                <>
                    {LevelHeader()}

                    <div className="flex items-center gap-6">
                        <MyDropdown
                            currentValue={currentSession ?? undefined}
                            dropdownList={sessionList}
                            placeholder="Select Session"
                            handleChange={handleSessionChange}
                        />
                    </div>

                    <div
                        className={`grid ${open ? 'grid-cols-4 gap-4' : 'grid-cols-5 gap-8'} justify-between`}
                    >
                        {levelList.map((level, key) => (
                            <div key={key}>
                                <LevelCard
                                    level={level}
                                    onDelete={handleLeveLDelete}
                                    onEdit={handleLevelUpdate}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
