import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { InviteFormType } from "../-schema/InviteFormSchema";
import {
    BatchOptionJsonType,
    CreateInvitationRequestType,
    CustomFieldType,
    InviteLevelType,
    LearnerChoicePackagesType,
    LearnerChoiceSessionType,
    PreSelectedPackagesType,
    PreSelectedSessionType,
} from "../-types/create-invitation-types";
import { TokenKey } from "@/constants/auth/tokens";

export const fetchPreSelectedLevels = (data: InviteFormType): InviteLevelType[] => {
    if (data.levelSelectionMode == "institute") {
        const preSelectedLevels: InviteLevelType[] =
            data.preSelectedLevels?.map((level) => ({
                id: level.id,
                name: level.name,
                package_session_id: null,
            })) || [];
        return preSelectedLevels;
    }
    return [];
};

export const fetchLearnerChoiceLevels = (data: InviteFormType): InviteLevelType[] => {
    if (data.levelSelectionMode == "both") {
        const preSelectedLevels: InviteLevelType[] =
            data.learnerChoiceLevels?.map((level) => ({
                id: level.id,
                name: level.name,
                package_session_id: null,
            })) || [];
        return preSelectedLevels;
    }
    return [];
};

export const fetchPreSelectedSessions = (data: InviteFormType): PreSelectedSessionType[] => {
    if (data.sessionSelectionMode == "institute") {
        const preSelectedLevels = fetchPreSelectedLevels(data);
        const learnerChoiceLevels = fetchLearnerChoiceLevels(data);
        const preSelectedSessions: PreSelectedSessionType[] =
            data.preSelectedSessions?.map((session) => ({
                id: session.id,
                name: session.name,
                institute_assigned: data.levelSelectionMode != "student" ? true : false,
                max_selectable_levels:
                    data.levelSelectionMode == "institute" ? 0 : data.maxLevels || 1,
                pre_selected_levels: preSelectedLevels,
                learner_choice_levels: learnerChoiceLevels,
            })) || [];
        return preSelectedSessions;
    }
    return [];
};

export const fetchLearnerChoiceSessions = (data: InviteFormType): LearnerChoiceSessionType[] => {
    if (data.sessionSelectionMode == "both") {
        const learnerChoiceLevels = fetchLearnerChoiceLevels(data);
        const learnerChoiceSessions: LearnerChoiceSessionType[] =
            data.learnerChoiceSessions?.map((session) => ({
                id: session.id,
                name: session.name,
                max_selectable_levels:
                    data.levelSelectionMode == "institute" ? 0 : data.maxLevels || 1,
                learner_choice_levels: learnerChoiceLevels,
            })) || [];
        return learnerChoiceSessions;
    }
    return [];
};

export const fetchPreSelectedCourses = (data: InviteFormType): PreSelectedPackagesType[] => {
    if (data.courseSelectionMode == "institute") {
        const preSelectedSessions = fetchPreSelectedSessions(data);
        const learnerChoiceSessions = fetchLearnerChoiceSessions(data);
        const preSelectedCourses: PreSelectedPackagesType[] =
            data.preSelectedCourses?.map((course) => ({
                id: course.id,
                name: course.name,
                institute_assigned: data.sessionSelectionMode != "student" ? true : false,
                max_selectable_sessions:
                    data.sessionSelectionMode == "institute" ? 0 : data.maxSessions || 1,
                pre_selected_session_dtos: preSelectedSessions,
                learner_choice_sessions: learnerChoiceSessions,
            })) || [];
        return preSelectedCourses;
    }
    return [];
};

export const fetchLearnerChoiceCourses = (data: InviteFormType): LearnerChoicePackagesType[] => {
    if (data.courseSelectionMode == "both") {
        const learnerChoiceSessions = fetchLearnerChoiceSessions(data);
        const learnerChoiceCourses: LearnerChoicePackagesType[] =
            data.learnerChoiceCourses?.map((course) => ({
                id: course.id,
                name: course.name,
                max_selectable_sessions:
                    data.sessionSelectionMode == "institute" ? 0 : data.maxSessions || 1,
                learner_choice_sessions: learnerChoiceSessions,
            })) || [];
        return learnerChoiceCourses;
    }
    return [];
};

export const fetchBatchOptions = (data: InviteFormType): string => {
    const preSelectedCoures = fetchPreSelectedCourses(data);
    const learnerChoiceCourses = fetchLearnerChoiceCourses(data);
    const batchOptionsJson: BatchOptionJsonType = {
        institute_assigned: data.courseSelectionMode != "student" ? true : false,
        max_selectable_packages: data.courseSelectionMode == "institute" ? 0 : data.maxCourses || 1,
        pre_selected_packages: preSelectedCoures,
        learner_choice_packages: learnerChoiceCourses,
    };
    return JSON.stringify(batchOptionsJson);
};

export const fetchCustomFields = (data: InviteFormType): CustomFieldType[] => {
    const customFields: CustomFieldType[] =
        data.custom_fields?.map((field) => ({
            id: field.id.toString(),
            field_name: field.name,
            field_type: field.type == "dropdown" ? "DROPDOWN" : "TEXT",
            default_value: null,
            description: "",
            is_mandatory: field.isRequired,
            comma_separated_options: field.options?.map((option) => option.value).join(",") || "",
        })) || [];
    return customFields;
};

export default function formDataToRequestData(data: InviteFormType): CreateInvitationRequestType {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const batchOptions = fetchBatchOptions(data);
    const customFields = fetchCustomFields(data);
    const request: CreateInvitationRequestType = {
        emails_to_send_invitation: data.inviteeEmails.map((emailObj) => emailObj.value),
        learner_invitation: {
            id: null,
            name: data.inviteLink,
            status: data.activeStatus ? "ACTIVE" : "INACTIVE",
            date_generated: null,
            expiry_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
            institute_id: INSTITUTE_ID || "",
            invite_code: null,
            batch_options_json: batchOptions,
            custom_fields: customFields,
        },
    };
    return request;
}
