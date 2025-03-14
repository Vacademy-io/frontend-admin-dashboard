import { AddSessionInput } from "@/components/design-system/add-session-input";
import { MyDropdown } from "../students/enroll-manually/dropdownForPackageItems";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { DropdownValueType } from "../students/enroll-manually/dropdownTypesForPackageItems";

export const CreateSessionStep = () => {
    const { instituteDetails, getSessionFromPackage } = useInstituteDetailsStore();
    const [sessionList, setSessionList] = useState(getSessionFromPackage());
    const [selectedSession, setSelectedSession] = useState<DropdownValueType | undefined>(
        undefined,
    );
    const [newSessionName, setNewSessionName] = useState("");
    const [newSessionStartDate, setNewSessionStartDate] = useState("");

    useEffect(() => {
        setSessionList(getSessionFromPackage());
    }, [instituteDetails]);

    const handleSessionChange = (e: DropdownValueType) => {
        setSelectedSession(e);
    };

    const handleAddSession = () => {};

    return (
        <div className="flex flex-col gap-6">
            <div className="text-regular">
                Step 2 <span className="font-semibold">Select Session</span>
            </div>
            <RadioGroup className="flex gap-10">
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="existing" />
                    <label htmlFor="existing">Pre-existing session</label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="new" />
                    <label htmlFor="new">Create new session</label>
                </div>
            </RadioGroup>
            <div className="flex flex-col gap-1">
                <div>
                    Session
                    <span className="text-subtitle text-danger-600">*</span>
                </div>
                {sessionList.length > 0 && (
                    <MyDropdown
                        currentValue={selectedSession}
                        dropdownList={sessionList}
                        handleChange={handleSessionChange}
                        placeholder="Select session"
                        required={true}
                    />
                )}
                <AddSessionInput
                    newSessionName={newSessionName}
                    setNewSessionName={setNewSessionName}
                    newSessionStartDate={newSessionStartDate}
                    setNewSessionStartDate={setNewSessionStartDate}
                    handleAddSession={handleAddSession}
                />
            </div>
        </div>
    );
};
