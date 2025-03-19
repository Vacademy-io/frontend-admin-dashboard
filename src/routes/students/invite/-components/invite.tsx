import { MyButton } from "@/components/design-system/button";
import { Copy, Plus } from "phosphor-react";
import { InviteLinkType } from "../-types/invite-link-types";
import { CreateInviteDialog } from "./create-invite/CreateInviteDialog";
import { InviteFormType } from "./create-invite/-schema/InviteFormSchema";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyInvitePage } from "@/assets/svgs";
import { InviteCardMenuOptions } from "./InviteCardMenuOptions";

export const Invite = () => {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const formSubmitRef = useRef<() => void>(() => {});

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
            invite_link: "https://forms.gle/example124",
        },
        {
            invite_link_name: "10th Premium Pro",
            creation_date: "13/10/24",
            accepted_by: 23,
            invite_link: "https://forms.gle/example125",
        },
    ];

    const CreateInviteButton = (
        <MyButton>
            <Plus /> Create Invite Link
        </MyButton>
    );

    const inviteSubmitButton = (
        <div
            className="flex w-full items-center justify-end"
            onClick={() => formSubmitRef.current()}
        >
            <MyButton type="submit">Create</MyButton>
        </div>
    );

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

    const onDeleteInvite = (invite: InviteLinkType) => {
        console.log(invite);
    };
    const onEditInvite = (updatedInvite: InviteFormType) => {
        console.log(updatedInvite);
    };

    return (
        <div className="flex w-full flex-col gap-10">
            <div className="flex items-center justify-between">
                <p className="text-h3 font-semibold">Invite Link List</p>
                <CreateInviteDialog
                    triggerButton={CreateInviteButton}
                    submitButton={inviteSubmitButton}
                    submitForm={(fn: () => void) => {
                        formSubmitRef.current = fn;
                    }}
                />
            </div>
            <div className="flex w-full flex-col gap-10">
                {data.length == 0 ? (
                    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
                        <EmptyInvitePage />
                        <p>No invite link has been created yet!</p>
                    </div>
                ) : (
                    data.map((obj, index) => (
                        <div
                            key={index}
                            className="flex w-full flex-col gap-4 rounded-lg border border-neutral-300 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-title font-semibold">{obj.invite_link_name}</p>
                                <InviteCardMenuOptions
                                    invite={obj}
                                    onDelete={onDeleteInvite}
                                    onEdit={onEditInvite}
                                />
                            </div>
                            <div className="flex items-center gap-12 text-body font-regular">
                                <p>Created on: {obj.creation_date}</p>
                                <p>Invites accepted by: {obj.accepted_by}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-body font-semibold">Invite Link: </p>
                                <p className="text-subtitle underline">{obj.invite_link}</p>
                                <div className="flex items-center gap-2">
                                    <MyButton
                                        buttonType="secondary"
                                        scale="medium"
                                        layoutVariant="icon"
                                        onClick={() => handleCopyClick(obj.invite_link)}
                                    >
                                        <Copy />
                                    </MyButton>
                                    {copySuccess == obj.invite_link && (
                                        <span className="text-caption text-primary-500">
                                            Copied!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
