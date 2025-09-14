import { MyDialog } from '@/components/design-system/dialog';
import { AddSessionDataType, AddSessionForm } from './add-session-form';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { SessionData } from '@/types/study-library/session-types';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface AddSessionDialogProps {
    isAddSessionDiaogOpen: boolean;
    handleOpenAddSessionDialog: () => void;
    handleSubmit: (sessionData: AddSessionDataType) => void;
    trigger: ReactNode;
    initialValues?: SessionData;
    submitButton: JSX.Element;
    setDisableAddButton: Dispatch<SetStateAction<boolean>>;
    submitFn: (fn: () => void) => void;
}

export const AddSessionDialog = ({
    isAddSessionDiaogOpen,
    handleOpenAddSessionDialog,
    handleSubmit,
    trigger,
    initialValues,
    submitButton,
    setDisableAddButton,
    submitFn,
}: AddSessionDialogProps) => {
    return (
        <MyDialog
            heading={
                initialValues
                    ? 'Edit ' + getTerminology(ContentTerms.Session, SystemTerms.Session)
                    : 'Add ' + getTerminology(ContentTerms.Session, SystemTerms.Session)
            }
            trigger={trigger}
            dialogWidth="w-[700px]"
            open={isAddSessionDiaogOpen}
            onOpenChange={handleOpenAddSessionDialog}
            footer={submitButton}
            className="z-[99999]"
        >
            <AddSessionForm
                onSubmit={handleSubmit}
                initialValues={initialValues}
                setDisableAddButton={setDisableAddButton}
                submitForm={submitFn}
            />
        </MyDialog>
    );
};
