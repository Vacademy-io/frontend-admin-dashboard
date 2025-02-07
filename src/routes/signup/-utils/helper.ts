import { z } from "zod";
import {
    FormValuesStep1Signup,
    organizationDetailsSignupStep1,
} from "../onboarding/-components/Step2AddOrgDetails";

export const convertedSignupData = ({
    searchParams,
    formData,
    formDataOrg,
}: {
    searchParams: Record<string, boolean>;
    formData: FormValuesStep1Signup;
    formDataOrg: z.infer<typeof organizationDetailsSignupStep1>;
}) => {
    const sub_modules = [];

    if (searchParams.assess) {
        sub_modules.push({
            module: "1",
            sub_module: "",
            sub_module_description: "",
        });
    }

    if (searchParams.lms) {
        sub_modules.push({
            module: "2",
            sub_module: "",
            sub_module_description: "",
        });
    }

    const data = {
        full_name: formDataOrg.name,
        user_name: formDataOrg.username,
        email: formDataOrg.email,
        password: formDataOrg.password,
        user_roles: [...formDataOrg.roleType],
        institute: {
            institute_name: formData.instituteName,
            id: "",
            country: "",
            state: "",
            city: "",
            address: "",
            pin_code: "",
            phone: "",
            email: "",
            website_url: "",
            institute_logo_file_id: formData.instituteProfilePic,
            institute_theme_code: "",
            language: "",
            description: "",
            type: formData.instituteType,
            held_by: "",
            founded_date: "",
            module_request_ids: [],
            sub_modules: sub_modules,
            sessions: [
                {
                    id: "",
                    session_name: "",
                    status: "",
                },
            ],
            batches_for_sessions: [
                {
                    id: "",
                    level: {
                        id: "",
                        level_name: "",
                        duration_in_days: 0,
                        thumbnail_id: "",
                    },
                    session: {
                        id: "",
                        session_name: "",
                        status: "",
                    },
                    start_time: "",
                    status: "",
                    package_dto: {
                        id: "",
                        package_name: "",
                        thumbnail_file_id: "",
                    },
                },
            ],
            levels: [
                {
                    id: "",
                    level_name: "",
                    duration_in_days: 0,
                    thumbnail_id: "",
                },
            ],
            genders: [],
            student_statuses: [],
            subjects: [
                {
                    id: "",
                    subject_name: "",
                    subject_code: "",
                    credit: 0,
                    thumbnail_id: "",
                    created_at: "",
                    updated_at: "",
                    subject_order: 0,
                },
            ],
            session_expiry_days: [],
        },
    };
    return data;
};
