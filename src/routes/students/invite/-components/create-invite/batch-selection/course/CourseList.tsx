import { MyButton } from "@/components/design-system/button";
import { useInviteFormContext } from "@/routes/students/invite/-context/useInviteFormContext";
import { useEffect, useState } from "react";
import { useCourseManager } from "../../../../-hooks/useCourseManager";
import { CourseSelection } from "./CourseSelection";
import { MaxLimitField } from "../MaxLimitField";

export const CourseList = () => {
    const { form } = useInviteFormContext();
    const { getValues, watch } = form;
    const {
        getAllAvailableCourses,
        setMaxCourses,
        hasValidPreSelectedCourseStructure,
        hasValidLearnerChoiceCourseStructure,
        isValidPreSelectedCourse,
        isValidLearnerChoiceCourse,
    } = useCourseManager();
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isMaxLimitSaved, setIsMaxLimitSaved] = useState(false);
    useEffect(() => {
        console.log(isMaxLimitSaved);
    }, []);
    const handleIsMaxLimitSaved = (value: boolean) => setIsMaxLimitSaved(value);
    const handleIsAddingCourse = (value: boolean) => {
        setIsAddingCourse(value);
        if (!value) setIsAddingNewCourse(false); // Reset when not adding a course
    };
    const [batchData, setBatchData] = useState(getValues("batches"));
    const [isAddingNewCourse, setIsAddingNewCourse] = useState(false);

    useEffect(() => {
        setBatchData(getValues("batches"));
        console.log("batchdata: ", batchData);
    }, [watch("batches")]);

    // Default to 0 if maxSessions not provided in props and not on course
    const currentMaxCourses = batchData?.maxCourses || 1;

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
        if (isAddingCourse == false) setIsAddingCourse(false);
    }, [isAddingCourse]);

    const currentAvailableCourses = getAllAvailableCourses();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <p className="text-title font-semibold">Batches</p>

                    {/* Show Save All button when not adding a course */}
                    {!isAddingCourse &&
                        (batchData.preSelectedCourses.length > 0 ||
                            batchData.learnerChoiceCourses.length > 0) && (
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
                    {(batchData.preSelectedCourses.length > 0 ||
                        batchData.learnerChoiceCourses.length > 0) && (
                        <MaxLimitField
                            title="Course"
                            maxAllowed={batchData.learnerChoiceCourses.length}
                            maxValue={currentMaxCourses}
                            onMaxChange={handleMaxCoursesChange}
                            handleIsMaxLimitSaved={handleIsMaxLimitSaved}
                        />
                    )}
                </div>

                {/* Show a message if no courses are present */}
                {batchData.preSelectedCourses.length === 0 &&
                    batchData.learnerChoiceCourses.length === 0 &&
                    !isAddingCourse && (
                        <p className="text-body text-neutral-500">No courses added yet</p>
                    )}

                {hasValidPreSelectedCourseStructure() &&
                    batchData.preSelectedCourses.length > 0 &&
                    batchData.preSelectedCourses.map(
                        (course, key) =>
                            isValidPreSelectedCourse(course) && (
                                // <CourseSelection
                                //     courseId={course.id}
                                //     isCourseCompulsory={true}
                                //     handleIsAddingCourse={handleIsAddingCourse}
                                // />
                                <div key={key}>
                                    <p>Pre selected Course name: {course.name}</p>
                                    {course.preSelectedSessions.length && (
                                        <p>Pre selection sessions</p>
                                    )}
                                    {course.preSelectedSessions.map((session, key1) => (
                                        <div key={key1}>
                                            <p>Session name: {session.name}</p>
                                            {session.preSelectedLevels && (
                                                <p>Pre selected levels</p>
                                            )}
                                            {session.preSelectedLevels.map((level, key2) => (
                                                <p key={key2}>level name: {level.name}</p>
                                            ))}
                                            {session.learnerChoiceLevels && (
                                                <p>learner choice levels</p>
                                            )}
                                            {session.learnerChoiceLevels.map((level, key2) => (
                                                <p key={key2}>level name: {level.name}</p>
                                            ))}
                                        </div>
                                    ))}
                                    {course.learnerChoiceSessions.length && (
                                        <p>Learner choice sessions</p>
                                    )}
                                    {course.learnerChoiceSessions.map((session, key1) => (
                                        <div key={key1}>
                                            <p>Session name: {session.name}</p>
                                            {session.learnerChoiceLevels && (
                                                <p>learner choice levels</p>
                                            )}
                                            {session.learnerChoiceLevels.map((level, key2) => (
                                                <p key={key2}>level name: {level.name}</p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ),
                    )}

                {hasValidLearnerChoiceCourseStructure() &&
                    batchData.learnerChoiceCourses.length > 0 &&
                    batchData.learnerChoiceCourses.map(
                        (course, key) =>
                            isValidLearnerChoiceCourse(course) && (
                                <div key={key}>
                                    <p>Learner choice Course name: {course.name}</p>
                                    {course.learnerChoiceSessions.length && (
                                        <p>Learner choice sessions</p>
                                    )}
                                    {course.learnerChoiceSessions.map((session, key1) => (
                                        <div key={key1}>
                                            <p>Session name: {session.name}</p>
                                            {session.learnerChoiceLevels && (
                                                <p>learner choice levels</p>
                                            )}
                                            {session.learnerChoiceLevels.map((level, key2) => (
                                                <p key={key2}>level name: {level.name}</p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ),
                        // <CourseSelection
                        //     courseId={course.id}
                        //     isCourseCompulsory={false}
                        //     key={key}
                        //     handleIsAddingCourse={handleIsAddingCourse}
                        // />
                    )}
            </div>

            {/* Session Selection form when adding a session */}
            {isAddingCourse && isAddingNewCourse && (
                <div className="flex items-center gap-1">
                    <CourseSelection handleIsAddingCourse={handleIsAddingCourse} />
                </div>
            )}

            {!isAddingCourse && currentAvailableCourses.length > 0 && (
                <div>
                    <div
                        onClick={() => {
                            setIsAddingCourse(true);
                            setIsAddingNewCourse(true);
                        }}
                        className="w-fit cursor-pointer text-body text-primary-500"
                    >
                        Add Course
                    </div>
                </div>
            )}
        </div>
    );
};
