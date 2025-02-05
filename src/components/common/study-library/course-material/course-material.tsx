import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { UploadStudyMaterialButton } from "../upload-study-material/upload-study-material-button";
import { CreateStudyDocButton } from "../upload-study-material/create-study-doc-button";
import { useSidebar } from "@/components/ui/sidebar";
import { getCourses } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getCourses";
import { CourseCard } from "./course-card";
import { AddCourseButton } from "./add-course-button";
import { useAddCourse } from "@/services/study-library/course-operations/add-course";
import { AddCourseData } from "./add-course-form";
import { useDeleteCourse } from "@/services/study-library/course-operations/delete-course";
import { useUpdateCourse } from "@/services/study-library/course-operations/update-course";

export const CourseMaterial = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { open } = useSidebar();
    const courses = getCourses();

    const addCourseMutation = useAddCourse();
    const deleteCourseMutation = useDeleteCourse();
    const updateCourseMutation = useUpdateCourse();

    useEffect(() => {
        setNavHeading("Study Library");
    }, []);

    const handleAddCourse = ({ requestData }: { requestData: AddCourseData }) => {
        console.log("Triggering mutation with:", requestData);
        addCourseMutation.mutate({ requestData: requestData });
    };

    const handleCourseDelete = (courseId: string) => {
        deleteCourseMutation.mutate(courseId);
    };

    const handleCourseUpdate = ({
        courseId,
        requestData,
    }: {
        requestData: AddCourseData;
        courseId?: string;
    }) => {
        updateCourseMutation.mutate({ courseId, requestData });
    };

    return (
        <div className="relative flex w-full flex-col gap-8 text-neutral-600">
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
                    <AddCourseButton onSubmit={handleAddCourse} />
                </div>
            </div>

            <div
                className={`grid grid-cols-3 ${
                    open ? "gap-4" : "gap-8"
                } w-full items-center justify-between gap-y-8`}
            >
                {courses.map((course, key) => (
                    <div key={key}>
                        <CourseCard
                            course={course}
                            onDelete={handleCourseDelete}
                            onEdit={handleCourseUpdate}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
