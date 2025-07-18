import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowSquareOut, Info } from 'phosphor-react';
import { useRouter } from '@tanstack/react-router';
import { getUnresolvedDoubtsCount } from '../-services/dashboard-services';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

interface UnresolvedDoubtsWidgetProps {
    instituteId: string;
}

export const UnresolvedDoubtsWidget = ({ instituteId }: UnresolvedDoubtsWidgetProps) => {
    const router = useRouter();
    const { instituteDetails } = useInstituteDetailsStore();
    
    // Get all batch IDs from institute details
    const batchIds = instituteDetails?.batches_for_sessions.map(batch => batch.id) || [];
    
    const { data: doubtsData } = useSuspenseQuery(
        getUnresolvedDoubtsCount(instituteId, batchIds)
    );

    const handleNavigateToDoubts = () => {
        router.navigate({
            to: '/study-library/doubt-management',
        });
    };

    // Only render the widget if there are unresolved doubts
    if (!doubtsData.hasUnresolvedDoubts) {
        return null;
    }

    return (
        <Card 
            className="grow cursor-pointer bg-orange-50 border-orange-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]"
            onClick={handleNavigateToDoubts}
        >
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-orange-800">
                        <Info size={20} weight="fill" className="text-orange-600" />
                        Unresolved Doubts
                    </CardTitle>
                    <ArrowSquareOut size={16} className="text-orange-500" />
                </div>
                <CardDescription className="mt-2 text-xs text-orange-700">
                    You have <span className="font-semibold text-orange-800">{doubtsData.count}</span> unresolved 
                    {doubtsData.count === 1 ? ' doubt' : ' doubts'} from the last 7 days that need attention.
                </CardDescription>
                <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-orange-600">Requires Action</span>
                </div>
            </CardHeader>
        </Card>
    );
}; 