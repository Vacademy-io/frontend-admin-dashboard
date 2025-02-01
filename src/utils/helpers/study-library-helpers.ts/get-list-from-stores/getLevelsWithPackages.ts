import { BatchForSessionSchema } from "@/schemas/student/student-list/institute-schema";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { z } from "zod";

type BatchForSession = z.infer<typeof BatchForSessionSchema>;

export interface PackageSession {
    package_session_id: string;
    package_dto: BatchForSession["package_dto"];
}

interface LevelWithPackages {
    level: BatchForSession["level"];
    package_sessions: PackageSession[];
}

export const GetLevelsWithPackages = (): LevelWithPackages[] => {
    const { instituteDetails } = useInstituteDetailsStore();

    if (!instituteDetails) return [];

    const levelMap = new Map<string, LevelWithPackages>();

    // Initialize map with all levels
    instituteDetails.levels.forEach((level) => {
        levelMap.set(level.id, {
            level,
            package_sessions: [],
        });
    });

    // Add package sessions to their respective levels
    instituteDetails.batches_for_sessions.forEach((batch) => {
        const levelId = batch.level.id;
        const levelData = levelMap.get(levelId);

        if (levelData) {
            levelData.package_sessions.push({
                package_session_id: batch.id,
                package_dto: batch.package_dto,
            });
        }
    });

    return Array.from(levelMap.values());
};
