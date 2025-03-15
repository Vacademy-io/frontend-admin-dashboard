import { MyDialog } from "@/components/design-system/dialog";
import { MyInput } from "@/components/design-system/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Copy } from "phosphor-react";

interface createInviteDialogProps {
    triggerButton: JSX.Element;
    submitButton: JSX.Element;
}

export const CreateInviteDialog = ({ triggerButton, submitButton }: createInviteDialogProps) => {
    const { instituteDetails, getCourseFromPackage, getLevelsFromPackage, getSessionFromPackage } =
        useInstituteDetailsStore();
    const [courseList, setCourseList] = useState(getCourseFromPackage());
    const [sessionList, setSessionList] = useState(getSessionFromPackage());
    const [levelList, setLevelList] = useState(getLevelsFromPackage());

    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
    }, [instituteDetails]);

    return (
        <MyDialog
            heading="Invite Students"
            footer={submitButton}
            trigger={triggerButton}
            dialogWidth="w-[80vw]"
        >
            <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                        <MyInput
                            label="Invite Link"
                            required={true}
                            inputType="text"
                            inputPlaceholder="Enter invite link name"
                            input=""
                            onChangeFunction={() => {}}
                            className="w-[1300px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-subtitle font-semibold">Active Status</p>
                        <Switch />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                        <p className="text-subtitle font-semibold">Course Selection Mode</p>
                        <RadioGroup className="flex items-center gap-6" value="institute">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="institute" id="existing" />
                                <label htmlFor="existing">Institute assigns</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="student" id="new" />
                                <label htmlFor="new">Student chooses</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="both" id="new" />
                                <label htmlFor="new">Both</label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex w-fit flex-col gap-2">
                        <p>
                            Course <span className="text-primary-500">*</span>
                        </p>
                        <MyDropdown dropdownList={courseList} placeholder="Select Course" />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                        <p className="text-subtitle font-semibold">Session Selection Mode</p>
                        <RadioGroup className="flex items-center gap-6" value="institute">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="institute" id="existing" />
                                <label htmlFor="existing">Institute assigns</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="student" id="new" />
                                <label htmlFor="new">Student chooses</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="both" id="new" />
                                <label htmlFor="new">Both</label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex w-fit flex-col gap-2">
                        <p>
                            Session <span className="text-primary-500">*</span>
                        </p>
                        <MyDropdown dropdownList={sessionList} placeholder="Select Session" />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                        <p className="text-subtitle font-semibold">Level Selection Mode</p>
                        <RadioGroup className="flex items-center gap-6" value="institute">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="institute" id="existing" />
                                <label htmlFor="existing">Institute assigns</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="student" id="new" />
                                <label htmlFor="new">Student chooses</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="both" id="new" />
                                <label htmlFor="new">Both</label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex w-fit flex-col gap-2">
                        <p>
                            Level <span className="text-primary-500">*</span>
                        </p>
                        <MyDropdown dropdownList={levelList} placeholder="Select Level" />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <p className="text-subtitle font-semibold">Student expiry date</p>
                    <div className="flex items-center gap-2">
                        <MyInput
                            input="365"
                            inputType="number"
                            onChangeFunction={() => {}}
                            className="w-[70px]"
                        />
                        <p>days</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <MyInput
                        label="Enter invitee email"
                        required={true}
                        placeholder="you@email.com"
                        className="w-full"
                        onChangeFunction={() => {}}
                        input=""
                    />
                    <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                        Add
                    </MyButton>
                </div>
                <Separator />
                <div className="flex items-center gap-4">
                    <p className="text-subtitle font-semibold">Invite Link</p>
                    <div className="rounded-lg border border-neutral-300 p-1 text-neutral-600 underline">
                        https://forms.gle/example123
                    </div>
                    <MyButton buttonType="secondary" layoutVariant="icon" scale="medium">
                        <Copy />
                    </MyButton>
                </div>
            </div>
        </MyDialog>
    );
};
