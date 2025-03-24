import { MyButton } from "@/components/design-system/button";
import { Copy, Plus } from "phosphor-react";
import { CreateInviteDialog } from "./create-invite/CreateInviteDialog";
import { InviteFormType } from "../-schema/InviteFormSchema";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyInvitePage } from "@/assets/svgs";
import { InviteCardMenuOptions } from "./InviteCardMenuOptions";
// import formDataToRequestData from "../-utils/formDataToRequestData";
// import { useCreateInvite } from "../-services/create-invite";
// import { CreateInvitationRequestType } from "../-types/create-invitation-types";
import { TokenKey } from "@/constants/auth/tokens";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { MyPagination } from "@/components/design-system/pagination";
import { usePaginationState } from "@/hooks/pagination";
import { useGetInviteList } from "../-services/get-invite-list";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import createInviteLink from "../-utils/createInviteLink";

export const Invite = () => {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const formSubmitRef = useRef<() => void>(() => {});
    // const createInviteMutation = useCreateInvite();
    const [openCreateInviteDialog, setOpenCreateInviteDialog] = useState(false);
    // const [inviteLink, setInviteLink] = useState<string | null>(null);
    const inviteLink = null;
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

    // const [filterRequest, setFilterRequest] = useState<InviteFilterRequest>({
    //     status: ["ACTIVE", "INACTIVE"],
    //     name: ""
    // })
    const filterRequest = {
        status: ["ACTIVE", "INACTIVE"],
        name: "",
    };

    const onOpenChangeCreateInviteDialog = () => {
        setOpenCreateInviteDialog(!openCreateInviteDialog);
    };

    const {
        data: inviteList,
        isLoading,
        isError,
    } = useGetInviteList({
        instituteId: INSTITUTE_ID || "",
        pageNo: page,
        pageSize: pageSize,
        requestFilterBody: filterRequest,
    });

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
            <MyButton>Create</MyButton>
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

    const onEditInvite = (updatedInvite: InviteFormType) => {
        console.log(updatedInvite);
    };

    const onCreateInvite = async (invite: InviteFormType) => {
        // const requestData = formDataToRequestData(invite);
        // try {
        //     const { data: responseData }: { data: CreateInvitationRequestType } =
        //         await createInviteMutation.mutateAsync({ requestBody: requestData });
        //     toast.success("invitation created");
        //     const link = createInviteLink(responseData?.learner_invitation?.invite_code || "");
        //     setInviteLink(link);
        //     // setOpenCreateInviteDialog(false);
        // } catch {
        //     toast.error("failed to create invitation");
        // }
        console.log(invite);
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
                    onCreateInvite={onCreateInvite}
                    open={openCreateInviteDialog}
                    onOpenChange={onOpenChangeCreateInviteDialog}
                    inviteLink={inviteLink}
                />
            </div>
            <div className="flex w-full flex-col gap-10">
                {isError ? (
                    <p>Error fetching invitation links</p>
                ) : isLoading ? (
                    <DashboardLoader />
                ) : !inviteList || !inviteList.content ? (
                    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
                        <EmptyInvitePage />
                        <p>No invite link has been created yet!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {inviteList.content.map((obj, index) => (
                            <div
                                key={index}
                                className="flex w-full flex-col gap-4 rounded-lg border border-neutral-300 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-title font-semibold">{obj.name}</p>
                                    <InviteCardMenuOptions invite={obj} onEdit={onEditInvite} />
                                </div>
                                <div className="flex items-center gap-12 text-body font-regular">
                                    <p>Created on: {obj.date_generated}</p>
                                    <p>Invites accepted by: {obj.accepted_by}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-body font-semibold">Invite Link: </p>
                                    <p className="text-subtitle underline">{`${createInviteLink(
                                        obj.invite_code,
                                    ).slice(0, 40)}..`}</p>
                                    <div className="flex items-center gap-2">
                                        <MyButton
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="icon"
                                            onClick={() =>
                                                handleCopyClick(createInviteLink(obj.invite_code))
                                            }
                                        >
                                            <Copy />
                                        </MyButton>
                                        {copySuccess == createInviteLink(obj.invite_code) && (
                                            <span className="text-caption text-primary-500">
                                                Copied!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <MyPagination
                            currentPage={page}
                            totalPages={inviteList.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
