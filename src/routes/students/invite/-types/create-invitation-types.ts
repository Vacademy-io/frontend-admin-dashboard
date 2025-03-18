export interface CustomFieldType {
    id: string;
    field_name: string;
    field_type: string;
    default_value: string;
    description: string;
    is_mandatory: boolean;
    comma_separated_options: string;
}

export interface CreateInvitationRequestType {
    emails_to_send_invitation: string[];
    learner_invitation: {
        id: string;
        name: string;
        status: "ACTIVE" | "INACTIVE";
        date_generated: string;
        expiry_date: string;
        institute_id: string;
        invite_code: string;
        batch_options_json: string;
        custom_fields: CustomFieldType[];
    };
}

export interface LevelType {
    id: string;
    name: string;
    package_session_id: string;
}

export interface LearnerChoiceSessionType {
    max_selectable_levels: number;
    id: string;
    name: string;
    learner_choice_levels: LevelType[];
}

export interface BatchOptionJsonType {
    institute_assigned: boolean;
    max_selectable_packages: number;
    pre_selected_packages: {
        id: string;
        name: string;
        institute_assigned: boolean;
        max_selectable_sessions: number;
        pre_selected_session_dtos: {
            id: string;
            name: string;
            institute_assigned: boolean;
            max_selectable_levels: number;
            pre_selected_levels: LevelType[];
            learner_choice_levels: LevelType[];
        }[];
        learner_choice_sessions: LearnerChoiceSessionType[];
    }[];

    learner_choice_packages: {
        id: string;
        name: string;
        max_selectable_sessions: number;
        learner_choice_sessions: LearnerChoiceSessionType[];
    }[];
}
