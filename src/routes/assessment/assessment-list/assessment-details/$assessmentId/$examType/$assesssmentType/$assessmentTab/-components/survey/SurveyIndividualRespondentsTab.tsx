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

interface SurveyIndividualRespondentsTabProps {
    assessmentId: string;
    sectionIds?: string;
    assessmentName?: string;
}

export const SurveyIndividualRespondentsTab: React.FC<SurveyIndividualRespondentsTabProps> = ({ assessmentId, sectionIds, assessmentName }) => {
    const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
    const [pageInput, setPageInput] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10;

    const { data, loading, error } = useSurveyRespondents(assessmentId, pageNo, pageSize, assessmentName, sectionIds);

    const currentRespondent = data?.respondents[currentRespondentIndex];
    const totalRespondents = data?.respondents.length || 0;

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
            if (pageNumber >= 1 && pageNumber <= totalRespondents) {
                setCurrentRespondentIndex(pageNumber - 1);
            } else {
                // Reset to current page if invalid input
                setPageInput((currentRespondentIndex + 1).toString());
            }
        }
    };

    const handlePageInputBlur = () => {
        const pageNumber = parseInt(pageInput);
        if (pageNumber >= 1 && pageNumber <= totalRespondents) {
            setCurrentRespondentIndex(pageNumber - 1);
        } else {
            // Reset to current page if invalid input
            setPageInput((currentRespondentIndex + 1).toString());
        }
    };

    // Update page input when currentRespondentIndex changes
    React.useEffect(() => {
        setPageInput((currentRespondentIndex + 1).toString());
    }, [currentRespondentIndex]);

    // Reset to first respondent when data changes
    React.useEffect(() => {
        if (data?.respondents?.length) {
            setCurrentRespondentIndex(0);
        }
    }, [data?.respondents]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading survey respondents...</span>
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
                            of {totalRespondents}
                        </span>
                    </div>
                    {data?.pagination && (
                        <div className="text-xs text-gray-400 mt-1">
                            Page {data.pagination.pageNo} of {data.pagination.totalPages}
                        </div>
                    )}
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
                {currentRespondent?.responses?.map((response, index) => (
                    <Card key={response.id} className="h-fit">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg font-semibold flex-1">
                                    Q{index + 1}. Survey Question {index + 1}
                                </CardTitle>
                                <Badge className="bg-primary-100 text-primary-800 border-primary-200 w-fit flex-shrink-0">
                                    Response
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">Response:</div>
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-sm">
                                        {Array.isArray(response.answer)
                                            ? response.answer.join(', ')
                                            : response.answer}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) || (
                    <div className="col-span-2 text-center py-8">
                        <p className="text-gray-500">No responses available for this respondent.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
