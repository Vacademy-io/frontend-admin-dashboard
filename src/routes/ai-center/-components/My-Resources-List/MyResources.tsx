import { useEffect, useState } from 'react';
import { ResourcesCard } from './ResourcesCard';
import { handleGetListIndividualTopics } from '../../-services/ai-center-service';
import { DashboardLoader } from '@/components/core/dashboard-loader';

interface FileDetail {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    created_on: string;
    source?: string;
    source_id?: string;
    expiry?: string;
    width?: number;
    height?: number;
    updated_on?: string;
}
interface TaskStatus {
    id: string;
    task_name?: string;
    institute_id?: string;
    status?: string;
    result_json?: string;
    input_id?: string;
    input_type?: string;
    created_at?: string;
    updated_at?: string;
    parent_id?: string | null;
    file_detail: FileDetail | null;
}
const MyResources = () => {
    const [allTasks, setAllTasks] = useState<TaskStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const data = await handleGetListIndividualTopics();
                setAllTasks(data);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
                setAllTasks([]); // fallback or keep old state if preferred
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (isLoading)
        return (
            <div className="flex h-screen w-[98%] items-center justify-center">
                <DashboardLoader />
            </div>
        );
    return <ResourcesCard apiResponse={allTasks} />;
};
export default MyResources;
