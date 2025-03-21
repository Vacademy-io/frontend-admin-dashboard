import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getBatchDetailsListOfStudents } from "../-services/assessment-details-services";

export interface AssessmentParticipantsInterface {
    name: string;
    statuses: string[];
    institute_ids: string[];
    package_session_ids: string[];
    group_ids: string[];
    gender: string[];
    sort_columns: Record<string, string>; // For dynamic keys in sort_columns
}

const AssessmentParticipantsList = ({ batchId }: { batchId: string }) => {
    const [pageNo] = useState(0);
    const [selectedFilter] = useState<AssessmentParticipantsInterface>({
        name: "",
        statuses: [],
        institute_ids: [],
        package_session_ids: [batchId],
        group_ids: [],
        gender: [],
        sort_columns: {},
    });

    const getParticipantsData = useMutation({
        mutationFn: ({
            pageNo,
            pageSize,
            selectedFilter,
        }: {
            pageNo: number;
            pageSize: number;
            selectedFilter: AssessmentParticipantsInterface;
        }) => getBatchDetailsListOfStudents(pageNo, pageSize, selectedFilter),
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleGetParticipantsDetails = () => {
        getParticipantsData.mutate({
            pageNo,
            pageSize: 10,
            selectedFilter,
        });
    };
    return (
        <Dialog>
            <DialogTrigger>
                <div className="flex items-center">
                    <span
                        className="text-sm text-primary-500"
                        onClick={handleGetParticipantsDetails}
                    >
                        View List
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0">
                <h1 className="rounded-t-lg bg-primary-100 p-4 text-primary-500">
                    Partcipants List
                </h1>
            </DialogContent>
        </Dialog>
    );
};

export default AssessmentParticipantsList;
