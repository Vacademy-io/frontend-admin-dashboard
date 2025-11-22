import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CreateCampaignDialog } from './-components/create-campaign-dialog/CreateCampaignDialog';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

interface AudienceItem {
    id: string;
    campaign_name: string;
    campaign_type: string;
    campaign_objective: string;
    status: string;
    start_date_local: string;
    end_date_local: string;
}

export const AudienceListSection: React.FC = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [audienceList, setAudienceList] = useState<AudienceItem[]>([]);
    const { instituteDetails } = useInstituteDetailsStore();

useEffect(() => {
  async function fetchAudienceList() {
    try {
      const response = await fetch(`/admin-core-service/v1/audience/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institute_id: instituteDetails?.id,
          page: 0,
          size: 10
        }),
      });

      const data = await response.json();
      setAudienceList(data.content || []); // 'content' holds campaign list
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      setAudienceList([]);
    }
  }

  if (instituteDetails) fetchAudienceList();
}, [instituteDetails]);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // TODO: trigger your filter/refetch with the new searchQuery
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">Audience Management</h1>
                    <p className="mt-1 text-sm text-neutral-600">Create and manage audience campaigns</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="size-4 text-neutral-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Campaign..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-72 rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                            aria-label="Search Campaign"
                        />
                    </div>

                    <button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="size-4" />
                        Add Campaign
                    </button>
                </div>
            </div>

            {/* List / Table */}
            <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
                {audienceList.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-neutral-50">
                                <th className="px-6 py-3 text-left font-semibold">Campaign Name</th>
                                <th className="px-6 py-3 text-left font-semibold">Type</th>
                                <th className="px-6 py-3 text-left font-semibold">Objective</th>
                                <th className="px-6 py-3 text-left font-semibold">Status</th>
                                <th className="px-6 py-3 text-left font-semibold">Start Date</th>
                                <th className="px-6 py-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audienceList.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-neutral-50">
                                    <td className="px-6 py-4">{item.campaign_name}</td>
                                    <td className="px-6 py-4">{item.campaign_type}</td>
                                    <td className="px-6 py-4">{item.campaign_objective}</td>
                                    <td className="px-6 py-4">{item.status}</td>
                                    <td className="px-6 py-4">{new Date(item.start_date_local).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-primary-600 hover:text-primary-700">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-16">
                        <div className="mb-4 rounded-full bg-neutral-100 p-4">
                            <Search className="size-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">No Campaigns Found</h3>
                        <p className="mt-2 text-sm text-neutral-600">Create your first audience campaign</p>
                        <button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                        >
                            Create Campaign
                        </button>
                    </div>
                )}
            </div>

            {/* Dialog */}
            <CreateCampaignDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
        </div>
    );
};