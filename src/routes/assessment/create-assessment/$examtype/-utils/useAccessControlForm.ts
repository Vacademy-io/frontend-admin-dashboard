import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AccessControlFormSchema } from "./access-control-form-schema";

// Define the type from the schema for better TypeScript inference
type AccessControlFormValues = z.infer<typeof AccessControlFormSchema>;

export const useAccessControlForm = () => {
    return useForm<AccessControlFormValues>({
        resolver: zodResolver(AccessControlFormSchema),
        defaultValues: {
            assessment_creation_access: {
                roles: [],
                users: [],
            },
            live_assessment_notification: {
                roles: [],
                users: [],
            },
            assessment_submission_and_report_access: {
                roles: [],
                users: [],
            },
            evaluation_process: {
                roles: [],
                users: [],
            },
        },
        mode: "onChange",
    });
};
