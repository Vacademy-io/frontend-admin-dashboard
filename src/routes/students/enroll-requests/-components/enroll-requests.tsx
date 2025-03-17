import { LearnerEnrollRequestType } from "../-types/request-data";
import { Copy } from "phosphor-react";
import { MyButton } from "@/components/design-system/button";
import { toast } from "sonner";
import { useState } from "react";

export const EnrollRequests = () => {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
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

    const handleCopyClick = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopySuccess(link);
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch((err) => {
                console.log("Error copying link: ", err);
                toast.error("Copy failed!");
            });
    };

    return (
        <div className="flex w-full flex-col gap-10 text-neutral-600">
            {data.map((obj, index) => (
                <div
                    key={index}
                    className="flex w-full flex-col gap-6 rounded-lg border border-neutral-300 p-6"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <div className="flex flex-col">
                                <div className="text-subtitle font-semibold">
                                    {obj.learner.full_name}
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-body">
                                        <span className="font-semibold">Invite Link name</span>:{" "}
                                        {obj.invite_link_name}
                                    </div>
                                    <div className="flex items-center gap-2 text-body">
                                        <p className="font-semibold">Invite Link: </p>
                                        <p className="underline">{obj.invite_link}</p>
                                        <div className="flex items-center gap-2">
                                            <MyButton
                                                buttonType="secondary"
                                                layoutVariant="icon"
                                                scale="medium"
                                                onClick={() => handleCopyClick(obj.invite_link)}
                                            >
                                                <Copy />
                                            </MyButton>
                                            {copySuccess == obj.invite_link && (
                                                <span className="text-caption text-primary-500">
                                                    Copied!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-neutral-500">{obj.request_time}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-x-20 gap-y-4">
                            <p>Batch: 10th Premium Pro Group</p>
                            <p>Session: 2024-2025</p>
                            <p>Email: {obj.learner.email}</p>
                            <p>Mobile Number: {obj.learner.mobile_number}</p>
                            <p>Gender: {obj.learner.gender}</p>
                            <p>School: {obj.learner.linked_institute_name}</p>
                            <p>Address Line: {obj.learner.address_line}</p>
                            <p>City/Village: {obj.learner.city}</p>
                            <p>State: {obj.learner.region}</p>
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-end">
                        <div className="flex items-center gap-6">
                            <MyButton buttonType="secondary" scale="medium">
                                Delete
                            </MyButton>
                            <MyButton buttonType="primary" scale="medium">
                                Accept
                            </MyButton>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
