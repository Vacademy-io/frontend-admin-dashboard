import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { MyButton } from "@/components/design-system/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { DotIcon, DotIconOffline } from "@/svgs";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CaretLeft, CheckCircle, LockSimple, PauseCircle, PencilSimpleLine } from "phosphor-react";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { getAssessmentDetails } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AssessmentPreview from "./-components/AssessmentPreview";

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
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        }),
    );

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

    const [isPreviewAssessmentDialogOpen, setIsPreviewAssessmentDialogOpen] = useState(false);

    const handleOpenDialog = () => setIsPreviewAssessmentDialogOpen(true);
    const handleCloseDialog = () => setIsPreviewAssessmentDialogOpen(false);

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    if (isLoading) return <DashboardLoader />;

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
                        <h1 className="font-semibold">{assessmentDetails[0]?.saved_data.name}</h1>
                        <Badge
                            className={`rounded-md border border-neutral-300 ${
                                assessmentDetails[0]?.saved_data.assessment_visibility === "PRIVATE"
                                    ? "bg-primary-50"
                                    : "bg-info-50"
                            } py-1.5 shadow-none`}
                        >
                            <LockSimple size={16} className="mr-2" />
                            {assessmentDetails[0]?.saved_data.assessment_visibility}
                        </Badge>
                        <Badge
                            className={`rounded-md border border-neutral-300 ${
                                assessmentDetails[0]?.saved_data.assessment_mode !== "EXAM"
                                    ? "bg-neutral-50"
                                    : "bg-success-50"
                            } py-1.5 shadow-none`}
                        >
                            {assessmentDetails[0]?.saved_data.assessment_mode === "EXAM" ? (
                                <DotIcon className="mr-2" />
                            ) : (
                                <DotIconOffline className="mr-2" />
                            )}
                            {assessmentDetails[0]?.saved_data.assessment_mode}
                        </Badge>
                        <Separator orientation="vertical" className="h-8 w-px bg-neutral-300" />
                        <Badge
                            className={`rounded-md border ${
                                assessmentDetails?.[0]?.status === "COMPLETED"
                                    ? "bg-success-50"
                                    : "bg-neutral-100"
                            } border-neutral-300 py-1.5 shadow-none`}
                        >
                            {assessmentDetails?.[0]?.status === "COMPLETED" ? (
                                <CheckCircle
                                    size={16}
                                    weight="fill"
                                    className="mr-2 text-success-600"
                                />
                            ) : (
                                <PauseCircle
                                    size={16}
                                    weight="fill"
                                    className="mr-2 text-neutral-400"
                                />
                            )}
                            {assessmentDetails?.[0]?.status}
                        </Badge>
                    </div>
                    <Dialog
                        open={isPreviewAssessmentDialogOpen}
                        onOpenChange={setIsPreviewAssessmentDialogOpen}
                    >
                        <DialogTrigger>
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="secondary"
                                className="font-medium"
                                onClick={handleOpenDialog}
                            >
                                Preview Assessment
                            </MyButton>
                        </DialogTrigger>
                        <DialogContent className="no-scrollbar !m-0 h-full !w-full !max-w-full !gap-0 overflow-y-auto !rounded-none !p-0 [&>button]:hidden">
                            <AssessmentPreview handleCloseDialog={handleCloseDialog} />
                        </DialogContent>
                    </Dialog>
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
