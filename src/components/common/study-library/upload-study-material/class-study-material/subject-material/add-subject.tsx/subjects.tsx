import { EmptySubjectMaterial } from "@/assets/svgs";
import { Subject, SubjectCard } from "./subject-card";
interface SubjectsProps {
    subjects: Subject[];
    onDeleteSubject: (index: number) => void;
    onEditSubject: (index: number, updatedSubject: Subject) => void;
    classNumber: string | undefined; // Add this prop
}

export const Subjects = ({
    subjects,
    onDeleteSubject,
    onEditSubject,
    classNumber,
}: SubjectsProps) => {
    return (
        <div className="h-full w-full">
            {!subjects.length && (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            )}
            <div className="grid grid-cols-4 gap-10">
                {subjects.map((subject, index) => (
                    <SubjectCard
                        key={index}
                        subject={subject}
                        onDelete={() => onDeleteSubject(index)}
                        onEdit={(updatedSubject) => onEditSubject(index, updatedSubject)}
                        classNumber={classNumber} // Pass down the classNumber
                    />
                ))}
            </div>
        </div>
    );
};

export { type Subject };
