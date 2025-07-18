import { useState } from 'react';
import { ReferralManager } from './ReferralManager';
import {
    UnifiedReferralSettings,
    UnifiedReferralSettings as UnifiedReferralSettingsType,
} from './UnifiedReferralSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ReferralSettings = () => {
    const [showUnifiedReferralSettings, setShowUnifiedReferralSettings] = useState(false);
    const [editingUnifiedReferralSettings, setEditingUnifiedReferralSettings] =
        useState<UnifiedReferralSettingsType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [referralPrograms, setReferralPrograms] = useState<UnifiedReferralSettingsType[]>([
        {
            id: '1',
            label: 'Paid Membership',
            isDefault: true,
            allowCombineOffers: true,
            payoutVestingDays: 7,
            refereeReward: {
                type: 'discount_percentage',
                value: 10,
                currency: 'GBP',
                description: '10% discount on course enrollment',
            },
            referrerRewards: [
                {
                    id: '1',
                    tierName: 'Free Membership',
                    referralCount: 10,
                    reward: {
                        type: 'free_days',
                        value: 30,
                        description: '30 days added to your membership',
                    },
                },
            ],
        },
    ]);

    // Error handling for component operations
    const handleError = (error: unknown, operation: string) => {
        console.error(`Error in ${operation}:`, error);
        setError(`Failed to ${operation}. Please try again.`);
        setTimeout(() => setError(null), 5000);
    };

    const handleCreateProgram = () => {
        setEditingUnifiedReferralSettings(null);
        setShowUnifiedReferralSettings(true);
    };

    const handleEditProgram = (program: UnifiedReferralSettingsType) => {
        setEditingUnifiedReferralSettings(program);
        setShowUnifiedReferralSettings(true);
    };

    const handleSaveProgram = (settings: UnifiedReferralSettingsType) => {
        try {
            if (editingUnifiedReferralSettings) {
                // Update existing program
                setReferralPrograms((programs) =>
                    programs.map((p) => (p.id === editingUnifiedReferralSettings.id ? settings : p))
                );
            } else {
                // Add new program
                setReferralPrograms((programs) => [...programs, settings]);
            }
            setEditingUnifiedReferralSettings(null);
            setShowUnifiedReferralSettings(false);
        } catch (error) {
            handleError(error, 'save referral program');
        }
    };

    const handleDeleteProgram = (programId: string) => {
        try {
            setReferralPrograms((programs) => programs.filter((p) => p.id !== programId));
        } catch (error) {
            handleError(error, 'delete referral program');
        }
    };

    const handleSetDefaultProgram = (programId: string) => {
        try {
            setReferralPrograms((programs) =>
                programs.map((p) => ({ ...p, isDefault: p.id === programId }))
            );
        } catch (error) {
            handleError(error, 'set default referral program');
        }
    };

    const handleDuplicateProgram = (program: UnifiedReferralSettingsType) => {
        try {
            const duplicatedProgram: UnifiedReferralSettingsType = {
                ...program,
                id: Date.now().toString(),
                label: `${program.label} (Copy)`,
                isDefault: false,
            };
            setReferralPrograms((programs) => [...programs, duplicatedProgram]);
        } catch (error) {
            handleError(error, 'duplicate referral program');
        }
    };

    return (
        <div>
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <ReferralManager
                programs={referralPrograms}
                onCreateProgram={handleCreateProgram}
                onEditProgram={handleEditProgram}
                onDeleteProgram={handleDeleteProgram}
                onSetDefaultProgram={handleSetDefaultProgram}
                onDuplicateProgram={handleDuplicateProgram}
            />
            <UnifiedReferralSettings
                isOpen={showUnifiedReferralSettings}
                onClose={() => {
                    setShowUnifiedReferralSettings(false);
                    setEditingUnifiedReferralSettings(null);
                }}
                onSave={handleSaveProgram}
                editingSettings={editingUnifiedReferralSettings}
            />
        </div>
    );
};

export default ReferralSettings;
