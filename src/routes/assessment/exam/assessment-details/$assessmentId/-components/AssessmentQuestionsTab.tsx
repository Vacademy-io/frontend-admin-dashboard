import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle } from "phosphor-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const AssessmentQuestionsTab = () => {
    return (
        <Accordion type="single" collapsible>
            <AccordionItem value={`section-1`}>
                <AccordionTrigger className="flex items-center justify-between">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center justify-start text-primary-500">
                            <h1 className="!ml-0 w-20 border-none !pl-0 text-primary-500">
                                Biology
                            </h1>
                            <span className="font-thin !text-neutral-600">
                                (MCQ(Single Correct):&nbsp; ,&nbsp; MCQ(Multiple Correct):&nbsp;
                                ,&nbsp; <span className="font-semibold">Total:&nbsp;</span> )
                            </span>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-8">
                    <div className="flex items-center justify-between rounded-md border border-primary-200 px-4 py-2">
                        <h1>The Human Eye and The Colourful World</h1>
                        <div className="flex items-center">
                            <span className="text-primary-500">View</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1>Section Description</h1>
                        <p className="font-thin">
                            Challenge your understanding of the chapter Human Eye with this test.
                            Dive into topics such as the structure of the eye, vision mechanisms,
                            common visual defects, and their corrections. Sharpen your knowledge and
                            prepare effectively!
                        </p>
                    </div>
                    <div className="flex w-96 items-center justify-start gap-8 text-sm font-thin">
                        <h1 className="font-normal">Question Duration:</h1>
                        <div className="flex items-center gap-1">
                            <span>2</span>
                            <span>hrs</span>
                            <span>:</span>
                            <span>30</span>
                            <span>minutes</span>
                        </div>
                    </div>
                    <div className="flex w-96 items-center justify-start gap-8 text-sm font-thin">
                        <h1 className="font-normal">Section Duration:</h1>
                        <div className="flex items-center gap-1">
                            <span>2</span>
                            <span>hrs</span>
                            <span>:</span>
                            <span>30</span>
                            <span>minutes</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-8 text-sm font-thin">
                        <h1 className="font-normal">Marks Per Question (Default):</h1>
                        <span>2</span>
                    </div>
                    <div className="flex w-1/2 items-center justify-between">
                        <div className="flex w-52 items-center justify-start gap-8">
                            <h1>Negative Marking:</h1>
                            <span className="font-thin">2</span>
                        </div>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                    <div className="flex w-1/2 items-center justify-between">
                        <h1>Partial Marking:</h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                    <div className="flex w-1/2 items-center justify-between">
                        <h1>Cutoff Marking:</h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                    <div className="flex w-1/2 items-center justify-between">
                        <h1>Problem Randamization:</h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>

                    <div>
                        <h1 className="mb-4 text-primary-500">Adaptive Marking Rules</h1>
                        <Table>
                            <TableHeader className="bg-primary-200">
                                <TableRow>
                                    <TableHead>Q.No.</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Question Type</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Penalty</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-neutral-50">
                                <TableRow>
                                    <TableCell>1</TableCell>
                                    <TableCell>Test Question Name 1</TableCell>
                                    <TableCell>MCQM</TableCell>
                                    <TableCell>2</TableCell>
                                    <TableCell>1</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            2<span>:</span>3
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                        <span>Total Marks</span>
                        <span>:</span>
                        <h1>20</h1>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
