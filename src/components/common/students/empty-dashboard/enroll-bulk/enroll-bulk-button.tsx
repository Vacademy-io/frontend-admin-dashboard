import { MyButton } from "@/components/design-system/button";
import { Share } from "@phosphor-icons/react";

export const EnrollBulkButton = () => {
    return (
        <MyButton buttonType="primary" scale="large" layoutVariant="default">
            <span>
                <Share />
            </span>
            Enroll in Bulk
        </MyButton>
    );
};
