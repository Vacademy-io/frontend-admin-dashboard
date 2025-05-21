import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { handleEvaluateLecture } from '../../-services/ai-center-service';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import AITasksList from '../AITasksList';
import { Badge } from '@/components/ui/badge';

const EvaluateLectureComponent = ({ fileId }: { fileId: string }) => {
    const [enableDialog, setEnableDialog] = useState(false);
    const queryClient = useQueryClient();

    /* Generate Assessment Complete */
    const generateAssessmentMutation = useMutation({
        mutationFn: ({ pdfId, taskName }: { pdfId: string; taskName: string }) => {
            return handleEvaluateLecture(pdfId, taskName);
        },
        onSuccess: () => {
            setEnableDialog(true);
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['GET_INDIVIDUAL_AI_LIST_DATA'] });
            }, 100);
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const handleExtractQuestions = () => {
        const now = new Date();
        const formattedDate = now.toLocaleString().replace(', ', '_');

        const taskName = `Task_${formattedDate}`;
        generateAssessmentMutation.mutate({
            pdfId: fileId || '',
            taskName,
        });
    };
    return (
        <>
            {generateAssessmentMutation.status === 'pending' ? (
                <DashboardLoader size={18} color="#ffffff" />
            ) : (
                <Badge
                    className="cursor-pointer bg-[#F4F9FF] text-black"
                    onClick={handleExtractQuestions}
                >
                    Evaluate Lecture
                </Badge>
            )}

            {enableDialog && (
                <AITasksList
                    heading="Vsmart Feedback"
                    enableDialog={enableDialog}
                    setEnableDialog={setEnableDialog}
                />
            )}
        </>
    );
};

export default EvaluateLectureComponent;
