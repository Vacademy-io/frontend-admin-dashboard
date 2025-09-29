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
import { surveyApiService } from '@/services/survey-api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Helper function to parse response data with question context
const parseResponseData = (responseString: string, questionsData: Map<string, any>) => {
  try {
    const response = JSON.parse(responseString);
    const responseData = response.responseData || {};

    // Get question data if available
    const questionData = questionsData.get(response.questionId);

    // Format the answer based on question type
    let formattedAnswer = 'No response provided';

    switch (responseData.type) {
      case 'MCQS':
      case 'MCQM':
      case 'TRUE_FALSE':
        if (responseData.optionIds && responseData.optionIds.length > 0) {
          if (questionData && questionData.optionsMap) {
            // Map option IDs to their content
            const selectedOptions = responseData.optionIds.map((optionId: string) => {
              const optionText = questionData.optionsMap.get(optionId);
              return optionText || optionId;
            });
            formattedAnswer = selectedOptions.join(', ');
          } else {
            formattedAnswer = responseData.optionIds.join(', ');
          }
        } else {
          formattedAnswer = 'No options selected';
        }
        break;

      case 'NUMERIC':
        if (responseData.validAnswer !== null && responseData.validAnswer !== undefined) {
          formattedAnswer = responseData.validAnswer.toString();
        } else {
          formattedAnswer = 'No numeric answer provided';
        }
        break;

      case 'ONE_WORD':
      case 'LONG_ANSWER':
        if (responseData.answer && responseData.answer.trim() !== '') {
          formattedAnswer = responseData.answer;
        } else {
          formattedAnswer = 'No text answer provided';
        }
        break;

      default:
        formattedAnswer = 'Unknown response type';
    }

    return {
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
    };
  } catch (error) {
    console.error('Error parsing response data:', error);
    return {
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
    };
  }
};

interface SurveyMainOverviewTabProps {
    assessmentId: string;
    sectionIds?: string;
    assessmentName?: string;
    assessmentDetails?: any;
}

