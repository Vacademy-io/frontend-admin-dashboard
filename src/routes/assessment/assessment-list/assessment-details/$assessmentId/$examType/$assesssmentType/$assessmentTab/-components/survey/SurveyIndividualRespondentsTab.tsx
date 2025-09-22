import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Mock data for multiple respondents
const mockRespondentsData = [
    {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        responses: [
            {
                id: "q1",
                questionText: "Which subject do you find the most engaging in this course?",
                questionType: "MCQ Single Choice",
                answer: "Mathematics"
            },
            {
                id: "q2",
                questionText: "Which learning methods help you understand best? (Select all that apply)",
                questionType: "MCQ Multiple Choice",
                answer: ["Visual Aids", "Hands-on Practice"]
            },
            {
                id: "q3",
                questionText: "The course materials provided were easy to follow.",
                questionType: "True/False",
                answer: "True"
            },
            {
                id: "q4",
                questionText: "What one improvement would make this course more effective?",
                questionType: "Short Answer",
                answer: "More practical examples would help understand concepts better"
            },
            {
                id: "q5",
                questionText: "Please provide detailed feedback about your overall learning experience.",
                questionType: "Long Answer",
                answer: "The course structure is well-organized and the instructor explains concepts clearly. However, I would appreciate more real-world examples and case studies to better understand how these concepts apply in practice."
            },
            {
                id: "q6",
                questionText: "How would you rate this course overall? (Enter a number from 1-10)",
                questionType: "Numerical",
                answer: "8"
            }
        ]
    },
    {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        responses: [
            {
                id: "q1",
                questionText: "Which subject do you find the most engaging in this course?",
                questionType: "MCQ Single Choice",
                answer: "Science"
            },
            {
                id: "q2",
                questionText: "Which learning methods help you understand best? (Select all that apply)",
                questionType: "MCQ Multiple Choice",
                answer: ["Group Discussion", "Reading Materials"]
            },
            {
                id: "q3",
                questionText: "The course materials provided were easy to follow.",
                questionType: "True/False",
                answer: "False"
            },
            {
                id: "q4",
                questionText: "What one improvement would make this course more effective?",
                questionType: "Short Answer",
                answer: "More interactive content and video tutorials"
            },
            {
                id: "q5",
                questionText: "Please provide detailed feedback about your overall learning experience.",
                questionType: "Long Answer",
                answer: "Great course overall! The materials are comprehensive and the pace is just right. My only suggestion would be to include more interactive elements and group activities."
            },
            {
                id: "q6",
                questionText: "How would you rate this course overall? (Enter a number from 1-10)",
                questionType: "Numerical",
                answer: "9"
            }
        ]
    },
    {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        responses: [
            {
                id: "q1",
                questionText: "Which subject do you find the most engaging in this course?",
                questionType: "MCQ Single Choice",
                answer: "Literature"
            },
            {
                id: "q2",
                questionText: "Which learning methods help you understand best? (Select all that apply)",
                questionType: "MCQ Multiple Choice",
                answer: ["Visual Aids", "Reading Materials"]
            },
            {
                id: "q3",
                questionText: "The course materials provided were easy to follow.",
                questionType: "True/False",
                answer: "True"
            },
            {
                id: "q4",
                questionText: "What one improvement would make this course more effective?",
                questionType: "Short Answer",
                answer: "Better pacing and more step-by-step examples"
            },
            {
                id: "q5",
                questionText: "Please provide detailed feedback about your overall learning experience.",
                questionType: "Long Answer",
                answer: "I found the course content valuable but sometimes difficult to follow. More visual aids and step-by-step examples would be helpful for understanding complex concepts."
            },
            {
                id: "q6",
                questionText: "How would you rate this course overall? (Enter a number from 1-10)",
                questionType: "Numerical",
                answer: "7"
            }
        ]
    },
    {
        id: "4",
        name: "Sarah Wilson",
        email: "sarah@example.com",
        responses: [
            {
                id: "q1",
                questionText: "Which subject do you find the most engaging in this course?",
                questionType: "MCQ Single Choice",
                answer: "History"
            },
            {
                id: "q2",
                questionText: "Which learning methods help you understand best? (Select all that apply)",
                questionType: "MCQ Multiple Choice",
                answer: ["Hands-on Practice", "Group Discussion"]
            },
            {
                id: "q3",
                questionText: "The course materials provided were easy to follow.",
                questionType: "True/False",
                answer: "True"
            },
            {
                id: "q4",
                questionText: "What one improvement would make this course more effective?",
                questionType: "Short Answer",
                answer: "More real-world applications and case studies"
            },
            {
                id: "q5",
                questionText: "Please provide detailed feedback about your overall learning experience.",
                questionType: "Long Answer",
                answer: "The course is well-structured and the instructor is knowledgeable. I particularly enjoyed the practical examples and would like to see more case studies from different industries."
            },
            {
                id: "q6",
                questionText: "How would you rate this course overall? (Enter a number from 1-10)",
                questionType: "Numerical",
                answer: "8"
            }
        ]
    },
    {
        id: "5",
        name: "David Brown",
        email: "david@example.com",
        responses: [
            {
                id: "q1",
                questionText: "Which subject do you find the most engaging in this course?",
                questionType: "MCQ Single Choice",
                answer: "Mathematics"
            },
            {
                id: "q2",
                questionText: "Which learning methods help you understand best? (Select all that apply)",
                questionType: "MCQ Multiple Choice",
                answer: ["Visual Aids", "Hands-on Practice", "Reading Materials"]
            },
            {
                id: "q3",
                questionText: "The course materials provided were easy to follow.",
                questionType: "True/False",
                answer: "True"
            },
            {
                id: "q4",
                questionText: "What one improvement would make this course more effective?",
                questionType: "Short Answer",
                answer: "More practice exercises and quizzes"
            },
            {
                id: "q5",
                questionText: "Please provide detailed feedback about your overall learning experience.",
                questionType: "Long Answer",
                answer: "Excellent course with clear explanations and good pacing. The practice exercises are very helpful. I would recommend adding more interactive elements and peer discussion opportunities."
            },
            {
                id: "q6",
                questionText: "How would you rate this course overall? (Enter a number from 1-10)",
                questionType: "Numerical",
                answer: "9"
            }
        ]
    },
    {
        id: "6",
        name: "Lisa Davis",
        email: "lisa@example.com",
        responses: [
            {
                id: "q1",
                questionText: "Which subject do you find the most engaging in this course?",
                questionType: "MCQ Single Choice",
                answer: "Science"
            },
            {
                id: "q2",
                questionText: "Which learning methods help you understand best? (Select all that apply)",
                questionType: "MCQ Multiple Choice",
                answer: ["Visual Aids", "Group Discussion"]
            },
            {
                id: "q3",
                questionText: "The course materials provided were easy to follow.",
                questionType: "True/False",
                answer: "False"
            },
            {
                id: "q4",
                questionText: "What one improvement would make this course more effective?",
                questionType: "Short Answer",
                answer: "Clearer instructions and better organization of materials"
            },
            {
                id: "q5",
                questionText: "Please provide detailed feedback about your overall learning experience.",
                questionType: "Long Answer",
                answer: "The course has good content but could be better organized. Some concepts are explained well while others need more clarity. More visual aids and step-by-step breakdowns would be beneficial."
            },
            {
                id: "q6",
                questionText: "How would you rate this course overall? (Enter a number from 1-10)",
                questionType: "Numerical",
                answer: "6"
            }
        ]
    }
];

