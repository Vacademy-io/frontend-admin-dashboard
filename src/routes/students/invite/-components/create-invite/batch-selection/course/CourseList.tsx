import { MyButton } from "@/components/design-system/button";
import { useInviteFormContext } from "@/routes/students/invite/-context/useInviteFormContext";
import { Check, PencilSimple } from "phosphor-react";
import { useState } from "react";
import { useCourseManager } from "../../../../-hooks/useCourseManager";
import { CourseSelection } from "./CourseSelection";
import { MaxLimitField } from "../MaxLimitField";

export const CourseList = () => {
    const { form } = useInviteFormContext();
    const { getValues } = form;
    const batch = getValues("batches");
    const { getAllAvailableCourses, setMaxCourses } = useCourseManager();
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [isMaxValueSaved, setIsMaxValueSaved] = useState(false);

    const availableCourses = getAllAvailableCourses();
    // Get preSelectedSessions
    const preSelectedCourses = batch?.preSelectedCourses || [];

    // Get learnerChoiceSessions (available for both course types)
    const learnerChoiceCourses = batch?.learnerChoiceCourses || [];

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
        setIsSavingAll(true);
        setIsAddingCourse(false);
    };

    // Handle save max value button click
    const handleSaveMaxValue = () => {
        setIsMaxValueSaved(true);
    };

    // Handle edit max value button click
    const handleEditMaxValue = () => {
        setIsMaxValueSaved(false);
        setIsSavingAll(false);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3">
                <p className="text-title font-semibold">Batches</p>

                {/* Show a message if no sessions are present */}
                {/* {preSelectedCourses.length === 0 &&
                learnerChoiceCourses.length === 0 &&
                !isAddingCourse && (
                    <p className="text-body text-neutral-500">No courses added yet</p>
                )} */}

                {preSelectedCourses.length > 0 &&
                    preSelectedCourses.map((course, key) => (
                        <CourseSelection courseId={course.id} isCourseCompulsory={true} key={key} />
                    ))}
                {learnerChoiceCourses.length > 0 &&
                    learnerChoiceCourses.map((course, key) => (
                        <CourseSelection courseId={course.id} isCourseCompulsory={true} key={key} />
                    ))}

                {/* Show Save All button when not adding a session */}
                {!isAddingCourse &&
                    (preSelectedCourses.length > 0 || learnerChoiceCourses.length > 0) && (
                        <MyButton
                            onClick={handleSaveAll}
                            type="button"
                            scale="small"
                            className="w-fit"
                        >
                            Save All
                        </MyButton>
                    )}

                {isSavingAll && !isMaxValueSaved && (
                    <div className="flex items-center gap-2">
                        <MaxLimitField
                            title="Session"
                            maxAllowed={10}
                            maxValue={currentMaxCourses}
                            onMaxChange={handleMaxCoursesChange}
                        />
                        <MyButton
                            buttonType="secondary"
                            scale="medium"
                            layoutVariant="icon"
                            onClick={handleSaveMaxValue}
                            type="button"
                        >
                            <Check />
                        </MyButton>
                    </div>
                )}

                {isSavingAll && isMaxValueSaved && (
                    <div className="flex items-center justify-between rounded-md p-3">
                        <div className="flex flex-col">
                            <p className="text-subtitle font-semibold">Maximum Courses</p>
                            <p className="text-body">{currentMaxCourses}</p>
                        </div>
                        <MyButton
                            buttonType="secondary"
                            scale="small"
                            layoutVariant="icon"
                            onClick={handleEditMaxValue}
                            type="button"
                        >
                            <PencilSimple />
                        </MyButton>
                    </div>
                )}
            </div>

            {/* Session Selection form when adding a session */}
            {!isSavingAll && (
                <div className="flex items-center gap-1">
                    <CourseSelection />
                </div>
            )}

            {!isSavingAll && availableCourses.length > 0 && (
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
