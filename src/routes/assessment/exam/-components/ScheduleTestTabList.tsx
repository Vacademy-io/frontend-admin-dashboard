import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const ScheduleTestTabList = ({ selectedTab }: { selectedTab: string }) => {
    return (
        <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
            <TabsTrigger
                value="liveTests"
                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                    selectedTab === "liveTests"
                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                        : "border-none bg-transparent"
                }`}
            >
                <span className={`${selectedTab === "liveTests" ? "text-primary-500" : ""}`}>
                    Live Tests
                </span>
                <Badge
                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                    variant="outline"
                >
                    {0}
                </Badge>
            </TabsTrigger>
            <TabsTrigger
                value="upcomingTests"
                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                    selectedTab === "upcomingTests"
                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                        : "border-none bg-transparent"
                }`}
            >
                <span className={`${selectedTab === "upcomingTests" ? "text-primary-500" : ""}`}>
                    Upcoming Tests
                </span>
                <Badge
                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                    variant="outline"
                >
                    {0}
                </Badge>
            </TabsTrigger>
            <TabsTrigger
                value="previousTests"
                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                    selectedTab === "previousTests"
                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                        : "border-none bg-transparent"
                }`}
            >
                <span className={`${selectedTab === "previousTests" ? "text-primary-500" : ""}`}>
                    Previous Tests
                </span>
                <Badge
                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                    variant="outline"
                >
                    {0}
                </Badge>
            </TabsTrigger>
        </TabsList>
    );
};

export default ScheduleTestTabList;
