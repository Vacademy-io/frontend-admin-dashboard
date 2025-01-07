import { IoCheckmarkOutline } from "react-icons/io5";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { TabsContent } from "@radix-ui/react-tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useTestAccessForm } from "../-utils/useTestAccessForm";
import { StudentListTab } from "./StudentListTab";

interface BatchData {
    [batchName: string]: string[];
}

export function AddingParticipantsTab({ batches }: { batches: BatchData }) {
    const [selectedTab, setSelectedTab] = useState("Batch");
    const handleChange = (value: string) => {
        setSelectedTab(value);
    };

    return (
        <>
            <Tabs value={selectedTab} onValueChange={handleChange}>
                <TabsList className="mt-4 flex h-auto w-fit flex-wrap justify-start border border-neutral-500 !bg-transparent p-0">
                    <TabsTrigger
                        value="Batch"
                        className={`flex gap-1.5 rounded-l-lg rounded-br-none rounded-tr-none p-2 pr-4 ${
                            selectedTab === "Batch"
                                ? "!bg-primary-100 !text-neutral-500"
                                : "bg-transparent px-4"
                        }`}
                    >
                        {selectedTab === "Batch" && (
                            <IoCheckmarkOutline
                                size={18}
                                className="text-teal-800 dark:text-teal-400"
                            />
                        )}
                        <span className={`${selectedTab === "Batch" ? "text-neutral-600" : ""}`}>
                            Select Batch
                        </span>
                    </TabsTrigger>
                    <Separator className="!h-9 bg-neutral-600" orientation="vertical" />
                    <TabsTrigger
                        value="Individually"
                        className={`flex gap-1.5 rounded-bl-none rounded-br-lg rounded-tl-none rounded-tr-lg p-2 ${
                            selectedTab === "Individually"
                                ? "text-bg-teal-100 !bg-primary-100 pr-4"
                                : "bg-transparent pl-4 pr-4"
                        }`}
                    >
                        {selectedTab === "Individually" && (
                            <IoCheckmarkOutline
                                size={18}
                                className="text-teal-800 dark:text-teal-400"
                            />
                        )}
                        <span
                            className={`${
                                selectedTab === "Individually" ? "text-neutral-600" : ""
                            }`}
                        >
                            Select Individually
                        </span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="Batch" className="mt-6 flex justify-between">
                    <Step3BatchList batchData={batches} />
                </TabsContent>
                <TabsContent value="Individually">
                    <StudentListTab />
                </TabsContent>
            </Tabs>
        </>
    );
}

const Step3BatchList = ({ batchData }: { batchData: BatchData }) => {
    const form = useTestAccessForm();
    const { setValue } = form;

    // State to manage checked items using arrays
    const [checkedState, setCheckedState] = useState<Record<string, string[]>>(
        Object.keys(batchData).reduce(
            (acc, key) => {
                acc[key] = []; // Initialize each batch with an empty array
                return acc;
            },
            {} as Record<string, string[]>,
        ),
    );

    // Handle parent checkbox toggle
    const handleParentToggle = (parent: string, isChecked: boolean) => {
        setCheckedState((prev) => {
            const newState = { ...prev };

            // Provide fallback to an empty array if batchData[parent] is undefined
            newState[parent] = isChecked ? [...(batchData[parent] || [])] : []; // Select all children or deselect

            return newState;
        });
    };

    // Handle child checkbox toggle
    const handleChildToggle = (parent: string, child: string, isChecked: boolean) => {
        setCheckedState((prev) => {
            const newState = { ...prev };

            // Ensure the parent key exists and initialize it if necessary
            const currentChildren = newState[parent] || [];

            if (isChecked) {
                // Add child to the array if not already present
                newState[parent] = [...currentChildren, child];
            } else {
                // Remove child from the array
                newState[parent] = currentChildren.filter((item) => item !== child);
            }

            return newState;
        });
    };

    // Check if all children are selected
    const isAllChildrenSelected = (parent: string) => {
        const currentChildren = batchData[parent] || [];
        const checkedChildren = checkedState[parent] || [];

        // Ensure that all children are selected
        return (
            currentChildren.length > 0 &&
            currentChildren.every((child) => checkedChildren.includes(child))
        );
    };

    useEffect(() => {
        setValue(`select_batch.batch_details`, checkedState);
    }, [checkedState]);

    return (
        <div className="flex w-full justify-between">
            {Object.entries(batchData).map(([batchName, packages]) => (
                <div key={batchName}>
                    {/* Parent Checkbox */}
                    <label>
                        <Checkbox
                            checked={isAllChildrenSelected(batchName)}
                            onCheckedChange={(isChecked) =>
                                handleParentToggle(batchName, !!isChecked)
                            }
                            className={`size-4 rounded-sm border-2 shadow-none ${
                                isAllChildrenSelected(batchName)
                                    ? "border-none bg-primary-500 text-white" // Blue background when checked
                                    : "" // Default styles when unchecked
                            }`}
                        />
                        <span className="ml-2 font-thin">{batchName}</span>
                    </label>

                    {/* Child Checkboxes */}
                    <ul className="ml-4 mt-3 flex flex-col gap-3">
                        {packages.map((packageName) => (
                            <li key={packageName}>
                                <label>
                                    <Checkbox
                                        checked={checkedState[batchName]?.includes(packageName)}
                                        onCheckedChange={(isChecked) =>
                                            handleChildToggle(batchName, packageName, !!isChecked)
                                        }
                                        className={`size-4 rounded-sm border-2 shadow-none ${
                                            checkedState[batchName]?.includes(packageName)
                                                ? "border-none bg-primary-500 text-white" // Light blue background when checked
                                                : "" // Default styles when unchecked
                                        }`}
                                    />
                                    <span className="ml-2 font-thin">{packageName}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
