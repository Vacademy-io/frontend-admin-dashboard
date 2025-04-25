import { Separator } from "@/components/ui/separator";
import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

const EvaluateReportPreview = ({ openDialog = false }: { openDialog: boolean }) => {
    const [open, setOpen] = useState(openDialog);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <div className="flex h-screen w-screen flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Feedback Report</h1>
                        <MyButton type="button" scale="large" buttonType="secondary">
                            Export
                        </MyButton>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">Lecture Title:&nbsp;</span>
                                <span className="text-sm font-thin">tg</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">Duration:&nbsp;</span>
                                <span className="text-sm font-thin">en</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">
                                    Evaluation Date:&nbsp;
                                </span>
                                <span className="text-sm font-thin">3/3/3</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col items-center">
                                <span className="text-sm">Total Score</span>
                                <span className="font-bold text-neutral-400">83/100</span>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        <span className="font-semibold">Evaluation Criteria</span>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">1. Delivery & Presentation</h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Clarity of Speech: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Tone and Expression: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold"> • Pacing: &nbsp;</span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">2. Content Quality</h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Accuracy: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Organization: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Depth and Relevance: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">3. Student Engagement</h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Accuracy: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Organization: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Depth and Relevance: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">4. Assessment & Feedback</h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Checks for Understanding: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Responsiveness: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">5. Inclusivity & Language</h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Accessibility: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Cultural Sensitivity: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">
                                    6. Classroom Management (Audible Cues)
                                </h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Discipline: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Time Management: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">
                                    7. Teaching Aids (Inferred from Audio)
                                </h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • References to Visuals/Resources: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Audio Resources: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <h1 className="font-semibold">8. Professionalism</h1>
                                <span className="text-primary-300">(Score: 17/20)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Preparation: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="text-sm font-semibold">
                                        {" "}
                                        • Conclusion: &nbsp;
                                    </span>
                                    <span className="text-sm font-thin">
                                        Speaker enunciated words clearly, maintained a moderate
                                        pace, and used minimal filler words.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EvaluateReportPreview;
