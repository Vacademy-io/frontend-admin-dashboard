import { Question } from "./Question";
import { useEffect, useState } from "react";
import { getQuestionPaperById } from "../-service/utils";
import { Question as QusetionDto } from "@/types/community/filters/questionDto";

export function QuestionDisplay({ id }: { id: string }) {
    const [questions, setQuestions] = useState<QusetionDto[]>();
    const fetchQuestions = async () => {
        const response = await getQuestionPaperById(id);
        setQuestions(response.question_dtolist);
    };
    useEffect(() => {
        if (id) {
            fetchQuestions();
        }
    }, [id]);
    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-row justify-between border-b px-8 py-4">
                <div className="text-h3">Question Number</div>
                <div className="text-primary-500">Show answers</div>
            </div>
            <div className="my-5 ml-5 flex flex-col gap-6">
                {questions?.map((question, idx) => (
                    <Question key={question.id} idx={idx} questionData={question} />
                ))}
            </div>
        </div>
    );
}
