import { create } from "zustand";
import {
    InstituteDetailsType,
    LevelType,
    SessionType,
} from "@/schemas/student/student-list/institute-schema";

interface InstituteDetailsStore {
    instituteDetails: InstituteDetailsType | null;
    setInstituteDetails: (details: InstituteDetailsType) => void;
    getAllLevels: () => Array<LevelType>;
    getAllSessions: () => Array<SessionType>;
    resetStore: () => void;
    getLevelsFromPackage: (params?: {
        courseId?: string;
        sessionId?: string;
    }) => Array<{ id: string; name: string }>;
    getCourseFromPackage: (params?: {
        levelId?: string;
        sessionId?: string;
    }) => Array<{ id: string; name: string }>;
    getSessionFromPackage: (params?: {
        courseId?: string;
        levelId?: string;
    }) => Array<{ id: string; name: string }>;
    getPackageSessionId: (params: {
        courseId: string;
        sessionId: string;
        levelId: string;
    }) => string | null;
}

export const useInstituteDetailsStore = create<InstituteDetailsStore>((set, get) => ({
    instituteDetails: null,
    setInstituteDetails: (details) => set({ instituteDetails: details }),

    getAllLevels: () => {
        const { instituteDetails } = get();
        return instituteDetails?.levels ?? [];
    },

    getAllSessions: () => {
        const { instituteDetails } = get();
        return instituteDetails?.sessions ?? [];
    },

    resetStore: () => set({ instituteDetails: null }),

    getLevelsFromPackage: (params) => {
        const { instituteDetails } = get();
        if (!instituteDetails) return [];

        return instituteDetails.batches_for_sessions
            .filter((batch) => {
                if (params?.courseId && params?.sessionId) {
                    return (
                        batch.package_dto.id === params.courseId &&
                        batch.session.id === params.sessionId
                    );
                }
                if (params?.courseId) {
                    return batch.package_dto.id === params.courseId;
                }
                if (params?.sessionId) {
                    return batch.session.id === params.sessionId;
                }
                return true;
            })
            .map((batch) => ({
                id: batch.level.id,
                name: batch.level.level_name,
            }));
    },

    getCourseFromPackage: (params) => {
        const { instituteDetails } = get();
        if (!instituteDetails) return [];

        return instituteDetails.batches_for_sessions
            .filter((batch) => {
                if (params?.levelId && params?.sessionId) {
                    return (
                        batch.level.id === params.levelId && batch.session.id === params.sessionId
                    );
                }
                if (params?.levelId) {
                    return batch.level.id === params.levelId;
                }
                if (params?.sessionId) {
                    return batch.session.id === params.sessionId;
                }
                return true;
            })
            .map((batch) => ({
                id: batch.package_dto.id,
                name: batch.package_dto.package_name,
            }));
    },

    getSessionFromPackage: (params) => {
        const { instituteDetails } = get();
        if (!instituteDetails) return [];

        return instituteDetails.batches_for_sessions
            .filter((batch) => {
                if (params?.courseId && params?.levelId) {
                    return (
                        batch.package_dto.id === params.courseId &&
                        batch.level.id === params.levelId
                    );
                }
                if (params?.courseId) {
                    return batch.package_dto.id === params.courseId;
                }
                if (params?.levelId) {
                    return batch.level.id === params.levelId;
                }
                return true;
            })
            .map((batch) => ({
                id: batch.session.id,
                name: batch.session.session_name,
            }));
    },

    getPackageSessionId: (params) => {
        const { instituteDetails } = get();
        if (!instituteDetails) return null;

        const matchingBatch = instituteDetails.batches_for_sessions.find(
            (batch) =>
                batch.package_dto.id === params.courseId &&
                batch.level.id === params.levelId &&
                batch.session.id === params.sessionId,
        );

        return matchingBatch?.id || null;
    },
}));