export const SurveyMainOverviewTab: React.FC<SurveyMainOverviewTabProps> = ({ assessmentId, sectionIds, assessmentName, assessmentDetails }) => {
    const { data: overviewData, loading: overviewLoading, error: overviewError } = useSurveyOverview(assessmentId, sectionIds);
    const { data: respondentData, loading: respondentLoading } = useSurveyRespondents(assessmentId, 1, 100, assessmentName, sectionIds);

    // Determine survey type from assessment details
    const isPublicSurvey = assessmentDetails?.assessment_visibility === 'PUBLIC';


    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [questionsData, setQuestionsData] = useState<Map<string, any>>(new Map());
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

                    // Process questions data into a map for easy lookup
                    const questionMap = new Map();
                    Object.entries(questionsResponse).forEach(([sectionId, questions]) => {
                        questions.forEach((question: any) => {
                            // Create options map for this question
                            const optionsMap = new Map();
                            if (question.options_with_explanation) {
                                question.options_with_explanation.forEach((option: any) => {
                                    optionsMap.set(option.id, option.text.content);
                                });
                            }

                            questionMap.set(question.question_id, {
                                questionContent: question.question.content,
                                questionOrder: question.question_order,
                                questionType: question.question_type,
                                optionsMap: optionsMap
                            });
                        });
                    });

                    setQuestionsData(questionMap);
                }
            } catch (error) {
                console.warn('Failed to fetch questions data:', error);
            } finally {
                setQuestionsLoading(false);
            }
        };

        fetchQuestionsData();
    }, [assessmentId, sectionIds]);

    // Fetch batch data for private surveys
    React.useEffect(() => {
        const fetchBatchData = async () => {
            console.log('🔍 [Batch Debug] Starting batch data fetch:', {
                hasAssessmentDetails: !!assessmentDetails,
                isPublicSurvey,
                assessmentVisibility: assessmentDetails?.assessment_visibility,
                liveAssessmentAccess: assessmentDetails?.live_assessment_access,
                timestamp: new Date().toISOString()
            });

            if (!assessmentDetails || isPublicSurvey) {
                console.log('🔍 [Batch Debug] Skipping batch fetch - no details or public survey');
                return;
            }

            try {
                setBatchLoading(true);
                const batchIds = assessmentDetails.live_assessment_access?.batch_ids || [];

                console.log('🔍 [Batch Debug] Batch IDs found:', {
                    batchIds,
                    batchIdsLength: batchIds.length,
                    liveAssessmentAccess: assessmentDetails.live_assessment_access
                });

                if (batchIds.length > 0) {
                    console.log('🔍 [Batch Debug] Calling getBatchInfo API...');
                    const batchInfo = await surveyApiService.getBatchInfo(batchIds);

                    console.log('🔍 [Batch Debug] Batch API response:', {
                        batchInfo,
                        batchInfoLength: batchInfo.length,
                        batchInfoType: typeof batchInfo
                    });

                    const batchMap = new Map();
                    batchInfo.forEach(batch => {
                        batchMap.set(batch.id, batch.name);
                        console.log('🔍 [Batch Debug] Mapped batch:', { id: batch.id, name: batch.name });
                    });

                    setBatchData(batchMap);
                    console.log('🔍 [Batch Debug] Final batch map:', {
                        batchMapSize: batchMap.size,
                        batchMapEntries: Array.from(batchMap.entries())
                    });
                } else {
                    console.log('🔍 [Batch Debug] No batch IDs found, setting empty map');
                    setBatchData(new Map());
                }
            } catch (error) {
                console.error('🔍 [Batch Debug] Error fetching batch data:', {
                    error: error.message,
                    errorType: error.constructor.name,
                    stack: error.stack
                });
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
        console.log('🎯 [Dialog] Opening individual responses dialog:', {
            question: question,
            questionId: question.questionId,
            questionText: question.questionText,
            index: index,
            timestamp: new Date().toISOString()
        });

        setSelectedQuestion({ ...question, index });
        setIsDialogOpen(true);
    };

    const renderQuestionContent = (question: TransformedQuestionAnalytics, index: number) => {
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
                            onClick={() => handleViewIndividualResponses(question, index)}
                        >
                            <Eye className="h-4 w-4" />
                            View Individual Responses
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {question.questionType === 'mcq_single_choice' && (
                        <div className="space-y-6">
                            {/* Bar Chart Section */}
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={question.responseDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                                `${value} responses (${props.payload.percentage}%)`,
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
                                            fill="#8884d8"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend Section Below Bar Chart */}
                            <div className="space-y-2">
                                {question.responseDistribution.map((response: ResponseDistribution, idx: number) => (
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
                        </div>
                    )}

                    {question.questionType === 'mcq_multiple_choice' && (
                        <div className="space-y-6">
                            {/* Bar Chart Section */}
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={question.responseDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                                `${value} responses (${props.payload.percentage}%)`,
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
                                            fill="#00C49F"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend Section Below Bar Chart */}
                            <div className="space-y-2">
                                {question.responseDistribution.map((response: ResponseDistribution, idx: number) => (
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
                        </div>
                    )}

                    {question.questionType === 'true_false' && (
                        <div className="space-y-6">
                            {/* Enhanced True/False Pie Chart */}
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                                {/* Pie Chart Section */}
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

                                        {/* Center Text - Only on Hover */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-gray-700">
                                                    {(question.responseDistribution[0]?.percentage || 0).toFixed(2)}%
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    True
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simple Legend Section */}
                                <div className="flex-1 space-y-4">
                                    {/* True Response */}
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-green-600 mb-1">
                                            True
                                        </div>
                                        <div className="text-2xl font-bold text-green-700 mb-1">
                                            {(question.responseDistribution[0]?.percentage || 0).toFixed(2)}%
                                            </div>
                                            <div className="text-sm text-gray-600">
                                            {question.responseDistribution[0]?.count || 0} responses
                                        </div>
                                    </div>

                                    {/* False Response */}
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-red-600 mb-1">
                                            False
                                        </div>
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
                    )}

                    {(question.questionType === 'short_answer' || question.questionType === 'long_answer') && (
                        <div className="space-y-4">
                            <div className="text-lg font-semibold mb-4">
                                Recent Responses ({question.totalResponses} total responses):
                            </div>
                            <div className="space-y-4">
                                {question.responseDistribution.slice(0, 5).map((response: any, idx: number) => (
                                    <div key={idx} className="p-4 border rounded-lg">
                                        <div className="text-sm text-gray-700 italic">
                                            "{response.value}"
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {response.count} similar responses
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.questionType === 'numerical' && (
                        <div className="space-y-4">
                            <div className="text-lg font-semibold mb-4">Response Distribution:</div>
                            <div className="space-y-3">
                                {question.responseDistribution.slice(0, 5).map((response: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="font-medium">
                                            {idx + 1}. {response.value}
                                        </span>
                                        <Badge variant="secondary">
                                            {response.count} responses ({response.percentage}%)
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                        {renderQuestionContent(question, index)}
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
                                                        // For now, we'll show the first available batch name since we don't have per-respondent batch data
                                                        const batchName = batchData.size > 0 ? Array.from(batchData.values())[0] : 'N/A';

                                                        // Log batch data for debugging
                                                        if (idx === 0) { // Only log for first respondent to avoid spam
                                                            console.log('🔍 [Batch Debug] Rendering table row with batch data:', {
                                                                batchDataSize: batchData.size,
                                                                batchDataEntries: Array.from(batchData.entries()),
                                                                batchName,
                                                                isPublicSurvey,
                                                                assessmentVisibility: assessmentDetails?.assessment_visibility,
                                                                liveAssessmentAccess: assessmentDetails?.live_assessment_access
                                                            });
                                                        }

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
