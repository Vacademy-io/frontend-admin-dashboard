import { TokenKey } from "@/constants/auth/tokens";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";

export default function createInviteLink(inviteCode: string) {
    const baseUrl = window.location.origin;
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const url = `${baseUrl}/learner-invitation-response?instituteId=${INSTITUTE_ID}&inviteCode=${inviteCode}`;
    return url;
}
