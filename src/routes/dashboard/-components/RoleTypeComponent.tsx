import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "phosphor-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScheduleTestFilters } from "@/routes/assessment/assessment-list/-components/ScheduleTestFilters";
import { MyFilterOption } from "@/types/assessments/my-filter";
import { RolesDummyData, RoleType, RoleTypeUserStatus } from "@/constants/dummy-data";
import RoleTypeFilterButtons from "./RoleTypeFilterButtons";
import InviteUsersComponent from "./InviteUsersComponent";
import InviteUsersTab from "./InviteUsersTab";
import InstituteUsersComponent from "./InstituteUsersTab";

export interface RoleTypeSelectedFilter {
    roleType: { id: string; name: string }[];
    status: { id: string; name: string }[];
}

const RoleTypeComponent = () => {
    const [selectedTab, setSelectedTab] = useState("instituteUsers");
    const [selectedFilter, setSelectedFilter] = useState({
        roleType: [],
        status: [],
    });

    const selectedTabData = RolesDummyData[selectedTab];

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedFilter((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    const handleSubmitFilters = () => {
        console.log("submit filter");
    };

    const handleResetFilters = () => {
        setSelectedFilter({
            roleType: [],
            status: [],
        });
    };

    return (
        <Dialog>
            <DialogTrigger>
                <MyButton
                    type="submit"
                    scale="medium"
                    buttonType="secondary"
                    layoutVariant="default"
                    className="text-sm"
                >
                    <Plus size={32} />
                    Manage Users
                </MyButton>
            </DialogTrigger>
            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-4 overflow-y-auto !rounded-none !p-0">
                <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                    Manage Role Types Users
                </h1>
                <Tabs
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                    className="flex flex-col justify-between p-4"
                >
                    <div className="flex items-center justify-start gap-8">
                        <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                            <TabsTrigger
                                value="instituteUsers"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "instituteUsers"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "instituteUsers" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Institute Users
                                </span>
                                <Badge
                                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                    variant="outline"
                                >
                                    {RolesDummyData["instituteUsers"].length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="invites"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === "invites"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedTab === "invites" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Invites
                                </span>
                                <Badge
                                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                    variant="outline"
                                >
                                    {RolesDummyData["invites"].length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-4">
                            <ScheduleTestFilters
                                label="Role Type"
                                data={RoleType}
                                selectedItems={selectedFilter["roleType"] || []}
                                onSelectionChange={(items) => handleFilterChange("roleType", items)}
                            />
                            <ScheduleTestFilters
                                label="Status"
                                data={RoleTypeUserStatus}
                                selectedItems={selectedFilter["status"] || []}
                                onSelectionChange={(items) => handleFilterChange("status", items)}
                            />
                            <RoleTypeFilterButtons
                                selectedQuestionPaperFilters={selectedFilter}
                                handleSubmitFilters={handleSubmitFilters}
                                handleResetFilters={handleResetFilters}
                            />
                        </div>
                    </div>
                    <InviteUsersTab selectedTab={selectedTab} selectedTabData={selectedTabData} />
                    <InstituteUsersComponent
                        selectedTab={selectedTab}
                        selectedTabData={selectedTabData}
                    />
                </Tabs>
                <div className="mr-4 text-end">
                    <InviteUsersComponent />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoleTypeComponent;
