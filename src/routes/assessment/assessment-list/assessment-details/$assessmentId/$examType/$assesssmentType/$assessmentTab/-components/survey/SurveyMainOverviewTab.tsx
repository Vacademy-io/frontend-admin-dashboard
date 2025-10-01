import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar
} from 'recharts';
import { Users, CheckCircle, Clock, TrendingUp, MessageSquare, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useSurveyOverview, useSurveyRespondents } from './hooks/useSurveyData';
import { TransformedQuestionAnalytics, ResponseDistribution } from './types';
import { surveyApiService, AssessmentQuestionPreview, QuestionOptionWithExplanation } from '@/services/survey-api';
import { useBatchNames } from './hooks/useBatchNames';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface QuestionData {
    questionContent: string;
    questionOrder: number;
    questionType: string;
    optionsMap: Map<string, string>;
}

// Helper components for question rendering
interface BarChartComponentProps {
  data: ResponseDistribution[];
  fillColor: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, fillColor }) => (
    <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="value"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                        `${value} responses (${props.payload?.percentage || 0}%)`,
                        'Count'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
                <Bar
                    dataKey="count"
                    fill={fillColor}
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

interface ResponseLegendProps {
  responses: ResponseDistribution[];
}

const ResponseLegend: React.FC<ResponseLegendProps> = ({ responses }) => (
    <div className="space-y-2">
        {responses.map((response: ResponseDistribution, idx: number) => (
            <div key={idx} className="flex justify-between items-center">
                <div className="text-lg font-semibold text-gray-800">
                    {response.value}
                </div>
                <div className="text-lg font-semibold text-gray-600">
                    {response.percentage.toFixed(0)}% ({response.count} responses)
                </div>
            </div>
        ))}
    </div>
);

interface QuestionContentProps {
  question: TransformedQuestionAnalytics;
}

const McqQuestionContent: React.FC<QuestionContentProps> = ({ question }) => (
    <div className="space-y-6">
        <BarChartComponent data={question.responseDistribution} fillColor="#8884d8" />
        <ResponseLegend responses={question.responseDistribution} />
    </div>
);

const McqMultipleChoiceContent: React.FC<QuestionContentProps> = ({ question }) => (
    <div className="space-y-6">
        <BarChartComponent data={question.responseDistribution} fillColor="#00C49F" />
        <ResponseLegend responses={question.responseDistribution} />
    </div>
);

const TrueFalseContent: React.FC<QuestionContentProps> = ({ question }) => (
    <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="flex-1 max-w-sm">
                <div className="relative h-64 w-64 mx-auto group">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    {
                                        name: 'True',
                                        value: question.responseDistribution[0]?.percentage || 0,
                                        fill: '#10B981',
                                        count: question.responseDistribution[0]?.count || 0
                                    },
                                    {
                                        name: 'False',
                                        value: question.responseDistribution[1]?.percentage || 0,
                                        fill: '#EF4444',
                                        count: question.responseDistribution[1]?.count || 0
                                    }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={450}
                            >
                                {[
                                    { name: 'True', value: question.responseDistribution[0]?.percentage || 0, fill: '#10B981' },
                                    { name: 'False', value: question.responseDistribution[1]?.percentage || 0, fill: '#EF4444' }
                                ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any, name: string) => [
                                    `${value}% (${name === 'True' ? question.responseDistribution[0]?.count || 0 : question.responseDistribution[1]?.count || 0} responses)`,
                                    name
                                ]}
                                labelStyle={{ color: '#374151' }}
                                contentStyle={{
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-gray-700">
                                {(question.responseDistribution[0]?.percentage || 0).toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-600">True</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600 mb-1">True</div>
                    <div className="text-2xl font-bold text-green-700 mb-1">
                        {(question.responseDistribution[0]?.percentage || 0).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">
                        {question.responseDistribution[0]?.count || 0} responses
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-red-600 mb-1">False</div>
                    <div className="text-2xl font-bold text-red-700 mb-1">
                        {(question.responseDistribution[1]?.percentage || 0).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">
                        {question.responseDistribution[1]?.count || 0} responses
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TextQuestionContent: React.FC<QuestionContentProps> = ({ question }) => (
    <div className="space-y-4">
        <div className="text-lg font-semibold mb-4">
            Recent Responses ({question.totalResponses} total responses):
        </div>
        <div className="space-y-4">
            {question.responseDistribution.slice(0, 5).map((response: ResponseDistribution, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-700 italic">"{response.value}"</div>
                    <div className="text-xs text-gray-500 mt-1">{response.count} similar responses</div>
                </div>
            ))}
        </div>
    </div>
);

const NumericalQuestionContent: React.FC<QuestionContentProps> = ({ question }) => (
    <div className="space-y-4">
        <div className="text-lg font-semibold mb-4">Response Distribution:</div>
        <div className="space-y-3">
            {question.responseDistribution.slice(0, 5).map((response: ResponseDistribution, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{idx + 1}. {response.value}</span>
                    <Badge variant="secondary">
                        {response.count} responses ({response.percentage}%)
                    </Badge>
                </div>
            ))}
        </div>
    </div>
);

const QuestionTypeRenderer = ({ question }: { question: TransformedQuestionAnalytics }) => {
    switch (question.questionType) {
        case 'mcq_single_choice':
            return <McqQuestionContent question={question} />;
        case 'mcq_multiple_choice':
            return <McqMultipleChoiceContent question={question} />;
        case 'true_false':
            return <TrueFalseContent question={question} />;
        case 'short_answer':
        case 'long_answer':
            return <TextQuestionContent question={question} />;
        case 'numerical':
            return <NumericalQuestionContent question={question} />;
        default:
            return <div>Unsupported question type</div>;
    }
};

const renderQuestionContent = (question: TransformedQuestionAnalytics, index: number, onViewResponses: (question: TransformedQuestionAnalytics, index: number) => void) => {
    const questionNumber = `Q${index + 1}`;

    return (
        <Card className="h-fit">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2">
                            {questionNumber}. {question.questionText}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span>{question.totalResponses} responses</span>
                        </div>
                        <Badge className="bg-primary-100 text-primary-800 border-primary-200 mb-4">
                            {question.questionType.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => onViewResponses(question, index)}
                    >
                        <Eye className="h-4 w-4" />
                        View Individual Responses
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <QuestionTypeRenderer question={question} />
            </CardContent>
        </Card>
    );
};

// Helper functions for response parsing
const formatMcqResponse = (responseData: any, questionData: any): string => {
        if (responseData.optionIds && responseData.optionIds.length > 0) {
          if (questionData && questionData.optionsMap) {
            const selectedOptions = responseData.optionIds.map((optionId: string) => {
              const optionText = questionData.optionsMap.get(optionId);
              return optionText || optionId;
            });
      return selectedOptions.join(', ');
          } else {
      return responseData.optionIds.join(', ');
          }
        }
  return 'No options selected';
};

const formatNumericResponse = (responseData: any): string => {
        if (responseData.validAnswer !== null && responseData.validAnswer !== undefined) {
    return responseData.validAnswer.toString();
        }
  return 'No numeric answer provided';
};

const formatTextResponse = (responseData: any): string => {
        if (responseData.answer && responseData.answer.trim() !== '') {
    return responseData.answer;
  }
  return 'No text answer provided';
};

const RESPONSE_TYPE_FORMATTERS = {
  'MCQS': formatMcqResponse,
  'MCQM': formatMcqResponse,
  'TRUE_FALSE': formatMcqResponse,
  'NUMERIC': formatNumericResponse,
  'ONE_WORD': formatTextResponse,
  'LONG_ANSWER': formatTextResponse,
} as const;

const formatAnswerByType = (responseData: any, questionData: any): string => {
  const formatter = RESPONSE_TYPE_FORMATTERS[responseData.type as keyof typeof RESPONSE_TYPE_FORMATTERS];
  return formatter ? formatter(responseData, questionData) : 'Unknown response type';
};

const createParsedResponse = (response: any, responseData: any, questionData: any, formattedAnswer: string) => ({
      questionId: response.questionId || 'Unknown',
      questionType: responseData.type || 'Unknown',
      questionContent: questionData?.questionContent || 'Survey Question',
      questionOrder: questionData?.questionOrder || 0,
      formattedAnswer,
      timeTaken: response.timeTakenInSeconds || 0,
      durationLeft: response.questionDurationLeftInSeconds || 0,
      isVisited: response.isVisited || false,
      isMarkedForReview: response.isMarkedForReview || false,
      rawResponse: response,
      questionData: questionData,
});

const createErrorResponse = (responseString: string) => ({
      questionId: 'Unknown',
      questionType: 'Unknown',
      questionContent: 'Survey Question',
      questionOrder: 0,
      formattedAnswer: 'Error parsing response data',
      timeTaken: 0,
      durationLeft: 0,
      isVisited: false,
      isMarkedForReview: false,
      rawResponse: responseString,
      questionData: null,
});

// Helper function to parse response data with question context
const parseResponseData = (responseString: string, questionsData: Map<string, QuestionData>) => {
  try {
    const response = JSON.parse(responseString);
    const responseData = response.responseData || {};
    const questionData = questionsData.get(response.questionId);
    const formattedAnswer = formatAnswerByType(responseData, questionData);
    return createParsedResponse(response, responseData, questionData, formattedAnswer);
  } catch (error) {
    return createErrorResponse(responseString);
  }
};

interface SurveyMainOverviewTabProps {
    assessmentId: string;
    sectionIds?: string;
    assessmentName?: string;
    assessmentDetails?: {
        assessment_visibility?: string;
        live_assessment_access?: {
            batch_ids?: string[];
        };
    };
}

export const SurveyMainOverviewTab: React.FC<SurveyMainOverviewTabProps> = ({ assessmentId, sectionIds, assessmentName, assessmentDetails }) => {
    const { data: overviewData, loading: overviewLoading, error: overviewError } = useSurveyOverview(assessmentId, sectionIds);
    const { data: respondentData, loading: respondentLoading } = useSurveyRespondents(assessmentId, 1, 100, assessmentName, sectionIds);
    const { getBatchName } = useBatchNames();

    // Determine survey type from assessment details
    const isPublicSurvey = assessmentDetails?.assessment_visibility === 'PUBLIC';


    const [selectedQuestion, setSelectedQuestion] = useState<TransformedQuestionAnalytics | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [questionsData, setQuestionsData] = useState<Map<string, QuestionData>>(new Map());
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [batchData, setBatchData] = useState<Map<string, string>>(new Map());
    const [batchLoading, setBatchLoading] = useState(false);


    // Fetch questions data when component mounts or sectionIds change
    React.useEffect(() => {
        const fetchQuestionsData = async () => {
            if (!sectionIds || !assessmentId) return;

            try {
                setQuestionsLoading(true);
                const sectionIdsArray = sectionIds.split(',').filter(id => id.trim());
                if (sectionIdsArray.length > 0) {
                    const questionsResponse = await surveyApiService.getQuestionsWithSections(assessmentId, sectionIdsArray);
                    const questionMap = processQuestionsData(questionsResponse);
                    setQuestionsData(questionMap);
                }
            } catch (error) {
                // Silently handle questions data fetch failure
            } finally {
                setQuestionsLoading(false);
            }
        };

        fetchQuestionsData();
    }, [assessmentId, sectionIds]);

    const processQuestionsData = (questionsResponse: any) => {
        const questionMap = new Map();
        Object.entries(questionsResponse).forEach(([sectionId, questions]) => {
            (questions as any[]).forEach((question: AssessmentQuestionPreview) => {
                const optionsMap = createOptionsMap(question);
                questionMap.set(question.question_id, {
                    questionContent: question.question.content,
                    questionOrder: question.question_order,
                    questionType: question.question_type,
                    optionsMap: optionsMap
                });
            });
        });
        return questionMap;
    };

    const createOptionsMap = (question: AssessmentQuestionPreview) => {
        const optionsMap = new Map();
        if (question.options_with_explanation) {
            question.options_with_explanation.forEach((option: QuestionOptionWithExplanation) => {
                optionsMap.set(option.id, option.text.content);
            });
        }
        return optionsMap;
    };

    // Fetch batch data for private surveys
    React.useEffect(() => {
        const fetchBatchData = async () => {
            if (!assessmentDetails || isPublicSurvey) {
                return;
            }

            try {
                setBatchLoading(true);
                const batchIds = assessmentDetails.live_assessment_access?.batch_ids || [];

                if (batchIds.length > 0) {
                    const batchInfo = await surveyApiService.getBatchInfo(batchIds);
                    const batchMap = new Map();
                    batchInfo.forEach(batch => {
                        batchMap.set(batch.id, batch.name);
                    });
                    setBatchData(batchMap);
                } else {
                    setBatchData(new Map());
                }
            } catch (error) {
                setBatchData(new Map());
            } finally {
                setBatchLoading(false);
            }
        };

        fetchBatchData();
    }, [assessmentDetails, isPublicSurvey]);

    // Show loading state
    if (overviewLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading survey data...</span>
                </div>
            </div>
        );
    }

    // Show error state
    if (overviewError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Survey Data</h3>
                    <p className="text-gray-600 mb-4">{overviewError}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Show empty state if no data
    if (!overviewData?.analytics || !overviewData?.questions?.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Survey Data Available</h3>
                    <p className="text-gray-600">No survey responses found for this assessment.</p>
                </div>
            </div>
        );
    }

    const { analytics, questions } = overviewData;

    const handleViewIndividualResponses = (question: TransformedQuestionAnalytics, index: number) => {
        setSelectedQuestion(question);
        setIsDialogOpen(true);
    };
const BarChartComponent = ({ data, fillColor }: { data: ResponseDistribution[], fillColor: string }) => (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="value"
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number, name: string, props: any) => [
                                                `${value} responses (${props.payload?.percentage || 0}%)`,
                                                'Count'
                                            ]}
                                            labelStyle={{ color: '#374151' }}
                                            contentStyle={{
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                    fill={fillColor}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
);

const ResponseLegend = ({ responses }: { responses: ResponseDistribution[] }) => (
                            <div className="space-y-2">
        {responses.map((response: ResponseDistribution, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="text-lg font-semibold text-gray-800">
                                            {response.value}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-600">
                                            {response.percentage.toFixed(0)}% ({response.count} responses)
                                        </div>
                                    </div>
                                ))}
                            </div>
);

const McqQuestionContent = ({ question }: { question: TransformedQuestionAnalytics }) => (
                        <div className="space-y-6">
        <BarChartComponent data={question.responseDistribution} fillColor="#8884d8" />
        <ResponseLegend responses={question.responseDistribution} />
                            </div>
);



const renderQuestionContent = (question: TransformedQuestionAnalytics, index: number, onViewResponses: (question: TransformedQuestionAnalytics, index: number) => void) => {
    const questionNumber = `Q${index + 1}`;

    return (
        <Card className="h-fit">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2">
                            {questionNumber}. {question.questionText}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span>{question.totalResponses} responses</span>
                        </div>
                        <Badge className="bg-primary-100 text-primary-800 border-primary-200 mb-4">
                            {question.questionType.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => onViewResponses(question, index)}
                    >
                        <Eye className="h-4 w-4" />
                        View Individual Responses
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <QuestionTypeRenderer question={question} />
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-primary-600 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Total Participants
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-gray-900">{analytics.completedResponses}</span>
                                <span className="text-lg text-gray-600">responded</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    out of <span className="font-semibold text-gray-700">{analytics.totalParticipants}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-primary-600 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Completion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics.completionRate}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${analytics.completionRate}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                    <div
                        key={question.questionId}
                        className={
                            question.questionType === 'short_answer' || question.questionType === 'long_answer' || question.questionType === 'numerical'
                                ? 'lg:col-span-2'
                                : ''
                        }
                    >
                        {renderQuestionContent(question, index, handleViewIndividualResponses)}
                    </div>
                ))}
            </div>

            {/* Individual Responses Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            Individual Responses
                        </DialogTitle>
                    </DialogHeader>

                    {selectedQuestion && (
                        <div className="mt-4">
                            {(() => {
                                if (respondentLoading) {
                                    return (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Loading responses...</span>
                                            </div>
                                        </div>
                                    );
                                }

                                if (questionsLoading) {
                                    return (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Loading questions data...</span>
                                            </div>
                                        </div>
                                    );
                                }

                                if (batchLoading) {
                                    return (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Loading batch data...</span>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                <div>
                                    {/* Filter responses for the selected question */}
                                    {(() => {
                                        // Get all responses from all respondents
                                        const allResponses: any[] = [];
                                        respondentData?.respondents?.forEach((respondent, respondentIndex) => {
                                            respondent.responses.forEach((response, responseIndex) => {
                                                allResponses.push({
                                                    name: respondent.name,
                                                    email: respondent.email,
                                                    source_id: respondent.source_id,
                                                    response: response.answer
                                                });
                                            });
                                        });

                                        const filteredResponses = allResponses.filter((respondent, index) => {
                                            try {
                                                const response = JSON.parse(respondent.response);
                                                return response.questionId === selectedQuestion.questionId;
                                            } catch (error) {
                                                return false;
                                            }
                                        });

                                        if (filteredResponses.length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No responses found for this question.</p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Question ID: {selectedQuestion.questionId}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                                        {!isPublicSurvey && <TableHead className="font-semibold w-32">Name</TableHead>}
                                        <TableHead className="font-semibold w-48">Email</TableHead>
                                                        {!isPublicSurvey && <TableHead className="font-semibold w-32">Batch</TableHead>}
                                                        <TableHead className="font-semibold w-96">Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                                    {filteredResponses.map((respondent, idx) => {
                                                        const parsedResponse = parseResponseData(respondent.response, questionsData);
                                                        // Get batch name from source_id (batch ID)
                                                        const batchName = respondent.source_id ? getBatchName(respondent.source_id) : 'N/A';


                                                        return (
                                        <TableRow key={idx}>
                                                                {!isPublicSurvey && <TableCell className="font-medium w-32">{respondent.name}</TableCell>}
                                            <TableCell className="w-48">{respondent.email}</TableCell>
                                                                {!isPublicSurvey && <TableCell className="w-32">{batchName}</TableCell>}
                                                                <TableCell className="w-96">
                                                                    <div className="text-sm max-h-32 overflow-y-auto">
                                                                        <div className="font-medium text-gray-900 whitespace-pre-wrap break-words">
                                                                            {parsedResponse.formattedAnswer}
                                                                        </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                                        );
                                                    })}
                                </TableBody>
                            </Table>
                                        );
                                    })()}
                                </div>
                                );
                            })()}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
