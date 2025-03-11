import { MyButton } from "@/components/design-system/button";
import { CourseType } from "@/stores/study-library/use-study-library-store";
import { batchWithStudentDetails, levelWithStudents } from "@/types/students/manage-batches-types";
import { Plus, TrashSimple } from "phosphor-react";

interface batchCardProps {
    course: CourseType;
    levelDetails: levelWithStudents;
}

const BatchCard = ({ course, levelDetails }: batchCardProps) => {
    return (
        <div className="flex flex-col gap-8 rounded-lg border border-neutral-300 bg-neutral-50 p-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-title font-semibold">
                        {levelDetails.level.level_name} {course.package_name}
                    </p>
                    <TrashSimple className="text-danger-400" />
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-h1 font-semibold text-primary-500">
                        {levelDetails.students_count}
                    </p>
                    <p className="text-subtitle font-semibold">students</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <MyButton
                    buttonType="text"
                    layoutVariant="default"
                    scale="medium"
                    className="text-primary-500"
                >
                    {" "}
                    <Plus /> Enroll Student
                </MyButton>
                <MyButton buttonType="secondary" layoutVariant="default" scale="medium">
                    View Batch
                </MyButton>
            </div>
        </div>
    );
};

export const BatchSection = ({ batch }: { batch: batchWithStudentDetails }) => {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-title font-semibold">{batch.course.package_name}</p>
            <div className="grid grid-cols-3 gap-6">
                {batch.levelsWithStudents.map((batchLevel, index) => (
                    <BatchCard course={batch.course} levelDetails={batchLevel} key={index} />
                ))}
            </div>
        </div>
    );
};
