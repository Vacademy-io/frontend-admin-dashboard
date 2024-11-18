import { useState } from "react";
import { SendResetLink } from "./send-reset-link";
// import { SetPassword } from "./set-password-form";

export function ForgotPassword() {
    const [resetLinkClick, setResetLinkClick] = useState<boolean>(false);

    //to deal with es lint check error
    console.log(resetLinkClick);

    return (
        // resetLinkClick ? (
        //     <SetPassword />
        // ) : (
        <SendResetLink setResetLinkClick={setResetLinkClick} />
        // );
    );
}
