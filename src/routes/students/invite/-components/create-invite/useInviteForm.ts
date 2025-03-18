import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inviteFormSchema, InviteFormType, defaultFormValues } from "./InviteFormSchema";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const useInviteForm = (initialValues?: InviteFormType) => {
    const { instituteDetails, getCourseFromPackage, getLevelsFromPackage, getSessionFromPackage } =
        useInstituteDetailsStore();
    const [courseList, setCourseList] = useState(getCourseFromPackage());
    const [sessionList, setSessionList] = useState(getSessionFromPackage());
    const [levelList, setLevelList] = useState(getLevelsFromPackage());
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // Initialize form
    const form = useForm<InviteFormType>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: initialValues || defaultFormValues,
    });

    const { setValue, getValues } = form;

    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
    }, [instituteDetails]);

    // Functions to handle custom fields
    const toggleIsRequired = (id: number) => {
        const customFields = getValues("custom_fields");
        const updatedFields = customFields?.map((field) =>
            field.id === id ? { ...field, isRequired: !field.isRequired } : field,
        );
        setValue("custom_fields", updatedFields);
    };

    const handleAddOpenFieldValues = (type: string, name: string, oldKey: boolean) => {
        const customFields = getValues("custom_fields");
        // Add the new field to the array
        const updatedFields = [
            ...customFields,
            {
                id: customFields.length,
                type,
                name,
                oldKey,
                isRequired: true,
            },
        ];

        // Update the form state with the new array
        setValue("custom_fields", updatedFields);
    };

    const handleDeleteOpenField = (id: number) => {
        const customFields = getValues("custom_fields");
        const updatedFields = customFields?.filter((field) => field.id !== id);
        setValue("custom_fields", updatedFields);
    };

    const handleCopyClick = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopySuccess(link);
                setTimeout(() => {
                    setCopySuccess(null);
                }, 2000);
            })
            .catch((err) => {
                console.log("Failed to copy link: ", err);
                toast.error("Copy failed");
            });
    };

    return {
        form,
        courseList,
        sessionList,
        levelList,
        toggleIsRequired,
        handleAddOpenFieldValues,
        handleDeleteOpenField,
        handleCopyClick,
        copySuccess,
    };
};
