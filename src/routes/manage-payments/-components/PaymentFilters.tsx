import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SelectChips from '@/components/design-system/SelectChips';
import type { SelectOption } from '@/components/design-system/SelectChips';
import { Calendar, Funnel, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { BatchForSession, PackageSessionFilter } from '@/types/payment-logs';

interface PaymentFiltersProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    selectedPaymentStatuses: SelectOption[];
    onPaymentStatusesChange: (statuses: SelectOption[]) => void;
    selectedUserPlanStatuses: SelectOption[];
    onUserPlanStatusesChange: (statuses: SelectOption[]) => void;
    packageSessionFilter: PackageSessionFilter;
    onPackageSessionFilterChange: (filter: PackageSessionFilter) => void;
    batchesForSessions: BatchForSession[];
    onQuickFilterSelect: (range: { start: string; end: string }) => void;
    onClearFilters: () => void;
}

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
    { value: 'PAID', label: 'Paid' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'PAYMENT_PENDING', label: 'Pending' },
];

const USER_PLAN_STATUS_OPTIONS: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'INACTIVE', label: 'Inactive' },
];

export function PaymentFilters({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    selectedPaymentStatuses,
    onPaymentStatusesChange,
    selectedUserPlanStatuses,
    onUserPlanStatusesChange,
    packageSessionFilter,
    onPackageSessionFilterChange,
    batchesForSessions,
    onQuickFilterSelect,
    onClearFilters,
}: PaymentFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique packages/courses
    const packageOptions = useMemo(() => {
        const uniquePackages = new Map<string, { id: string; name: string }>();
        batchesForSessions.forEach((batch) => {
            if (!uniquePackages.has(batch.package_dto.id)) {
                uniquePackages.set(batch.package_dto.id, {
                    id: batch.package_dto.id,
                    name: batch.package_dto.package_name,
                });
            }
        });
        return Array.from(uniquePackages.values()).map((pkg) => ({
            value: pkg.id,
            label: pkg.name,
        }));
    }, [batchesForSessions]);

    // Get sessions for selected package
    const sessionOptions = useMemo(() => {
        if (!packageSessionFilter.packageId) return [];
        const sessions = new Map<string, { id: string; name: string }>();
        batchesForSessions
            .filter((batch) => batch.package_dto.id === packageSessionFilter.packageId)
            .forEach((batch) => {
                if (!sessions.has(batch.session.id)) {
                    sessions.set(batch.session.id, {
                        id: batch.session.id,
                        name: batch.session.session_name,
                    });
                }
            });
        return Array.from(sessions.values()).map((session) => ({
            value: session.id,
            label: session.name,
        }));
    }, [batchesForSessions, packageSessionFilter.packageId]);

    // Get levels for selected package and session
    const levelOptions = useMemo(() => {
        if (!packageSessionFilter.packageId) return [];
        const levels = new Map<string, { id: string; name: string }>();
        batchesForSessions
            .filter(
                (batch) =>
                    batch.package_dto.id === packageSessionFilter.packageId &&
                    (!packageSessionFilter.sessionId ||
                        batch.session.id === packageSessionFilter.sessionId)
            )
            .forEach((batch) => {
                if (!levels.has(batch.level.id)) {
                    levels.set(batch.level.id, {
                        id: batch.level.id,
                        name: batch.level.level_name,
                    });
                }
            });
        return Array.from(levels.values()).map((level) => ({
            value: level.id,
            label: level.name,
        }));
    }, [batchesForSessions, packageSessionFilter.packageId, packageSessionFilter.sessionId]);

    // Get final package session ID based on selections
    const finalPackageSessionId = useMemo(() => {
        if (
            !packageSessionFilter.packageId ||
            (sessionOptions.length > 1 && !packageSessionFilter.sessionId) ||
            (levelOptions.length > 1 && !packageSessionFilter.levelId)
        ) {
            return undefined;
        }

        const batch = batchesForSessions.find(
            (b) =>
                b.package_dto.id === packageSessionFilter.packageId &&
                (sessionOptions.length === 1 || b.session.id === packageSessionFilter.sessionId) &&
                (levelOptions.length === 1 || b.level.id === packageSessionFilter.levelId)
        );

        return batch?.id;
    }, [batchesForSessions, packageSessionFilter, sessionOptions.length, levelOptions.length]);

    // Handle package selection
    const handlePackageChange = (selected: SelectOption[]) => {
        const packageId = selected.length > 0 ? selected[0]?.value : undefined;
        onPackageSessionFilterChange({
            packageId,
            sessionId: undefined,
            levelId: undefined,
            packageSessionId: undefined,
        });
    };

    // Handle session selection
    const handleSessionChange = (selected: SelectOption[]) => {
        const sessionId = selected.length > 0 ? selected[0]?.value : undefined;
        onPackageSessionFilterChange({
            ...packageSessionFilter,
            sessionId,
            levelId: undefined,
            packageSessionId: undefined,
        });
    };

    // Handle level selection
    const handleLevelChange = (selected: SelectOption[]) => {
        const levelId = selected.length > 0 ? selected[0]?.value : undefined;
        onPackageSessionFilterChange({
            ...packageSessionFilter,
            levelId,
            packageSessionId: finalPackageSessionId,
        });
    };

    const getQuickDateRange = (type: string) => {
        const now = new Date();
        const start = new Date();

        switch (type) {
            case '1h':
                start.setHours(now.getHours() - 1);
                break;
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case '7d':
                start.setDate(now.getDate() - 7);
                break;
            case '30d':
                start.setDate(now.getDate() - 30);
                break;
            case '90d':
                start.setDate(now.getDate() - 90);
                break;
            case 'all':
                return {
                    start: '',
                    end: '',
                };
        }

        return {
            start: start.toISOString(),
            end: now.toISOString(),
        };
    };

    const handleQuickFilter = (type: string) => {
        const range = getQuickDateRange(type);
        onQuickFilterSelect(range);
    };

    const hasActiveFilters =
        startDate ||
        endDate ||
        selectedPaymentStatuses.length > 0 ||
        selectedUserPlanStatuses.length > 0 ||
        !!packageSessionFilter.packageId;

    return (
        <div className="space-y-4">
            {/* Filter Toggle & Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn('gap-2', hasActiveFilters && 'border-primary-500 bg-primary-50')}
                >
                    <Funnel size={16} weight={hasActiveFilters ? 'fill' : 'regular'} />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                            {(selectedPaymentStatuses.length || 0) +
                                (selectedUserPlanStatuses.length || 0) +
                                (startDate ? 1 : 0) +
                                (endDate ? 1 : 0) +
                                (packageSessionFilter.packageId ? 1 : 0)}
                        </span>
                    )}
                </Button>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Quick:</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFilter('1h')}
                        className="h-8"
                    >
                        Last 1 Hour
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFilter('today')}
                        className="h-8"
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFilter('7d')}
                        className="h-8"
                    >
                        Last 7 Days
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFilter('30d')}
                        className="h-8"
                    >
                        Last 30 Days
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFilter('all')}
                        className="h-8"
                    >
                        All Time
                    </Button>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="ml-auto gap-2 text-red-600 hover:text-red-700"
                    >
                        <X size={16} />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Expanded Filter Panel */}
            {showFilters && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {/* Package Session Filter Section */}
                    <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                        <Label className="mb-2 block text-sm font-semibold text-blue-900">
                            Filter by Course/Session
                        </Label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {/* Package/Course Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-700">
                                    Course/Package
                                </Label>
                                <SelectChips
                                    options={packageOptions}
                                    selected={
                                        packageSessionFilter.packageId
                                            ? [
                                                  packageOptions.find(
                                                      (opt) =>
                                                          opt.value ===
                                                          packageSessionFilter.packageId
                                                  )!,
                                              ].filter(Boolean)
                                            : []
                                    }
                                    onChange={handlePackageChange}
                                    placeholder="Select course"
                                    multiSelect={false}
                                    clearable={true}
                                />
                            </div>

                            {/* Session Selector - Only show if multiple sessions available */}
                            {packageSessionFilter.packageId && sessionOptions.length > 1 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-gray-700">
                                        Session
                                    </Label>
                                    <SelectChips
                                        options={sessionOptions}
                                        selected={
                                            packageSessionFilter.sessionId
                                                ? [
                                                      sessionOptions.find(
                                                          (opt) =>
                                                              opt.value ===
                                                              packageSessionFilter.sessionId
                                                      )!,
                                                  ].filter(Boolean)
                                                : []
                                        }
                                        onChange={handleSessionChange}
                                        placeholder="Select session"
                                        multiSelect={false}
                                        clearable={true}
                                    />
                                </div>
                            )}

                            {/* Level Selector - Only show if multiple levels available */}
                            {packageSessionFilter.packageId && levelOptions.length > 1 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-gray-700">
                                        Level
                                    </Label>
                                    <SelectChips
                                        options={levelOptions}
                                        selected={
                                            packageSessionFilter.levelId
                                                ? [
                                                      levelOptions.find(
                                                          (opt) =>
                                                              opt.value ===
                                                              packageSessionFilter.levelId
                                                      )!,
                                                  ].filter(Boolean)
                                                : []
                                        }
                                        onChange={handleLevelChange}
                                        placeholder="Select level"
                                        multiSelect={false}
                                        clearable={true}
                                    />
                                </div>
                            )}

                            {/* Auto-selected message */}
                            {packageSessionFilter.packageId &&
                                (sessionOptions.length === 1 || levelOptions.length === 1) && (
                                    <div className="flex items-center text-xs text-blue-700">
                                        {sessionOptions.length === 1 &&
                                            `Session: ${sessionOptions[0]?.label || ''}`}
                                        {sessionOptions.length === 1 &&
                                            levelOptions.length === 1 &&
                                            ' • '}
                                        {levelOptions.length === 1 &&
                                            `Level: ${levelOptions[0]?.label || ''}`}
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Other Filters */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                <Calendar size={14} className="mr-1 inline" />
                                Start Date
                            </Label>
                            <Input
                                type="datetime-local"
                                value={
                                    startDate ? new Date(startDate).toISOString().slice(0, 16) : ''
                                }
                                onChange={(e) =>
                                    onStartDateChange(
                                        e.target.value ? new Date(e.target.value).toISOString() : ''
                                    )
                                }
                                className="h-9"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                <Calendar size={14} className="mr-1 inline" />
                                End Date
                            </Label>
                            <Input
                                type="datetime-local"
                                value={endDate ? new Date(endDate).toISOString().slice(0, 16) : ''}
                                onChange={(e) =>
                                    onEndDateChange(
                                        e.target.value ? new Date(e.target.value).toISOString() : ''
                                    )
                                }
                                className="h-9"
                            />
                        </div>

                        {/* Payment Status */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Payment Status
                            </Label>
                            <SelectChips
                                options={PAYMENT_STATUS_OPTIONS}
                                selected={selectedPaymentStatuses}
                                onChange={onPaymentStatusesChange}
                                placeholder="Select statuses"
                                multiSelect={true}
                                clearable={true}
                            />
                        </div>

                        {/* User Plan Status */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                User Plan Status
                            </Label>
                            <SelectChips
                                options={USER_PLAN_STATUS_OPTIONS}
                                selected={selectedUserPlanStatuses}
                                onChange={onUserPlanStatusesChange}
                                placeholder="Select statuses"
                                multiSelect={true}
                                clearable={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
