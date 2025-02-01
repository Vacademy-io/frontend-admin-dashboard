import { Helmet } from "react-helmet";
import { Tabs } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { ScheduleTestFilters } from "./ScheduleTestFilters";
import {
    useFilterDataForAssesment,
    useFilterDataForAssesmentInitData,
} from "../-utils.ts/useFiltersData";
import { ScheduleTestSearchComponent } from "./ScheduleTestSearchComponent";
import { MyFilterOption } from "@/types/assessments/my-filter";
import { ScheduleTestHeaderDescription } from "./ScheduleTestHeaderDescription";
import ScheduleTestTabList from "./ScheduleTestTabList";
import ScheduleTestFilterButtons from "./ScheduleTestFilterButtons";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import ScheduleTestLists from "./ScheduleTestLists";
import {
    getAssessmentListWithFilters,
    getInitAssessmentDetails,
} from "../-services/assessment-services";
import { INSTITUTE_ID } from "@/constants/urls";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { ScheduleTestTab } from "@/types/assessments/assessment-list";

export interface SelectedQuestionPaperFilters {
    name: string | { id: string; name: string }[];
    batch_ids: MyFilterOption[];
    subjects_ids: MyFilterOption[];
    tag_ids: MyFilterOption[];
    get_live_assessments: boolean;
    get_passed_assessments: boolean;
    get_upcoming_assessments: boolean;
    institute_ids: string[];
    assessment_statuses: MyFilterOption[];
    assessment_modes: MyFilterOption[];
    access_statuses: MyFilterOption[];
}

