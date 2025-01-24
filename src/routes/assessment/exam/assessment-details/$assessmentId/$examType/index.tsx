import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { MyButton } from "@/components/design-system/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { DotIconOffline } from "@/svgs";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CaretLeft, LockSimple, PauseCircle, PencilSimpleLine } from "phosphor-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionsMarkRankGraph } from "./-components/QuestionsMarkRankGraph";
import { QuestionAnalysisChart } from "./-components/QuestionAnalysisChart";
import { Helmet } from "react-helmet";
import { QuestionsPieChart } from "./-components/QuestionsPieChart";
import { AssessmentBasicInfoTab } from "./-components/AssessmentBasicInfoTab";
import AssessmentParticipantsTab from "./-components/AssessmentParticipantsTab";
import AssessmentAccessControlTab from "./-components/AssessmentAccessControlTab";
import { AssessmentQuestionsTab } from "./-components/AssessmentQuestionsTab";
import { asssessmentDetailsData } from "./-utils/dummy-data";

export const Route = createFileRoute(
    "/assessment/exam/assessment-details/$assessmentId/$examType/",
)({
    component: () => (
        <LayoutContainer>
            <AssessmentDetailsComponent />
        </LayoutContainer>
    ),
});

const heading = (
    <div className="flex items-center gap-4">
        <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
        <h1 className="text-lg">Assessment Details</h1>
    </div>
);

const AssessmentDetailsComponent = () => {
    const { assessmentId, examType } = Route.useParams();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("overview");
    const { setNavHeading } = useNavHeadingStore();

    const handleNavigateToSteps = () => {
        const tabMapping: Record<string, number> = {
            basicInfo: 0,
            questions: 1,
            participants: 2,
            accessControl: 3,
        };

        navigate({
            to: "/assessment/create-assessment/$assessmentId/$examtype",
            params: {
                assessmentId: assessmentId,
                examtype: examType,
            },
            search: {
                currentStep: tabMapping[selectedTab] ?? 0, // Default to 0 if tab is not found
            },
        });
    };

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <>
            <Helmet>
                <title>Assessment Details</title>
                <meta
                    name="description"
                    content="This page shows all details related to an assessment."
                />
            </Helmet>
            <div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="font-semibold">{asssessmentDetailsData.title}</h1>
                        <Badge
                            className={`rounded-md border border-neutral-300 py-1.5 shadow-none`}
                        >
                            <LockSimple size={16} className="mr-2" />
                            {asssessmentDetailsData.type}
                        </Badge>
                        <Badge
                            className={`rounded-md border border-neutral-300 py-1.5 shadow-none`}
                        >
                            <DotIconOffline className="mr-2" />
                            {asssessmentDetailsData.mode}
                        </Badge>
                        <Separator orientation="vertical" className="h-8 w-px bg-neutral-300" />
                        <Badge
                            className={`rounded-md border border-neutral-300 py-1.5 shadow-none`}
                        >
                            <PauseCircle
                                size={16}
                                weight="fill"
                                className="mr-2 text-neutral-400"
                            />
                            {asssessmentDetailsData.status}
                        </Badge>
                    </div>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="font-medium"
                    >
                        Preview Assessment
                    </MyButton>
                </div>
                <Separator className="mt-4" />
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <div className="flex items-center justify-between">
                        <TabsList className="mb-2 mt-6 inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                            <TabsTrigger
                                value="overview"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "overview"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "overview" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Overview
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="basicInfo"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "basicInfo"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "basicInfo" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Basic Info
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="questions"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "questions"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "questions" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Questions
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="participants"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "participants"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "participants" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Participants
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="accessControl"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "accessControl"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "accessControl" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Access Control
                                </span>
                            </TabsTrigger>
                        </TabsList>
                        {selectedTab !== "overview" && (
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="secondary"
                                className="mt-4 w-10 min-w-8 font-medium"
                                onClick={handleNavigateToSteps}
                            >
                                <PencilSimpleLine size={32} />
                            </MyButton>
                        )}
                    </div>
                    <div className="max-h-[72vh] overflow-y-auto pr-8">
                        <TabsContent value="overview">
                            <QuestionsPieChart />
                            <Separator className="my-10" />
                            <QuestionsMarkRankGraph />
                            <Separator className="mb-10 mt-4" />
                            <QuestionAnalysisChart />
                        </TabsContent>
                        <TabsContent value="basicInfo">
                            <AssessmentBasicInfoTab />
                        </TabsContent>
                        <TabsContent value="questions">
                            <AssessmentQuestionsTab />
                        </TabsContent>
                        <TabsContent value="participants">
                            <AssessmentParticipantsTab />
                        </TabsContent>
                        <TabsContent value="accessControl">
                            <AssessmentAccessControlTab />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </>
    );
};
