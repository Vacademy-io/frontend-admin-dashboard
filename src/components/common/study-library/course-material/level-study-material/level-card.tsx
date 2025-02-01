import { useSidebar } from "@/components/ui/sidebar";
import { LevelWithDetailsType } from "@/stores/study-library/use-study-library-store";
import { useNavigate, useRouter } from "@tanstack/react-router";

export const LevelCard = ({ level }: { level: LevelWithDetailsType }) => {
    const { open } = useSidebar();
    const navigate = useNavigate();
    const router = useRouter();

    const currentPath = router.state.location.pathname;
    const { courseId } = router.state.location.search;

    const handleClassClick = () => {
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
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl py-5 shadow-xl ${
                open ? "h-[300px] w-[360px]" : "h-[300px] w-[420px]"
            }`}
            onClick={() => handleClassClick()}
        >
            <div className="text-h1 font-semibold text-primary-500">{level.name}</div>
        </div>
    );
};
