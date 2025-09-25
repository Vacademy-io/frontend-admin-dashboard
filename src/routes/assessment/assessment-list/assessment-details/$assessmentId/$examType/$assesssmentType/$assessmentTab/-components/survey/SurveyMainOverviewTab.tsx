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
import { useSurveyOverview, useSurveyRespondentResponses } from './hooks/useSurveyData';
import { TransformedQuestionAnalytics, ResponseDistribution } from './types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface SurveyMainOverviewTabProps {
    assessmentId: string;
    sectionIds?: string;
    assessmentName?: string;
}

export const SurveyMainOverviewTab: React.FC<SurveyMainOverviewTabProps> = ({ assessmentId, sectionIds, assessmentName }) => {
    const { data: overviewData, loading: overviewLoading, error: overviewError } = useSurveyOverview(assessmentId, sectionIds);
    const { data: respondentData, loading: respondentLoading } = useSurveyRespondentResponses(assessmentId, 1, 100, assessmentName);

    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Log the sectionIds being passed
    React.useEffect(() => {
        console.log('📋 [SurveyMainOverviewTab] Component props:', {
            assessmentId,
            sectionIds,
            timestamp: new Date().toISOString(),
        });
    }, [assessmentId, sectionIds]);

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
                        <div className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={question.responseDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="value" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => [`${value} responses`, 'Count']} />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {question.responseDistribution.map((response: ResponseDistribution, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="font-medium">{response.value}</span>
                                        <span className="text-sm text-gray-600">
                                            {response.percentage}% ({response.count} responses)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.questionType === 'mcq_multiple_choice' && (
                        <div className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={question.responseDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="value" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => [`${value} responses`, 'Count']} />
                                        <Bar dataKey="count" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {question.responseDistribution.map((response: ResponseDistribution, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="font-medium">{response.value}</span>
                                        <span className="text-sm text-gray-600">
                                            {response.percentage}% ({response.count} responses)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.questionType === 'true_false' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-8">
                                <div className="flex-1 max-w-xs">
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="60%"
                                                outerRadius="90%"
                                                data={[
                                                    { name: 'True', value: question.responseDistribution[0]?.percentage || 0, fill: '#10B981' },
                                                    { name: 'False', value: question.responseDistribution[1]?.percentage || 0, fill: '#EF4444' }
                                                ]}
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                <RadialBar
                                                    dataKey="value"
                                                    cornerRadius={10}
                                                    fill="#8884d8"
                                                />
                                                <text
                                                    x="50%"
                                                    y="50%"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-2xl font-bold fill-gray-700"
                                                >
                                                    {question.responseDistribution[0]?.percentage || 0}%
                                                </text>
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        <div>
                                            <div className="text-lg font-semibold text-green-600">
                                                True: {question.responseDistribution[0]?.percentage || 0}%
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {question.responseDistribution[0]?.count || 0} responses
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                        <div>
                                            <div className="text-lg font-semibold text-red-600">
                                                False: {question.responseDistribution[1]?.percentage || 0}%
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {question.responseDistribution[1]?.count || 0} responses
                                            </div>
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
                        <CardTitle className="text-lg font-semibold text-primary-600">Total Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-gray-900">{analytics.completedResponses}</span>
                                <span className="text-lg text-gray-600">responded</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    out of <span className="font-semibold text-gray-700">{analytics.totalParticipants}</span> sent
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Active responses</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-primary-600">Completion Rate</CardTitle>
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
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {selectedQuestion && `Q${selectedQuestion.index + 1}. ${selectedQuestion.questionText} - Individual Responses`}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedQuestion && (
                        <div className="mt-4">
                            {respondentLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Loading responses...</span>
                                    </div>
                                </div>
                            ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold w-32">Name</TableHead>
                                        <TableHead className="font-semibold w-48">Email</TableHead>
                                        <TableHead className="font-semibold">Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                        {respondentData?.content?.map((respondent, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium w-32">{respondent.name}</TableCell>
                                            <TableCell className="w-48">{respondent.email}</TableCell>
                                            <TableCell className="max-w-md">
                                                <div
                                                    className="text-sm leading-relaxed overflow-hidden"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        lineHeight: '1.5',
                                                        maxHeight: '3rem'
                                                    }}
                                                >
                                                    {respondent.response}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
