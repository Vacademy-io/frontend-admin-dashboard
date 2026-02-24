import React from 'react';

export const ComingSoon: React.FC = () => {
    return (
        <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center p-4 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">Coming Soon</h1>
            <p className="text-lg text-gray-600">
                This module is under development and will be available soon.
            </p>
        </div>
    );
};
