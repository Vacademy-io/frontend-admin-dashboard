import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Plus, X } from "@phosphor-icons/react";
import { Dispatch, SetStateAction } from "react";

interface AddLevelInputProps {
    newLevelName: string;
    setNewLevelName: Dispatch<SetStateAction<string>>;
    newLevelDuration: number | null;
    setNewLevelDuration: Dispatch<SetStateAction<number | null>>;
    handleAddLevel: (levelName: string, durationInDays: number | null) => void;
    setShowNewLevelInput: Dispatch<SetStateAction<boolean>>;
}

export const AddLevelInput = ({
    newLevelName,
    setNewLevelName,
    newLevelDuration,
    setNewLevelDuration,
    handleAddLevel,
    setShowNewLevelInput,
}: AddLevelInputProps) => {
    return (
        <div className="ml-3 flex items-end gap-4">
            <div className="flex flex-col gap-4">
                <MyInput
                    inputType="text"
                    inputPlaceholder="Enter level name"
                    className="w-[230px]"
                    input={newLevelName}
                    onChangeFunction={(e) => setNewLevelName(e.target.value)}
                    required={true}
                    label="Level"
                />
                <MyInput
                    inputType="number"
                    inputPlaceholder="Duration (days)"
                    className="w-[200px]"
                    input={newLevelDuration?.toString() || ""}
                    onChangeFunction={(e) => setNewLevelDuration(Number(e.target.value))}
                    required={true}
                    label="Days"
                />
            </div>
            <div className="flex items-center gap-4">
                <MyButton
                    onClick={() => {
                        if (newLevelName) {
                            handleAddLevel(newLevelName, newLevelDuration);
                            setNewLevelName("");
                            setNewLevelDuration(null);
                            setShowNewLevelInput(false);
                        }
                    }}
                    buttonType="primary"
                    layoutVariant="icon"
                    scale="small"
                >
                    <Plus />
                </MyButton>
                <MyButton
                    onClick={() => {
                        setShowNewLevelInput(false);
                    }}
                    buttonType="secondary"
                    layoutVariant="icon"
                    scale="small"
                >
                    <X />
                </MyButton>
            </div>
        </div>
    );
};
