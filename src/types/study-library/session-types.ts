interface Session {
    id: string;
    session_name: string;
    status: string;
}

interface PackageDTO {
    id: string;
    package_name: string;
    thumbnail_file_id: string | null;
}

interface Level {
    id: string;
    level_name: string;
    duration_in_days: number | null;
    thumbnail_id: string | null;
}

interface Package {
    package_dto: PackageDTO;
    level: Level[];
}

export interface SessionData {
    session: Session;
    packages: Package[];
}

export type SessionsResponse = SessionData[];
