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
import { Users, CheckCircle, Clock, TrendingUp, MessageSquare, Eye } from 'lucide-react';

// Mock data matching the exact UI specification
const mockSurveyOverviewData = {
    totalParticipants: 300,
    completedResponses: 247,
    completionRate: 82, // 247/300 = 82.33% rounded to 82%
    questions: [
        {
            id: 'q1',
            text: 'Which subject do you find the most engaging in this course?',
            type: 'mcq_single_choice',
            respondents: 246,
            totalParticipants: 300,
            responses: [
                { value: 'Mathematics', count: 86, percentage: 35 },
                { value: 'Science', count: 69, percentage: 28 },
                { value: 'Literature', count: 54, percentage: 22 },
                { value: 'History', count: 37, percentage: 15 }
            ]
        },
        {
            id: 'q2',
            text: 'Which learning methods help you understand best? (Select all that apply)',
            type: 'mcq_multiple_choice',
            respondents: 247,
            totalParticipants: 300,
            responses: [
                { value: 'Visual Aids', count: 180, percentage: 73 },
                { value: 'Hands-on Practice', count: 156, percentage: 63 },
                { value: 'Group Discussion', count: 98, percentage: 40 },
                { value: 'Reading Materials', count: 74, percentage: 30 }
            ]
        },
        {
            id: 'q3',
            text: 'The course materials provided were easy to follow.',
            type: 'true_false',
            respondents: 247,
            totalParticipants: 300,
            responses: [
                { value: 'True', count: 193, percentage: 78 },
                { value: 'False', count: 54, percentage: 22 }
            ]
        },
        {
            id: 'q4',
            text: 'What one improvement would make this course more effective?',
            type: 'short_answer',
            respondents: 240,
            totalParticipants: 300,
            topSuggestions: [
                { suggestion: 'More practical examples', mentions: 32 },
                { suggestion: 'Interactive content', mentions: 28 },
                { suggestion: 'Video tutorials', mentions: 24 },
                { suggestion: 'Better pacing', mentions: 19 },
                { suggestion: 'More practice exercises', mentions: 17 }
            ]
        },
        {
            id: 'q5',
            text: 'Please provide detailed feedback about your overall learning experience.',
            type: 'long_answer',
            respondents: 235,
            totalParticipants: 300,
            recentResponses: [
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    response: 'The course structure is well-organized and the instructor explains concepts clearly. However, I would appreciate more real-world examples...'
                },
                {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    response: 'Great course overall! The materials are comprehensive and the pace is just right. My only suggestion would be to include more interactive elements...'
                },
                {
                    name: 'Mike Johnson',
                    email: 'mike@example.com',
                    response: 'I found the course content valuable but sometimes difficult to follow. More visual aids and step-by-step examples would be helpful...'
                }
            ]
        },
        {
            id: 'q6',
            text: 'How would you rate this course overall? (Enter a number from 1-10)',
            type: 'numerical',
            respondents: 247,
            totalParticipants: 300,
            topRatings: [
                { rating: 8, count: 45 },
                { rating: 9, count: 42 },
                { rating: 10, count: 38 },
                { rating: 7, count: 35 },
                { rating: 6, count: 28 }
            ]
        }
    ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for individual responses
const mockIndividualResponses = {
    q1: [
        { name: 'John Doe', email: 'john@example.com', response: 'Mathematics' },
        { name: 'Jane Smith', email: 'jane@example.com', response: 'Science' },
        { name: 'Mike Johnson', email: 'mike@example.com', response: 'Literature' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', response: 'Mathematics' },
        { name: 'David Brown', email: 'david@example.com', response: 'History' },
        { name: 'Lisa Davis', email: 'lisa@example.com', response: 'Science' }
    ],
    q2: [
        { name: 'John Doe', email: 'john@example.com', response: 'Visual Aids, Hands-on Practice' },
        { name: 'Jane Smith', email: 'jane@example.com', response: 'Group Discussion, Reading Materials' },
        { name: 'Mike Johnson', email: 'mike@example.com', response: 'Visual Aids, Reading Materials' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', response: 'Hands-on Practice, Group Discussion' },
        { name: 'David Brown', email: 'david@example.com', response: 'Visual Aids, Hands-on Practice, Reading Materials' },
        { name: 'Lisa Davis', email: 'lisa@example.com', response: 'Visual Aids, Group Discussion' }
    ],
    q3: [
        { name: 'John Doe', email: 'john@example.com', response: 'True' },
        { name: 'Jane Smith', email: 'jane@example.com', response: 'False' },
        { name: 'Mike Johnson', email: 'mike@example.com', response: 'True' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', response: 'True' },
        { name: 'David Brown', email: 'david@example.com', response: 'True' },
        { name: 'Lisa Davis', email: 'lisa@example.com', response: 'False' }
    ],
    q4: [
        { name: 'John Doe', email: 'john@example.com', response: 'More practical examples would help understand concepts better' },
        { name: 'Jane Smith', email: 'jane@example.com', response: 'More interactive content and video tutorials' },
        { name: 'Mike Johnson', email: 'mike@example.com', response: 'Better pacing and more step-by-step examples' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', response: 'More real-world applications and case studies' },
        { name: 'David Brown', email: 'david@example.com', response: 'More practice exercises and quizzes' },
        { name: 'Lisa Davis', email: 'lisa@example.com', response: 'Clearer instructions and better organization of materials' }
    ],
    q5: [
        { name: 'John Doe', email: 'john@example.com', response: 'The course structure is well-organized and the instructor explains concepts clearly. However, I would appreciate more real-world examples and case studies to better understand how these concepts apply in practice.' },
        { name: 'Jane Smith', email: 'jane@example.com', response: 'Great course overall! The materials are comprehensive and the pace is just right. My only suggestion would be to include more interactive elements and group activities.' },
        { name: 'Mike Johnson', email: 'mike@example.com', response: 'I found the course content valuable but sometimes difficult to follow. More visual aids and step-by-step examples would be helpful for understanding complex concepts.' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', response: 'The course is well-structured and the instructor is knowledgeable. I particularly enjoyed the practical examples and would like to see more case studies from different industries.' },
        { name: 'David Brown', email: 'david@example.com', response: 'Excellent course with clear explanations and good pacing. The practice exercises are very helpful. I would recommend adding more interactive elements and peer discussion opportunities.' },
        { name: 'Lisa Davis', email: 'lisa@example.com', response: 'The course has good content but could be better organized. Some concepts are explained well while others need more clarity. More visual aids and step-by-step breakdowns would be beneficial.' }
    ],
    q6: [
        { name: 'John Doe', email: 'john@example.com', response: '8' },
        { name: 'Jane Smith', email: 'jane@example.com', response: '9' },
        { name: 'Mike Johnson', email: 'mike@example.com', response: '7' },
        { name: 'Sarah Wilson', email: 'sarah@example.com', response: '8' },
        { name: 'David Brown', email: 'david@example.com', response: '9' },
        { name: 'Lisa Davis', email: 'lisa@example.com', response: '6' }
    ]
};

export const SurveyMainOverviewTab: React.FC = () => {
    const { totalParticipants, completedResponses, completionRate, questions } = mockSurveyOverviewData;
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewIndividualResponses = (question: any, index: number) => {
        setSelectedQuestion({ ...question, index });
        setIsDialogOpen(true);
    };

    const renderQuestionContent = (question: any, index: number) => {
        const questionNumber = `Q${index + 1}`;

        return (
            <Card className="h-fit">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold mb-2">
                                {questionNumber}. {question.text}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <span>{question.respondents} respondents / {question.totalParticipants} total participants</span>
                            </div>
                            <Badge className="bg-primary-100 text-primary-800 border-primary-200 mb-4">
                                {question.type.replace('_', ' ').toUpperCase()}
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
                    {question.type === 'mcq_single_choice' && (
                        <div className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={question.responses}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="value" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => [`${value} responses`, 'Count']} />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {question.responses.map((response: any, idx: number) => (
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

                    {question.type === 'mcq_multiple_choice' && (
                        <div className="space-y-4">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={question.responses}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="value" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => [`${value} responses`, 'Count']} />
                                        <Bar dataKey="count" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {question.responses.map((response: any, idx: number) => (
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

                    {question.type === 'true_false' && (
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
                                                    { name: 'True', value: question.responses[0].percentage, fill: '#10B981' },
                                                    { name: 'False', value: question.responses[1].percentage, fill: '#EF4444' }
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
                                                    {question.responses[0].percentage}%
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
                                                True: {question.responses[0].percentage}%
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {question.responses[0].count} responses
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                        <div>
                                            <div className="text-lg font-semibold text-red-600">
                                                False: {question.responses[1].percentage}%
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {question.responses[1].count} responses
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {question.type === 'short_answer' && (
                        <div className="space-y-4">
                            <div className="text-lg font-semibold mb-4">Top 5 Suggestions:</div>
                            <div className="space-y-3">
                                {question.topSuggestions.map((suggestion: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="font-medium">
                                            {idx + 1}. {suggestion.suggestion}
                                        </span>
                                        <Badge variant="secondary">
                                            {suggestion.mentions} mentions
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.type === 'long_answer' && (
                        <div className="space-y-4">
                            <div className="text-lg font-semibold mb-4">
                                Recent Responses ({question.respondents} total responses):
                            </div>
                            <div className="space-y-4">
                                {question.recentResponses.map((response: any, idx: number) => (
                                    <div key={idx} className="p-4 border rounded-lg">
                                        <div className="font-medium text-sm mb-1">
                                            {response.name} - {response.email}
                                        </div>
                                        <div className="text-sm text-gray-700 italic">
                                            "{response.response}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.type === 'numerical' && (
                        <div className="space-y-4">
                            <div className="text-lg font-semibold mb-4">Top 5 Responses:</div>
                            <div className="space-y-3">
                                {question.topRatings.map((rating: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="font-medium">
                                            {idx + 1}. Rating: {rating.rating}
                                        </span>
                                        <Badge variant="secondary">
                                            {rating.count} responses
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
                                <span className="text-4xl font-bold text-gray-900">{completedResponses}</span>
                                <span className="text-lg text-gray-600">responded</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    out of <span className="font-semibold text-gray-700">{totalParticipants}</span> sent
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
                        <div className="text-3xl font-bold">{completionRate}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                    <div
                        key={question.id}
                        className={
                            question.type === 'short_answer' || question.type === 'long_answer' || question.type === 'numerical'
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
                            {selectedQuestion && `Q${selectedQuestion.index + 1}. ${selectedQuestion.text} - Individual Responses`}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedQuestion && (
                        <div className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold w-32">Name</TableHead>
                                        <TableHead className="font-semibold w-48">Email</TableHead>
                                        <TableHead className="font-semibold">Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockIndividualResponses[`q${selectedQuestion.index + 1}` as keyof typeof mockIndividualResponses]?.map((respondent, idx) => (
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
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
