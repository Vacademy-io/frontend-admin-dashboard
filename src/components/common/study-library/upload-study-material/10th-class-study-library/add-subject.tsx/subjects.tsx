import { EmptySubjectMaterial, SubjectDefaultImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { DotsSixVertical, DotsThree } from "@phosphor-icons/react";

interface Subject {
    name: string;
    imageUrl?: string;
}

const SubjectCard = ({ subject }: { subject: Subject }) => {
    return (
        <div className="relative flex size-[300px] flex-col items-center justify-center gap-4 border-neutral-500 bg-neutral-50 p-4 shadow-md">
            <DotsSixVertical className="absolute right-4 top-4 size-6 cursor-pointer" />
            <SubjectDefaultImage />
            <div className="flex items-center justify-between gap-5">
                <div className="text-h2 font-semibold">{subject.name}</div>
                <MyButton buttonType="secondary" layoutVariant="icon" scale="small">
                    <DotsThree />
                </MyButton>
            </div>
        </div>
    );
};

interface SubjectsProps {
    subjects: Subject[];
}

export const Subjects = ({ subjects }: SubjectsProps) => {
    return (
        <div className="h-full w-full">
            {!subjects.length && (
                <div className="flex h-[500px] w-full flex-col items-center justify-center gap-8 rounded-lg bg-neutral-100">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            )}
            <div className="grid grid-cols-4 gap-10">
                {subjects.map((subject, index) => (
                    <SubjectCard key={index} subject={subject} />
                ))}
            </div>
        </div>
    );
};

export { type Subject };
