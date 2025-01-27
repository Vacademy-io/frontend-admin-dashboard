import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AddSubjectButton } from "./subject-material/add-subject.tsx/add-subject-button";
import { Subjects } from "./subject-material/add-subject.tsx/subjects";
import { useState } from "react";
import { Subject } from "./subject-material/add-subject.tsx/subjects";
import { formatClassName } from "@/lib/study-library/class-formatter";
import { SessionDropdown } from "@/components/common/session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";

interface ClassStudyMaterialProps {
    classNumber: string | undefined;
}

export const ClassStudyMaterial = ({ classNumber }: ClassStudyMaterialProps) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [searchInput, setSearchInput] = useState("");

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

    const formattedClass = formatClassName(classNumber);

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${formattedClass} Class Study Library`}</div>
        </div>
    );

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(heading);
    }, [classNumber]);

    return (
        <div className="flex h-full w-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">
                        {`Manage ${formattedClass} Class Resources`}
                    </div>
                    <div className="text-subtitle">
                        {`Explore and manage resources for ${formattedClass}th Class. Click on a subject to view and
                        organize eBooks and video lectures, or upload new content to enrich your
                        study library.`}
                    </div>
                </div>
                <AddSubjectButton onAddSubject={handleAddSubject} />
            </div>
            <div className="flex items-center gap-6">
                <SessionDropdown className="text-title font-semibold" />
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
                classNumber={classNumber} // Add this prop
            />
        </div>
    );
};
