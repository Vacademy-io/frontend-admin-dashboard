import { Separator } from "@/components/ui/separator";
import { planLectureDummyData } from "./dummyData";

const PlanLecturePreview = () => {
    return (
        <div className="flex h-screen w-screen flex-col gap-4">
            <h1 className="text-xl font-semibold">
                📘 Lecture Title: {planLectureDummyData.heading}
            </h1>
            <div className="flex flex-col gap-1">
                <div className="flex items-center">
                    <span className="text-sm font-semibold">Level:&nbsp;</span>
                    <span className="text-sm font-thin">{planLectureDummyData.level}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-semibold">Mode of Teaching:&nbsp;</span>
                    <span className="text-sm font-thin">{planLectureDummyData.mode}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-semibold">Lecture Language:&nbsp;</span>
                    <span className="text-sm font-thin">{planLectureDummyData.Language}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-semibold">Lecture Duration:&nbsp;</span>
                    <span className="text-sm font-thin">{planLectureDummyData.Duration}</span>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
                {planLectureDummyData.timeWiseSplit.map((lectureData, idx) => {
                    return (
                        <>
                            <div key={idx} className="flex flex-col gap-3">
                                <div className="flex items-center gap-4">
                                    <h1 className="font-semibold">{lectureData.sectionHeading}</h1>
                                    <span className="text-primary-300">
                                        ({lectureData.timeSplit})
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-semibold">
                                        Topic Covered:&nbsp;
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {lectureData.topicCovered.map((topic, idx) => {
                                            return (
                                                <span key={idx} className="text-sm font-thin">
                                                    {topic}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <span>Content:</span>
                                    <p className="text-sm font-thin">{lectureData.content}</p>
                                </div>
                                <div>
                                    <span>In-Lecture Question:</span>
                                    <div className="flex flex-col">
                                        {lectureData.questionToStudents.map((activity, idx) => {
                                            return (
                                                <p key={idx} className="text-sm font-thin">
                                                    {activity}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <span>Activity:</span>
                                    <div className="flex flex-col">
                                        {lectureData.activity.map((activity, idx) => {
                                            return (
                                                <p key={idx} className="text-sm font-thin">
                                                    {activity}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanLecturePreview;
