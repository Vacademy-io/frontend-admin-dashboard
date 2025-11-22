import React from 'react';
import { CreateCampaignForm } from './CreateCampaignForm';
import { X } from 'lucide-react';
import { CampaignItem } from '../../-services/get-campaigns-list';

interface CreateCampaignDialogProps {
    isOpen: boolean;
    onClose: () => void;
    campaign?: CampaignItem | null;
}

export const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({
    isOpen,
    onClose,
    campaign,
}) => {
    if (!isOpen) return null;

    const heading = campaign ? 'Edit Campaign' : 'Create Campaign';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-neutral-900">{heading}</h2>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <CreateCampaignForm onSuccess={onClose} campaign={campaign} />
            </div>
        </div>
    );
};