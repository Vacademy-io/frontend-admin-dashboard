import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import CourseTypeButtons from './course-type-buttons';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '../../layout-container/sidebar/utils';

export const AddCourseButton = () => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setOpenDialog(open);
    };

    return (
        <MyDialog
            trigger={
                <MyButton type="button" scale="large" buttonType="primary" className="font-medium">
                    Create {getTerminology(ContentTerms.Course, SystemTerms.Course)}
                </MyButton>
            }
            heading={`Add ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`}
            dialogWidth="w-[500px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
            isTour
        >
            <CourseTypeButtons />
        </MyDialog>
    );
};
