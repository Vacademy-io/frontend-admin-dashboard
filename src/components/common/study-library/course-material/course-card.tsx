import { useSidebar } from "@/components/ui/sidebar";
import { CourseType } from "@/stores/study-library/use-study-library-store";

export const CourseCard = ({ course }: { course: CourseType }) => {
    const { open } = useSidebar();
    return (
        <div
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl py-5 shadow-xl ${
                open ? "h-[300px] w-[360px]" : "h-[300px] w-[420px]"
            }`}
        >
            <div className="text-h1 font-semibold text-primary-500">{course.package_name}</div>
        </div>
    );
};
