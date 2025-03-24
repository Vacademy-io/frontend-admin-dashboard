import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useState } from "react";
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
import { MaxLimitField } from "./MaxLimitField";
import { Check } from "phosphor-react";

interface CourseSelectionProps {
    areMaxSessionsSaved: boolean;
    handleAreMaxSessionsSaved: (saved: boolean) => void;
}

export const CourseSelection = ({
    areMaxSessionsSaved,
    handleAreMaxSessionsSaved,
}: CourseSelectionProps) => {
    const { getCourseFromPackage } = useInstituteDetailsStore();
    // const [courseList, setCourseList] = useState(getCourseFromPackage());
    const courseList = getCourseFromPackage();
    const [courseSelectionMode, setCourseSelectionMode] = useState<SelectionModeType>("institute");
    const [sessionLevelsSelected, setSessionLevelSelected] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [sessionsSaved, setSessionsSaved] = useState(false);

    const handleSessionLevelsSelected = (selected: boolean) => setSessionLevelSelected(selected);

    const onChangeCourseSelectionMode = (mode: SelectionModeType) => setCourseSelectionMode(mode);

    const handleAddSession = () => {
        //add selected session here
        setSessionLevelSelected(false);
        setSessionsSaved(false);
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
                            <Select onValueChange={(value) => setSelectedCourseId(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Available Courses</SelectLabel>
                                        {courseList.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                {/* {showAddSessionButton && !saveMaxAllowedSession && */}

                {/* } */}
            </div>
            {selectedCourseId != null && !areMaxSessionsSaved && (
                <div className="flex w-full flex-col gap-2">
                    {!sessionsSaved ? (
                        <div className="flex items-center gap-2">
                            <SessionSelection
                                course={selectedCourseId}
                                courseSelectionMode={courseSelectionMode}
                                handleSessionLevelsSelected={handleSessionLevelsSelected}
                            />
                            {sessionLevelsSelected && (
                                <MyButton
                                    buttonType="primary"
                                    scale="small"
                                    layoutVariant="default"
                                    onClick={() => setSessionsSaved(true)}
                                >
                                    Save all sessions
                                </MyButton>
                            )}
                        </div>
                    ) : (
                        <div className="flex w-full items-center justify-between gap-2">
                            <p>Session and level list from course</p>
                            <div className="flex items-center gap-2">
                                <MaxLimitField title="Session" maxAllowed={1} />
                                <MyButton
                                    buttonType="secondary"
                                    scale="medium"
                                    layoutVariant="icon"
                                    type="button"
                                    onClick={() => handleAreMaxSessionsSaved(true)}
                                >
                                    <Check />
                                </MyButton>
                            </div>
                        </div>
                    )}
                    {sessionLevelsSelected && !areMaxSessionsSaved && !sessionsSaved && (
                        <div>
                            <MyButton
                                buttonType="text"
                                className="text-primary-500"
                                onClick={() => handleAddSession()}
                            >
                                Add Session
                            </MyButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
