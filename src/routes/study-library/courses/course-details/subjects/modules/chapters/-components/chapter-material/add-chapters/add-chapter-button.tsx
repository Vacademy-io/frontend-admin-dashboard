import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { AddChapterForm } from './add-chapter-form';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface AddChapterButtonProps {
    isTextButton?: boolean;
    moduleId?: string;
    sessionId?: string;
    levelId?: string;
    subjectId?: string;
}

export const AddChapterButton = ({
    isTextButton = false,
    moduleId,
    sessionId,
    levelId,
    subjectId,
}: AddChapterButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);
    const triggerButton = isTextButton ? (
        <MyButton
            scale="large"
            buttonType="text"
            className="!m-0 flex w-fit cursor-pointer flex-row items-center justify-start gap-2 px-0 pl-2 text-primary-500"
            id="add-chapters"
        >
            <Plus /> Add {getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}
        </MyButton>
    ) : (
        <MyButton scale="large" id="add-chapters">
            <Plus /> Add {getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}
        </MyButton>
    );

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    const handleSubmitSuccess = () => {
        handleOpenChange();
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading={`Add ${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}`}
            dialogWidth="min-w-fit"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddChapterForm
                module_id={moduleId}
                session_id={sessionId}
                level_id={levelId}
                subject_id={subjectId}
                onSubmitSuccess={handleSubmitSuccess}
                mode="create"
            />
        </MyDialog>
    );
};
