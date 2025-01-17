// stores/activity-stats-store.ts
import { create } from "zustand";
// stores/activity-stats-store.ts
import { ActivityLogType } from "@/components/common/students/students-list/student-side-view/student-view-dummy-data/learning-progress";

interface ActivityStatsStore {
    isOpen: boolean;
    selectedUserId: string | null;
    selectedTopicName: string | null;
    selectedStudyType: string | null;
    activityData: ActivityLogType[] | null;
    openDialog: (
        userId: string,
        topicName: string,
        studyType: string,
        activityData: ActivityLogType[],
    ) => void;
    closeDialog: () => void;
}

export const useActivityStatsStore = create<ActivityStatsStore>((set) => ({
    isOpen: false,
    selectedUserId: null,
    selectedTopicName: null,
    selectedStudyType: null,
    activityData: null,
    openDialog: (userId, topicName, studyType, activityData) =>
        set({
            isOpen: true,
            selectedUserId: userId,
            selectedTopicName: topicName,
            selectedStudyType: studyType,
            activityData: activityData,
        }),
    closeDialog: () =>
        set({
            isOpen: false,
            selectedUserId: null,
            selectedTopicName: null,
            selectedStudyType: null,
            activityData: null,
        }),
}));
