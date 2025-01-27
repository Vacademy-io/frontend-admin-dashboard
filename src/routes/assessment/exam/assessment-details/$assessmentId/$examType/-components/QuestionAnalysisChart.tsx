import { useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DotOutline } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QuestionInsightsComponent } from "./QuestionInsights";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowCounterClockwise, Export } from "phosphor-react";
import { questionInsightsData } from "../-utils/dummy-data";

const chartConfig = {
    correct: { label: "Correct", color: "#97D4B4" },
    partiallyCorrect: { label: "Partially Correct", color: "#FFDD82" },
    wrongResponses: { label: "Wrong Responses", color: "#F49898" },
    skip: { label: "Skip", color: "#EEE" },
} satisfies ChartConfig;

export function AssessmentDetailsQuestionAnalysisChart({
    selectedSectionData,
}: {
    selectedSectionData: (typeof questionInsightsData)[0];
}) {
    const [visibleKeys, setVisibleKeys] = useState<string[]>([
        "correct",
        "partiallyCorrect",
        "wrongResponses",
        "skip",
    ]);

    const toggleKey = (key: string) => {
        setVisibleKeys((prev) => {
            // If the key is the last item, prevent toggling
            if (prev.length === 1 && prev.includes(key)) {
                return prev; // No change if it's the last value
            }

            return prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
        });
    };

    // Format data for the chart based on the selected section's questions
    const chartData = selectedSectionData.questions.map((question, index) => {
        const { correct, partiallyCorrect, wrongResponse, skipped } =
            question.questionAttemptedAnalysis;
        return {
            questionId: index + 1,
            correct,
            partiallyCorrect,
            wrongResponses: wrongResponse,
            skip: skipped,
            total: correct + partiallyCorrect + wrongResponse + skipped,
        };
    });

    return (
        <div>
            <div className="flex flex-row items-center justify-end">
                {Object.keys(chartConfig).map((key) => (
                    <div
                        key={key}
                        className="flex cursor-pointer items-center space-x-2"
                        onClick={() => toggleKey(key)}
                    >
                        <DotOutline
                            size={70}
                            weight="fill"
                            style={{
                                color: visibleKeys.includes(key)
                                    ? chartConfig[key as keyof typeof chartConfig].color
                                    : "#D1D5DB",
                                marginRight: "-1.5rem",
                            }}
                        />
                        <p
                            className={`text-[14px] ${
                                visibleKeys.includes(key) ? "" : "line-through"
                            }`}
                        >
                            {chartConfig[key as keyof typeof chartConfig].label}
                        </p>
                    </div>
                ))}
                <Dialog>
                    <DialogTrigger>
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="secondary"
                            className="ml-6 font-medium"
                        >
                            Check Question Insights
                        </MyButton>
                    </DialogTrigger>
                    <DialogContent className="no-scrollbar !m-0 h-full !w-full !max-w-full !gap-0 overflow-y-auto !rounded-none !p-0">
                        <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                            Question Insights
                        </h1>
                        <QuestionInsightsComponent />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig}>
                <BarChart data={chartData} margin={{ left: 12, right: 12, bottom: 50 }}>
                    <XAxis
                        dataKey="questionId"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={true}
                        label={{
                            value: "Question",
                            position: "left",
                            dx: 60,
                            dy: 30,
                            style: { fontSize: "14px", fill: "#ED7424" },
                        }}
                    />
                    <YAxis
                        dataKey="total"
                        tickLine={false}
                        axisLine={true}
                        tickMargin={8}
                        label={{
                            value: "Number of Participants",
                            angle: -90,
                            position: "left",
                            dx: 10,
                            dy: 10,
                            style: { fontSize: "14px", fill: "#ED7424" },
                        }}
                    />
                    {visibleKeys.includes("correct") && (
                        <Bar dataKey="correct" stackId="a" fill={chartConfig.correct.color} />
                    )}
                    {visibleKeys.includes("partiallyCorrect") && (
                        <Bar
                            dataKey="partiallyCorrect"
                            stackId="a"
                            fill={chartConfig.partiallyCorrect.color}
                        />
                    )}
                    {visibleKeys.includes("wrongResponses") && (
                        <Bar
                            dataKey="wrongResponses"
                            stackId="a"
                            fill={chartConfig.wrongResponses.color}
                        />
                    )}
                    {visibleKeys.includes("skip") && (
                        <Bar dataKey="skip" stackId="a" fill={chartConfig.skip.color} />
                    )}
                    <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={false}
                        defaultIndex={1}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
}

export function QuestionAnalysisChart() {
    const [selectedSection, setSelectedSection] = useState<string>("Section 1");

    // Find the selected section's data
    const selectedSectionData = questionInsightsData.find(
        (section) => section.sectionName === selectedSection,
    )!;

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between">
                <h1>Question Analysis</h1>
                <div className="flex items-center gap-6">
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {questionInsightsData.map((section) => (
                                <SelectItem key={section.id} value={section.sectionName}>
                                    {section.sectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="font-medium"
                    >
                        <Export size={32} />
                        Export
                    </MyButton>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="min-w-8 font-medium"
                    >
                        <ArrowCounterClockwise size={32} />
                    </MyButton>
                </div>
            </div>
            <AssessmentDetailsQuestionAnalysisChart selectedSectionData={selectedSectionData} />
        </div>
    );
}
