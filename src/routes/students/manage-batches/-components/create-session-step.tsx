// CreateSessionStep.tsx
import { AddSessionInput } from "@/components/design-system/add-session-input";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
    convertToFormSession,
    Session,
} from "@/components/common/study-library/add-course/add-course-form";

export const CreateSessionStep = () => {
    const { instituteDetails, getAllSessions } = useInstituteDetailsStore();
    const [newSessionName, setNewSessionName] = useState("");
    const [newSessionStartDate, setNewSessionStartDate] = useState("");
    const form = useFormContext();
    const [sessionList, setSessionList] = useState<Session[]>([]);

    useEffect(() => {
        setSessionList(getAllSessions().map((session) => convertToFormSession(session)));
    }, [instituteDetails]);

    const handleAddSession = (sessionName: string, startDate: string) => {
        const newSession: Session = {
            id: "",
            new_session: true,
            session_name: sessionName,
            status: "INACTIVE",
            start_date: startDate,
            levels: [], // Initialize with empty levels array
        };
        setSessionList((prevSessionList) => [...prevSessionList, newSession]);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="text-regular">
                Step 2 <span className="font-semibold">Select Session</span>
            </div>

            <FormField
                control={form.control}
                name="sessionCreationType"
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
                                    <label htmlFor="existing">Pre-existing session</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="new" id="new" />
                                    <label htmlFor="new">Create new session</label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className="flex flex-col gap-1">
                {sessionList.length > 0 && form.watch("sessionCreationType") === "existing" && (
                    <>
                        <div>
                            Session
                            <span className="text-subtitle text-danger-600">*</span>
                        </div>

                        <FormField
                            control={form.control}
                            name="selectedSession"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyDropdown
                                            currentValue={field.value}
                                            dropdownList={sessionList.map((session) => ({
                                                id: session.id,
                                                name: session.session_name,
                                            }))}
                                            handleChange={field.onChange}
                                            placeholder="Select session"
                                            required={true}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {form.watch("sessionCreationType") === "new" && (
                    <AddSessionInput
                        newSessionName={newSessionName}
                        setNewSessionName={setNewSessionName}
                        newSessionStartDate={newSessionStartDate}
                        setNewSessionStartDate={setNewSessionStartDate}
                        handleAddSession={handleAddSession}
                    />
                )}
            </div>
        </div>
    );
};
