// subjects.tsx
import { EmptySubjectMaterial } from "@/assets/svgs";
import { Subject, SubjectCard } from "./subject-card";

interface SubjectsProps {
    subjects: Subject[];
    onDeleteSubject: (subjectId: string) => void;
    onEditSubject: (subjectId: string, updatedSubject: Subject) => void;
    classNumber: string;
}

export const Subjects = ({
    subjects,
    onDeleteSubject,
    onEditSubject,
    classNumber,
}: SubjectsProps) => {
    return (
        <div className="h-full w-full">
            {!subjects.length ? (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-10">
                    {subjects.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                            onDelete={() => onDeleteSubject(subject.id)}
                            onEdit={(updatedSubject) => onEditSubject(subject.id, updatedSubject)}
                            classNumber={classNumber}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { type Subject };
