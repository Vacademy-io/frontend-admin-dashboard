/* eslint-disable react-hooks/exhaustive-deps */
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { UploadStudyMaterialButton } from "../upload-study-material/upload-study-material-button";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { CreateStudyDocButton } from "../upload-study-material/create-study-doc-button";
import { useSidebar } from "@/components/ui/sidebar";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "phosphor-react";
import { getCourses } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getCourses";
import { CourseCard } from "./course-card";

export const CourseMaterial = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { open } = useSidebar();
    const courses = getCourses();

    const router = useRouter();
    const currentPath = router.state.location.pathname;
    const navigate = useNavigate();

    const handleCourseCardClick = (courseId: string) => {
        navigate({
            to: `${currentPath}/levels`,
            search: {
                courseId: courseId,
            },
        });
    };

    useEffect(() => {
        setNavHeading("Study Library");
    }, []);

    return (
        <div className="relative flex flex-col gap-8 text-neutral-600">
            <div className="flex items-center gap-20">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">Organize Your Courses</div>
                    <div className="text-subtitle">
                        Effortlessly organize, upload, and track educational resources in one place.
                        Provide students with easy access to the materials they need to succeed,
                        ensuring a seamless learning experience.
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <CreateStudyDocButton />
                    <UploadStudyMaterialButton />
                    <MyButton>
                        <Plus />
                        Create Course
                    </MyButton>
                </div>
            </div>

            <div className={`grid grid-cols-3 ${open ? "gap-4" : "gap-8"} justify-between`}>
                {courses.map((course, key) => (
                    <div key={key} onClick={() => handleCourseCardClick(course.id)}>
                        <CourseCard course={course} />
                    </div>
                ))}
            </div>
        </div>
    );
};
