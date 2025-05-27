import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import React from 'react';
import { AddCourseData, AddCourseForm } from './add-course-form';
import { useState } from 'react';
import { addCourseStep } from '@/constants/intro/steps';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import useIntroJsTour from '@/hooks/use-intro';
import { useRef } from 'react';

interface AddCourseButtonProps {
    onSubmit: ({ requestData }: { requestData: AddCourseData }) => void;
    courseButton?: JSX.Element;
}

const triggerButton = (
    <MyButton buttonType="primary" layoutVariant="default" scale="large" id="create-new-course">
        Create Course Manually
    </MyButton>
);

const CourseTypeButtons = ({ onSubmit, courseButton }: AddCourseButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [disableAddButton, setDisableAddButton] = useState(false);
    const formSubmitRef = useRef<() => void>(() => {});

    const handleOpenChange = (open: boolean) => {
        setOpenDialog(open);
    };

    const submitButton = (
        <div className="items-center justify-center bg-white">
            <MyButton
                onClick={() => formSubmitRef.current()}
                type="button"
                buttonType="primary"
                layoutVariant="default"
                scale="large"
                id="add-course-button"
                className="w-[140px]"
                disable={disableAddButton}
            >
                Add
            </MyButton>
        </div>
    );

    // Don't use the div wrapper approach
    const triggerWithPreventSubmit = courseButton
        ? React.cloneElement(courseButton, {
              onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenDialog(true);

                  // Call the original onClick if it exists
                  if (courseButton.props.onClick) {
                      courseButton.props.onClick(e);
                  }
              },
          })
        : triggerButton;

    useIntroJsTour({
        key: StudyLibraryIntroKey.addCourseStep,
        steps: addCourseStep,
        enable: openDialog,
    });

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
            <MyDialog
                trigger={triggerWithPreventSubmit}
                heading="Add Course"
                dialogWidth="w-[400px]"
                open={openDialog}
                onOpenChange={handleOpenChange}
                isTour
                className="z-[99999]"
                footer={submitButton}
            >
                <AddCourseForm
                    onSubmitCourse={onSubmit}
                    setOpenDialog={setOpenDialog}
                    setDisableAddButton={setDisableAddButton}
                    submitForm={(submitFn) => {
                        formSubmitRef.current = submitFn;
                    }}
                />
            </MyDialog>
            <MyButton type="button" scale="large" buttonType="primary" className="font-medium">
                Create Course Through AI
            </MyButton>
        </div>
    );
};

export default CourseTypeButtons;
