import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { AddSubjectForm } from './add-subject-form';
import { SubjectType } from '@/stores/study-library/use-study-library-store';

interface AddSubjectButtonProps {
    onAddSubject: (subject: SubjectType) => void;
    isTextButton?: boolean;
}

export const AddSubjectButton = ({ onAddSubject, isTextButton = false }: AddSubjectButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);
    const triggerButton = isTextButton ? (
        <div className="m-0 w-fit text-primary-500">Add Subject</div>
    ) : (
        <MyButton buttonType="primary" layoutVariant="default" scale="large" id="add-subject">
            Add Subject
        </MyButton>
    );

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Subject"
            dialogWidth="w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddSubjectForm
                onSubmitSuccess={(subject) => {
                    onAddSubject(subject);
                    handleOpenChange();
                }}
            />
        </MyDialog>
    );
};
