import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Plus, X } from "@phosphor-icons/react";
import { Dispatch, SetStateAction } from "react";

interface AddSessionInputProps {
    newSessionName: string;
    setNewSessionName: Dispatch<SetStateAction<string>>;
    newSessionStartDate: string;
    setNewSessionStartDate: Dispatch<SetStateAction<string>>;
    handleAddSession: (sessionName: string, startDate: string) => void;
    setShowNewSessionInput: Dispatch<SetStateAction<boolean>>;
}

export const AddSessionInput = ({
    newSessionName,
    setNewSessionName,
    newSessionStartDate,
    setNewSessionStartDate,
    handleAddSession,
    setShowNewSessionInput,
}: AddSessionInputProps) => {
    return (
        <div className="flex items-end gap-4">
            <div className="flex flex-col gap-4">
                <MyInput
                    inputType="text"
                    inputPlaceholder="Enter session name"
                    className="w-[230]"
                    input={newSessionName}
                    onChangeFunction={(e) => setNewSessionName(e.target.value)}
                    required={true}
                    label="New Session"
                />
                <MyInput
                    inputType="date"
                    inputPlaceholder="Start Date"
                    className="w-[200px] text-neutral-500"
                    input={newSessionStartDate}
                    onChangeFunction={(e) => setNewSessionStartDate(e.target.value)}
                    required={true}
                    label="Start Date"
                />
            </div>
            <div className="flex items-center gap-4">
                <MyButton
                    onClick={() => {
                        if (newSessionName && newSessionStartDate) {
                            handleAddSession(newSessionName, newSessionStartDate);
                            setNewSessionName("");
                            setNewSessionStartDate("");
                            setShowNewSessionInput(false);
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
                        setShowNewSessionInput(false);
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
