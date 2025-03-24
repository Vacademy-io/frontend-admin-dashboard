import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BatchSelectionField } from "./BatchSelectionField";
import { SessionSelection } from "./SessionSelection";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
} from "@/components/ui/select";
import { SelectionModeType } from "../../../-schema/InviteFormSchema";
import { MyButton } from "@/components/design-system/button";
import { Check } from "phosphor-react";
import { useCoursesUtility } from "../../../-hooks/useAvailableCourses";
import { useBatchSelection } from "../../../-hooks/useBatchSelection";

interface CourseSelectionProps {
    areMaxSessionsSaved: boolean;
    handleAreMaxSessionsSaved: (saved: boolean) => void;
}

/**
 * This component handles the course selection flow:
 * 1. Select course & mode (institute/student)
 * 2. Select session & mode
 * 3. Select levels & mode
 * 4. Set limits for learner choices
 * 5. Add more sessions or save all sessions
 * 6. Add more courses or finalize
 */
export const CourseSelection = ({
    areMaxSessionsSaved,
    handleAreMaxSessionsSaved,
}: CourseSelectionProps) => {
    const { getAvailableCourses } = useCoursesUtility();
    const { watch } = useFormContext();
    const { addCourse } = useBatchSelection();

    // Course selection state
    const [courseSelectionMode, setCourseSelectionMode] = useState<SelectionModeType>("institute");
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedCourseName, setSelectedCourseName] = useState<string>("");
    const [courseSelected, setCourseSelected] = useState(false);

    // Session state tracking
    const [sessionLevelsSelected, setSessionLevelSelected] = useState(false);
    const [canAddMoreSessions, setCanAddMoreSessions] = useState(false);

    // Available courses from API
    const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; name: string }>>(
        [],
    );

    // Get the current batches from the form
    const formBatches = watch("batches");

    // Fetch available courses when component mounts or when form batches change
    useEffect(() => {
        const courses = getAvailableCourses(formBatches);
        setAvailableCourses(courses);
    }, [formBatches, getAvailableCourses]);

    // Handle when session+levels are selected
    const handleSessionLevelsSelected = (selected: boolean) => {
        setSessionLevelSelected(selected);
        if (selected) {
            // When levels are selected, user can add more sessions
            setCanAddMoreSessions(true);
        }
    };

    const onChangeCourseSelectionMode = (mode: SelectionModeType) => setCourseSelectionMode(mode);

    const handleCourseSelection = (courseId: string) => {
        const course = availableCourses.find((c) => c.id === courseId);
        if (course) {
            setSelectedCourseId(courseId);
            setSelectedCourseName(course.name);
        }
    };

    const handleSaveCourse = () => {
        if (selectedCourseId && selectedCourseName) {
            // Add course to form with default max sessions (will be updated later if needed)
            addCourse(selectedCourseId, selectedCourseName, courseSelectionMode, 1);
            setCourseSelected(true);
        }
    };

    const handleAddSession = () => {
        // Reset session selection state to allow adding another session
        setSessionLevelSelected(false);
    };

    const handleSaveAllSessions = () => {
        // This would be called when the user has completed selecting sessions and levels
        // and wants to save everything and move to the next step
        handleAreMaxSessionsSaved(true);
    };

    return (
        <div className="flex w-full flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                    <BatchSelectionField
                        title={"Course"}
                        isPreSelectionDisabled={false}
                        mode={courseSelectionMode}
                        onChangeMode={onChangeCourseSelectionMode}
                    />
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex w-fit items-center gap-4">
                            <p>
                                {courseSelectionMode == "institute"
                                    ? "Compulsory"
                                    : "Student Preference"}{" "}
                                Courses
                                <span className="text-subtitle text-danger-600">*</span>
                            </p>
                            <Select
                                onValueChange={handleCourseSelection}
                                value={selectedCourseId || undefined}
                                disabled={courseSelected}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Available Courses</SelectLabel>
                                        {availableCourses.length > 0 ? (
                                            availableCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-courses" disabled>
                                                No available courses
                                            </SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Save Course Button */}
                        {selectedCourseId && !courseSelected && (
                            <div className="mt-2">
                                <MyButton
                                    buttonType="primary"
                                    scale="small"
                                    onClick={handleSaveCourse}
                                >
                                    Save Course
                                </MyButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Session Selection Section */}
            {courseSelected && !areMaxSessionsSaved && (
                <div className="flex w-full flex-col gap-2">
                    {/* Show session selection component */}
                    <SessionSelection
                        course={selectedCourseId}
                        courseSelectionMode={courseSelectionMode}
                        handleSessionLevelsSelected={handleSessionLevelsSelected}
                    />

                    {/* Session Management Buttons - appear after levels are selected */}
                    {sessionLevelsSelected && canAddMoreSessions && (
                        <div className="mt-4 flex items-center gap-4">
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                onClick={handleAddSession}
                            >
                                Add Another Session
                            </MyButton>

                            <MyButton
                                buttonType="primary"
                                scale="small"
                                onClick={handleSaveAllSessions}
                            >
                                Save All Sessions
                            </MyButton>
                        </div>
                    )}
                </div>
            )}

            {/* Session Summary Section - appears after sessions are saved */}
            {areMaxSessionsSaved && (
                <div className="flex w-full items-center justify-between gap-2 rounded-md border p-4">
                    <p>All sessions have been configured for this course</p>
                    <div className="flex items-center gap-2">
                        <MyButton
                            buttonType="secondary"
                            scale="medium"
                            layoutVariant="icon"
                            type="button"
                            onClick={() => handleAreMaxSessionsSaved(false)} // Allow editing
                        >
                            <Check />
                        </MyButton>
                    </div>
                </div>
            )}
        </div>
    );
};
