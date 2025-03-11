import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { SessionDropdown } from "../session-dropdown";
import { MyButton } from "@/components/design-system/button";
import { batchesWithStudents } from "@/types/students/manage-batches-types";
import { BatchSection } from "./batch-section";

export const ManageBatches = () => {
    const { setNavHeading } = useNavHeadingStore();

    const data: batchesWithStudents = [
        {
            course: {
                id: "3517d090-d3a2-420b-a453-b8dff1a4014b",
                package_name: "Foundation",
                thumbnail_file_id: "26d82ded-125a-4573-b471-45fa244f123a",
                status: "ACTIVE",
            },
            levelsWithStudents: [
                {
                    level: {
                        id: "e4cfbd1b-f018-4fb7-b012-4796ee19a440",
                        level_name: "9th standard",
                        duration_in_days: 365,
                        thumbnail_id: null,
                    },
                    students_count: 75,
                },
                {
                    level: {
                        id: "e4cfbd1b-f018-4fb7-b012-4796ee19a440",
                        level_name: "9th standard",
                        duration_in_days: 365,
                        thumbnail_id: null,
                    },
                    students_count: 75,
                },
                {
                    level: {
                        id: "e4cfbd1b-f018-4fb7-b012-4796ee19a440",
                        level_name: "9th standard",
                        duration_in_days: 365,
                        thumbnail_id: null,
                    },
                    students_count: 75,
                },
                {
                    level: {
                        id: "e4cfbd1b-f018-4fb7-b012-4796ee19a440",
                        level_name: "9th standard",
                        duration_in_days: 365,
                        thumbnail_id: null,
                    },
                    students_count: 75,
                },
            ],
        },
        {
            course: {
                id: "3517d090-d3a2-420b-a453-b8dff1a4014b",
                package_name: "Foundation",
                thumbnail_file_id: "26d82ded-125a-4573-b471-45fa244f123a",
                status: "ACTIVE",
            },
            levelsWithStudents: [
                {
                    level: {
                        id: "e4cfbd1b-f018-4fb7-b012-4796ee19a440",
                        level_name: "9th standard",
                        duration_in_days: 365,
                        thumbnail_id: null,
                    },
                    students_count: 75,
                },
            ],
        },
    ];

    useEffect(() => {
        setNavHeading("Manage Batches");
    }, []);

    return (
        <div className="flex flex-col gap-10 text-neutral-600">
            <div className="flex items-center justify-between">
                <p className="text-h3 font-semibold">Student Batches</p>
                <div className="flex items-center gap-6">
                    <SessionDropdown sessionDirection="flex-row" />
                    <MyButton scale="large">Create Batch</MyButton>
                </div>
            </div>
            <div className="flex flex-col gap-10">
                {data.map((batch, index) => (
                    <BatchSection key={index} batch={batch} />
                ))}
            </div>
        </div>
    );
};
