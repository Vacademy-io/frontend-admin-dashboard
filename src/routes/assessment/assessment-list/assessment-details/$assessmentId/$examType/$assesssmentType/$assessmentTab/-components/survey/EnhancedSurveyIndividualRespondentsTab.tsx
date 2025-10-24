import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Eye, EyeOff } from 'lucide-react';
import { useEnhancedSurveyRespondents } from './hooks/useEnhancedSurveyData';
import { useBatchNames } from './hooks/useBatchNames';

interface EnhancedSurveyIndividualRespondentsTabProps {
  assessmentId: string;
  sectionIds?: string[];
  assessmentName?: string;
}

export const EnhancedSurveyIndividualRespondentsTab: React.FC<EnhancedSurveyIndividualRespondentsTabProps> = ({
  assessmentId,
  sectionIds = [],
  assessmentName
}) => {
  const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
  const [pageInput, setPageInput] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const pageSize = 100; // Increased to get more respondents per page
  const { getBatchName } = useBatchNames();

  const { data, loading, error } = useEnhancedSurveyRespondents(
    assessmentId,
    sectionIds,
    pageNo,
    pageSize,
    assessmentName
  );

  const currentRespondent = data?.respondents[currentRespondentIndex];
  const totalRespondents = data?.respondents.length || 0;
  const totalElements = data?.respondents.length || 0; // Use unique respondents count instead of API totalElements

  // Calculate global respondent number across all pages
  const globalRespondentNumber = ((pageNo - 1) * pageSize) + currentRespondentIndex + 1;

  const handlePrevious = () => {
    if (currentRespondentIndex > 0) {
      setCurrentRespondentIndex(currentRespondentIndex - 1);
      setPageInput((currentRespondentIndex).toString());
    } else if (pageNo > 1) {
      // Load previous page
      setPageNo(pageNo - 1);
      setCurrentRespondentIndex(pageSize - 1);
    }
  };

  const handleNext = () => {
    if (currentRespondentIndex < totalRespondents - 1) {
      setCurrentRespondentIndex(currentRespondentIndex + 1);
      setPageInput((currentRespondentIndex + 2).toString());
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
      if (pageNumber >= 1 && pageNumber <= totalElements) {
        // Calculate which page and index this respondent is on
        const targetPage = Math.ceil(pageNumber / pageSize);
        const targetIndex = (pageNumber - 1) % pageSize;

        if (targetPage !== pageNo) {
          setPageNo(targetPage);
        }
        setCurrentRespondentIndex(targetIndex);
      } else {
        // Reset to current respondent if invalid input
        setPageInput(globalRespondentNumber.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalElements) {
      // Calculate which page and index this respondent is on
      const targetPage = Math.ceil(pageNumber / pageSize);
      const targetIndex = (pageNumber - 1) % pageSize;

      if (targetPage !== pageNo) {
        setPageNo(targetPage);
      }
      setCurrentRespondentIndex(targetIndex);
    } else {
      // Reset to current respondent if invalid input
      setPageInput(globalRespondentNumber.toString());
    }
  };

  // Update page input when respondent changes
  React.useEffect(() => {
    setPageInput(globalRespondentNumber.toString());
  }, [globalRespondentNumber]);

  const getQuestionTypeBadge = (questionType: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      'MCQS': { label: 'Single Choice', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'MCQM': { label: 'Multiple Choice', className: 'bg-green-100 text-green-800 border-green-200' },
      'TRUE_FALSE': { label: 'True/False', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'NUMERIC': { label: 'Numeric', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      'ONE_WORD': { label: 'One Word', className: 'bg-pink-100 text-pink-800 border-pink-200' },
      'LONG_ANSWER': { label: 'Long Answer', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };
    return typeMap[questionType] || { label: questionType, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const formatUserAnswer = (response: any) => {
    if (!response.userAnswer) return 'No response';

    switch (response.questionType) {
      case 'MCQS':
      case 'MCQM':
      case 'TRUE_FALSE':
        if (response.userAnswer.optionIds && response.userAnswer.optionIds.length > 0) {
          const selectedOptions = response.options.filter((opt: any) =>
            response.userAnswer.optionIds.includes(opt.id)
          );
          return selectedOptions.map((opt: any) => opt.content).join(', ');
        }
        return 'No response';

      case 'NUMERIC':
        return response.userAnswer.validAnswer !== null ?
          response.userAnswer.validAnswer.toString() : 'No response';

      case 'ONE_WORD':
      case 'LONG_ANSWER':
        return response.userAnswer.answer || 'No response';

      default:
        return 'Unknown answer format';
    }
  };

  const formatCorrectAnswer = (response: any) => {
    if (!response.correctAnswer) return 'No correct answer available';

    switch (response.questionType) {
      case 'MCQS':
      case 'MCQM':
      case 'TRUE_FALSE':
        if (response.correctAnswer.options && response.correctAnswer.options.length > 0) {
          return response.correctAnswer.options.map((opt: any) => opt.content).join(', ');
        }
        return 'No correct options available';

      case 'NUMERIC':
        return response.correctAnswer.validAnswers ?
          response.correctAnswer.validAnswers.join(', ') : 'No correct answer available';

      case 'ONE_WORD':
      case 'LONG_ANSWER':
        return response.correctAnswer.answer || 'No correct answer available';

      default:
        return 'Unknown correct answer format';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading enhanced survey data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!currentRespondent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No respondents found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with respondent info and navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentRespondent.name}
            </h2>
            <p className="text-sm text-gray-600">{currentRespondent.email}</p>
            {currentRespondent.source_id && (
              <p className="text-xs text-gray-500 mt-1">
                Batch: {getBatchName(currentRespondent.source_id)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {currentRespondent.correctAnswers}/{currentRespondent.totalQuestions} Correct
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {currentRespondent.accuracy.toFixed(1)}% Accuracy
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentRespondentIndex === 0 && pageNo === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              onBlur={handlePageInputBlur}
              className="w-16 text-center"
              min="1"
              max={totalElements}
            />
            <span className="text-sm text-gray-500">of {totalElements}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentRespondentIndex === totalRespondents - 1 && data?.pagination?.last}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Individual Responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {currentRespondent?.responses?.map((response: any, index: number) => {
          const typeBadge = getQuestionTypeBadge(response.questionType);

          return (
            <Card key={response.questionId} className="h-fit">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold flex-1">
                    Q{response.questionOrder}. {response.questionContent}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={typeBadge.className}>
                      {typeBadge.label}
                    </Badge>
                    {response.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User Answer */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">User Answer:</span>
                      {response.isVisited ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      {response.isMarkedForReview && (
                        <Badge variant="outline" className="text-xs">
                          Marked for Review
                        </Badge>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      response.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <p className="text-sm font-medium">
                        {formatUserAnswer(response)}
                      </p>
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm">
                        {formatCorrectAnswer(response)}
                      </p>
                    </div>
                  </div>

                  {/* Options (for MCQ questions) */}
                  {(response.questionType === 'MCQS' || response.questionType === 'MCQM' || response.questionType === 'TRUE_FALSE') && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">All Options:</div>
                      <div className="space-y-2">
                        {response.options.map((option: any, optIndex: number) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border text-sm ${
                              response.userAnswer.optionIds?.includes(option.id)
                                ? response.isCorrect
                                  ? 'bg-green-100 border-green-300 text-green-800'
                                  : 'bg-red-100 border-red-300 text-red-800'
                                : option.isCorrect
                                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.content}</span>
                              {option.isCorrect && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {response.timeTaken}s
                      </span>
                    </div>
                    <span>Question #{response.questionOrder}</span>
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
