import { AddLevelInput } from "@/components/design-system/add-level-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { DropdownValueType } from "../students/enroll-manually/dropdownTypesForPackageItems";
import { MyDropdown } from "../students/enroll-manually/dropdownForPackageItems";

export const CreateLevelStep = () => {
    // remove the levels from the list which already are connected to the same batch and same session
    const { getLevelsFromPackage, instituteDetails } = useInstituteDetailsStore();
    const [newLevelName, setNewLevelName] = useState("");
    const [newLevelDuration, setNewLevelDuration] = useState<number | null>(null);
    const [levelList, setLevelList] = useState<
        Array<{
            id: string;
            name: string;
        }>
    >(getLevelsFromPackage());
    const [selectedLevel, setSelectedLevel] = useState<DropdownValueType | undefined>(undefined);

    useEffect(() => {
        const allLevels = getLevelsFromPackage();
        //paas the selected courseId and sessionId
        const levelToRemove = getLevelsFromPackage({ courseId: "", sessionId: "" });
        const requiredLevelList = allLevels.filter((level) => level.id != levelToRemove[0]?.id);
        setLevelList(requiredLevelList);
    }, [instituteDetails]);

    const handleLevelChange = (e: DropdownValueType) => {
        setSelectedLevel(e);
    };

    const handleAddLevel = () => {};

    return (
        <div className="flex flex-col gap-6">
            <div className="text-regular">
                Step 2 <span className="font-semibold">Select Level</span>
            </div>
            <RadioGroup className="flex gap-10">
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="existing" />
                    <label htmlFor="existing">Pre-existing level</label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="new" />
                    <label htmlFor="new">Create new level</label>
                </div>
            </RadioGroup>
            <div className="flex flex-col gap-1">
                <div>
                    Level
                    <span className="text-subtitle text-danger-600">*</span>
                </div>
                {levelList.length > 0 && (
                    <MyDropdown
                        currentValue={selectedLevel}
                        dropdownList={levelList}
                        handleChange={handleLevelChange}
                        placeholder="Select level"
                        required={true}
                    />
                )}

                <AddLevelInput
                    newLevelName={newLevelName}
                    setNewLevelName={setNewLevelName}
                    newLevelDuration={newLevelDuration}
                    setNewLevelDuration={setNewLevelDuration}
                    handleAddLevel={handleAddLevel}
                />
            </div>
        </div>
    );
};
