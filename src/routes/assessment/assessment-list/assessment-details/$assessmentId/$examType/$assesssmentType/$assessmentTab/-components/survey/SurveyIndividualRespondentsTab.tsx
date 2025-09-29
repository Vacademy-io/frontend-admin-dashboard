import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Users,
} from 'lucide-react';
import { useSurveyRespondents } from './hooks/useSurveyData';
import { surveyApiService } from '@/services/survey-api';

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
            formattedAnswer = `Selected: ${selectedOptions.join(', ')}`;
          } else {
            formattedAnswer = `Selected options: ${responseData.optionIds.join(', ')}`;
          }
        } else {
          formattedAnswer = 'No options selected';
        }
        break;

      case 'NUMERIC':
        if (responseData.validAnswer !== null && responseData.validAnswer !== undefined) {
          formattedAnswer = `Answer: ${responseData.validAnswer}`;
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

interface SurveyIndividualRespondentsTabProps {
    assessmentId: string;
    sectionIds?: string;
    assessmentName?: string;
    assessmentDetails?: any;
}

export const SurveyIndividualRespondentsTab: React.FC<SurveyIndividualRespondentsTabProps> = ({ assessmentId, sectionIds, assessmentName, assessmentDetails }) => {
    const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
    const [pageInput, setPageInput] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const [questionsData, setQuestionsData] = useState<Map<string, any>>(new Map());
    const [questionsLoading, setQuestionsLoading] = useState(false);

    // Determine survey type from assessment details
    const isPublicSurvey = assessmentDetails?.assessment_visibility === 'PUBLIC';

    const pageSize = 10;

    const { data, loading, error } = useSurveyRespondents(assessmentId, pageNo, pageSize, assessmentName, sectionIds);

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

    const currentRespondent = data?.respondents[currentRespondentIndex];
    const totalRespondents = data?.respondents.length || 0;
    const totalElements = data?.pagination?.totalElements || 0;

    // Calculate the global respondent number across all pages
    const globalRespondentNumber = ((pageNo - 1) * pageSize) + currentRespondentIndex + 1;

    const handlePrevious = () => {
        if (currentRespondentIndex > 0) {
            setCurrentRespondentIndex(currentRespondentIndex - 1);
        } else if (pageNo > 1) {
            // Load previous page
            setPageNo(pageNo - 1);
            setCurrentRespondentIndex(pageSize - 1);
        }
    };

    const handleNext = () => {
        if (currentRespondentIndex < totalRespondents - 1) {
            setCurrentRespondentIndex(currentRespondentIndex + 1);
        } else if (data?.pagination && !data.pagination.last) {
            // Load next page
            setPageNo(pageNo + 1);
            setCurrentRespondentIndex(0);
        }
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    };

    const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const pageNumber = parseInt(pageInput);
            if (pageNumber >= 1 && pageNumber <= (data?.pagination?.totalPages || 1)) {
                setPageNo(pageNumber);
                setCurrentRespondentIndex(0); // Reset to first respondent on new page
            } else {
                // Reset to current page if invalid input
                setPageInput(pageNo.toString());
            }
        }
    };

    const handlePageInputBlur = () => {
        const pageNumber = parseInt(pageInput);
        if (pageNumber >= 1 && pageNumber <= (data?.pagination?.totalPages || 1)) {
            setPageNo(pageNumber);
            setCurrentRespondentIndex(0); // Reset to first respondent on new page
        } else {
            // Reset to current page if invalid input
            setPageInput(pageNo.toString());
        }
    };

    // Update page input when pageNo changes
    React.useEffect(() => {
        setPageInput(pageNo.toString());
    }, [pageNo]);

    // Reset to first respondent when data changes
    React.useEffect(() => {
        if (data?.respondents?.length) {
            setCurrentRespondentIndex(0);
        }
    }, [data?.respondents]);

    // Show loading state
    if (loading || questionsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>
                        {loading ? 'Loading survey respondents...' : 'Loading questions data...'}
                    </span>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Respondents</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Show empty state
    if (!data?.respondents?.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Respondents Found</h3>
                    <p className="text-gray-600">No survey responses found for this assessment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Navigation Controls */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentRespondentIndex <= 0 && pageNo <= 1}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="text-center">
                    <div className="font-semibold text-lg">{currentRespondent?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{currentRespondent?.email || 'No email'}</div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                            Respondent
                        </span>
                        <Input
                            type="number"
                            min="1"
                            max={totalRespondents}
                            value={pageInput}
                            onChange={handlePageInputChange}
                            onKeyDown={handlePageInputSubmit}
                            onBlur={handlePageInputBlur}
                            className="w-12 h-6 text-xs text-center p-1"
                        />
                        <span className="text-xs text-gray-500">
                            of {data?.pagination?.totalPages || 1}
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentRespondentIndex >= totalRespondents - 1 && data?.pagination?.last}
                    className="flex items-center gap-2"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Individual Responses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentRespondent?.responses?.map((response, index) => {
                    // Parse the response data with question context
                    const parsedResponse = parseResponseData(response.answer, questionsData);

                    return (
                    <Card key={response.id} className="h-fit">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg font-semibold flex-1">
                                        Q{parsedResponse.questionOrder || index + 1}. {parsedResponse.questionContent}
                                </CardTitle>
                                    <div className="flex items-center gap-2">
                                <Badge className="bg-primary-100 text-primary-800 border-primary-200 w-fit flex-shrink-0">
                                            {parsedResponse.questionType}
                                        </Badge>
                                        {parsedResponse.isVisited && (
                                            <Badge variant="outline" className="text-xs">
                                                Visited
                                            </Badge>
                                        )}
                                        {parsedResponse.isMarkedForReview && (
                                            <Badge variant="outline" className="text-xs">
                                                Marked for Review
                                </Badge>
                                        )}
                                    </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                                <div className="space-y-4">
                                    {/* Response Data */}
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-2">Response:</div>
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                            <p className="text-sm font-medium">
                                                {parsedResponse.formattedAnswer}
                                            </p>
                                        </div>
                                    </div>


                            </div>
                        </CardContent>
                    </Card>
                    );
                }) || (
                    <div className="col-span-2 text-center py-8">
                        <p className="text-gray-500">No responses available for this respondent.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
