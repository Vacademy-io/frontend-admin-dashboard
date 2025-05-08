import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { AddModulesForm } from './add-modules-form';
import { Module } from '@/stores/study-library/use-modules-with-chapters-store';

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
    <MyButton buttonType="text" scale="large" layoutVariant="default">
      Add Module
    </MyButton>
  ) : (
    <MyButton buttonType="primary" scale="large" layoutVariant="default" id="add-modules">
      Add Module
    </MyButton>
  );
  const handleOpenChange = () => {
    setOpenDialog(!openDialog);
  };

  return (
    <MyDialog
      trigger={triggerButton}
      heading="Add Module"
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
