import { useEffect, useState } from "react";
import { StudyMediumToggleMenu } from "./study-medium-toggle-menu";
import { ChapterWithProgress } from "@/types/students/student-subjects-details-types";
import { useStudentSidebar } from "@/context/selected-student-sidebar-context";
import { useStudentSlidesProgressQuery } from "@/services/student-list-section/getStudentChapterSlides";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { SlideWithStatusType } from "@/types/students/student-slides-progress-type";

export interface slideType {
    id: string;
    name: string;
    slides: SlideWithStatusType[] | null;
}

export const TopicDetails = ({ chapterDetails }: { chapterDetails: ChapterWithProgress }) => {
    const { selectedStudent } = useStudentSidebar();
    const {
        data: SlideWithProgress,
        isLoading,
        isError,
        error,
    } = useStudentSlidesProgressQuery({
        userId: selectedStudent?.user_id || "",
        chapterId: chapterDetails.id,
    });
    const [documentSlides, setDocumentSlides] = useState<SlideWithStatusType[] | null>(null);
    const [videoSlides, setVideoSlides] = useState<SlideWithStatusType[] | null>(null);
    const [selectedSlideType, setSelectedSlideType] = useState<slideType | null>(null);

    const slideTypes: slideType[] = [
        { id: "DOC", name: "E-Book", slides: documentSlides },
        { id: "VIDEO", name: "Video", slides: videoSlides },
    ];

    useEffect(() => {
        const documents = SlideWithProgress?.filter((slide) => slide.video_url != null) || null;
        const videos = SlideWithProgress?.filter((slide) => slide.video_url == null) || null;
        setDocumentSlides(documents);
        setVideoSlides(videos);
        const slide = slideTypes[0];
        setSelectedSlideType(slide || null);
        console.log("selected slide type: ", selectedSlideType);
    }, [chapterDetails]);

    if (isLoading) return <DashboardLoader />;
    if (isError || error) return <p>Error getting slides</p>;

    return (
        <>
            {SlideWithProgress == null || SlideWithProgress == undefined ? (
                <p>Slides are not created for this chapter</p>
            ) : slideTypes == null ? (
                <p>slide data not available</p>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex">
                        {slideTypes?.map((slideType, index) => (
                            <div key={index} onClick={() => setSelectedSlideType(slideType)}>
                                <StudyMediumToggleMenu
                                    slideTypeDetails={slideType}
                                    selectedSlideType={selectedSlideType}
                                />
                            </div>
                        ))}
                    </div>
                    <div></div>
                </div>
            )}
        </>
    );
};
