import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FC, SVGProps, useEffect, useState } from "react";
import { Class10CardImage } from "@/assets/svgs";
import { Class9CardImage } from "@/assets/svgs";
import { Class8CardImage } from "@/assets/svgs";
import { ClassCard } from "./class-card";
import { UploadStudyMaterialButton } from "./upload-study-material/upload-study-material-button";
import { useNavigate } from "@tanstack/react-router";
import { SessionDropdown } from "./study-library-session-dropdown";
import { CreateStudyDocButton } from "./upload-study-material/create-study-doc-button";
import { useSidebar } from "@/components/ui/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useStudyLibraryQuery } from "@/services/study-library/getStudyLibraryDetails";
import { getSessionNames } from "@/utils/helpers/study-library-helpers.ts/get-utilitites-from-stores/getStudyLibrarySessions";
import { getSessionLevels } from "@/utils/helpers/study-library-helpers.ts/get-utilitites-from-stores/getSessionLevels";

interface ClassCardType {
    levelId: string;
    image: FC<SVGProps<SVGSVGElement>> | undefined;
    class: string;
}

export const StudyLibrary = () => {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const { open } = useSidebar();
    const sessionList = getSessionNames();
    const [currentSession, setCurrentSession] = useState(sessionList[0] || "");
    const LevelList = getSessionLevels(currentSession);

    useSuspenseQuery(useStudyLibraryQuery());

    const handleSessionChange = (value: string) => {
        setCurrentSession(value);
    };

    const classImages: Record<string, FC<SVGProps<SVGSVGElement>>> = {
        "8th": Class8CardImage,
        "9th": Class9CardImage,
        "10th": Class10CardImage,
        "11th": Class10CardImage,
    };

    const ClassCardData: ClassCardType[] = LevelList.map((level) => ({
        levelId: level.id,
        image: classImages[level.name],
        class: level.name,
    }));

    const handleClassClick = (className: string) => {
        const routeName = `${className}-class-study-library`;
        navigate({ to: `/study-library/${routeName}` });
    };

    useEffect(() => {
        setNavHeading("Study Library");
    }, []);

    return (
        <div className="relative flex flex-col gap-8 text-neutral-600">
            <div className="flex items-center gap-20">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">Class & Resource Management</div>
                    <div className="text-subtitle">
                        Effortlessly manage classes, subjects, and resources to ensure students have
                        access to the best education materials. Organize, upload, and track study
                        resources for 8th, 9th and 10th classes all in one place.
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <CreateStudyDocButton />
                    <UploadStudyMaterialButton />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <SessionDropdown
                    currentSession={currentSession}
                    onSessionChange={handleSessionChange}
                    className="text-title font-semibold"
                />
            </div>

            <div className={`grid grid-cols-3 ${open ? "gap-4" : "gap-8"} justify-between`}>
                {ClassCardData.map((card, key) => (
                    <div key={key} onClick={() => handleClassClick(card.class)}>
                        <ClassCard
                            image={card.image}
                            classLevel={card.class}
                            levelId={card.levelId}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
