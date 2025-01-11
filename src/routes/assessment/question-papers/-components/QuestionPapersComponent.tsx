import { Helmet } from "react-helmet";
import { QuestionPapersHeading } from "./QuestionPapersHeading";
import { QuestionPapersTabs } from "./QuestionPapersTabs";

export function QuestionPapersComponent() {
    return (
        <>
            <Helmet>
                <title>Question Papers</title>
                <meta
                    name="description"
                    content="This page shows show all the added question papers and also you can add question papers here too."
                />
            </Helmet>
            <div className="flex flex-col gap-4">
                <QuestionPapersHeading />
                <QuestionPapersTabs />
            </div>
        </>
    );
}
