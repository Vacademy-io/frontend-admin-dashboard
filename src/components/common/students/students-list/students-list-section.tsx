import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table";
import { MyDropdown } from "./dropdown";
import { Filters } from "./filters";
import { TableDummyData } from "@/components/design-system/utils/data/table-dummy-data";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";

export const StudentsListSection = () => {
    /*An API which will return a list containing all the sessions and their respected students data or 2 apis for both the operations*/

    const { setNavHeading } = useNavHeadingStore();
    useEffect(() => {
        setNavHeading("Students");
    }, []);

    const [currentSession, setCurrentSession] = useState<string>("2024-2025");
    const [searchInput, setSearchInput] = useState("");
    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedGender, setSelectedGender] = useState<string[]>([]);
    const [selectedSessionExpiry, setSelectedSessionExpiry] = useState<string[]>([]);

    const sessionlist = ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021"];
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
            filters: ["active", "inactive"],
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

    const handleFilterChange = (filterType: string, values: string[]) => {
        switch (filterType) {
            case "Batches":
                setSelectedBatches(values);
                break;
            case "Status":
                setSelectedStatus(values);
                break;
            case "Gender":
                setSelectedGender(values);
                break;
            case "Session Expiry":
                setSelectedSessionExpiry(values);
                break;
        }
    };

    const filterData = (data: typeof TableDummyData) => {
        return data.filter((row) => {
            const searchMatch =
                searchInput === "" ||
                row.studentName.toLowerCase().includes(searchInput.toLowerCase()) ||
                row.enrollmentNumber.toLowerCase().includes(searchInput.toLowerCase());

            const batchMatch = selectedBatches.length === 0 || selectedBatches.includes(row.batch);
            const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(row.status);
            const genderMatch = selectedGender.length === 0 || selectedGender.includes(row.gender);
            const sessionExpiryMatch =
                selectedSessionExpiry.length === 0 ||
                selectedSessionExpiry.includes(getSessionExpiryStatus(row.sessionExpiry));

            return searchMatch && batchMatch && statusMatch && genderMatch && sessionExpiryMatch;
        });
    };

    // Function to determine session expiry status
    const getSessionExpiryStatus = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const threshold = new Date();
        threshold.setMonth(threshold.getMonth() + 1); // 1 month threshold

        if (expiry < today) return "Session Expired";
        if (expiry <= threshold) return "Below Session Threshold";
        return "Above Session Threshold";
    };

    return (
        <section className="flex max-w-full flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="text-h3 font-semibold">Students List</div>
                <MyButton scale="large" buttonType="primary" layoutVariant="default">
                    Enroll Student
                </MyButton>
            </div>
            <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-6 gap-y-4">
                    <div className="flex items-center gap-2">
                        <div className="text-title">Session</div>
                        <MyDropdown
                            currentValue={currentSession}
                            setCurrentValue={setCurrentSession}
                            dropdownList={sessionlist}
                        />
                    </div>

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
                        <Filters
                            filterDetails={obj}
                            key={ind}
                            onFilterChange={(values) => handleFilterChange(obj.label, values)}
                        />
                    ))}
                </div>
                <MyButton scale="large" buttonType="secondary" layoutVariant="default">
                    <Export />
                    <div>Export</div>
                </MyButton>
            </div>
            <div className="max-w-full">
                <MyTable filteredData={filterData(TableDummyData)} />
            </div>
        </section>
    );
};
