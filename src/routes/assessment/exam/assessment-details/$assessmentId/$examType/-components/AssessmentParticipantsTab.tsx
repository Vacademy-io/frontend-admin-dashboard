import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Copy, DownloadSimple } from "phosphor-react";
import QRCode from "react-qr-code";

const AssessmentParticipantsTab = () => {
    return (
        <>
            <div className="mt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold">Assessment Participants</h1>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 px-4 py-2">
                            <h1 className="text-sm">10th Premium Pro Group 1</h1>
                            <div className="flex items-center">
                                <span className="text-primary-500">View List</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 px-4 py-2">
                            <h1 className="text-sm">10th Premium Pro Group 2</h1>
                            <div className="flex items-center">
                                <span className="text-primary-500">View List</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 px-4 py-2">
                            <h1 className="text-sm">10th Premium Pro Group 3</h1>
                            <div className="flex items-center">
                                <span className="text-primary-500">View List</span>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="flex items-start justify-start gap-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-sm font-semibold">Join Link</h1>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <span className="rounded-md border px-3 py-2 text-sm">
                                    https://google.comerkjbref
                                </span>
                                <MyButton
                                    type="button"
                                    scale="small"
                                    buttonType="secondary"
                                    className="h-9 min-w-10"
                                    // onClick={() => copyToClipboard(getValues("join_link"))}
                                >
                                    <Copy size={32} />
                                </MyButton>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-start gap-2">
                        <h1 className="text-sm font-semibold">QR Code</h1>
                        <div className="flex items-center gap-8">
                            <div className="flex items-start gap-4">
                                <QRCode value={"shiva"} className="size-16" id="qr-code-svg" />
                                <MyButton
                                    type="button"
                                    scale="small"
                                    buttonType="secondary"
                                    className="h-9 min-w-10"
                                    // onClick={() => handleDownloadQRCode("qr-code-svg")}
                                >
                                    <DownloadSimple size={32} />
                                </MyButton>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="flex w-1/2 items-center justify-between">
                    <p className="text-sm font-semibold">Show Leaderboard to Participants</p>
                    <CheckCircle size={22} weight="fill" className="text-success-600" />
                </div>
                <div className="flex w-full items-start gap-16">
                    <div className="flex w-1/2 flex-col gap-6">
                        <p className="font-semibold">Notify Participants via Email:</p>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When Assessment is created:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="flex items-center gap-6">
                                <p className="text-sm">Before Assessment goes live:</p>
                                <p className="text-sm">10 Min</p>
                            </p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When Assessment goes live:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When assessment reports are generated:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                    </div>
                    <div className="flex w-1/2 flex-col gap-6">
                        <p className="font-semibold">Notify Parents via Email:</p>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When Assessment is created:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="flex items-center gap-6">
                                <p className="text-sm">Before Assessment goes live:</p>
                                <p className="text-sm">10 Min</p>
                            </p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When Assessment goes live:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When students appears for the Assessment:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When students finishes the Assessment:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When assessment reports are generated:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssessmentParticipantsTab;