export const ScheduleTestMainComponent = () => {
    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState("liveTests");
    const { data: initData } = useSuspenseQuery(useInstituteQuery());
    const { data: initAssessmentData } = useSuspenseQuery(getInitAssessmentDetails(initData?.id));
    const { BatchesFilterData, SubjectFilterData } = useFilterDataForAssesment(initData);
    const { AssessmentTypeData, AssessmentStatusData, ModeData } =
        useFilterDataForAssesmentInitData(initAssessmentData);

    const [selectedQuestionPaperFilters, setSelectedQuestionPaperFilters] =
        useState<SelectedQuestionPaperFilters>({
            name: "",
            batch_ids: [],
            subjects_ids: [],
            tag_ids: [],
            get_live_assessments: false,
            get_passed_assessments: false,
            get_upcoming_assessments: false,
            institute_ids: [initData?.id || ""],
            assessment_statuses: [],
            assessment_modes: [],
            access_statuses: [],
        });

    const [scheduleTestTabsData, setScheduleTestTabsData] = useState<ScheduleTestTab[]>([
        {
            value: "liveTests",
            message: "No tests are currently live.",
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
        {
            value: "upcomingTests",
            message: "No upcoming tests scheduled.",
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
        {
            value: "previousTests",
            message: "No previous tests available.",
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
        {
            value: "draftTests",
            message: "No draft tests available.",
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
    ]);

    const [searchText, setSearchText] = useState("");
    const [pageNo, setPageNo] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedQuestionPaperFilters((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    const clearSearch = () => {
        setSearchText("");
        selectedQuestionPaperFilters["name"] = "";
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: selectedQuestionPaperFilters,
        });
    };

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                ...selectedQuestionPaperFilters,
                name: [{ id: searchValue, name: searchValue }],
            },
        });
    };

    const handleResetFilters = () => {
        setSelectedQuestionPaperFilters({
            name: "",
            batch_ids: [],
            subjects_ids: [],
            tag_ids: [],
            get_live_assessments: false,
            get_passed_assessments: false,
            get_upcoming_assessments: false,
            institute_ids: [initData?.id || ""],
            assessment_statuses: [],
            assessment_modes: [],
            access_statuses: [],
        });
        setSearchText("");
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                name: "",
                batch_ids: [],
                subjects_ids: [],
                tag_ids: [],
                get_live_assessments: selectedTab === "liveTests" ? true : false,
                get_passed_assessments: selectedTab === "previousTests" ? true : false,
                get_upcoming_assessments: selectedTab === "upcomingTests" ? true : false,
                institute_ids: [initData?.id || ""],
                assessment_statuses: [],
                assessment_modes: [],
                access_statuses: [],
            },
        });
    };

    const getFilteredData = useMutation({
        mutationFn: ({
            pageNo,
            pageSize,
            instituteId,
            data,
        }: {
            pageNo: number;
            pageSize: number;
            instituteId: string;
            data: SelectedQuestionPaperFilters;
        }) => getAssessmentListWithFilters(pageNo, pageSize, instituteId, data),
        onSuccess: (data) => {
            setScheduleTestTabsData((prevTabs) =>
                prevTabs.map((tab) => (tab.value === selectedTab ? { ...tab, data: data } : tab)),
            );
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleSubmitFilters = () => {
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                ...selectedQuestionPaperFilters,
                get_live_assessments: selectedTab === "liveTests" ? true : false,
                get_passed_assessments: selectedTab === "previousTests" ? true : false,
                get_upcoming_assessments: selectedTab === "upcomingTests" ? true : false,
            },
        });
    };

    const handlePageChange = (newPage: number) => {
        setPageNo(newPage);
        getAssessmentListWithFilters(newPage, 10, INSTITUTE_ID, {
            ...selectedQuestionPaperFilters,
            get_live_assessments: selectedTab === "liveTests" ? true : false,
            get_passed_assessments: selectedTab === "previousTests" ? true : false,
            get_upcoming_assessments: selectedTab === "upcomingTests" ? true : false,
        })
            .then((data) => {
                setScheduleTestTabsData((prevTabs) =>
                    prevTabs.map((tab) =>
                        tab.value === selectedTab ? { ...tab, data: data } : tab,
                    ),
                );
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...selectedQuestionPaperFilters,
                get_live_assessments: true,
                get_passed_assessments: false,
                get_upcoming_assessments: false,
            })
                .then((data) => {
                    setScheduleTestTabsData((prevTabs) =>
                        prevTabs.map((tab) =>
                            tab.value === "liveTests" ? { ...tab, data: data } : tab,
                        ),
                    );
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...selectedQuestionPaperFilters,
                get_live_assessments: false,
                get_passed_assessments: true,
                get_upcoming_assessments: false,
            })
                .then((data) => {
                    setScheduleTestTabsData((prevTabs) =>
                        prevTabs.map((tab) =>
                            tab.value === "upcomingTests" ? { ...tab, data: data } : tab,
                        ),
                    );
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...selectedQuestionPaperFilters,
                get_live_assessments: false,
                get_passed_assessments: false,
                get_upcoming_assessments: true,
            })
                .then((data) => {
                    setScheduleTestTabsData((prevTabs) =>
                        prevTabs.map((tab) =>
                            tab.value === "previousTests" ? { ...tab, data: data } : tab,
                        ),
                    );
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...selectedQuestionPaperFilters,
                get_live_assessments: false,
                get_passed_assessments: false,
                get_upcoming_assessments: false,
            })
                .then((data) => {
                    setScheduleTestTabsData((prevTabs) =>
                        prevTabs.map((tab) =>
                            tab.value === "draftTests" ? { ...tab, data: data } : tab,
                        ),
                    );
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Assessments List</h1>);
    }, []);

    if (isLoading) return <DashboardLoader />;
    return (
        <>
            <Helmet>
                <title>Schedule Tests</title>
                <meta
                    name="description"
                    content="This page shows the list of all the schedules tests and also an assessment can be scheduled here."
                />
            </Helmet>
            <ScheduleTestHeaderDescription />
            <div className="flex flex-col gap-4">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <ScheduleTestTabList
                        selectedTab={selectedTab}
                        scheduleTestTabsData={scheduleTestTabsData}
                    />
                    <div className="my-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <ScheduleTestFilters
                                label="Batches"
                                data={BatchesFilterData}
                                selectedItems={selectedQuestionPaperFilters["batch_ids"] || []}
                                onSelectionChange={(items) =>
                                    handleFilterChange("batch_ids", items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Subjects"
                                data={SubjectFilterData}
                                selectedItems={selectedQuestionPaperFilters["subjects_ids"] || []}
                                onSelectionChange={(items) =>
                                    handleFilterChange("subjects_ids", items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Status"
                                data={AssessmentStatusData}
                                selectedItems={
                                    selectedQuestionPaperFilters["assessment_statuses"] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange("assessment_statuses", items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Mode"
                                data={ModeData}
                                selectedItems={
                                    selectedQuestionPaperFilters["assessment_modes"] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange("assessment_modes", items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Type"
                                data={AssessmentTypeData}
                                selectedItems={
                                    selectedQuestionPaperFilters["access_statuses"] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange("access_statuses", items)
                                }
                            />
                            <ScheduleTestFilterButtons
                                selectedQuestionPaperFilters={selectedQuestionPaperFilters}
                                handleSubmitFilters={handleSubmitFilters}
                                handleResetFilters={handleResetFilters}
                            />
                        </div>
                        <ScheduleTestSearchComponent
                            onSearch={handleSearch}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            clearSearch={clearSearch}
                        />
                    </div>
                    {scheduleTestTabsData.map((tab, index) => (
                        <ScheduleTestLists
                            key={index}
                            tab={tab}
                            pageNo={pageNo}
                            handlePageChange={handlePageChange}
                        />
                    ))}
                </Tabs>
            </div>
        </>
    );
};
