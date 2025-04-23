// CreateLevelStep.tsx
import { AddLevelInput } from "@/components/design-system/add-level-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { X } from "phosphor-react";
import { MyButton } from "@/components/design-system/button";

export const CreateLevelStep = () => {
    const { getLevelsFromPackage, instituteDetails } = useInstituteDetailsStore();
    const [newLevelName, setNewLevelName] = useState("");
    const [newLevelDuration, setNewLevelDuration] = useState<number | null>(null);
    const [newLevelAdded, setNewLevelAdded] = useState(false);
    const [levelList, setLevelList] =
        useState<Array<{ id: string; name: string }>>(getLevelsFromPackage());
    const form = useFormContext();
    const { watch } = form;
    useEffect(() => {
        const allLevels = getLevelsFromPackage();
        //pass the selected courseId and sessionId
        const levelToRemove = getLevelsFromPackage({
            courseId: form.watch("selectedCourse")?.id || "",
            sessionId: form.watch("selectedSession")?.id || "",
        });
        const requiredLevelList = allLevels.filter((level) => level.id != levelToRemove[0]?.id);
        setLevelList(requiredLevelList);
    }, [instituteDetails, form.watch("selectedCourse"), form.watch("selectedSession")]);

    const handleAddLevel = (levelName: string, durationInDays: number | null) => {
        setNewLevelName(levelName);
        setNewLevelDuration(durationInDays);
        setNewLevelAdded(true);
    };

    useEffect(() => {
        if (watch("levelCreationType") === "new") {
            form.setValue("selectedLevel", { id: "", name: newLevelName });
            form.setValue("selectedLevelDuration", newLevelDuration);
        }
    }, [watch("levelCreationType"), newLevelName, newLevelDuration]);

    return (
        <div className="flex flex-col gap-6">
            <div className="text-regular">
                Step 3 <span className="font-semibold">Select Level</span>
            </div>

            <FormField
                control={form.control}
                name="levelCreationType"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <RadioGroup
                                className="flex gap-10"
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="existing" id="existing" />
                                    <label htmlFor="existing">Pre-existing level</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="new" id="new" />
                                    <label htmlFor="new">Create new level</label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className="flex flex-col gap-1">
                {levelList.length > 0 && form.watch("levelCreationType") === "existing" && (
                    <>
                        <div>
                            Level
                            <span className="text-subtitle text-danger-600">*</span>
                        </div>

                        <FormField
                            control={form.control}
                            name="selectedLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyDropdown
                                            currentValue={field.value}
                                            dropdownList={levelList}
                                            handleChange={field.onChange}
                                            placeholder="Select level"
                                            required={true}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {form.watch("levelCreationType") === "new" &&
                    (newLevelName != "" && setNewLevelDuration != null && newLevelAdded ? (
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                                <p className="text-body font-semibold">Level: {newLevelName}</p>
                                <p className="text-caption text-neutral-500">
                                    Duration: {newLevelDuration}
                                </p>
                            </div>
                            <MyButton
                                onClick={() => {
                                    setNewLevelName("");
                                    setNewLevelDuration(null);
                                    setNewLevelAdded(false);
                                }}
                                scale="small"
                                layoutVariant="icon"
                            >
                                <X />
                            </MyButton>
                        </div>
                    ) : (
                        <AddLevelInput
                            newLevelName={newLevelName}
                            setNewLevelName={setNewLevelName}
                            newLevelDuration={newLevelDuration}
                            setNewLevelDuration={setNewLevelDuration}
                            handleAddLevel={handleAddLevel}
                            batchCreation={true}
                        />
                    ))}
            </div>
        </div>
    );
};
