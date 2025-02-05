import { SubjectDefaultImage } from "@/assets/svgs";
import { useSidebar } from "@/components/ui/sidebar";
import { CourseType } from "@/stores/study-library/use-study-library-store";
import { CourseMenuOptions } from "./level-study-material/course-menu-options";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { AddCourseData } from "./add-course-form";
import { useEffect, useState } from "react";
import { getPublicUrl } from "@/services/upload_file";

export const CourseCard = ({
    course,
    onDelete,
    onEdit,
}: {
    course: CourseType;
    onDelete: (courseId: string) => void;
    onEdit: ({ courseId, requestData }: { requestData: AddCourseData; courseId?: string }) => void;
}) => {
    const { open } = useSidebar();

    const router = useRouter();
    const currentPath = router.state.location.pathname;
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

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

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (course?.thumbnail_file_id) {
                try {
                    const url = await getPublicUrl(course?.thumbnail_file_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Failed to fetch image URL:", error);
                }
            }
        };

        fetchImageUrl();
    }, [course?.thumbnail_file_id]);

    return (
        <div
            className={`relative flex cursor-pointer flex-col items-center gap-4 rounded-xl border py-5 pt-10 shadow-md ${
                open ? "h-[330px] w-[360px]" : "h-[330px] w-[420px]"
            }`}
            onClick={handleCourseCardClick}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={course.package_name}
                    className={`${open ? "size-[150px]" : "size-[200px]"} rounded-lg object-cover`}
                />
            ) : (
                <SubjectDefaultImage className={`${open ? "size-[150px]" : "size-[200px]"}`} />
            )}
            <div className="flex w-full justify-between gap-3 px-5">
                <div className="text-semibold text-wrap text-center text-title font-semibold text-neutral-600">
                    {course.package_name}
                </div>
                <CourseMenuOptions onDelete={onDelete} onEdit={onEdit} course={course} />
            </div>
        </div>
    );
};
