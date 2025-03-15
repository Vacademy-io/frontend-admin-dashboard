import { MyButton } from "@/components/design-system/button";
import { Copy, DotsThree, Plus } from "phosphor-react";
import { InviteLinkType } from "../-types/invite-link-types";
import { CreateInviteDialog } from "./create-invite-dialog";

export const Invite = () => {
    const data: InviteLinkType[] = [
        {
            invite_link_name: "10th Premium Pro",
            creation_date: "13/10/24",
            accepted_by: 23,
            invite_link: "https://forms.gle/example123",
        },
        {
            invite_link_name: "10th Premium Pro",
            creation_date: "13/10/24",
            accepted_by: 23,
            invite_link: "https://forms.gle/example123",
        },
        {
            invite_link_name: "10th Premium Pro",
            creation_date: "13/10/24",
            accepted_by: 23,
            invite_link: "https://forms.gle/example123",
        },
    ];

    const CreateInviteButton = (
        <MyButton>
            <Plus /> Create Invite Link
        </MyButton>
    );

    const inviteSubmitButton = (
        <div className="flex-end flex w-full items-center">
            <MyButton>Create</MyButton>
        </div>
    );

    return (
        <div className="flex w-full flex-col gap-10">
            <div className="flex items-center justify-between">
                <p className="text-h3 font-semibold">Invite Link List</p>
                <CreateInviteDialog
                    triggerButton={CreateInviteButton}
                    submitButton={inviteSubmitButton}
                />
            </div>
            <div className="flex w-full flex-col gap-10">
                {data.map((obj, index) => (
                    <div
                        key={index}
                        className="flex w-full flex-col gap-4 rounded-lg border border-neutral-300 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-title font-semibold">{obj.invite_link_name}</p>
                            <MyButton buttonType="secondary" scale="medium" layoutVariant="icon">
                                {" "}
                                <DotsThree />{" "}
                            </MyButton>
                        </div>
                        <div className="flex items-center gap-12 text-body font-regular">
                            <p>Created on: {obj.creation_date}</p>
                            <p>Invites accepted by: {obj.accepted_by}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-body font-semibold">Invite Link: </p>
                            <p className="text-subtitle underline">{obj.invite_link}</p>
                            <MyButton buttonType="secondary" scale="medium" layoutVariant="icon">
                                <Copy />
                            </MyButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
