import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import testAccessSchema from "./add-participants-schema";

export type TestAccessFormType = z.infer<typeof testAccessSchema>;

// Custom hook for handling form logic
export const useTestAccessForm = (): UseFormReturn<TestAccessFormType> => {
    return useForm<TestAccessFormType>({
        resolver: zodResolver(testAccessSchema),
        defaultValues: {
            closed_test: false,
            open_test: {
                checked: false,
                start_date: "",
                end_date: "",
                instructions: "",
                name: "",
                email: "",
                phone: "",
                custom_fields: {}, // Default to an empty object for custom fields
            },
            select_batch: {
                checked: false,
                batch_details: {},
            },
            select_individually: {
                checked: false,
                student_details: [],
            },
            join_link: "",
            show_leaderboard: false,
            notify_student: {
                when_assessment_created: false,
                before_assessment_goes_live: {
                    checked: false,
                    value: "",
                },
                when_assessment_live: false,
                when_assessment_report_generated: false,
            },
            notify_parent: {
                when_assessment_created: false,
                before_assessment_goes_live: {
                    checked: false,
                    value: "",
                },
                when_assessment_live: false,
                when_student_appears: false,
                when_student_finishes_test: false,
                when_assessment_report_generated: false,
            },
        },
        mode: "onChange",
    });
};
