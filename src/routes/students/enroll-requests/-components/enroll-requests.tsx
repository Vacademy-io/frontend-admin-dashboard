import { LearnerEnrollRequestType } from "../-types/enroll-request-types";
import { EmptyRequestPage } from "@/assets/svgs";
import { RequestCard } from "./request-card";

export const EnrollRequests = () => {
    const data: LearnerEnrollRequestType[] = [
        {
            invite_link: "https://forms.gle/example123",
            invite_link_name: "10th Premium Pro invites",
            request_time: "10/02/2025, 10 a.m.",
            learner: {
                id: "04b6b835-c89c-40bf-972d-64013e3c4915",
                username: "2026-10thstandard-265",
                user_id: "4202433f-6502-414d-8b3b-8484605f5b54",
                email: "dvdv@gmail.com",
                full_name: "Rajshekhar",
                address_line: "",
                region: null,
                city: "",
                pin_code: "",
                mobile_number: "918365952356",
                date_of_birth: "",
                gender: "MALE",
                father_name: "",
                mother_name: "",
                parents_mobile_number: "",
                parents_email: "",
                linked_institute_name: "dchg",
                package_session_id: "de21b777-0671-4ef0-8b5e-7c10875e64c5",
                institute_enrollment_id: "4561265",
                status: "ACTIVE",
                session_expiry_days: 0,
                institute_id: "9d3f4ccb-a7f6-423f-bc4f-75c6d6176346",
                face_file_id: "",
                expiry_date: 0,
                created_at: "2025-03-11T09:35:49.749+00:00",
                updated_at: "2025-03-11T09:35:49.749+00:00",
            },
        },
        {
            invite_link: "https://forms.gle/example124",
            invite_link_name: "10th Premium Pro invites",
            request_time: "10/02/2025, 10 a.m.",
            learner: {
                id: "04b6b835-c89c-40bf-972d-64013e3c4915",
                username: "2026-10thstandard-265",
                user_id: "4202433f-6502-414d-8b3b-8484605f5b54",
                email: "dvdv@gmail.com",
                full_name: "Rajshekhar",
                address_line: "",
                region: null,
                city: "",
                pin_code: "",
                mobile_number: "918365952356",
                date_of_birth: "",
                gender: "MALE",
                father_name: "",
                mother_name: "",
                parents_mobile_number: "",
                parents_email: "",
                linked_institute_name: "dchg",
                package_session_id: "de21b777-0671-4ef0-8b5e-7c10875e64c5",
                institute_enrollment_id: "4561265",
                status: "ACTIVE",
                session_expiry_days: 0,
                institute_id: "9d3f4ccb-a7f6-423f-bc4f-75c6d6176346",
                face_file_id: "",
                expiry_date: 0,
                created_at: "2025-03-11T09:35:49.749+00:00",
                updated_at: "2025-03-11T09:35:49.749+00:00",
            },
        },
    ];

    return (
        <div className="flex w-full flex-col gap-10 text-neutral-600">
            {data.length == 0 ? (
                <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2 text-title">
                    <EmptyRequestPage />
                    <p className="font-semibold">No Enrollment Requests Yet!</p>
                    <p>New requests will appear here for your review and approval</p>
                </div>
            ) : (
                data.map((obj, index) => <RequestCard key={index} obj={obj} />)
            )}
        </div>
    );
};
