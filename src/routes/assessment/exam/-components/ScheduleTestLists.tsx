import { MyButton } from "@/components/design-system/button";
import { Badge } from "@/components/ui/badge";
import { ReverseProgressBar } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { DotIcon, DotIconOffline, EmptyScheduleTest } from "@/svgs";
import {
    CheckCircle,
    Copy,
    DotsThree,
    DownloadSimple,
    LockSimple,
    PauseCircle,
} from "phosphor-react";
import {
    copyToClipboard,
    handleDownloadQRCode,
} from "../../create-assessment/$examtype/-utils/helper";
import QRCode from "react-qr-code";
import { MyPagination } from "@/components/design-system/pagination";
import { ScheduleTestListsProps } from "@/types/schedule-test-list";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { convertToLocalDateTime } from "@/constants/helper";

const ScheduleTestLists: React.FC<ScheduleTestListsProps> = ({ tab, pageNo, handlePageChange }) => {
    const navigate = useNavigate();
    const handleNavigateAssessment = (assessmentId: string) => {
        navigate({
            to: "/assessment/exam/assessment-details/$assessmentId",
            params: {
                assessmentId: assessmentId,
            },
        });
    };
    return (
        <TabsContent
            key={tab.value}
            value={tab.value}
            // className="my-4 flex flex-col gap-6 rounded-xl"
        >
            {tab.data.length === 0 ? (
                <div className="flex h-screen flex-col items-center justify-center">
                    <EmptyScheduleTest />
                    <span className="text-neutral-600">{tab.message}</span>
                </div>
            ) : (
                <>
                    {tab.data.content.map((item, index) => (
                        <div
                            key={index}
                            className="my-6 flex flex-col gap-4 rounded-xl border bg-neutral-50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h1 className="font-semibold">{item.name}</h1>
                                    <Badge
                                        className={`rounded-md border border-neutral-300 ${
                                            item.assessment_visibility === "PRIVATE"
                                                ? "bg-primary-50"
                                                : "bg-info-50"
                                        } py-1.5 shadow-none`}
                                    >
                                        <LockSimple size={16} className="mr-2" />
                                        {item.assessment_visibility}
                                    </Badge>
                                    <Badge
                                        className={`rounded-md border border-neutral-300 ${
                                            item.play_mode !== "EXAM"
                                                ? "bg-neutral-50"
                                                : "bg-success-50"
                                        } py-1.5 shadow-none`}
                                    >
                                        {item.play_mode === "EXAM" ? (
                                            <DotIcon className="mr-2" />
                                        ) : (
                                            <DotIconOffline className="mr-2" />
                                        )}
                                        {item.play_mode}
                                    </Badge>
                                    <Separator
                                        orientation="vertical"
                                        className="h-8 w-px bg-neutral-300"
                                    />
                                    <Badge
                                        className={`rounded-md border ${
                                            item.status === "PUBLISHED"
                                                ? "bg-success-50"
                                                : "bg-neutral-100"
                                        } border-neutral-300 py-1.5 shadow-none`}
                                    >
                                        {item.status === "PUBLISHED" ? (
                                            <CheckCircle
                                                size={16}
                                                weight="fill"
                                                className="mr-2 text-success-600"
                                            />
                                        ) : (
                                            <PauseCircle
                                                size={16}
                                                weight="fill"
                                                className="mr-2 text-neutral-400"
                                            />
                                        )}
                                        {item.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className="rounded-md border border-primary-200 bg-primary-50 py-1.5 shadow-none">
                                        10th Premium Pro Group 1
                                    </Badge>
                                    <span className="text-sm text-primary-500">+3 more</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MyButton
                                                type="button"
                                                scale="small"
                                                buttonType="secondary"
                                                className="w-6 !min-w-6"
                                            >
                                                <DotsThree size={32} />
                                            </MyButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleNavigateAssessment(item.assessment_id)
                                                }
                                            >
                                                View Assessment Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                Reschedule Assessment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                Duplicate Assessment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                Delete Assessment
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="flex w-full items-center justify-start gap-8 text-sm text-neutral-500">
                                <div className="flex flex-col gap-4">
                                    <p>Created on: {convertToLocalDateTime(item.created_at)}</p>
                                    <p>Subject: </p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <p>
                                        Start Date and Time:{" "}
                                        {convertToLocalDateTime(item.bound_start_time)}
                                    </p>
                                    <p>Duration: {item.duration} min</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <p>
                                        End Date and Time:{" "}
                                        {convertToLocalDateTime(item.bound_end_time)}
                                    </p>
                                    <p>Total Participants: {item.user_registrations}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-8 text-sm text-neutral-500">
                                <p>Attempted by: {item.attemptedParticipants}</p>
                                <p>Pending: {item.remainingParticipants}</p>
                            </div>
                            <ReverseProgressBar
                                value={
                                    item.expected_participants && item.user_registrations
                                        ? (item.user_registrations / item.expected_participants) *
                                          100
                                        : 0 // Default value if `expected_participants` or `user_registrations` is missing
                                }
                                className="-mt-3 w-full border"
                            />
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <h1 className="!font-normal text-black">Join Link:</h1>
                                    {/* <p>{item.joinLink}</p> */}
                                    <MyButton
                                        type="button"
                                        scale="small"
                                        buttonType="secondary"
                                        className="h-8 min-w-8"
                                        // onClick={() => copyToClipboard(item.joinLink)}
                                    >
                                        <Copy size={32} />
                                    </MyButton>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* <QRCode
                                        value={item.joinLink}
                                        className="size-16"
                                        id={`qr-code-svg-assessment-list-${item.id}`}
                                    /> */}
                                    <MyButton
                                        type="button"
                                        scale="small"
                                        buttonType="secondary"
                                        className="h-8 min-w-8"
                                        // onClick={() =>
                                        //     handleDownloadQRCode(
                                        //         `qr-code-svg-assessment-list-${item.id}`,
                                        //     )
                                        // }
                                    >
                                        <DownloadSimple size={32} />
                                    </MyButton>
                                </div>
                            </div>
                        </div>
                    ))}
                    <MyPagination
                        currentPage={pageNo}
                        totalPages={Math.ceil(tab.data.total_pages)}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </TabsContent>
    );
};

export default ScheduleTestLists;
