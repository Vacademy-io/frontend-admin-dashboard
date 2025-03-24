// import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { BatchSelectionField } from "./BatchSelectionField";
import { MultiSelect } from "../MultiSelect";
import { SelectionModeType } from "../../../-schema/InviteFormSchema";
import { MaxLimitField } from "./MaxLimitField";
import { MyButton } from "@/components/design-system/button";
import { Check } from "phosphor-react";

interface LevelSelectionProps {
    course: string | null;
    session: string | null;
    sessionSelectionMode: SelectionModeType;
    handleMaxLevelsSaved: (maxLevels: boolean) => void;
}

export const LevelSelection = ({
    sessionSelectionMode,
    handleMaxLevelsSaved,
}: LevelSelectionProps) => {
    // const {getLevelsFromPackage} = useInstituteDetailsStore();
    // const [levelList, setLevelList] = useState(getLevelsFromPackage({courseId: course || "", sessionId: session || ""}));
    // const levelList = getLevelsFromPackage({courseId: course || "", sessionId: session || ""});
    const [levelSelectionMode, setLevelSelectionMode] = useState<SelectionModeType>(
        getLevelSelectionMode(sessionSelectionMode),
    );
    const [areLevelsSaved, setAreLevelsSaved] = useState(false);
    // this will be removed later and instead of this the condition of selected levelLength will be used.
    const isLevelSelected = true;

    function getLevelSelectionMode(sessionSelectionMode: SelectionModeType) {
        return sessionSelectionMode == "student" ? "student" : "institute";
    }

    useEffect(() => {
        setLevelSelectionMode(getLevelSelectionMode(sessionSelectionMode));
    }, [sessionSelectionMode]);

    const onChangeLevelSelectionMode = (mode: SelectionModeType) => setLevelSelectionMode(mode);

    return areLevelsSaved ? (
        <div className="flex justify-between gap-3">
            <p>Level list</p>
            <div className="flex items-center gap-2">
                <MaxLimitField title="Levels" maxAllowed={1} />
                <MyButton
                    buttonType="secondary"
                    scale="medium"
                    layoutVariant="icon"
                    type="button"
                    onClick={() => handleMaxLevelsSaved(true)}
                >
                    <Check />
                </MyButton>
            </div>
        </div>
    ) : (
        <div className="flex flex-col gap-4">
            <BatchSelectionField
                title={"level"}
                isPreSelectionDisabled={sessionSelectionMode == "student"}
                mode={levelSelectionMode}
                onChangeMode={onChangeLevelSelectionMode}
            />
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <div className="flex w-fit items-center gap-4">
                        <p>
                            Compulsory Levels
                            <span className="text-subtitle text-danger-600">*</span>
                        </p>
                        <MultiSelect
                            options={[]}
                            onValueChange={() => {}}
                            // defaultValue={}
                            placeholder={`Select Levels`}
                            // disabled={isDisabled}
                        />
                    </div>
                    <div>
                        {/* add condition about if values are present */}
                        {isLevelSelected && (
                            <MyButton
                                buttonType="primary"
                                scale="small"
                                layoutVariant="default"
                                type="button"
                                onClick={() => setAreLevelsSaved(true)}
                            >
                                Save
                            </MyButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
