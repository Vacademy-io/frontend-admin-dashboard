import { Pie, PieChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { MyButton } from "@/components/design-system/button";
import { DotOutline } from "@phosphor-icons/react";
import { Crown, Person } from "@/svgs";
import { ArrowCounterClockwise, Export } from "phosphor-react";
import { useState } from "react";
import { AssessmentDetailsSearchComponent } from "./SearchComponent";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QuestionAssessmentStatus from "./QuestionAssessmentStatus";
import { overviewTabCloseTestData } from "../-utils/dummy-data-close";
import { overviewTabOpenTestData } from "../-utils/dummy-data-open";

const chartData = [
    {
        browser: "ongoing",
        visitors: overviewTabCloseTestData.assessmentStatus[2]?.studentDetails.length,
        fill: "#97D4B4",
    },
    {
        browser: "pending",
        visitors: overviewTabCloseTestData.assessmentStatus[1]?.studentDetails.length,
        fill: "#FAD6AE",
    },
    {
        browser: "attempted",
        visitors: overviewTabCloseTestData.assessmentStatus[0]?.studentDetails.length,
        fill: "#E5F5EC",
    },
];

const chartConfig = {
    ongoing: {
        label: "Ongoing",
        color: "hsl(var(--chart-2))",
    },
    pending: {
        label: "Pending",
        color: "hsl(var(--chart-3))",
    },
    attempted: {
        label: "Attempted",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export function AssessmentDetailsPieChart() {
    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="visitors" nameKey="browser" />
            </PieChart>
        </ChartContainer>
    );
}

export function QuestionsPieChart() {
    const [searchText, setSearchText] = useState("");

    const clearSearch = () => {
        setSearchText("");
    };

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
    };
    return (
        <div className="mt-8 flex w-full gap-16">
            <div className="flex w-1/2 flex-col gap-8">
                <div className="flex justify-between text-[14px]">
                    <div className="flex flex-col gap-6">
                        <p>
                            <span className="font-normal text-black">Created on: </span>
                            <span>{overviewTabCloseTestData.createdOn}</span>
                        </p>
                        <p>
                            <span className="font-normal text-black">Start Date and Time: </span>
                            <span>{overviewTabCloseTestData.startDate}</span>
                        </p>
                        <p>
                            <span className="font-normal text-black">End Date and Time: </span>
                            <span>{overviewTabCloseTestData.endDate}</span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-6">
                        <p>
                            <span className="font-normal text-black">Subject: </span>
                            <span>{overviewTabCloseTestData.subject}</span>
                        </p>
                        <p>
                            <span className="font-normal text-black">Duration: </span>
                            <span>{overviewTabCloseTestData.duration} min</span>
                        </p>
                        <p>
                            <span className="font-normal text-black">Total Participants: </span>
                            <span>{overviewTabCloseTestData.totalParticipants}</span>
                        </p>
                    </div>
                </div>
                <div className="flex justify-evenly">
                    <div className="flex flex-col text-center">
                        <p className="text-1xl text-neutral-500">Avg. Duration</p>
                        <p className="text-center text-3xl font-semibold text-primary-500">
                            {overviewTabCloseTestData.avgDuration} min
                        </p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-1xl text-neutral-500">Avg. Marks</p>
                        <p className="text-center text-3xl font-semibold text-primary-500">
                            {overviewTabCloseTestData.avgMarks}
                        </p>
                    </div>
                </div>
                <div className="flex justify-center">
                    <Dialog>
                        <DialogTrigger>
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="secondary"
                                className="font-medium"
                            >
                                Check Assessment Status
                            </MyButton>
                        </DialogTrigger>
                        <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col items-start !gap-0 overflow-y-auto !rounded-none !p-0">
                            <h1 className="h-14 w-full bg-primary-50 p-4 font-semibold text-primary-500">
                                Assessment Status
                            </h1>
                            <QuestionAssessmentStatus
                                type="open"
                                studentsListData={overviewTabOpenTestData.assessmentStatus}
                            />
                            {/* <QuestionAssessmentStatus
                                type="close"
                                studentsListData={overviewTabCloseTestData.assessmentStatus}
                            /> */}
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex items-center">
                    <AssessmentDetailsPieChart />
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <DotOutline size={40} weight="fill" className="text-success-400" />
                            <p className="text-[14px]">
                                Ongoing (
                                {
                                    overviewTabCloseTestData.assessmentStatus[2]?.studentDetails
                                        .length
                                }
                                )
                            </p>
                        </div>
                        <div className="flex items-center">
                            <DotOutline size={40} weight="fill" className="text-primary-200" />
                            <p className="text-[14px]">
                                Pending (
                                {
                                    overviewTabCloseTestData.assessmentStatus[1]?.studentDetails
                                        .length
                                }
                                )
                            </p>
                        </div>
                        <div className="flex items-center">
                            <DotOutline size={40} weight="fill" className="text-success-100" />
                            <p className="text-[14px]">
                                Attempted (
                                {
                                    overviewTabCloseTestData.assessmentStatus[0]?.studentDetails
                                        .length
                                }
                                )
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex w-1/2 flex-col gap-4 rounded-xl border bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                    <h1>Leaderboard</h1>
                    <div className="flex items-center gap-6">
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
                <AssessmentDetailsSearchComponent
                    onSearch={handleSearch}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    clearSearch={clearSearch}
                />
                <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                    {overviewTabCloseTestData.studentLeaderboard.map((student, idx) => {
                        return (
                            <div
                                key={idx}
                                className={`flex items-center justify-between rounded-xl border ${
                                    student.rank === "1" ? "bg-primary-50" : "bg-white"
                                } p-4`}
                            >
                                <div className="flex items-center gap-4">
                                    <span>{student.rank}</span>
                                    {student.rank === "1" ? (
                                        <div>
                                            <Crown />
                                            <Person />
                                        </div>
                                    ) : (
                                        <Person />
                                    )}
                                    <div className="flex flex-col">
                                        <span>{student.name}</span>
                                        <span className="text-[12px]">{student.batch}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col text-neutral-500">
                                        <span className="text-[12px]">Percentile</span>
                                        <span>{student.percentile}</span>
                                    </div>
                                    <div className="flex flex-col text-center text-neutral-500">
                                        <span className="text-[12px]">Marks</span>
                                        <span>
                                            {student.scoredMarks}/{student.totalMarks}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
