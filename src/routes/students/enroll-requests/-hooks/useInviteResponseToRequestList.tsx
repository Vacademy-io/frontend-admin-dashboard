import { TokenKey } from "@/constants/auth/tokens";
import { LearnerEnrollRequestType } from "../-types/enroll-request-types";
import { BatchSelectionJsonResponses, LearnerInvitationData } from "../-types/enroll-response-type";
import createInviteLink from "../../invite/-utils/createInviteLink";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const inviteResponseToRequest = ({
    data,
    packageSessionId,
}: {
    data: LearnerInvitationData;
    packageSessionId: string;
}): LearnerEnrollRequestType => {
    const inviteLink = createInviteLink(data.learner_invitation.invite_code);
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const enrollRequest: LearnerEnrollRequestType = {
        invite_link: inviteLink,
        invite_link_name: data.learner_invitation.name,
        request_time: data.learner_invitation_response_dto.recorded_on,
        learner: {
            id: data.learner_invitation_response_dto.id,
            username: "",
            user_id: "",
            email: data.learner_invitation_response_dto.email,
            full_name: data.learner_invitation_response_dto.full_name,
            address_line: "",
            region: null,
            city: "",
            pin_code: "",
            mobile_number: "",
            date_of_birth: "",
            gender: "MALE",
            father_name: "",
            mother_name: "",
            parents_mobile_number: "",
            parents_email: "",
            linked_institute_name: "",
            package_session_id: packageSessionId,
            institute_enrollment_id: "",
            status:
                data.learner_invitation_response_dto.status == "ACTIVE" ? "ACTIVE" : "TERMINATED",
            session_expiry_days: 365,
            institute_id: INSTITUTE_ID || "",
            face_file_id: "",
            expiry_date: 0,
            created_at: "",
            updated_at: "",
        },
    };
    return enrollRequest;
};

export const useInviteResponseToRequestList = ({
    data,
}: {
    data: LearnerInvitationData;
}): LearnerEnrollRequestType[] => {
    const batchSelectionResponse: BatchSelectionJsonResponses = JSON.parse(
        data.learner_invitation_response_dto.batch_selection_response_json,
    );
    const { getPackageSessionId } = useInstituteDetailsStore();

    const requestList: LearnerEnrollRequestType[] = batchSelectionResponse.flatMap((course) =>
        course.selected_sessions.flatMap((session) =>
            session.selected_levels.map((levelId) => {
                const packageSessionId = getPackageSessionId({
                    courseId: course.package_id,
                    sessionId: session.session_id,
                    levelId,
                });
                return inviteResponseToRequest({ packageSessionId: packageSessionId || "", data });
            }),
        ),
    );

    return requestList;
};
