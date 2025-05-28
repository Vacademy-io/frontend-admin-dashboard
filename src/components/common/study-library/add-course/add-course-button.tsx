import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { AddCourseData } from './add-course-form';
import CourseTypeButtons from './course-type-buttons';

interface AddCourseButtonProps {
    onSubmit: ({ requestData }: { requestData: AddCourseData }) => void;
    courseButton?: JSX.Element;
}

export const AddCourseButton = ({ onSubmit, courseButton }: AddCourseButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setOpenDialog(open);
    };

    return (
        <MyDialog
            trigger={
                <MyButton type="button" scale="large" buttonType="primary" className="font-medium">
                    Create Course
                </MyButton>
            }
            heading="Add Course"
            dialogWidth="w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
            isTour
            className="z-[99999]"
        >
            <CourseTypeButtons onSubmit={onSubmit} courseButton={courseButton} />
        </MyDialog>
    );
};
