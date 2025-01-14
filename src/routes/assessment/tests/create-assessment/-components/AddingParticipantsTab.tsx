import { IoCheckmarkOutline } from "react-icons/io5";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { TabsContent } from "@radix-ui/react-tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentListTab } from "./StudentListTab";
import testAccessSchema from "../-utils/add-participants-schema";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

type TestAccessFormType = z.infer<typeof testAccessSchema>;

type BatchItem = {
    id: string;
    name: string;
};

type BatchData = Record<string, BatchItem[]>;

export function AddingParticipantsTab({
    batches,
    form,
}: {
    batches: BatchData;
    form: UseFormReturn<TestAccessFormType>;
}) {
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
                    <Step3BatchList batchData={batches} form={form} />
                </TabsContent>
                <TabsContent value="Individually">
                    <StudentListTab form={form} />
                </TabsContent>
            </Tabs>
        </>
    );
}

const Step3BatchList = ({
    batchData,
    form,
}: {
    batchData: BatchData;
    form: UseFormReturn<TestAccessFormType>;
}) => {
    const { setValue, getValues } = form;

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
    const handleParentToggle = (parentId: string, isChecked: boolean) => {
        setCheckedState((prev) => {
            const newState = { ...prev };
            newState[parentId] = isChecked ? batchData[parentId]?.map((item) => item.id) || [] : [];
            return newState;
        });
    };

    // Handle child checkbox toggle
    const handleChildToggle = (parentId: string, childId: string, isChecked: boolean) => {
        setCheckedState((prev) => {
            const newState = { ...prev };
            const currentChildren = newState[parentId] || [];

            if (isChecked) {
                newState[parentId] = [...currentChildren, childId];
            } else {
                newState[parentId] = currentChildren.filter((id) => id !== childId);
            }

            return newState;
        });
    };

    // Check if all children are selected
    const isAllChildrenSelected = (parentId: string) => {
        const currentChildren = batchData[parentId]?.map((item) => item.id) || [];
        const checkedChildren = checkedState[parentId] || [];
        return (
            currentChildren.length > 0 &&
            currentChildren.every((childId) => checkedChildren.includes(childId))
        );
    };

    useEffect(() => {
        // Update form with only IDs
        setValue("select_batch.batch_details", checkedState);
    }, [checkedState]);

    useEffect(() => {
        setCheckedState(getValues("select_batch.batch_details"));
    }, []);
    console.log(checkedState);

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
                                    ? "border-none bg-primary-500 text-white"
                                    : ""
                            }`}
                        />
                        <span className="ml-2 font-thin">{batchName}</span>
                    </label>

                    {/* Child Checkboxes */}
                    <ul className="ml-4 mt-3 flex flex-col gap-3">
                        {packages.map((pkg) => (
                            <li key={pkg.id}>
                                <label>
                                    <Checkbox
                                        checked={checkedState[batchName]?.includes(pkg.id)}
                                        onCheckedChange={(isChecked) =>
                                            handleChildToggle(batchName, pkg.id, !!isChecked)
                                        }
                                        className={`size-4 rounded-sm border-2 shadow-none ${
                                            checkedState[batchName]?.includes(pkg.id)
                                                ? "border-none bg-primary-500 text-white"
                                                : ""
                                        }`}
                                    />
                                    <span className="ml-2 font-thin">{pkg.name}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
