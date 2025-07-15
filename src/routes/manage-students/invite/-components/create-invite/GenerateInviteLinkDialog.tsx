import { MyButton } from '@/components/design-system/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface Course {
    id: string;
    name: string;
}

export interface Batch {
    sessionId: string;
    levelId: string;
    sessionName: string;
    levelName: string;
}

export interface GenerateInviteLinkDialogProps {
    selectedCourse: Course | null;
    selectedBatches: Batch[];
    showSummaryDialog: boolean;
    setShowSummaryDialog: (open: boolean) => void;
}

const GenerateInviteLinkDialog = ({
    selectedCourse,
    selectedBatches,
    showSummaryDialog,
    setShowSummaryDialog,
}: GenerateInviteLinkDialogProps) => {
    return (
        <>
            <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
                <DialogContent className="animate-fadeIn min-w-[350px] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Selection Summary</DialogTitle>
                    </DialogHeader>
                    {selectedCourse && selectedBatches.length > 0 && selectedBatches[0] ? (
                        <div className="mt-4 text-base">
                            You have selected:
                            <ul className="ml-4 mt-2 list-disc text-sm">
                                <li>
                                    <span className="font-semibold">Course:</span>{' '}
                                    {selectedCourse.name}
                                </li>
                                <li>
                                    <span className="font-semibold">Session:</span>{' '}
                                    {selectedBatches[0].sessionName}
                                </li>
                                <li>
                                    <span className="font-semibold">Level:</span>{' '}
                                    {selectedBatches[0].levelName}
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="mt-4 text-base">No selection made.</div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <MyButton
                            type="button"
                            scale="small"
                            buttonType="primary"
                            className="px-6"
                            onClick={() => setShowSummaryDialog(false)}
                        >
                            Close
                        </MyButton>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GenerateInviteLinkDialog;
