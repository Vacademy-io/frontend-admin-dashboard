import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';

// API Response Types
export interface SurveyRespondentResponse {
  question: string;
  question_type: string;
  response: string;
  name: string;
  email: string;
}

export interface SurveyRespondentResponseData {
  content: SurveyRespondentResponse[];
  page_no: number;
  page_size: number;
  total_pages: number;
  total_elements: number;
  last: boolean;
}

export interface SurveyRespondentResponseRequest {
  name?: string;
  assessment_ids?: string[];
  attempt_ids?: string[];
  status?: string[];
  sort_columns?: Record<string, string>;
}

export interface SurveySetupResponse {
  [key: string]: string;
}

export interface IndividualResponseData {
  name: string;
  email: string;
  response: string;
}

export interface IndividualResponseApiData {
  content: IndividualResponseData[];
  page_no: number;
  page_size: number;
  total_pages: number;
  total_elements: number;
  last: boolean;
}

export interface IndividualResponseRequest {
  name?: string;
  assessment_ids?: string[];
  question_ids?: string[];
  section_ids?: string[];
  status?: string[];
  sort_columns?: Record<string, string>;
}

export interface RichTextContent {
  id: string;
  type: string;
  content: string;
}

export interface QuestionOption {
  id: string;
  preview_id: string;
  question_id: string;
  text: RichTextContent;
  media_id: string;
  option_order: number;
  created_on: string;
  updated_on: string;
}

export interface QuestionOptionWithExplanation extends QuestionOption {
  explanation_text: RichTextContent;
}

export interface AssessmentQuestionPreview {
  question_id: string;
  parent_rich_text: RichTextContent;
  question: RichTextContent;
  section_id: string;
  question_duration: number;
  question_order: number;
  marking_json: string;
  evaluation_json: string;
  question_type: string;
  options: QuestionOption[];
  options_with_explanation: QuestionOptionWithExplanation[];
}

export interface McqSurveyInfo {
  option: string;
  percentage: number;
  respondent_count: number;
}

export interface McqSurveyDto {
  type: string;
  total_respondent: number;
  order: number;
  mcq_survey_info_list: McqSurveyInfo[];
}

export interface OneWordLongSurveyResponse {
  name: string;
  email: string;
  answer: string;
}

export interface OneWordLongSurveyDto {
  type: string;
  total_respondent: number;
  order: number;
  latest_response: OneWordLongSurveyResponse[];
}

export interface NumberSurveyInfo {
  answer: string;
  total_responses: number;
}

export interface NumberSurveyDto {
  type: string;
  total_respondent: number;
  order: number;
  number_survey_info_list: NumberSurveyInfo[];
}

export interface SurveyQuestionData {
  assessment_question_preview_dto: AssessmentQuestionPreview;
  mcq_survey_dtos: McqSurveyDto[];
  one_word_long_survey_dtos: OneWordLongSurveyDto[];
  number_survey_dtos: NumberSurveyDto[];
}

export interface SurveyOverviewResponse {
  survey_id: string;
  total_participants: number;
  participants_responded: number;
  all_surveys: SurveyQuestionData[];
}

