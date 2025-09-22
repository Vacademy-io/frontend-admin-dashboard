// Survey-specific types and interfaces

export interface SurveyQuestion {
    id: string;
    text: string;
    type: SurveyQuestionType;
    required: boolean;
    options?: SurveyOption[];
    responses: SurveyResponse[];
}

export type SurveyQuestionType =
    | 'mcq_single_choice'
    | 'mcq_multiple_choice'
    | 'true_false'
    | 'short_answer'
    | 'long_answer'
    | 'numerical'
    | 'rating';

export interface SurveyOption {
    id: string;
    text: string;
    value: string;
}

export interface SurveyResponse {
    id: string;
    respondentId: string;
    questionId: string;
    answer: string | string[] | number;
    submittedAt: string;
}

export interface SurveyRespondent {
    id: string;
    name: string;
    email: string;
    completedAt: string;
    responses: SurveyResponse[];
}

export interface SurveyAnalytics {
    totalParticipants: number;
    completedResponses: number;
    completionRate: number;
    averageResponseTime: string;
    totalQuestions: number;
    averageRating?: number;
}

export interface QuestionAnalytics {
    questionId: string;
    questionText: string;
    questionType: SurveyQuestionType;
    totalResponses: number;
    responseDistribution: ResponseDistribution[];
    topInsights: string[];
}

export interface ResponseDistribution {
    value: string;
    count: number;
    percentage: number;
}

export interface SurveyInsight {
    id: string;
    title: string;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
    impact: 'high' | 'medium' | 'low';
}

// Mock data types for demonstration
export interface MockSurveyData {
    analytics: SurveyAnalytics;
    questions: QuestionAnalytics[];
    respondents: SurveyRespondent[];
    insights: SurveyInsight[];
}
