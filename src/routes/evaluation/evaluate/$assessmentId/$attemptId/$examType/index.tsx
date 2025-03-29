import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { getAttemptDetails } from "@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/-services/assessment-details-services";
import { getAssessmentDetails, getQuestionDataForSection } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services";
import PDFEvaluator from "@/routes/evaluation/evaluation-tool/-components/pdf-editor";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { getPublicUrl } from "@/services/upload_file";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

export const Route = createFileRoute(
  "/evaluation/evaluate/$assessmentId/$attemptId/$examType/",
)({
  component:  () => (
        <LayoutContainer>
          <EvaluateAttemptComponent />
        </LayoutContainer>
      ),
})

const EvaluateAttemptComponent = () => {
        const { attemptId,assessmentId,examType } = Route.useParams();
        const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
        const [fileUrl, setFileUrl] = useState<string>();
        const { data: attemptDetails, isLoading:isAttemptLoading } = useSuspenseQuery(
            getAttemptDetails(attemptId),
        );
        const { data: assessmentDetails, isLoading } = useSuspenseQuery(
          getAssessmentDetails({
              assessmentId: assessmentId,
              instituteId: instituteDetails?.id,
              type: examType,
          }),
      );
        const { data: questionsDataSectionWise, isLoading: isQuestionsLoading } = useSuspenseQuery(
            getQuestionDataForSection({
                assessmentId,
                sectionIds: assessmentDetails[1]?.saved_data.sections
                    ?.map((section) => section.id)
                    .join(","),
            }),
        );

        const navigate = useNavigate();
        const { setNavHeading } = useNavHeadingStore();
      
        useEffect(() => {
            setNavHeading("Evaluate Response");
            if(!isAttemptLoading){
                console.log("fetching")
                // setTimeout(()=>{ getPublicUrl(attemptDetails).then((url)=>setFileUrl(url))},100)
            }
        }, []);
      
        if (isLoading || isQuestionsLoading) return <DashboardLoader />;
      
        return (
            <>
                <Helmet>
                    <title>Evaluate Response</title>
                    <meta
                        name="description"
                        content="This page shows all details related to an assessment."
                    />
                </Helmet>
                <PDFEvaluator publicUrl={"https://vacademy-media-storage.s3.ap-south-1.amazonaws.com/23103559-5632-42c9-b9ce-619d55fce3cb/SUBJECTS/79e4ba2c-4f4c-429a-90aa-349ecd6b8e07-sample_answer_sheet.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250329T123303Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=AKIA3ISBV4TNEO3NCERX%2F20250329%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d667cf54492cd844e9d636720a05525bec71b2511aa4fa23feb0b7c1af4c3822"}/>
            </>
        );
      };
