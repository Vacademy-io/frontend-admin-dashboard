import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import CourseTypeButtons from './course-type-buttons';

export const AddCourseButton = () => {
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
        >
            <CourseTypeButtons />
        </MyDialog>
    );
};
