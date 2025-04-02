import {
    BatchDetails,
    CustomField,
    InviteForm,
    LearnerChoiceCourse,
    LearnerChoiceSession,
    LevelField,
    PreSelectedCourse,
    PreSelectedSession,
} from "../-schema/InviteFormSchema";
import {
    BatchOptionJsonType,
    CustomFieldType,
    InviteLevelType,
    LearnerChoicePackagesType,
    LearnerChoiceSessionType,
    LearnerInvitationType,
    PreSelectedPackagesType,
    PreSelectedSessionType,
} from "../-types/create-invitation-types";

export const responseToFormLevel = (responseLevel: InviteLevelType): LevelField => {
    const formLevel: LevelField = {
        id: responseLevel.id,
        name: responseLevel.name,
        packageSessionId: responseLevel.package_session_id || "",
    };
    return formLevel;
};

export const responseToFormLearnerChoiceSession = (
    responseLearnerChoiceSession: LearnerChoiceSessionType,
): LearnerChoiceSession => {
    const learnerChoiceLevels = responseLearnerChoiceSession.learner_choice_levels.map((level) =>
        responseToFormLevel(level),
    );
    const formLearnerChoiceSession: LearnerChoiceSession = {
        id: responseLearnerChoiceSession.id,
        name: responseLearnerChoiceSession.name,
        maxLevels: responseLearnerChoiceSession.max_selectable_levels,
        levelSelectionMode: "student",
        learnerChoiceLevels: learnerChoiceLevels,
    };
    return formLearnerChoiceSession;
};

export const responseToFormPreSelectedSession = (
    responsePreSelectedSession: PreSelectedSessionType,
): PreSelectedSession => {
    const preSelectedLevels = responsePreSelectedSession.pre_selected_levels.map((level) =>
        responseToFormLevel(level),
    );
    const learnerChoiceLevels = responsePreSelectedSession.learner_choice_levels.map((level) =>
        responseToFormLevel(level),
    );
    const formPreSelectedSession: PreSelectedSession = {
        id: responsePreSelectedSession.id,
        name: responsePreSelectedSession.name,
        maxLevels: responsePreSelectedSession.max_selectable_levels,
        levelSelectionMode: responsePreSelectedSession.institute_assigned ? "institute" : "student",
        learnerChoiceLevels: learnerChoiceLevels,
        preSelectedLevels: preSelectedLevels,
    };
    return formPreSelectedSession;
};

export const responseToFormLearnerChoiceCourse = (
    responseLearnerChoiceCourse: LearnerChoicePackagesType,
): LearnerChoiceCourse => {
    const learnerChoiceSessions = responseLearnerChoiceCourse.learner_choice_sessions.map(
        (session) => responseToFormLearnerChoiceSession(session),
    );
    const formLearnerChoiceCourse: LearnerChoiceCourse = {
        id: responseLearnerChoiceCourse.id,
        name: responseLearnerChoiceCourse.name,
        maxSessions: responseLearnerChoiceCourse.max_selectable_sessions,
        sessionSelectionMode: "student",
        learnerChoiceSessions: learnerChoiceSessions,
    };
    return formLearnerChoiceCourse;
};

export const responseToFormPreSelectedCourse = (
    responsePreSelectedCourse: PreSelectedPackagesType,
): PreSelectedCourse => {
    const learnerChoiceSessions = responsePreSelectedCourse.learner_choice_sessions.map((session) =>
        responseToFormLearnerChoiceSession(session),
    );
    const preSelectedSessions = responsePreSelectedCourse.pre_selected_session_dtos.map((session) =>
        responseToFormPreSelectedSession(session),
    );
    const formPreSelectedCourse: PreSelectedCourse = {
        id: responsePreSelectedCourse.id,
        name: responsePreSelectedCourse.name,
        maxSessions: responsePreSelectedCourse.max_selectable_sessions,
        sessionSelectionMode: responsePreSelectedCourse.institute_assigned
            ? "institute"
            : "student",
        learnerChoiceSessions: learnerChoiceSessions,
        preSelectedSessions: preSelectedSessions,
    };
    return formPreSelectedCourse;
};

export const responseToFormBatch = (responseBatch: BatchOptionJsonType): BatchDetails => {
    const preSelectedCourse = responseBatch.pre_selected_packages.map((course) =>
        responseToFormPreSelectedCourse(course),
    );
    const learnerChoiceCourse = responseBatch.learner_choice_packages.map((course) =>
        responseToFormLearnerChoiceCourse(course),
    );
    const batchFormData: BatchDetails = {
        maxCourses: responseBatch.max_selectable_packages,
        courseSelectionMode: responseBatch.institute_assigned ? "institute" : "student",
        preSelectedCourses: preSelectedCourse,
        learnerChoiceCourses: learnerChoiceCourse,
    };
    return batchFormData;
};

export const responseToFormCustomField = (responseCustomField: CustomFieldType): CustomField => {
    const options = responseCustomField.comma_separated_options.split(",");
    const requiredOptionsFormat = options.map((option, index) => ({
        id: index,
        value: option,
        disabled: false,
    }));
    const formCustomField: CustomField = {
        id: Math.floor(Math.random() * 100000),
        type: responseCustomField.field_type,
        name: responseCustomField.field_name,
        oldKey: true,
        isRequired: responseCustomField.is_mandatory,
        options: requiredOptionsFormat,
    };

    return formCustomField;
};

export default function responseDataToFormData(data: LearnerInvitationType): InviteForm {
    const responseBatch: BatchOptionJsonType = JSON.parse(data.batch_options_json);
    const formBatch: BatchDetails = responseToFormBatch(responseBatch);
    const CustomFields: CustomField[] = data.custom_fields.map((customField) =>
        responseToFormCustomField(customField),
    );
    // const inviteeEmails = data.emails_to_send_invitation.map((email, index)=>({ value: email, id: index.toString()}))

    // Convert expiry_date to Date format and calculate remaining days
    const expiryDate = new Date(data.expiry_date);
    const currentDate = new Date();
    const timeDifference = expiryDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDifference / (1000 * 60 * 60 * 24)));

    const formData: InviteForm = {
        inviteLink: data.name,
        activeStatus: data.status === "ACTIVE",
        custom_fields: CustomFields,
        batches: formBatch,
        studentExpiryDays: daysRemaining, // Use calculated value
        inviteeEmails: [{ id: "", value: "abc@gmail.com" }],
        inviteeEmail: "",
    };

    return formData;
}
