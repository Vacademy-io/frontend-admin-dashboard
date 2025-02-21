import { Question } from "./Question";

export function QuestionDisplay() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-row justify-between border-b px-8 py-4">
                <div className="text-h3">Question Number</div>
                <div className="text-primary-500">Show answers</div>
            </div>
            <div className="ml-5 mt-5 flex flex-col gap-6">
                <Question />
                <Question />
                <Question />
            </div>
        </div>
    );
}
