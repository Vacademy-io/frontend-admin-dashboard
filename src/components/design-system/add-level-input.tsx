import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Plus, X } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useState } from "react";

interface AddLevelInputProps {
    newLevelName: string;
    setNewLevelName: Dispatch<SetStateAction<string>>;
    newLevelDuration: number | null;
    setNewLevelDuration: Dispatch<SetStateAction<number | null>>;
    handleAddLevel: (levelName: string, durationInDays: number | null) => void;
}

export const AddLevelInput = ({
    newLevelName,
    setNewLevelName,
    newLevelDuration,
    setNewLevelDuration,
    handleAddLevel,
}: AddLevelInputProps) => {
    const [showNewLevelInput, setShowNewLevelInput] = useState(false);
    return (
        <>
            {showNewLevelInput ? (
                <div className="ml-3 flex items-end gap-4">
                    <div className="flex flex-col gap-4">
                        <MyInput
                            inputType="text"
                            inputPlaceholder="Eg. 10th standard"
                            className="w-[230px]"
                            input={newLevelName}
                            onChangeFunction={(e) => setNewLevelName(e.target.value)}
                            required={true}
                            label="Level"
                        />
                        <MyInput
                            inputType="number"
                            inputPlaceholder="Eg. 365 days"
                            className="w-[200px]"
                            input={newLevelDuration?.toString() || ""}
                            onChangeFunction={(e) =>
                                setNewLevelDuration(Math.floor(Number(e.target.value)))
                            }
                            required={true}
                            label="Days"
                            step="1"
                            min="1"
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
                            type="button"
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
                            type="button"
                        >
                            <X />
                        </MyButton>
                    </div>
                </div>
            ) : (
                <MyButton
                    onClick={() => setShowNewLevelInput(true)}
                    buttonType="text"
                    layoutVariant="default"
                    scale="small"
                    className="w-fit text-primary-500 hover:bg-white active:bg-white"
                >
                    <Plus /> Add Level
                </MyButton>
            )}
        </>
    );
};
