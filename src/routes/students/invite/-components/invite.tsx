import { MyButton } from "@/components/design-system/button";
import { Copy, Plus } from "phosphor-react";
import { CreateInviteDialog } from "./create-invite/CreateInviteDialog";
import { InviteForm } from "../-schema/InviteFormSchema";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyInvitePage } from "@/assets/svgs";
import { InviteCardMenuOptions } from "./InviteCardMenuOptions";
import formDataToRequestData from "../-utils/formDataToRequestData";
import { useCreateInvite } from "../-services/create-invite";
import { CreateInvitationRequestType } from "../-types/create-invitation-types";
import { TokenKey } from "@/constants/auth/tokens";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { MyPagination } from "@/components/design-system/pagination";
import { usePaginationState } from "@/hooks/pagination";
import { useGetInviteList } from "../-services/get-invite-list";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import createInviteLink from "../-utils/createInviteLink";
import { useInviteFormContext } from "../-context/useInviteFormContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MyDialog } from "@/components/design-system/dialog";

export const Invite = () => {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const formSubmitRef = useRef<() => void>(() => {});
    const createInviteMutation = useCreateInvite();
    const [openCreateInviteDialog, setOpenCreateInviteDialog] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const { form } = useInviteFormContext();
    const { setValue, watch } = form;
    const [disableCreateInviteButton, setDisableCreateInviteButton] = useState<boolean>(true);
    const [openInvitationLinkDialog, setOpenInvitationLinkDialog] = useState<boolean>(false);

    const handleDisableCreateInviteButton = (value: boolean) => {
        setDisableCreateInviteButton(value);
    };

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

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

    useEffect(() => {
        console.log(
            "values: ",
            watch("batches.preSelectedCourses"),
            watch("batches.learnerChoiceCourses"),
        );
    }, [watch("batches.preSelectedCourses"), watch("batches.learnerChoiceCourses")]);

    const inviteSubmitButton = (
        <div className="flex w-full items-center justify-end">
            <MyButton onClick={() => formSubmitRef.current()} disable={disableCreateInviteButton}>
                Create
            </MyButton>
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

    const onEditInvite = (updatedInvite: InviteForm) => {
        console.log(updatedInvite);
    };

    const onCreateInvite = async (invite: InviteForm) => {
        const requestData = formDataToRequestData(invite);
        try {
            const { data: responseData }: { data: CreateInvitationRequestType } =
                await createInviteMutation.mutateAsync({ requestBody: requestData });
            toast.success("invitation created");
            const link = createInviteLink(responseData?.learner_invitation?.invite_code || "");
            setInviteLink(link);
            setValue("batches", {
                maxCourses: 0,
                courseSelectionMode: "institute",
                preSelectedCourses: [],
                learnerChoiceCourses: [],
            });
            setOpenCreateInviteDialog(false);
            setOpenInvitationLinkDialog(true);
        } catch {
            toast.error("failed to create invitation");
        }
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
                    setInviteLink={setInviteLink}
                    handleDisableCreateInviteButton={handleDisableCreateInviteButton}
                />
            </div>
            <div className="flex w-full flex-col gap-10">
                {isError ? (
                    <p>Error fetching invitation links</p>
                ) : isLoading ? (
                    <DashboardLoader />
                ) : !inviteList || !inviteList.content || inviteList?.content.length == 0 ? (
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
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={createInviteLink(obj.invite_code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-subtitle underline hover:text-primary-500"
                                                >
                                                    {`${createInviteLink(obj.invite_code).slice(
                                                        0,
                                                        40,
                                                    )}..`}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent className="cursor-pointer border border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-primary-500">
                                                <a
                                                    href={createInviteLink(obj.invite_code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {createInviteLink(obj.invite_code)}
                                                </a>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

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

            <MyDialog
                heading="Invitation Link"
                open={openInvitationLinkDialog}
                onOpenChange={setOpenInvitationLinkDialog}
                footer={
                    <div className="flex w-full items-center justify-between">
                        <MyButton buttonType="secondary">Review Invitation</MyButton>
                        <MyButton onClick={() => setOpenInvitationLinkDialog(false)}>
                            Close
                        </MyButton>
                    </div>
                }
                dialogWidth="w-[50vw] overflow-x-hidden"
            >
                <div className="flex w-fit items-center gap-4 overflow-x-hidden">
                    <p className="w-[50%] overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-neutral-300 p-2 text-neutral-500">
                        {inviteLink}
                    </p>
                    <div className="flex items-center gap-2">
                        <MyButton
                            buttonType="secondary"
                            scale="medium"
                            layoutVariant="icon"
                            onClick={() => inviteLink && handleCopyClick(inviteLink)}
                            type="button"
                        >
                            <Copy />
                        </MyButton>
                        {copySuccess === inviteLink && (
                            <span className="text-caption text-primary-500">Copied!</span>
                        )}
                    </div>
                </div>
            </MyDialog>
        </div>
    );
};
