import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import BatchReports from "./batch/batchReports";
import StudentReports from "./student/studentReports";
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function HeaderTabs() {
    const [selectedTab, setSelectedTab] = useState("BATCH");
    const [settingDialogState, setSettingDialogState] = useState(false);

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    return (
        <div>
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
                <div className="flex flex-row justify-between">
                    <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b-[1px] !bg-transparent p-0">
                        <TabsTrigger
                            value="BATCH"
                            className={`flex gap-1.5 rounded-none pb-2 pl-12 pr-12 pt-2 !shadow-none ${
                                selectedTab === "BATCH"
                                    ? "border-4px rounded-tl-sm rounded-tr-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                    : "border-none bg-transparent"
                            }`}
                        >
                            Batch
                        </TabsTrigger>
                        <TabsTrigger
                            value="STUDENT"
                            className={`flex gap-1.5 rounded-none pb-2 pl-12 pr-12 pt-2 !shadow-none ${
                                selectedTab === "STUDENT"
                                    ? "border-4px rounded-tl-sm rounded-tr-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                    : "border-none bg-transparent"
                            }`}
                        >
                            Student
                        </TabsTrigger>
                    </TabsList>
                    <MyButton
                        onClick={() => {
                            setSettingDialogState(!settingDialogState);
                        }}
                        buttonType="secondary"
                    >
                        Report Settings
                    </MyButton>
                </div>
                <TabsContent value="BATCH">
                    <BatchReports></BatchReports>
                </TabsContent>
                <TabsContent value="STUDENT">
                    <StudentReports></StudentReports>
                </TabsContent>
            </Tabs>
            <MyDialog
                heading="Reports Settings"
                open={settingDialogState}
                onOpenChange={setSettingDialogState}
                dialogWidth="w-[800px]"
            >
                <div className="flex flex-col gap-10">
                    <div className="flex h-[350px] flex-col gap-10 overflow-y-scroll">
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-row items-center gap-4">
                                <Checkbox></Checkbox>
                                <div className="text-subtitle font-[600]">
                                    Send Reports to Student via mail
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
