import { MockSurveyData, SurveyAnalytics, QuestionAnalytics, SurveyRespondent, SurveyInsight } from './types';

// Mock data service for survey analytics
export const mockSurveyData: MockSurveyData = {
    analytics: {
        totalParticipants: 300,
        completedResponses: 247,
        completionRate: 94,
        averageResponseTime: '4.2 min',
        totalQuestions: 5,
        averageRating: 4.2
    },
    questions: [
        {
            questionId: 'q1',
            questionText: 'How satisfied are you with the course content?',
            questionType: 'rating',
            totalResponses: 247,
            responseDistribution: [
                { value: 'Very Satisfied', count: 89, percentage: 36 },
                { value: 'Satisfied', count: 78, percentage: 32 },
                { value: 'Neutral', count: 45, percentage: 18 },
                { value: 'Dissatisfied', count: 23, percentage: 9 },
                { value: 'Very Dissatisfied', count: 12, percentage: 5 }
            ],
            topInsights: [
                '68% of participants are satisfied or very satisfied',
                'Only 14% expressed dissatisfaction',
                'High satisfaction rate indicates effective content delivery'
            ]
        },
        {
            questionId: 'q2',
            questionText: 'Which topics did you find most helpful? (Select all that apply)',
            questionType: 'mcq_multiple_choice',
            totalResponses: 247,
            responseDistribution: [
                { value: 'Video Lectures', count: 156, percentage: 63 },
                { value: 'Practice Exercises', count: 134, percentage: 54 },
                { value: 'Discussion Forums', count: 89, percentage: 36 },
                { value: 'Reading Materials', count: 78, percentage: 32 },
                { value: 'Live Sessions', count: 67, percentage: 27 }
            ],
            topInsights: [
                'Video lectures are the most preferred learning method',
                'Practice exercises are highly valued by students',
                'Discussion forums show good engagement'
            ]
        },
        {
            questionId: 'q3',
            questionText: 'Rate the difficulty level of the course',
            questionType: 'mcq_single_choice',
            totalResponses: 247,
            responseDistribution: [
                { value: 'Too Easy', count: 23, percentage: 9 },
                { value: 'Just Right', count: 156, percentage: 63 },
                { value: 'Too Difficult', count: 68, percentage: 28 }
            ],
            topInsights: [
                '63% found the difficulty level appropriate',
                '28% found it too difficult - may need additional support',
                'Good balance for majority of students'
            ]
        },
        {
            questionId: 'q4',
            questionText: 'The course materials were well-organized and easy to follow',
            questionType: 'true_false',
            totalResponses: 247,
            responseDistribution: [
                { value: 'True', count: 198, percentage: 80 },
                { value: 'False', count: 49, percentage: 20 }
            ],
            topInsights: [
                '80% agree that materials are well-organized',
                'Strong positive feedback on course structure',
                'Minor improvements needed for remaining 20%'
            ]
        },
        {
            questionId: 'q5',
            questionText: 'What suggestions do you have for improving the course?',
            questionType: 'long_answer',
            totalResponses: 247,
            responseDistribution: [
                { value: 'More interactive content', count: 45, percentage: 18 },
                { value: 'Additional practice problems', count: 38, percentage: 15 },
                { value: 'Better video quality', count: 32, percentage: 13 },
                { value: 'More real-world examples', count: 28, percentage: 11 },
                { value: 'Other suggestions', count: 104, percentage: 42 }
            ],
            topInsights: [
                'Students want more interactive content',
                'Additional practice problems are highly requested',
                'Video quality improvements needed'
            ]
        }
    ],
    respondents: [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            completedAt: '2024-01-15T10:30:00Z',
            responses: [
                { id: 'r1', respondentId: '1', questionId: 'q1', answer: 'Very Satisfied', submittedAt: '2024-01-15T10:30:00Z' },
                { id: 'r2', respondentId: '1', questionId: 'q2', answer: ['Video Lectures', 'Practice Exercises'], submittedAt: '2024-01-15T10:30:00Z' },
                { id: 'r3', respondentId: '1', questionId: 'q3', answer: 'Just Right', submittedAt: '2024-01-15T10:30:00Z' },
                { id: 'r4', respondentId: '1', questionId: 'q4', answer: 'True', submittedAt: '2024-01-15T10:30:00Z' },
                { id: 'r5', respondentId: '1', questionId: 'q5', answer: 'The course was excellent overall. I would suggest adding more interactive quizzes throughout the modules.', submittedAt: '2024-01-15T10:30:00Z' }
            ]
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            completedAt: '2024-01-15T11:15:00Z',
            responses: [
                { id: 'r6', respondentId: '2', questionId: 'q1', answer: 'Satisfied', submittedAt: '2024-01-15T11:15:00Z' },
                { id: 'r7', respondentId: '2', questionId: 'q2', answer: ['Discussion Forums', 'Live Sessions'], submittedAt: '2024-01-15T11:15:00Z' },
                { id: 'r8', respondentId: '2', questionId: 'q3', answer: 'Too Easy', submittedAt: '2024-01-15T11:15:00Z' },
                { id: 'r9', respondentId: '2', questionId: 'q4', answer: 'True', submittedAt: '2024-01-15T11:15:00Z' },
                { id: 'r10', respondentId: '2', questionId: 'q5', answer: 'Could use more advanced topics and challenging assignments.', submittedAt: '2024-01-15T11:15:00Z' }
            ]
        },
        {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            completedAt: '2024-01-15T12:45:00Z',
            responses: [
                { id: 'r11', respondentId: '3', questionId: 'q1', answer: 'Neutral', submittedAt: '2024-01-15T12:45:00Z' },
                { id: 'r12', respondentId: '3', questionId: 'q2', answer: ['Reading Materials'], submittedAt: '2024-01-15T12:45:00Z' },
                { id: 'r13', respondentId: '3', questionId: 'q3', answer: 'Too Difficult', submittedAt: '2024-01-15T12:45:00Z' },
                { id: 'r14', respondentId: '3', questionId: 'q4', answer: 'False', submittedAt: '2024-01-15T12:45:00Z' },
                { id: 'r15', respondentId: '3', questionId: 'q5', answer: 'The course was quite challenging. More step-by-step explanations would be helpful.', submittedAt: '2024-01-15T12:45:00Z' }
            ]
        },
        {
            id: '4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            completedAt: '2024-01-15T14:20:00Z',
            responses: [
                { id: 'r16', respondentId: '4', questionId: 'q1', answer: 'Very Satisfied', submittedAt: '2024-01-15T14:20:00Z' },
                { id: 'r17', respondentId: '4', questionId: 'q2', answer: ['Video Lectures', 'Reading Materials'], submittedAt: '2024-01-15T14:20:00Z' },
                { id: 'r18', respondentId: '4', questionId: 'q3', answer: 'Just Right', submittedAt: '2024-01-15T14:20:00Z' },
                { id: 'r19', respondentId: '4', questionId: 'q4', answer: 'True', submittedAt: '2024-01-15T14:20:00Z' },
                { id: 'r20', respondentId: '4', questionId: 'q5', answer: 'Perfect course! The materials were well-structured and easy to follow.', submittedAt: '2024-01-15T14:20:00Z' }
            ]
        },
        {
            id: '5',
            name: 'David Brown',
            email: 'david.brown@example.com',
            completedAt: '2024-01-15T15:10:00Z',
            responses: [
                { id: 'r21', respondentId: '5', questionId: 'q1', answer: 'Dissatisfied', submittedAt: '2024-01-15T15:10:00Z' },
                { id: 'r22', respondentId: '5', questionId: 'q2', answer: ['Practice Exercises'], submittedAt: '2024-01-15T15:10:00Z' },
                { id: 'r23', respondentId: '5', questionId: 'q3', answer: 'Too Difficult', submittedAt: '2024-01-15T15:10:00Z' },
                { id: 'r24', respondentId: '5', questionId: 'q4', answer: 'False', submittedAt: '2024-01-15T15:10:00Z' },
                { id: 'r25', respondentId: '5', questionId: 'q5', answer: 'The course needs better organization and clearer instructions for assignments.', submittedAt: '2024-01-15T15:10:00Z' }
            ]
        }
    ],
    insights: [
        {
            id: 'i1',
            title: 'High Satisfaction Rate',
            description: '89% of participants are satisfied or very satisfied with the course content',
            type: 'positive',
            impact: 'high'
        },
        {
            id: 'i2',
            title: 'Video Lectures Preferred',
            description: 'Video lectures are the most preferred learning method (63% of participants)',
            type: 'positive',
            impact: 'high'
        },
        {
            id: 'i3',
            title: 'Difficulty Level Concerns',
            description: '28% of participants found the course too difficult',
            type: 'negative',
            impact: 'medium'
        },
        {
            id: 'i4',
            title: 'Interactive Content Request',
            description: '18% of participants requested more interactive content',
            type: 'neutral',
            impact: 'medium'
        }
    ]
};

// Service functions
export const getSurveyAnalytics = (): SurveyAnalytics => {
    return mockSurveyData.analytics;
};

export const getSurveyQuestions = (): QuestionAnalytics[] => {
    return mockSurveyData.questions;
};

export const getSurveyRespondents = (): SurveyRespondent[] => {
    return mockSurveyData.respondents;
};

export const getSurveyInsights = (): SurveyInsight[] => {
    return mockSurveyData.insights;
};

export const getSurveyQuestionById = (questionId: string): QuestionAnalytics | undefined => {
    return mockSurveyData.questions.find(q => q.questionId === questionId);
};

export const getSurveyRespondentById = (respondentId: string): SurveyRespondent | undefined => {
    return mockSurveyData.respondents.find(r => r.id === respondentId);
};

export const searchSurveyRespondents = (searchTerm: string): SurveyRespondent[] => {
    const term = searchTerm.toLowerCase();
    return mockSurveyData.respondents.filter(respondent =>
        respondent.name.toLowerCase().includes(term) ||
        respondent.email.toLowerCase().includes(term)
    );
};
