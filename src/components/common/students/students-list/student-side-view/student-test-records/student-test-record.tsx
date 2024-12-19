import { MyInput } from "@/components/design-system/input";
import { ChangeEvent, useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { StatusChips } from "@/components/design-system/chips";
import { StudentTestRecordsType } from "../student-view-dummy-data/student-view-dummy-data";
import { TestRecordDetailsType } from "../student-view-dummy-data/test-record";
import { TestReportDialog } from "./test-report-dialog";

export const StudentTestRecord = ({
    testRecordData,
}: {
    testRecordData: StudentTestRecordsType;
}) => {
    const [searchInput, setSearchInput] = useState("");
    const [selectedTest, setSelectedTest] = useState<TestRecordDetailsType | null>(null);

    const handleSearchInputChange = (value: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(value.target.value);
    };

    const handleViewReport = (test: TestRecordDetailsType) => {
        setSelectedTest(test);
    };

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between">
                <MyInput
                    inputType="text"
                    placeholder="Search test, subject"
                    size="large"
                    input={searchInput}
                    onChangeFunction={handleSearchInputChange}
                />
            </div>
            <div className="flex flex-col gap-10">
                {testRecordData.data.map((test, ind) => (
                    <div
                        className="flex w-full flex-col gap-2 rounded-lg border border-primary-300 p-4"
                        key={ind}
                    >
                        <div className="flex w-full gap-4">
                            <div className="text-subtitle">{test.name}</div>
                            <StatusChips status={test.status} />
                        </div>
                        {test.status === "active" ? (
                            <div className="flex w-full flex-col gap-8">
                                <div className="flex items-center justify-between">
                                    <div>Subject: {test.subject}</div>
                                    <div>Attempted Date: {test.attemptDate}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>Marks: {test.marks}</div>
                                    <div>Duration: {test.duration}</div>
                                </div>
                                <div className="flex w-full justify-end">
                                    <MyButton
                                        buttonType="secondary"
                                        layoutVariant="default"
                                        scale="medium"
                                        onClick={() => handleViewReport(test)}
                                    >
                                        View Report
                                    </MyButton>
                                </div>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col gap-8">
                                <div>Subject: {test.subject}</div>
                                <div>Test Schedule: {test.testSchedule}</div>
                                {test.status === "pending" && (
                                    <div className="flex w-full justify-end">
                                        <MyButton
                                            scale="medium"
                                            buttonType="secondary"
                                            layoutVariant="default"
                                        >
                                            Send Reminder
                                        </MyButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedTest?.testReport && (
                <TestReportDialog
                    isOpen={!!selectedTest}
                    onClose={() => setSelectedTest(null)}
                    testReport={selectedTest.testReport}
                />
            )}
        </div>
    );
};