// API Service Functions
export const surveyApiService = {
  /**
   * Get survey respondent responses with pagination and filtering
   */
  async getRespondentResponses(
    assessmentId: string,
    pageNo: number = 1,
    pageSize: number = 10,
    requestBody: SurveyRespondentResponseRequest = {}
  ): Promise<SurveyRespondentResponseData> {
    const instituteId = getInstituteId();
    if (!instituteId) {
      throw new Error('Institute ID not found');
    }

    const url = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/assessment-service/assessment/survey/respondent-response`;
    const params = {
      instituteId,
      pageNo,
      pageSize,
    };

    console.log('🔍 [Survey API] getRespondentResponses - Request Details:', {
      url,
      method: 'POST',
      params: {
        ...params,
        instituteId: params.instituteId || 'NOT_PROVIDED',
        assessmentId: assessmentId || 'NOT_PROVIDED',
      },
      requestBody: {
        name: requestBody.name || 'NOT_PROVIDED',
        assessment_ids: requestBody.assessment_ids || [assessmentId],
        attempt_ids: requestBody.attempt_ids || [],
        status: requestBody.status || [],
        sort_columns: requestBody.sort_columns || {},
        fullRequestBody: requestBody,
        dataTypes: {
          name: typeof (requestBody.name || 'NOT_PROVIDED'),
          assessment_ids: Array.isArray(requestBody.assessment_ids || [assessmentId]) ? 'array' : typeof (requestBody.assessment_ids || [assessmentId]),
          attempt_ids: Array.isArray(requestBody.attempt_ids || []) ? 'array' : typeof (requestBody.attempt_ids || []),
          status: Array.isArray(requestBody.status || []) ? 'array' : typeof (requestBody.status || []),
          sort_columns: typeof (requestBody.sort_columns || {}),
        },
      },
      timestamp: new Date().toISOString(),
    });

    try {
      const finalRequestBody = {
        ...requestBody,
        assessment_ids: requestBody.assessment_ids || [assessmentId],
      };

      console.log('🔍 [Survey API] getRespondentResponses - Final Request Body:', {
        finalRequestBody,
        stringified: JSON.stringify(finalRequestBody),
        timestamp: new Date().toISOString(),
      });

      const response = await authenticatedAxiosInstance.post<SurveyRespondentResponseData>(
        url,
        finalRequestBody,
        { params }
      );

      console.log('✅ [Survey API] getRespondentResponses - Response Details:', {
        status: response.status,
        data: {
          contentLength: response.data.content?.length || 0,
          pageNo: response.data.page_no,
          pageSize: response.data.page_size,
          totalPages: response.data.total_pages,
          totalElements: response.data.total_elements,
          last: response.data.last,
        },
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [Survey API] getRespondentResponses - Error Details:', {
        error: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
        request: {
          url,
          params,
          requestBody: {
            ...requestBody,
            assessment_ids: requestBody.assessment_ids || [assessmentId],
          },
        },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  /**
   * Get survey setup data
   */
  async getSurveySetup(assessmentId: string): Promise<SurveySetupResponse> {
    const instituteId = getInstituteId();
    if (!instituteId) {
      throw new Error('Institute ID not found');
    }

    const url = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/assessment-service/assessment/survey/setup`;
    const params = {
      instituteId,
      assessmentId,
    };

    console.log('🔍 [Survey API] getSurveySetup - Request Details:', {
      url,
      method: 'GET',
      params: {
        ...params,
        instituteId: params.instituteId || 'NOT_PROVIDED',
        assessmentId: params.assessmentId || 'NOT_PROVIDED',
      },
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await authenticatedAxiosInstance.get<SurveySetupResponse>(
        url,
        { params }
      );

      console.log('✅ [Survey API] getSurveySetup - Response Details:', {
        status: response.status,
        data: {
          responseType: Array.isArray(response.data) ? 'array' : typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : Object.keys(response.data || {}).length,
          sampleData: Array.isArray(response.data) ? response.data.slice(0, 3) : response.data,
        },
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [Survey API] getSurveySetup - Error Details:', {
        error: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
        request: {
          url,
          params,
        },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  /**
   * Get individual survey responses with pagination and filtering
   */
  async getIndividualResponses(
    assessmentId: string,
    pageNo: number = 1,
    pageSize: number = 10,
    requestBody: IndividualResponseRequest = {}
  ): Promise<IndividualResponseApiData> {
    const instituteId = getInstituteId();
    if (!instituteId) {
      throw new Error('Institute ID not found');
    }

    const url = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/assessment-service/assessment/survey/individual-response`;
    const params = {
      instituteId,
      pageNo,
      pageSize,
    };

    console.log('🔍 [Survey API] getIndividualResponses - Request Details:', {
      url,
      method: 'POST',
      params: {
        ...params,
        instituteId: params.instituteId || 'NOT_PROVIDED',
        assessmentId: assessmentId || 'NOT_PROVIDED',
      },
      requestBody: {
        name: requestBody.name || 'NOT_PROVIDED',
        assessment_ids: requestBody.assessment_ids || [assessmentId],
        attempt_ids: requestBody.attempt_ids || [],
        status: requestBody.status || [],
        sort_columns: requestBody.sort_columns || {},
        fullRequestBody: requestBody,
      },
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await authenticatedAxiosInstance.post<IndividualResponseApiData>(
        url,
        {
          ...requestBody,
          assessment_ids: requestBody.assessment_ids || [assessmentId],
        },
        { params }
      );

      console.log('✅ [Survey API] getIndividualResponses - Response Details:', {
        status: response.status,
        data: {
          contentLength: response.data.content?.length || 0,
          pageNo: response.data.page_no,
          pageSize: response.data.page_size,
          totalPages: response.data.total_pages,
          totalElements: response.data.total_elements,
          last: response.data.last,
          sampleContent: response.data.content?.slice(0, 2) || [],
        },
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [Survey API] getIndividualResponses - Error Details:', {
        error: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
        request: {
          url,
          params,
          requestBody: {
            ...requestBody,
            assessment_ids: requestBody.assessment_ids || [assessmentId],
          },
        },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  /**
   * Get survey overview data
   */
  async getSurveyOverview(
    assessmentId: string,
    sectionIds?: string
  ): Promise<SurveyOverviewResponse> {
    const instituteId = getInstituteId();
    if (!instituteId) {
      throw new Error('Institute ID not found');
    }

    const url = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/assessment-service/assessment/survey/get-overview`;
    const params = {
      instituteId,
      assessmentId,
      ...(sectionIds && { sectionIds }),
    };

    console.log('🔍 [Survey API] getSurveyOverview - Request Details:', {
      url,
      method: 'GET',
      params: {
        ...params,
        sectionIds: sectionIds || 'NOT_PROVIDED',
      },
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await authenticatedAxiosInstance.get<SurveyOverviewResponse>(
        url,
        { params }
      );

      console.log('✅ [Survey API] getSurveyOverview - Response Details:', {
        status: response.status,
        requestUrl: `${url}?${new URLSearchParams(params).toString()}`,
        data: {
          surveyId: response.data.survey_id,
          totalParticipants: response.data.total_participants,
          participantsResponded: response.data.participants_responded,
          allSurveysCount: response.data.all_surveys?.length || 0,
          sampleSurvey: response.data.all_surveys?.[0] ? {
            questionId: response.data.all_surveys[0].assessment_question_preview_dto?.question_id,
            questionType: response.data.all_surveys[0].assessment_question_preview_dto?.question_type,
            mcqCount: response.data.all_surveys[0].mcq_survey_dtos?.length || 0,
            textCount: response.data.all_surveys[0].one_word_long_survey_dtos?.length || 0,
            numberCount: response.data.all_surveys[0].number_survey_dtos?.length || 0,
          } : null,
        },
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [Survey API] getSurveyOverview - Error Details:', {
        error: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
        request: {
          url,
          params,
        },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },
};
