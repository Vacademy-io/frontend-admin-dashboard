import { MyDropdown } from '@/components/design-system/dropdown';
import { MyButton } from '@/components/design-system/button';
import { DotsThree } from 'phosphor-react';
import { useState } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CampaignItem, CampaignListResponse } from '../../-services/get-campaigns-list';
import { deleteAudienceCampaign } from '../../-services/delete-audience-campaign';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

interface AudienceCampaignCardMenuOptionsProps {
    campaign: CampaignItem;
    onEdit?: (campaign: CampaignItem) => void;
}

export const AudienceCampaignCardMenuOptions = ({
    campaign,
    onEdit,
}: AudienceCampaignCardMenuOptionsProps) => {
    const queryClient = useQueryClient();
    const dropdownList = ['edit', 'delete'];
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { instituteDetails } = useInstituteDetailsStore();

    const instituteId = instituteDetails?.id || campaign.institute_id;
    const campaignId = campaign.campaign_id || campaign.id || campaign.audience_id;
    // Backend delete endpoint expects `audienceId`, which should be the campaign identifier.
    const audienceIdForDelete = campaignId;

    const deleteCampaignMutation = useMutation({
        mutationFn: async () => {
            if (!instituteId || !audienceIdForDelete) {
                throw new Error('Missing institute or campaign identifier to delete the campaign.');
            }
            return deleteAudienceCampaign(instituteId, audienceIdForDelete);
        },
        onSuccess: () => {
            queryClient.setQueriesData(
                { queryKey: ['campaignsList'] },
                (existingData: CampaignListResponse | undefined) => {
                    if (!existingData) return existingData;
                    const filteredContent = existingData.content?.filter(
                        (item) =>
                            (item.campaign_id || item.id || item.audience_id) !== audienceIdForDelete
                    );
                    return {
                        ...existingData,
                        content: filteredContent,
                        totalElements: Math.max((existingData.totalElements || 1) - 1, 0),
                        numberOfElements: Math.max((existingData.numberOfElements || 1) - 1, 0),
                    };
                }
            );
            queryClient.invalidateQueries({ queryKey: ['campaignsList'] });
            toast.success('Campaign deleted successfully');
            setOpenDeleteDialog(false);
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : 'Failed to delete the campaign';
            toast.error(message);
        },
    });

    const handleDeleteCampaign = async () => {
        await deleteCampaignMutation.mutateAsync();
    };

    const handleSelect = async (value: string) => {
        if (value === 'delete') {
            setOpenDeleteDialog(true);
        } else if (value === 'edit') {
            if (onEdit) {
                onEdit(campaign);
            } else {
                toast.info('Edit campaign functionality coming soon');
            }
        }
    };

    return (
        <>
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton buttonType="secondary" scale="medium" layoutVariant="icon">
                    <DotsThree />
                </MyButton>
            </MyDropdown>

            <MyDialog
                open={openDeleteDialog}
                onOpenChange={() => setOpenDeleteDialog((prev) => !prev)}
                heading="Delete Campaign"
                footer={
                    <div className="flex w-full items-center justify-between py-2">
                        <MyButton buttonType="secondary" onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </MyButton>
                        <MyButton
                            buttonType="primary"
                            onClick={handleDeleteCampaign}
                            disable={deleteCampaignMutation.isPending}
                        >
                            Yes, delete it
                        </MyButton>
                    </div>
                }
            >
                Are you sure you want to delete the campaign &quot;{campaign.campaign_name}&quot;?
            </MyDialog>
        </>
    );
};