export const SurveyIndividualRespondentsTab: React.FC = () => {
    const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
    const [pageInput, setPageInput] = useState('');

    const currentRespondent = mockRespondentsData[currentRespondentIndex];
    const totalRespondents = mockRespondentsData.length;

    const handlePrevious = () => {
        if (currentRespondentIndex > 0) {
            setCurrentRespondentIndex(currentRespondentIndex - 1);
            setPageInput((currentRespondentIndex).toString());
        }
    };

    const handleNext = () => {
        if (currentRespondentIndex < totalRespondents - 1) {
            setCurrentRespondentIndex(currentRespondentIndex + 1);
            setPageInput((currentRespondentIndex + 2).toString());
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

    return (
        <div className="space-y-6">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentRespondentIndex <= 0}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="text-center">
                    <div className="font-semibold text-lg">{currentRespondent.name}</div>
                    <div className="text-sm text-gray-600">{currentRespondent.email}</div>
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
                </div>

                <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentRespondentIndex >= totalRespondents - 1}
                    className="flex items-center gap-2"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Individual Responses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentRespondent.responses.map((response, index) => (
                    <Card key={response.id} className="h-fit">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg font-semibold flex-1">
                                    Q{index + 1}. {response.questionText}
                                </CardTitle>
                                <Badge className="bg-primary-100 text-primary-800 border-primary-200 w-fit flex-shrink-0">
                                    {response.questionType}
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
                ))}
            </div>
        </div>
    );
};
