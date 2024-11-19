import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { FilterChips } from "@/components/design-system/chips";
import { Export } from "@phosphor-icons/react";

export const StudentsListSection = () => {
    const [sessionValue, setSessionValue] = useState("Session 2024-2025");
    const [searchInput, setSearchInput] = useState("");

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="text-h3 font-semibold">Students List</div>
                <MyButton scale="large" buttonType="primary" layoutVariant="default">
                    Enroll Student
                </MyButton>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <MyInput inputType="dropdown" input={sessionValue} setInput={setSessionValue} />
                    <MyInput
                        inputType="text"
                        input={searchInput}
                        setInput={setSearchInput}
                        inputPlaceholder="Search by name, enrollment ..."
                    />
                    <FilterChips label="Batches"></FilterChips>
                    <FilterChips label="Status"></FilterChips>
                    <FilterChips label="Gender"></FilterChips>
                </div>
                <MyButton scale="large" buttonType="secondary" layoutVariant="default">
                    <Export />
                    <div>Export</div>
                </MyButton>
            </div>
        </section>
    );
};
