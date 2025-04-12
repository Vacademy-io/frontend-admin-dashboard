import { Checkbox } from "@/components/ui/checkbox";
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { X } from "phosphor-react";
import { Input } from "@/components/ui/input";

interface MultipleInputProps {
    itemsList: string[];
    onListChange: (updatedList: string[]) => void; // Callback function to update parent state
}

const MultipleInput = ({ itemsList, onListChange }: MultipleInputProps) => {
    const [input, setInput] = useState("");
    const [list, setList] = useState<string[]>(itemsList);

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const updateList = (updatedList: string[]) => {
        setList(updatedList);
        onListChange(updatedList); // Notify parent about the change
    };

    const addItemsToList = () => {
        if (input.trim() !== "" && isValidEmail(input) && !list.includes(input)) {
            updateList([...list, input]);
            setInput("");
        }
    };

    const deleteItem = (item: string) => {
        updateList(list.filter((i) => i !== item));
    };

    return (
        <div>
            <div className="w-[350px]">
                <Input
                    type="email"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItemsToList()}
                    placeholder="Enter email and press Enter"
                    className="!focus:outline-none !focus:ring-0 mb-2 w-full !outline-none"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {list?.map((item) => (
                    <div
                        key={item}
                        className="flex w-fit flex-row items-center gap-2 rounded-lg border px-3 py-1"
                    >
                        <div>{item}</div>
                        <button
                            onClick={() => deleteItem(item)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ReportRecipientsDialogBox() {
    const [reportRecipientsState, setReportRecipientsState] = useState(false);
    return (
        <div>
            <MyButton
                buttonType="secondary"
                onClick={() => {
                    setReportRecipientsState(!reportRecipientsState);
                }}
            >
                Report Recipients
            </MyButton>
            <MyDialog
                heading="Report Recipients"
                open={reportRecipientsState}
                onOpenChange={setReportRecipientsState}
                dialogWidth="w-[800px]"
            >
                <div className="flex flex-col gap-10">
                    <div className="flex h-[350px] flex-col gap-10 overflow-y-scroll">
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-row items-center gap-4">
                                    <Checkbox></Checkbox>
                                    <div className="text-subtitle font-[600]">
                                        Send Reports to Student via mail
                                    </div>
                                </div>
                                <div>
                                    <MultipleInput
                                        itemsList={["demo@gmail.com"]}
                                        onListChange={() => {}}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <Checkbox></Checkbox>
                                <div className="text-subtitle font-[600]">
                                    Send Reports to Student via whatsapp
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-4">
                                <div className="text-subtitle font-[600]">
                                    Student Learning Progress Report
                                </div>
                                <div className="flex flex-row gap-6">
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate daily reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate weekly reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate monthly reports</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-4">
                                <div className="text-subtitle font-[600]">
                                    Batch Learning Progress Report
                                </div>
                                <div className="flex flex-row gap-6">
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate daily reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate weekly reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate monthly reports</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border"></div>
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-row items-center gap-4">
                                <Checkbox></Checkbox>
                                <div className="text-subtitle font-[600]">
                                    Send Reports to Parent/Guardian via mail
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <Checkbox></Checkbox>
                                <div className="text-subtitle font-[600]">
                                    Send Reports to Parent/Guardian via whatsapp
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-4">
                                <div className="text-subtitle font-[600]">
                                    Student Learning Progress Report
                                </div>
                                <div className="flex flex-row gap-6">
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate daily reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate weekly reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate monthly reports</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-4">
                                <div className="text-subtitle font-[600]">
                                    Batch Learning Progress Report
                                </div>
                                <div className="flex flex-row gap-6">
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate daily reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate weekly reports</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox></Checkbox>
                                        <div className="text-body">Generate monthly reports</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-center">
                        <MyButton>Save Changes</MyButton>
                    </div>
                </div>
            </MyDialog>
        </div>
    );
}
