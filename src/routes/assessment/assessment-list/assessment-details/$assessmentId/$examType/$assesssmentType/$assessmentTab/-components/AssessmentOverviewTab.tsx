import { Separator } from '@/components/ui/separator';
import { QuestionsPieChart } from './QuestionsPieChart';
import { QuestionsMarkRankGraph } from './QuestionsMarkRankGraph';
import { QuestionAnalysisChart } from './QuestionAnalysisChart';
import { SurveyMainOverviewTab } from './survey/SurveyMainOverviewTab';
import { Route } from '../index';

const AssessmentOverviewTab = () => {
    const { examType } = Route.useParams();

    // Show survey-specific overview for SURVEY type assessments
    if (examType === 'SURVEY') {
        return <SurveyMainOverviewTab />;
    }

    // Default overview for other assessment types
    return (
        <>
            <QuestionsPieChart />
            <Separator className="my-10" />
            <QuestionsMarkRankGraph />
            <Separator className="mb-10 mt-4" />
            <QuestionAnalysisChart />
        </>
    );
};

export default AssessmentOverviewTab;
