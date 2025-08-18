import { MyDialog } from '@/components/design-system/dialog';
import { toast } from 'sonner';
import { useEnrollRequestsDialogStore } from '../bulk-actions-store';

export const AcceptRequestDialog = () => {
    const { isAcceptRequestOpen, bulkActionInfo, selectedStudent, closeAllDialogs } =
        useEnrollRequestsDialogStore();

    const handleAcceptRequestBulk = async () => {
        if (!bulkActionInfo) return;

        try {
            toast.success('Request accepted successfully');
            closeAllDialogs();
        } catch {
            toast.error('Failed to accept request');
        }
    };

    const handleAcceptRequest = async () => {
        if (!selectedStudent) return;

        try {
            toast.success('Request accepted successfully');
            closeAllDialogs();
        } catch {
            toast.error('Failed to accept request');
        }
    };

    return (
        <MyDialog
            heading="Accept Request"
            open={isAcceptRequestOpen}
            onOpenChange={closeAllDialogs}
            footer={
                <div className="flex w-full justify-between gap-2">
                    <button
                        className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-600 hover:bg-neutral-100"
                        onClick={closeAllDialogs}
                    >
                        Cancel
                    </button>
                    <button
                        className="hover:bg-primary-600 rounded-lg bg-primary-500 px-4 py-2 text-white"
                        onClick={selectedStudent ? handleAcceptRequest : handleAcceptRequestBulk}
                    >
                        Accept Request
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <p className="text-neutral-600">
                    Are you sure you want to accept request for{' '}
                    {selectedStudent?.full_name || bulkActionInfo?.displayText}?
                </p>
                <p className="text-sm text-neutral-500">
                    This will accept the request to the selected students via email.
                </p>
            </div>
        </MyDialog>
    );
};
