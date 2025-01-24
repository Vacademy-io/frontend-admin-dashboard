import { Badge } from "@/components/ui/badge";

const AssessmentAccessControlTab = () => {
    return (
        <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Assessment Creation Access</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4F9FF] py-1.5 shadow-none">
                            Role: All Admin
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4FFF9] py-1.5 shadow-none">
                            Role: All Educators
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 shadow-none">
                            Role: All Creators
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shreyashjain@gmail.com
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shiva@gmail.com
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Live Assessment Notifications</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4F9FF] py-1.5 shadow-none">
                            Role: All Admin
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4FFF9] py-1.5 shadow-none">
                            Role: All Educators
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 shadow-none">
                            Role: All Creators
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shreyashjain@gmail.com
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shiva@gmail.com
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Assessment Submission & Reports Access</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4F9FF] py-1.5 shadow-none">
                            Role: All Admin
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4FFF9] py-1.5 shadow-none">
                            Role: All Educators
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 shadow-none">
                            Role: All Creators
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shreyashjain@gmail.com
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shiva@gmail.com
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Evaluation Access</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4F9FF] py-1.5 shadow-none">
                            Role: All Admin
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#F4FFF9] py-1.5 shadow-none">
                            Role: All Educators
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 shadow-none">
                            Role: All Creators
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shreyashjain@gmail.com
                        </Badge>
                        <Badge className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none">
                            User: shiva@gmail.com
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentAccessControlTab;
