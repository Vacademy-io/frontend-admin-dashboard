import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApplicationStages } from '@/routes/admissions/-services/applicant-services';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { MyButton } from '@/components/design-system/button';
import { Plus, Pencil, Trash } from '@phosphor-icons/react';

interface ApplicationStage {
    id: string;
    sequence: string;
    source: string;
    type: string;
    stage_name: string;
    source_id: string;
    institute_id: string;
    config_json: string;
}

const StageSettings = () => {
    const { instituteDetails } = useInstituteDetailsStore();
    const instituteId = instituteDetails?.id || '';

    // Fetch application stages
    const { data: stages, isLoading, error, refetch } = useQuery({
        queryKey: ['applicationStages', instituteId],
        queryFn: () => fetchApplicationStages(instituteId, 'INSTITUTE', instituteId),
        enabled: !!instituteId,
    });

    const getStageTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'FORM':
                return 'bg-blue-100 text-blue-800';
            case 'PAYMENT':
                return 'bg-green-100 text-green-800';
            case 'TEST':
                return 'bg-purple-100 text-purple-800';
            case 'INTERVIEW':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-neutral-100 text-neutral-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-neutral-900">
                        Application Stage Settings
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Manage application stages for your admission process
                    </p>
                </div>
                <MyButton buttonType="primary" onClick={() => {}}>
                    <Plus className="mr-2 size-4" />
                    Add Stage
                </MyButton>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center p-12">
                    <div className="text-neutral-500">Loading stages...</div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-800">
                        Failed to load application stages. Please try again.
                    </p>
                </div>
            )}

            {/* Stages List */}
            {!isLoading && !error && stages && (
                <div className="space-y-4">
                    {stages.length === 0 ? (
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
                            <p className="text-neutral-500">No application stages configured</p>
                            <p className="mt-1 text-sm text-neutral-400">
                                Click "Add Stage" to create your first stage
                            </p>
                        </div>
                    ) : (
                        stages
                            .sort((a, b) => parseInt(a.sequence) - parseInt(b.sequence))
                            .map((stage) => (
                                <div
                                    key={stage.id}
                                    className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
                                                    {stage.sequence}
                                                </span>
                                                <div>
                                                    <h3 className="font-semibold text-neutral-900">
                                                        {stage.stage_name}
                                                    </h3>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageTypeBadgeColor(stage.type)}`}
                                                        >
                                                            {stage.type}
                                                        </span>
                                                        <span className="text-xs text-neutral-500">
                                                            Stage ID: {stage.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Configuration Preview */}
                                            {stage.config_json && (
                                                <div className="mt-3 rounded-lg bg-neutral-50 p-3">
                                                    <p className="mb-1 text-xs font-medium text-neutral-600">
                                                        Configuration:
                                                    </p>
                                                    <pre className="max-h-32 overflow-auto text-xs text-neutral-700">
                                                        {JSON.stringify(
                                                            JSON.parse(stage.config_json),
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                                                title="Edit Stage"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                className="rounded-lg p-2 text-neutral-400 hover:bg-red-100 hover:text-red-600"
                                                title="Delete Stage"
                                            >
                                                <Trash className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StageSettings;

