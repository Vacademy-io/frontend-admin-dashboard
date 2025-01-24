import { useState } from "react";
import { DotsThree } from "@phosphor-icons/react";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { MyDropdown } from "@/components/design-system/dropdown";
import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { WarningCircle } from "phosphor-react";
import { asssessmentDetailsData } from "../-utils/dummy-data";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { timeLimit } from "@/constants/dummy-data";

const getMenuOptions = (status: string) => {
    if (status === "Attempted") {
        return ["Provide Reattempt", "Assessment Report"];
    }
    if (status === "Pending") {
        return ["Send Reminder", "Remove Participant"];
    }
    return ["Increase Assessment Time", "Close Submission"];
};

export const AssessmentStatusOptions = ({ student }: { student: StudentTable }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleMenuOptionsChange = (value: string) => {
        setSelectedOption(value);
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger>
                    <MyDropdown
                        dropdownList={getMenuOptions(student.status)}
                        onSelect={handleMenuOptionsChange}
                    >
                        <MyButton
                            buttonType="secondary"
                            scale="small"
                            layoutVariant="icon"
                            className="flex items-center justify-center"
                        >
                            <DotsThree />
                        </MyButton>
                    </MyDropdown>
                </DialogTrigger>
                {selectedOption === "Provide Reattempt" && (
                    <ProvideReattemptComponent student={student} />
                )}
                {selectedOption === "Send Reminder" && <SendReminderComponent student={student} />}
                {selectedOption === "Remove Participant" && (
                    <RemoveParticipantsComponent student={student} />
                )}
                {selectedOption === "Close Submission" && (
                    <CloseSubmissionComponent student={student} />
                )}
                {selectedOption === "Increase Assessment Time" && (
                    <IncreaseAssessmentTimeComponent student={student} />
                )}
            </Dialog>
        </div>
    );
};

const ProvideReattemptComponent = ({ student }: { student: StudentTable }) => {
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Provide Reattempt</h1>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center text-danger-600">
                    <p>Attention</p>
                    <WarningCircle size={18} />
                </div>
                <h1>
                    Are you sure you want to provide a reattempt opportunity to{" "}
                    <span className="text-primary-500">{student.full_name}</span> for assessment{" "}
                    {asssessmentDetailsData.title}.
                </h1>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="mt-4 font-medium"
                    >
                        Yes
                    </MyButton>
                </div>
            </div>
        </DialogContent>
    );
};

const SendReminderComponent = ({ student }: { student: StudentTable }) => {
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Send Reminder</h1>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center text-danger-600">
                    <p>Attention</p>
                    <WarningCircle size={18} />
                </div>
                <h1>
                    A reminder will be sent to{" "}
                    <span className="text-primary-500">{student.full_name}</span> who hasn’t yet
                    appeared for the Assessment
                </h1>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="mt-4 font-medium"
                    >
                        Send
                    </MyButton>
                </div>
            </div>
        </DialogContent>
    );
};

const RemoveParticipantsComponent = ({ student }: { student: StudentTable }) => {
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Remove Participant</h1>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center text-danger-600">
                    <p>Attention</p>
                    <WarningCircle size={18} />
                </div>
                <h1>
                    Are you sure you want remove{" "}
                    <span className="text-primary-500">{student.full_name}</span> from this
                    Assessment?
                </h1>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="mt-4 font-medium"
                    >
                        Remove
                    </MyButton>
                </div>
            </div>
        </DialogContent>
    );
};

const CloseSubmissionComponent = ({ student }: { student: StudentTable }) => {
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Close Submission</h1>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center text-danger-600">
                    <p>Attention</p>
                    <WarningCircle size={18} />
                </div>
                <h1>
                    Are you sure you want to close Assessment submission of{" "}
                    <span className="text-primary-500">{student.full_name}</span>?
                </h1>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="mt-4 font-medium"
                    >
                        Close
                    </MyButton>
                </div>
            </div>
        </DialogContent>
    );
};

const IncreaseAssessmentTimeComponent = ({ student }: { student: StudentTable }) => {
    console.log(student);
    const [selectedSection, setSelectedSection] = useState<string>(timeLimit[0] as string);
    const durationDistribution1 = "ASSESSMENT";
    const durationDistribution2 = "SECTION";
    const durationDistribution3 = "QUESTION";
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">
                Increase Assessment Time
            </h1>
            {durationDistribution1 && (
                <div className="flex flex-col gap-2 p-4">
                    <h1>Entire Assessment</h1>
                    <h3>Increase By</h3>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeLimit.map((section, idx) => (
                                <SelectItem key={idx} value={section}>
                                    {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex justify-center">
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="primary"
                            className="mt-4 font-medium"
                        >
                            Close
                        </MyButton>
                    </div>
                </div>
            )}
            {durationDistribution2 && (
                <div className="flex flex-col gap-2 p-4">
                    <h1>Section 1</h1>
                    <h3>Increase By</h3>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeLimit.map((section, idx) => (
                                <SelectItem key={idx} value={section}>
                                    {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <h1>Section 2</h1>
                    <h3>Increase By</h3>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeLimit.map((section, idx) => (
                                <SelectItem key={idx} value={section}>
                                    {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex justify-center">
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="primary"
                            className="mt-4 font-medium"
                        >
                            Close
                        </MyButton>
                    </div>
                </div>
            )}
            {durationDistribution3 && (
                <div className="flex flex-col gap-2 p-4">
                    <h1>Question 1</h1>
                    <h3>Increase By</h3>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeLimit.map((section, idx) => (
                                <SelectItem key={idx} value={section}>
                                    {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <h1>Question 2</h1>
                    <h3>Increase By</h3>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeLimit.map((section, idx) => (
                                <SelectItem key={idx} value={section}>
                                    {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex justify-center">
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="primary"
                            className="mt-4 font-medium"
                        >
                            Close
                        </MyButton>
                    </div>
                </div>
            )}
        </DialogContent>
    );
};
