import { useIsMobile } from "@/hooks/use-mobile";
import { MyButton } from "@/components/design-system/button";
import { CalendarBlank } from "phosphor-react";
import { useNavigate } from "@tanstack/react-router";

export const ScheduleTestHeaderDescription = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const handleSubjectRoute = () => {
        navigate({
            to: "/assessment/create-assessment/$assessmentId/$examtype",
            params: {
                assessmentId: "defaultId",
                examtype: "EXAM",
            },
            search: {
                currentStep: 0,
            },
        });
    };
    return (
        <div
            className={`mb-8 flex items-center justify-between ${
                isMobile ? "flex-wrap gap-4" : "gap-10"
            }`}
        >
            <div className="flex flex-col">
                <h1 className="text-[1.25rem] font-semibold text-neutral-600">
                    Comprehensive Test Management
                </h1>
                <p className="text-neutral-600">
                    Effortlessly monitor and manage all assessments with a comprehensive view of
                    ongoing, upcoming, and past exams. Gain easy access to each test&rsquo;s
                    details, schedule, and status, ensuring organized oversight of the entire
                    testing process from start to finish.
                </p>
            </div>
            <MyButton
                scale="large"
                buttonType="primary"
                layoutVariant="default"
                onClick={handleSubjectRoute}
            >
                <CalendarBlank size={32} />
                Create Assessment
            </MyButton>
        </div>
    );
};
