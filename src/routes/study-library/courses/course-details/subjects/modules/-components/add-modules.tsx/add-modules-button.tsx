import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { AddModulesForm } from './add-modules-form';
import { Module } from '@/stores/study-library/use-modules-with-chapters-store';
import { Plus } from 'phosphor-react';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface AddModuleButtonProps {
    onAddModule?: (module: Module) => void;
    onAddModuleBySubjectId?: (subjectId: string, module: Module) => void;
    isTextButton?: boolean;
    subjectId?: string;
}

export const AddModulesButton = ({
    onAddModule,
    isTextButton = false,
    onAddModuleBySubjectId,
    subjectId,
}: AddModuleButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const triggerButton = isTextButton ? (
        <MyButton
            scale="large"
            buttonType="text"
            className="!m-0 flex w-fit cursor-pointer flex-row items-center justify-start gap-2 px-0 pl-2 text-primary-500"
            id="add-chapters"
        >
            <Plus /> Add {getTerminology(ContentTerms.Modules, SystemTerms.Modules)}
        </MyButton>
    ) : (
        <MyButton buttonType="primary" scale="large" layoutVariant="default" id="add-modules">
            Add {getTerminology(ContentTerms.Modules, SystemTerms.Modules)}
        </MyButton>
    );
    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading={`Add ${getTerminology(ContentTerms.Modules, SystemTerms.Modules)}`}
            dialogWidth="w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddModulesForm
                onSubmitSuccess={(module) => {
                    if (subjectId && onAddModuleBySubjectId) {
                        onAddModuleBySubjectId(subjectId, module);
                    } else if (onAddModule) {
                        onAddModule(module);
                    }

                    handleOpenChange();
                }}
            />
        </MyDialog>
    );
};
