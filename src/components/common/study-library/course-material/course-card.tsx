import { SubjectDefaultImage } from "@/assets/svgs";
import { useSidebar } from "@/components/ui/sidebar";
import { CourseType } from "@/stores/study-library/use-study-library-store";
import { CourseMenuOptions } from "./level-study-material/course-menu-options";
import { useNavigate, useRouter } from "@tanstack/react-router";

export const CourseCard = ({
    course,
    onDelete,
    onEdit,
}: {
    course: CourseType;
    onDelete: () => void;
    onEdit: () => void;
}) => {
    const { open } = useSidebar();

    const router = useRouter();
    const currentPath = router.state.location.pathname;
    const navigate = useNavigate();

    const handleCourseCardClick = (e: React.MouseEvent) => {
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
            to: `${currentPath}/levels`,
            search: {
                courseId: course.id,
            },
        });
    };

    return (
        <div
            className={`relative flex cursor-pointer flex-col items-center gap-4 rounded-xl border py-5 pt-10 shadow-md ${
                open ? "h-[330px] w-[360px]" : "h-[330px] w-[420px]"
            }`}
            onClick={handleCourseCardClick}
        >
            <SubjectDefaultImage />
            <div className="flex w-full justify-between gap-3 px-5">
                <div className="text-semibold text-wrap text-center text-title font-semibold text-neutral-600">
                    {course.package_name}
                </div>
                <CourseMenuOptions onDelete={onDelete} onEdit={onEdit} />
            </div>
        </div>
    );
};
