import { LevelWithDetailsType } from '@/stores/study-library/use-study-library-store';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { LevelMenuOptions } from './level-menu-options';
import { AddLevelData } from './add-level-form';

export const LevelCard = ({
    level,
    onDelete,
    onEdit,
}: {
    level: LevelWithDetailsType;
    onDelete: (levelId: string) => void;
    onEdit: ({ requestData }: { requestData: AddLevelData }) => void;
}) => {
    const navigate = useNavigate();
    const router = useRouter();

    const currentPath = router.state.location.pathname;
    const { courseId } = router.state.location.search;

    const handleLevelCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof Element &&
            (e.target.closest('.menu-options-container') ||
                e.target.closest('.drag-handle-container') ||
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
            className="relative flex h-[140px] w-full max-w-[900px] cursor-pointer flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-shadow hover:shadow-md"
            onClick={handleLevelCardClick}
        >
            {/* TOP: Level name and duration */}
            <div className="flex flex-col overflow-hidden">
                <p className="line-clamp-2 break-words text-sm font-semibold text-neutral-700">
                    {level.name}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                    Duration: {level.duration_in_days} days
                </p>
            </div>

            {/* BOTTOM-RIGHT: Menu Options */}
            <div className="flex justify-end">
                <LevelMenuOptions
                    onDelete={onDelete}
                    onEdit={onEdit}
                    levelId={level.id}
                    level={level}
                />
            </div>
        </div>
    );
};
