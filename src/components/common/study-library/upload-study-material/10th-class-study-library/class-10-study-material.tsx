import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AddSubjectButton } from "./add-subject.tsx/add-subject-button";
import { Subjects } from "./add-subject.tsx/subjects";
import { useState } from "react";
import { Subject } from "./add-subject.tsx/subjects";

export const Class10StudyMaterial = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const router = useRouter();

    const handleBackClick = () => {
        router.navigate({
            to: "/study-library",
        });
    };

    const handleAddSubject = (subject: Subject) => {
        setSubjects((prev) => [...prev, subject]);
        console.log("New subject added:", subject);
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>10th Class Study Library</div>
        </div>
    );

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <div className="flex h-full w-full flex-col gap-12 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">Manage 10th Class Resources</div>
                    <div className="text-subtitle">
                        Explore and manage resources for 10th Class. Click on a subject to view and
                        organize eBooks and video lectures, or upload new content to enrich your
                        study library.
                    </div>
                </div>
                <AddSubjectButton onAddSubject={handleAddSubject} />
            </div>
            <Subjects subjects={subjects} />
        </div>
    );
};
