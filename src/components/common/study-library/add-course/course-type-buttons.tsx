import { AddCourseForm } from './add-course-form';
import { MyButton } from '@/components/design-system/button';
// import { AddCourseForm } from './add-course-form';

const CourseTypeButtons = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
            <AddCourseForm />
            <MyButton type="button" scale="large" buttonType="secondary" className="font-medium">
                Create Course Through AI
            </MyButton>
        </div>
    );
};

export default CourseTypeButtons;
