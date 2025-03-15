import { StudentTable } from "@/schemas/student/student-list/table-schema";

export interface LearnerEnrollRequestType {
    invite_link_name: string;
    invite_link: string;
    request_time: string;
    learner: StudentTable;
}
