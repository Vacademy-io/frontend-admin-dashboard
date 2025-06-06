import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { BatchSection } from './batch-section';
import { useGetBatchesQuery } from '@/routes/manage-institute/batches/-services/get-batches';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { CreateBatchDialog } from './create-batch-dialog';
import {
    DropdownItemType,
    DropdownValueType,
} from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { MyDropdown } from '@/components/common/students/enroll-manually/dropdownForPackageItems';
import { EmptyBatchImage } from '@/assets/svgs';
import { MyButton } from '@/components/design-system/button';
import { Plus } from 'phosphor-react';

export const ManageBatches = () => {
    const { setNavHeading } = useNavHeadingStore();

    const { getAllSessions, instituteDetails } = useInstituteDetailsStore();
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(
        getAllSessions().map((session) => ({
            id: session.id,
            name: session.session_name,
        }))
    );

    const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>();

    useEffect(() => {
        if (sessionList.length > 0) {
            let selectedSession = sessionList[0];
            getAllSessions().forEach((session) => {
                if (session.status === 'ACTIVE') {
                    selectedSession = { id: session.id, name: session.session_name };
                }
            });
            setCurrentSession(selectedSession);
        } else {
            setCurrentSession(undefined);
        }
    }, [sessionList]);

    const { data, isLoading, isError } = useGetBatchesQuery({
        sessionId: currentSession?.id || '',
    });

    const handleSessionChange = (value: DropdownValueType) => {
        if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
            setCurrentSession(value as DropdownItemType);
        }
    };

    useEffect(() => {
        setSessionList(
            getAllSessions().map((session) => ({
                id: session.id,
                name: session.session_name,
            }))
        );
    }, [instituteDetails]);

    useEffect(() => {
        setNavHeading('Manage Batches');
    }, []);

    if (isLoading) return <DashboardLoader />;

    if (isError) return <div className="flex flex-col items-center justify-center h-full text-neutral-500"><p>Unable to fetch batches. Please try again later.</p></div>;

    return (
        <div className="flex flex-col gap-8 p-2 text-neutral-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xl font-semibold">Student Batches</p>
                    <p className="text-sm text-neutral-500">Manage and organize your student batches by session.</p>
                </div>
                <div className="flex items-center gap-4">
                    {sessionList.length > 0 && currentSession !== undefined && (
                        <MyDropdown
                            currentValue={currentSession}
                            dropdownList={sessionList}
                            placeholder="Select Session"
                            handleChange={handleSessionChange}
                        />
                    )}
                    <CreateBatchDialog />
                </div>
            </div>

            {data && data.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {data.map((batch, index) => <BatchSection key={index} batch={batch} currentSessionId={currentSession?.id} />)}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-5 text-center py-16 rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
                    <EmptyBatchImage className="w-32 h-32 text-neutral-400" />
                    <p className="text-lg font-medium text-neutral-600">
                        {currentSession ? `No batches found for ${currentSession.name}` : 'No sessions available'}
                    </p>
                    <p className="text-sm text-neutral-500 max-w-md">
                        {currentSession
                            ? 'Create a new batch in this session to get started.'
                            : 'Please create a session first before adding batches.'}
                    </p>
                    {currentSession && <CreateBatchDialog />}
                </div>
            )}
        </div>
    );
};
