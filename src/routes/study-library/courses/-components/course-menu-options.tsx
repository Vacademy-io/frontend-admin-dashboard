import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { MyDropdown } from '@/components/design-system/dropdown';
import { CourseType } from '@/stores/study-library/use-study-library-store';
import { DotsThree } from 'phosphor-react';
import { useRef, useState } from 'react';
import {
    CourseFormData,
    AddCourseForm,
} from '../../../../components/common/study-library/add-course/add-course-form';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
interface CourseMenuOptionsProps {
    onDelete: (courseId: string) => void;
    onEdit: ({ courseId, requestData }: { requestData: CourseFormData; courseId?: string }) => void;
    course: CourseType;
}

export const CourseMenuOptions = ({ onDelete, onEdit, course }: CourseMenuOptionsProps) => {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const DropdownList = [
        `Edit ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`,
        `Delete ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`,
    ];
    const [disableAddButton, setDisableAddButton] = useState(false);
    const formSubmitRef = useRef<() => void>(() => {});

    const handleMenuOptionsChange = (value: string) => {
        if (value === `Delete ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`) {
            onDelete(course.id);
        } else if (value === `Edit ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`) {
            setOpenEditDialog(true);
        }
    };

    const handleOpenChange = () => {
        setOpenEditDialog(!openEditDialog);
    };

    const submitButton = (
        <div className="items-center justify-center bg-white">
            <MyButton
                onClick={() => formSubmitRef.current()}
                type="button"
                buttonType="primary"
                layoutVariant="default"
                scale="large"
                className="w-[140px]"
                disable={disableAddButton}
            >
                Save Changes
            </MyButton>
        </div>
    );

    return (
        <>
            <MyDropdown dropdownList={DropdownList} onSelect={handleMenuOptionsChange}>
                <MyButton
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="icon"
                    className="flex items-center justify-center"
                >
                    <DotsThree />
                </MyButton>
            </MyDropdown>

            <MyDialog
                heading={`Edit ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`}
                dialogWidth="w-[700px]"
                open={openEditDialog}
                onOpenChange={handleOpenChange}
                footer={submitButton}
            >
                <AddCourseForm
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    initialValues={{
                        id: course.id,
                        course_name: course.package_name,
                        thumbnail_file_id: course.thumbnail_file_id,
                        contain_levels: false,
                        sessions: [],
                    }}
                    onSubmitCourse={onEdit}
                    setOpenDialog={setOpenEditDialog}
                    setDisableAddButton={setDisableAddButton}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    submitForm={(submitFn) => {
                        formSubmitRef.current = submitFn;
                    }}
                />
            </MyDialog>
        </>
    );
};
