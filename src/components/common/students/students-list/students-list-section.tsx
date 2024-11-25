import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table";
import { MyDropdown } from "./dropdown";
import { Filters } from "./filters";

export const StudentsListSection = () => {
    /*An API which will return a list containing all the sessions and their respected students data or 2 apis for both the operations*/
    const sessionlist = ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021"];

    const [currentSession, setCurrentSession] = useState<string>("2024-2025");

    const [searchInput, setSearchInput] = useState("");

    const filters = [
        {
            label: "Batches",
            filters: [
                "10th Premium Pro Group 1",
                "10th Premium Pro Group 2",
                "10th Premium Plus Group 1",
                "10th Premium Plus Group 2",
                "9th Premium Pro Group 1",
                "9th Premium Pro Group 2",
                "9th Premium Plus Group 1",
                "9th Premium Plus Group 2",
            ],
        },
        {
            label: "Status",
            filters: ["Active", "Inactive"],
        },
        {
            label: "Gender",
            filters: ["Male", "Female", "Others"],
        },
        {
            label: "Session Expiry",
            filters: ["Above Session Threshold", "Below Session Threshold", "Session Expired"],
        },
    ];

    return (
        <section className="flex max-w-full flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="text-h3 font-semibold">Students List</div>
                <MyButton scale="large" buttonType="primary" layoutVariant="default">
                    Enroll Student
                </MyButton>
            </div>
            <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-6">
                    <MyDropdown
                        currentValue={currentSession}
                        setCurrentValue={setCurrentSession}
                        dropdownList={sessionlist}
                    />

                    <div className="relative">
                        <MyInput
                            inputType="text"
                            input={searchInput}
                            setInput={setSearchInput}
                            inputPlaceholder="Search by name, enrollment ..."
                            className="pl-9"
                        />
                        <MagnifyingGlass className="absolute left-3 top-1/4 size-[18px] text-neutral-600" />
                    </div>

                    {filters.map((obj, ind) => (
                        <Filters filterDetails={obj} key={ind} />
                    ))}
                </div>
                <MyButton scale="large" buttonType="secondary" layoutVariant="default">
                    <Export />
                    <div>Export</div>
                </MyButton>
            </div>
            <div className="max-w-full">
                <MyTable />
            </div>
        </section>
    );
};
