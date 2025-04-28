import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from "@/svgs";
import { QuestionType as QuestionTypeList } from "@/constants/dummy-data";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { questionsFormSchema } from "@/routes/assessment/question-papers/-utils/question-form-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContentStore } from "../../-stores/chapter-sidebar-store";

export interface QuestionTypeProps {
    icon: React.ReactNode; // Accepts an SVG or any React component
    text: string; // Accepts the text label
    type?: QuestionTypeList;
    handleAddQuestion: (type: string) => void;
}
export type QuestionPaperFormType = z.infer<typeof questionsFormSchema>;

const AddQuestionDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { setItems, items } = useContentStore();
    console.log(items);
    const form = useForm<QuestionPaperFormType>({
        resolver: zodResolver(questionsFormSchema),
        mode: "onChange",
        defaultValues: {
            questionId: undefined,
            questionName: "",
            explanation: "",
            questionType: "MCQS",
            questionPenalty: "",
            questionDuration: {
                hrs: "",
                min: "",
            },
            questionMark: "",
            singleChoiceOptions: [],
            multipleChoiceOptions: [],
            csingleChoiceOptions: [],
            cmultipleChoiceOptions: [],
            trueFalseOptions: [],
            parentRichTextContent: null,
            decimals: undefined,
            numericType: undefined,
            validAnswers: null,
            questionResponseType: null,
            subjectiveAnswerText: "",
        },
    });
    console.log(openState);
    const QuestionType = ({
        icon,
        text,
        type = QuestionTypeList.MCQS,
        handleAddQuestion,
    }: QuestionTypeProps) => {
        return (
            <div
                className="w-full"
                onClick={() => {
                    handleAddQuestion(type);
                }}
            >
                <div className="flex w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-3">
                    {icon}
                    <div className="text-body">{text}</div>
                </div>
            </div>
        );
    };

    const handleAddQuestion = (newQuestionType: string) => {
        form.reset({
            ...form.getValues(),
            questionType: newQuestionType,
        });
        setItems([
            {
                slide_title: null,
                document_id: null,
                document_title: `${form.getValues("questionType")} slide`,
                document_type: form.getValues("questionType"),
                slide_description: null,
                document_cover_file_id: null,
                video_description: null,
                document_data: JSON.stringify(form.getValues()),
                video_id: null,
                video_title: null,
                video_url: null,
                slide_id: String(items.length + 1),
                source_type: "QUESTION",
                status: "DRAFT",
                published_data: "",
                published_url: "",
                last_sync_date: null,
            },
            ...items,
        ]);
        form.trigger();
    };
    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Quick Access</div>
                <QuestionType
                    icon={<MCQS />}
                    text="Multiple Choice Questions (Single correct)"
                    type={QuestionTypeList.MCQS}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<MCQM />}
                    text="Multiple Choice Questions (Multiple correct)"
                    type={QuestionTypeList.MCQM}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<Numerical />}
                    text="Numerical"
                    type={QuestionTypeList.NUMERIC}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    type={QuestionTypeList.TRUE_FALSE}
                    icon={<TrueFalse />}
                    text="True False"
                    handleAddQuestion={handleAddQuestion}
                />
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Option Based</div>
                <QuestionType
                    icon={<MCQS />}
                    text="Multiple Choice Questions (Single correct)"
                    type={QuestionTypeList.MCQS}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<MCQM />}
                    text="Multiple Choice Questions (Multiple correct)"
                    type={QuestionTypeList.MCQM}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Math Based</div>
                <QuestionType
                    icon={<Numerical />}
                    text="Numerical"
                    type={QuestionTypeList.NUMERIC}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Writing Skills</div>
                <QuestionType
                    icon={<LongAnswer />}
                    type={QuestionTypeList.LONG_ANSWER}
                    text="Long Answer"
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<SingleWord />}
                    type={QuestionTypeList.ONE_WORD}
                    text="Single Word"
                    handleAddQuestion={handleAddQuestion}
                />
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Reading Skills</div>
                <QuestionType
                    icon={<CMCQS />}
                    text="Comprehension Multiple Choice Questions (Single correct)"
                    type={QuestionTypeList.CMCQS}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<CMCQM />}
                    text="Comprehension Multiple Choice Questions (Multiple correct)"
                    type={QuestionTypeList.CMCQM}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<CMCQM />}
                    text="Comprehension Numeric"
                    type={QuestionTypeList.CNUMERIC}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>
        </>
    );
};

export default AddQuestionDialog;
