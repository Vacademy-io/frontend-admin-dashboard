import EmptyInvitePage from '@/assets/svgs/empty-invite-page.svg';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { MyPagination } from '@/components/design-system/pagination';
import { usePaginationState } from '@/hooks/pagination';
import { MyButton } from '@/components/design-system/button';
import { useState, useMemo, useEffect } from 'react';
import { CreateCampaignDialog } from '../create-campaign-dialog/CreateCampaignDialog';
import { getDateFromUTCString } from '@/constants/helper';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCampaignsList } from '../../-hooks/useCampaignsList';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { CampaignItem } from '../../-services/get-campaigns-list';
import { AudienceCampaignCardMenuOptions } from './audience-campaign-card-menu-options';
import CampaignLink from '../create-campaign-dialog/CampaignLink';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { MyDropdown } from '@/components/design-system/dropdown';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DRAFT';

const SERVER_FETCH_SIZE = 200;

export const AudienceInvite = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [campaignBeingEdited, setCampaignBeingEdited] = useState<CampaignItem | null>(null);
    const { instituteDetails } = useInstituteDetailsStore();
    const navigate = useNavigate();

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

    // Reset to page 0 when filter or search changes
    useEffect(() => {
        if (page !== 0) {
            handlePageChange(0);
        }
        // we intentionally skip `page` in deps so this only runs when filters change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handlePageChange, searchQuery, statusFilter]);

    const statusDropdownOptions = [
        { label: 'All Status', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Draft', value: 'DRAFT' },
    ];

    const getStatusDisplayText = (status: string) => {
        const statusMap: Record<string, string> = {
            ALL: 'All Status',
            ACTIVE: 'Active',
            INACTIVE: 'Inactive',
            DRAFT: 'Draft',
        };
        return statusMap[status.toUpperCase()] || status;
    };

    const campaignsPayload = useMemo(
        () => ({
            institute_id: instituteDetails?.id || '',
            page: 0,
            size: SERVER_FETCH_SIZE,
            campaign_name: searchQuery || undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            sort_by: 'created_at',
            sort_direction: 'DESC',
        }),
        [instituteDetails?.id, searchQuery, statusFilter]
    );

    const {
        data: campaignsList,
        isLoading,
        isError,
    } = useCampaignsList(campaignsPayload);

    // Filter campaigns to only show ACTIVE, INACTIVE, or DRAFT status
    const filteredCampaigns = useMemo(() => {
        if (!campaignsList?.content) return [];
        return campaignsList.content.filter((campaign: CampaignItem) => {
            const normalizedStatus = campaign.status?.trim().toUpperCase();
            return ['ACTIVE', 'INACTIVE', 'DRAFT'].includes(normalizedStatus);
        });
    }, [campaignsList?.content]);

    const totalFilteredPages = useMemo(() => {
        if (!filteredCampaigns.length) return 1;
        return Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
    }, [filteredCampaigns.length, pageSize]);

    // Clamp page if current page exceeds total pages after filtering
    useEffect(() => {
        if (page > 0 && page >= totalFilteredPages) {
            handlePageChange(Math.max(totalFilteredPages - 1, 0));
        }
    }, [handlePageChange, page, totalFilteredPages]);

    const paginatedCampaigns = useMemo(() => {
        const startIndex = page * pageSize;
        return filteredCampaigns.slice(startIndex, startIndex + pageSize);
    }, [filteredCampaigns, page, pageSize]);

    // Update pagination info based on filtered (client-side paginated) results
    const displayCampaignsList = useMemo(() => {
        if (!campaignsList) return null;
        return {
            ...campaignsList,
            content: paginatedCampaigns,
            numberOfElements: paginatedCampaigns.length,
            totalElements: filteredCampaigns.length,
            totalPages: totalFilteredPages,
        };
    }, [campaignsList, filteredCampaigns.length, paginatedCampaigns, totalFilteredPages]);

    return (
        <div className="flex w-full flex-col gap-10">
            <div className="flex items-center justify-between">
                <p className="text-h3 font-semibold">Campaign List </p>
                
                <MyButton
                    buttonType="primary"
                    scale="medium"
                    onClick={() => {
                        setCampaignBeingEdited(null);
                        setIsDialogOpen(true);
                    }}
                >
                    +  Add Campaign
                </MyButton>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative min-w-[240px] flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search Campaign"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        aria-label="Search Campaign"
                    />
                </div>
                <div className="w-[180px]">
                    <MyDropdown
                        currentValue={getStatusDisplayText(statusFilter)}
                        handleChange={(value) => setStatusFilter(value as StatusFilter)}
                        dropdownList={statusDropdownOptions}
                        onSelect={(value) => setStatusFilter(value as StatusFilter)}
                        placeholder="Filter by Status"
                    />
                </div>
            </div>
            <div className="flex w-full flex-col gap-10">
                {isError ? (
                    <p>Error fetching campaigns</p>
                ) : isLoading ? (
                    <DashboardLoader />
                ) : !displayCampaignsList?.content || displayCampaignsList.content.length === 0 ? (
                    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
                        <EmptyInvitePage />
                        <p>
                            {statusFilter === 'ALL'
                                ? 'No campaigns found!'
                                : `No ${getStatusDisplayText(statusFilter).toLowerCase()} campaigns found!`}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {displayCampaignsList.content.map((campaign: CampaignItem, index: number) => {
                            // Calculate total users count from custom fields
                            // const totalUsersCount = campaign.institute_custom_fields?.length || 0;
                            const normalizedStatus = campaign.status?.trim().toUpperCase();
                            const campaignId =
                                campaign.id || campaign.campaign_id || campaign.audience_id || '';

                            const handleCampaignClick = () => {
                                if (!campaignId) {
                                    toast.error('Unable to open campaign details. Missing campaign identifier.');
                                    return;
                                }
                                navigate({
                                    to: '/audience-manager/list/campaign-users' as any,
                                    search: {
                                        campaignId,
                                        campaignName: campaign.campaign_name,
                                        customFields: campaign.institute_custom_fields
                                            ? JSON.stringify(campaign.institute_custom_fields)
                                            : undefined,
                                    } as any,
                                } as any);
                            };

                            return (
                                <div
                                    key={campaignId || index}
                                    className="flex w-full flex-col gap-4 rounded-lg border border-neutral-300 p-6 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                                    onClick={handleCampaignClick}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-title font-semibold">{campaign.campaign_name}</p>
                                            <div className="flex items-center gap-4 text-body font-regular">
                                                {/* <p className="text-neutral-600">
                                                    Total Users: <span className="font-semibold">{totalUsersCount}</span>
                                                </p> */}
                                                <p className="text-neutral-600">
                                                    Type: <span className="font-semibold capitalize">{campaign.campaign_type}</span>
                                                </p>
                                                <p className="text-neutral-600">
                                                    Status: <span className="font-semibold capitalize">{campaign.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <AudienceCampaignCardMenuOptions
                                                campaign={campaign}
                                                onEdit={(selectedCampaign) => {
                                                    setCampaignBeingEdited(selectedCampaign);
                                                    setIsDialogOpen(true);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12 text-body font-regular">
                                        <p>
                                            Start Date: {getDateFromUTCString(campaign.start_date_local)}
                                        </p>
                                        <p>
                                            End Date: {getDateFromUTCString(campaign.end_date_local)}
                                        </p>
                                    </div>
                                    {campaign.description && (
                                        <div className="text-body font-regular text-neutral-600">
                                            <p className="font-semibold mb-1">Description:</p>
                                            <p>{campaign.description}</p>
                                        </div>
                                    )}
                                    {campaign.campaign_objective && (
                                        <div className="text-body font-regular">
                                            <p>
                                                Objective: <span className="font-semibold">{campaign.campaign_objective}</span>
                                            </p>
                                        </div>
                                    )}
                                    <div className="pt-4" onClick={(e) => e.stopPropagation()}>
                                        {normalizedStatus === 'ACTIVE' ? (
                                            <CampaignLink campaignId={campaignId} label="Shareable link" />
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm font-semibold text-neutral-700">Shareable link</span>
                                                <p className="text-sm text-neutral-600">
                                                    You need to set campaign status to Active
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <MyPagination
                            currentPage={page}
                            totalPages={displayCampaignsList?.totalPages || 0}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
            <CreateCampaignDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setCampaignBeingEdited(null);
                }}
                campaign={campaignBeingEdited}
            />
        </div>
    );
};
