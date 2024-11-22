import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TabListComponent = ({ selectedTab }: { selectedTab: string }) => {
    return (
        <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b-2 !bg-transparent p-0">
            <TabsTrigger
                value="All"
                className={`flex gap-1.5 rounded-none pb-2 pl-12 pr-12 pt-2 !shadow-none ${
                    selectedTab === "All"
                        ? "border-4px rounded-tl-sm rounded-tr-sm border !border-b-0 border-primary-200 !bg-primary-50"
                        : "border-none bg-transparent"
                }`}
            >
                <span className={`${selectedTab === "All" ? "text-primary-500" : ""}`}>All</span>
                <Badge
                    className="rounded-[10px] bg-primary-500 p-0 pl-2 pr-2 text-[9px] text-white"
                    variant="outline"
                >
                    125
                </Badge>
            </TabsTrigger>
            <TabsTrigger
                value="Favourites"
                className={`inline-flex gap-1.5 rounded-none pb-2 pl-12 pr-12 pt-2 !shadow-none ${
                    selectedTab === "Favourites"
                        ? "border-4px rounded-tl-sm rounded-tr-sm border !border-b-0 border-primary-200 !bg-primary-50"
                        : "border-none bg-transparent"
                }`}
            >
                <span className={`${selectedTab === "Favourites" ? "text-primary-500" : ""}`}>
                    Favourites
                </span>
                <Badge
                    className="rounded-[10px] bg-primary-500 p-0 pl-2 pr-2 text-[9px] text-white"
                    variant="outline"
                >
                    125
                </Badge>
            </TabsTrigger>
        </TabsList>
    );
};
