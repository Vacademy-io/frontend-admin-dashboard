import { SubjectDefaultImage } from "@/assets/svgs";
import { useSidebar } from "@/components/ui/sidebar";
import { LevelWithDetailsType } from "@/stores/study-library/use-study-library-store";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { LevelMenuOptions } from "./level-menu-options";

export const LevelCard = ({
    level,
    onDelete,
    onEdit,
}: {
    level: LevelWithDetailsType;
    onDelete: (levelId: string) => void;
    onEdit: () => void;
}) => {
    const { open } = useSidebar();
    const navigate = useNavigate();
    const router = useRouter();

    const currentPath = router.state.location.pathname;
    const { courseId } = router.state.location.search;

    const handleLevelCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof Element &&
            (e.target.closest(".menu-options-container") ||
                e.target.closest(".drag-handle-container") ||
                e.target.closest('[role="menu"]') ||
                e.target.closest('[role="dialog"]'))
        ) {
            return;
        }

        navigate({
            to: `${currentPath}/subjects`,
            search: {
                courseId: courseId,
                levelId: level.id,
            },
        });
    };

    return (
        <div
            className={`relative flex cursor-pointer flex-col items-center gap-4 rounded-xl border py-5 pt-10 shadow-md ${
                open ? "h-[330px] w-[360px]" : "h-[330px] w-[420px]"
            }`}
            onClick={handleLevelCardClick}
        >
            <SubjectDefaultImage />
            <div className="flex w-full justify-center gap-3 px-5">
                <div className="text-semibold w-full text-wrap text-center text-title font-semibold text-neutral-600">
                    {level.name} Class
                </div>
                <LevelMenuOptions onDelete={onDelete} onEdit={onEdit} levelId={level.id} />
            </div>
        </div>
    );
};
