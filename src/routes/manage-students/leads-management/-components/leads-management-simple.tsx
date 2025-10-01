import { useState, useEffect } from 'react';

export const LeadsManagementSimple = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    <p className="text-neutral-600">Loading Leads Management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col gap-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-lg border border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-neutral-800">
                                Leads Management
                            </h1>
                        </div>
                        <div className="text-sm text-neutral-600">Total Leads: 0</div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-1 flex-col gap-4 rounded-lg border border-neutral-200/50 bg-white p-4">
                        <div className="py-8 text-center">
                            <h3 className="mb-2 text-lg font-medium text-neutral-700">
                                Leads Management
                            </h3>
                            <p className="mb-4 text-neutral-600">
                                This is a placeholder for the leads management table.
                            </p>
                            <div className="text-sm text-neutral-500">
                                The full table with data will be displayed here once the API is
                                integrated.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
