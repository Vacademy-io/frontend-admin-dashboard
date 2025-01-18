// class-study-material.tsx
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AddSubjectButton } from "./subject-material/add-subject.tsx/add-subject-button";
import { Subjects } from "./subject-material/add-subject.tsx/subjects";
import { useState } from "react";
import { Subject } from "./subject-material/add-subject.tsx/subjects";
import { SessionDropdown } from "../../study-library-session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { getSessionNames } from "@/services/study-library/getStudyLibrarySessions";
import { getSessionSubjects } from "@/services/study-library/getSessionSubjects";

interface ClassStudyMaterialProps {
    classNumber: string;
}

export const ClassStudyMaterial = ({ classNumber }: ClassStudyMaterialProps) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const sessionList = getSessionNames();
    const [currentSession, setCurrentSession] = useState(sessionList[0] || "");
    const mysubjects = getSessionSubjects(currentSession, classNumber);

    const handleSessionChange = (value: string) => {
        setCurrentSession(value);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleAddSubject = (subject: Subject) => {
        setSubjects((prev) => [...prev, subject]);
    };

    const handleDeleteSubject = (index: number) => {
        setSubjects((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditSubject = (index: number, updatedSubject: Subject) => {
        setSubjects((prev) => prev.map((subject, i) => (i === index ? updatedSubject : subject)));
    };

    const router = useRouter();

    const handleBackClick = () => {
        router.navigate({
            to: "/study-library",
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${classNumber} Class Study Library`}</div>
        </div>
    );

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(heading);
        console.log("Subjects: ", mysubjects);
    }, [classNumber]);

    return (
        <div className="flex h-full w-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">
                        {`Manage ${classNumber} Class Resources`}
                    </div>
                    <div className="text-subtitle">
                        {`Explore and manage resources for ${classNumber} Class. Click on a subject to view and
                        organize eBooks and video lectures, or upload new content to enrich your
                        study library.`}
                    </div>
                </div>
                <AddSubjectButton onAddSubject={handleAddSubject} />
            </div>
            <div className="flex items-center gap-6">
                <SessionDropdown
                    currentSession={currentSession}
                    onSessionChange={handleSessionChange}
                    className="text-title font-semibold"
                />
                <SearchInput
                    searchInput={searchInput}
                    onSearchChange={handleSearchInputChange}
                    placeholder="Search subject"
                />
            </div>
            <Subjects
                subjects={subjects}
                onDeleteSubject={handleDeleteSubject}
                onEditSubject={handleEditSubject}
                classNumber={classNumber}
            />
        </div>
    );
};
