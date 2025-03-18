import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "phosphor-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScheduleTestFilters } from "@/routes/assessment/assessment-list/-components/ScheduleTestFilters";
import { MyFilterOption } from "@/types/assessments/my-filter";
import { RoleType, RoleTypeUserStatus } from "@/constants/dummy-data";
import RoleTypeFilterButtons from "./RoleTypeFilterButtons";
import InviteUsersComponent from "./InviteUsersComponent";
import InviteUsersTab from "./InviteUsersTab";
import InstituteUsersComponent from "./InstituteUsersTab";
import { RolesDummyDataType } from "@/types/dashboard/user-roles";
import { getInstituteId } from "@/constants/helper";
import { fetchInstituteDashboardUsers } from "../-services/dashboard-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useMutation } from "@tanstack/react-query";
import { useRefetchUsersStore } from "../-global-states/refetch-store-users";

export interface RoleTypeSelectedFilter {
    roles: { id: string; name: string }[];
    status: { id: string; name: string }[];
}

// Type for tabs
type TabKey = keyof RolesDummyDataType;

const RoleTypeComponent = () => {
    const setHandleRefetchUsersData = useRefetchUsersStore(
        (state) => state.setHandleRefetchUsersData,
    );
    const [isLoading, setIsLoading] = useState(false);
    const instituteId = getInstituteId();
    const [selectedTab, setSelectedTab] = useState<TabKey>("instituteUsers");
    const [selectedFilter, setSelectedFilter] = useState({
        roles: [],
        status: [],
    });

    const [dashboardUsers, setDashboardUsers] = useState({
        instituteUsers: [],
        invites: [],
    });

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedFilter((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    const getDashboardUsersData = useMutation({
        mutationFn: ({
            instituteId,
            selectedFilter,
        }: {
            instituteId: string | undefined;
            selectedFilter: RoleTypeSelectedFilter;
        }) => fetchInstituteDashboardUsers(instituteId, selectedFilter),
        onSuccess: (data) => {
            if (selectedTab === "instituteUsers") {
                setDashboardUsers({ ...dashboardUsers, ["instituteUsers"]: data });
            } else {
                setDashboardUsers({ ...dashboardUsers, ["invites"]: data });
            }
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleSubmitFilters = () => {
        getDashboardUsersData.mutate({
            instituteId,
            selectedFilter,
        });
    };

    const handleResetFilters = () => {
        setSelectedFilter({
            roles: [],
            status: [],
        });
        getDashboardUsersData.mutate({
            instituteId,
            selectedFilter: {
                roles: [
                    { id: "1", name: "ADMIN" },
                    { id: "2", name: "COURSE CREATOR" },
                    { id: "3", name: "ASSESSMENT CREATOR" },
                    { id: "4", name: "EVALUATOR" },
                ],
                status:
                    selectedTab === "instituteUsers"
                        ? [
                              { id: "1", name: "ACTIVE" },
                              { id: "2", name: "DISABLED" },
                          ]
                        : [{ id: "1", name: "INVITED" }],
            },
        });
    };

    const handleTabChange = (value: string) => {
        if (value === "instituteUsers" || value === "invites") {
            setSelectedTab(value as TabKey);
            getDashboardUsersData.mutate({
                instituteId,
                selectedFilter: {
                    roles: [
                        { id: "1", name: "ADMIN" },
                        { id: "2", name: "COURSE CREATOR" },
                        { id: "3", name: "ASSESSMENT CREATOR" },
                        { id: "4", name: "EVALUATOR" },
                    ],
                    status:
                        value === "instituteUsers"
                            ? [
                                  { id: "1", name: "ACTIVE" },
                                  { id: "2", name: "DISABLED" },
                              ]
                            : [{ id: "1", name: "INVITED" }],
                },
            });
        }
    };

    const handleRefetchData = () => {
        const timeoutId = setTimeout(() => {
            Promise.all([
                fetchInstituteDashboardUsers(instituteId, {
                    roles: [
                        { id: "1", name: "ADMIN" },
                        { id: "2", name: "COURSE CREATOR" },
                        { id: "3", name: "ASSESSMENT CREATOR" },
                        { id: "4", name: "EVALUATOR" },
                    ],
                    status: [
                        { id: "1", name: "ACTIVE" },
                        { id: "2", name: "DISABLED" },
                    ],
                }),
                fetchInstituteDashboardUsers(instituteId, {
                    roles: [
                        { id: "1", name: "ADMIN" },
                        { id: "2", name: "COURSE CREATOR" },
                        { id: "3", name: "ASSESSMENT CREATOR" },
                        { id: "4", name: "EVALUATOR" },
                    ],
                    status: [{ id: "1", name: "INVITED" }],
                }),
            ])
                .then(([instituteUsersData, invitesData]) => {
                    setDashboardUsers((prev) => ({
                        ...prev,
                        instituteUsers: instituteUsersData,
                        invites: invitesData,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    };

    // Define the handleRefetchData function here
    useEffect(() => {
        setHandleRefetchUsersData(handleRefetchData);
    }, [setHandleRefetchUsersData]);

    useEffect(() => {
        setIsLoading(true);

        const timeoutId = setTimeout(() => {
            Promise.all([
                fetchInstituteDashboardUsers(instituteId, {
                    roles: [
                        { id: "1", name: "ADMIN" },
                        { id: "2", name: "COURSE CREATOR" },
                        { id: "3", name: "ASSESSMENT CREATOR" },
                        { id: "4", name: "EVALUATOR" },
                    ],
                    status: [
                        { id: "1", name: "ACTIVE" },
                        { id: "2", name: "DISABLED" },
                    ],
                }),
                fetchInstituteDashboardUsers(instituteId, {
                    roles: [
                        { id: "1", name: "ADMIN" },
                        { id: "2", name: "COURSE CREATOR" },
                        { id: "3", name: "ASSESSMENT CREATOR" },
                        { id: "4", name: "EVALUATOR" },
                    ],
                    status: [{ id: "1", name: "INVITED" }],
                }),
            ])
                .then(([instituteUsersData, invitesData]) => {
                    setDashboardUsers((prev) => ({
                        ...prev,
                        instituteUsers: instituteUsersData,
                        invites: invitesData,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    if (isLoading) return <DashboardLoader />;

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
                    onValueChange={handleTabChange}
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
                                    {dashboardUsers["instituteUsers"].length}
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
                                    {dashboardUsers["invites"].length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-4">
                            <ScheduleTestFilters
                                label="Role Type"
                                data={RoleType}
                                selectedItems={selectedFilter["roles"] || []}
                                onSelectionChange={(items) => handleFilterChange("roles", items)}
                            />
                            {selectedTab === "instituteUsers" && (
                                <ScheduleTestFilters
                                    label="Status"
                                    data={RoleTypeUserStatus}
                                    selectedItems={selectedFilter["status"] || []}
                                    onSelectionChange={(items) =>
                                        handleFilterChange("status", items)
                                    }
                                />
                            )}
                            <RoleTypeFilterButtons
                                selectedQuestionPaperFilters={selectedFilter}
                                handleSubmitFilters={handleSubmitFilters}
                                handleResetFilters={handleResetFilters}
                            />
                        </div>
                    </div>
                    <InstituteUsersComponent
                        selectedTab={selectedTab}
                        selectedTabData={dashboardUsers.instituteUsers}
                        refetchData={handleRefetchData}
                    />
                    <InviteUsersTab
                        selectedTab={selectedTab}
                        selectedTabData={dashboardUsers.invites}
                        refetchData={handleRefetchData}
                    />
                </Tabs>
                <div className="mr-4 text-end">
                    <InviteUsersComponent refetchData={handleRefetchData} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoleTypeComponent;
