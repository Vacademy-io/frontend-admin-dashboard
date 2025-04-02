import { MyButton } from "@/components/design-system/button";
import { useInviteFormContext } from "@/routes/students/invite/-context/useInviteFormContext";
import { useEffect, useState } from "react";
import { useCourseManager } from "../../../../-hooks/useCourseManager";
import { CourseSelection } from "./CourseSelection";
import { MaxLimitField } from "../MaxLimitField";
import {
    LearnerChoiceCourse,
    PreSelectedCourse,
} from "@/routes/students/invite/-schema/InviteFormSchema";

export const CourseList = () => {
    const { form } = useInviteFormContext();
    const { getValues, watch } = form;
    const [batch, setBatch] = useState(getValues("batches"));
    const { getAllAvailableCourses, setMaxCourses } = useCourseManager();
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isMaxLimitSaved, setIsMaxLimitSaved] = useState(false);
    useEffect(() => {
        console.log(isMaxLimitSaved);
    }, []);
    const handleIsMaxLimitSaved = (value: boolean) => setIsMaxLimitSaved(value);
    const handleIsAddingCourse = (value: boolean) => setIsAddingCourse(value);

    const batchData = watch("batches");

    const [courses, setCourses] = useState<{
        preSelectedCourses: PreSelectedCourse[];
        learnerChoiceCourses: LearnerChoiceCourse[];
    }>({
        preSelectedCourses: [],
        learnerChoiceCourses: [],
    });
    const [availableCourses, setAvailableCourses] = useState(getAllAvailableCourses());

    useEffect(() => {
        setCourses({
            preSelectedCourses: batchData?.preSelectedCourses || [],
            learnerChoiceCourses: batchData?.learnerChoiceCourses || [],
        });
        setAvailableCourses(getAllAvailableCourses());
    }, [batchData]);

    // Default to 0 if maxSessions not provided in props and not on course
    const currentMaxCourses = batch?.maxCourses || 0;

    // Handle max sessions change
    const handleMaxCoursesChange = (value: number) => {
        const success = setMaxCourses(value);
        if (success) {
            console.log("Max courses updated to:", value);
        }
    };

    // Handle save all button click
    const handleSaveAll = () => {
        setIsAddingCourse(false);
    };

    useEffect(() => {
        setBatch(getValues("batches"));
        console.log("isAddingCourse: ", isAddingCourse);
        console.log("courses: ", courses);
    }, [isAddingCourse]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3">
                <p className="text-title font-semibold">Batches</p>

                {/* Show a message if no courses are present */}
                {courses.preSelectedCourses.length === 0 &&
                    courses.learnerChoiceCourses.length === 0 &&
                    !isAddingCourse && (
                        <p className="text-body text-neutral-500">No courses added yet</p>
                    )}

                {courses.preSelectedCourses.length > 0 &&
                    courses.preSelectedCourses.map((course, key) => (
                        <CourseSelection
                            courseId={course.id}
                            isCourseCompulsory={true}
                            key={key}
                            handleIsAddingCourse={handleIsAddingCourse}
                        />
                    ))}
                {courses.learnerChoiceCourses.length > 0 &&
                    courses.learnerChoiceCourses.map((course, key) => (
                        <CourseSelection
                            courseId={course.id}
                            isCourseCompulsory={true}
                            key={key}
                            handleIsAddingCourse={handleIsAddingCourse}
                        />
                    ))}

                {/* Show Save All button when not adding a course */}
                {!isAddingCourse &&
                    (courses.preSelectedCourses.length > 0 ||
                        courses.learnerChoiceCourses.length > 0) && (
                        <MyButton
                            onClick={handleSaveAll}
                            type="button"
                            scale="small"
                            className="w-fit"
                        >
                            Save All
                        </MyButton>
                    )}

                {/* MaxLimitField will handle its own editing/saving state */}
                {(courses.preSelectedCourses.length > 0 ||
                    courses.learnerChoiceCourses.length > 0) && (
                    <MaxLimitField
                        title="Course"
                        maxAllowed={10}
                        maxValue={currentMaxCourses}
                        onMaxChange={handleMaxCoursesChange}
                        handleIsMaxLimitSaved={handleIsMaxLimitSaved}
                    />
                )}
            </div>

            {/* Session Selection form when adding a session */}
            {isAddingCourse && (
                <div className="flex items-center gap-1">
                    <CourseSelection handleIsAddingCourse={handleIsAddingCourse} />
                </div>
            )}

            {!isAddingCourse && availableCourses.length > 0 && (
                <div>
                    <div
                        onClick={() => setIsAddingCourse(true)}
                        className="w-fit cursor-pointer text-body text-primary-500"
                    >
                        Add Course
                    </div>
                </div>
            )}
        </div>
    );
};
