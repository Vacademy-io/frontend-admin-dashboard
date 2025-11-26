import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import type { ListPlanningLogsRequest, LogType, IntervalType, PlanningLogStatus } from '../../-types/types';
import { MyButton } from '@/components/design-system/button';

interface PlanningFiltersProps {
    filters: ListPlanningLogsRequest;
    onChange: (filters: ListPlanningLogsRequest) => void;
    onClose: () => void;
}

export default function PlanningFilters({ filters, onChange, onClose }: PlanningFiltersProps) {
    const [localFilters, setLocalFilters] = useState<ListPlanningLogsRequest>(filters);

    const handleApply = () => {
        onChange(localFilters);
        onClose();
    };

    const handleReset = () => {
        setLocalFilters({});
        onChange({});
    };

    const handleLogTypeChange = (value: string) => {
        if (value === 'all') {
            setLocalFilters({ ...localFilters, log_types: undefined });
        } else {
            setLocalFilters({ ...localFilters, log_types: [value as LogType] });
        }
    };

    const handleIntervalTypeChange = (value: string) => {
        if (value === 'all') {
            setLocalFilters({ ...localFilters, interval_types: undefined });
        } else {
            setLocalFilters({ ...localFilters, interval_types: [value as IntervalType] });
        }
    };

    const handleStatusChange = (value: string) => {
        if (value === 'all') {
            setLocalFilters({ ...localFilters, statuses: undefined });
        } else {
            setLocalFilters({ ...localFilters, statuses: [value as PlanningLogStatus] });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Log Type Filter */}
                    <div className="space-y-2">
                        <Label>Log Type</Label>
                        <Select
                            value={localFilters.log_types?.[0] || 'all'}
                            onValueChange={handleLogTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="diary_log">Diary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interval Type Filter */}
                    <div className="space-y-2">
                        <Label>Interval</Label>
                        <Select
                            value={localFilters.interval_types?.[0] || 'all'}
                            onValueChange={handleIntervalTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={localFilters.statuses?.[0] || 'all'}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="DELETED">Deleted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <MyButton buttonType="secondary" onClick={handleReset}>
                        Reset
                    </MyButton>
                    <MyButton onClick={handleApply}>Apply Filters</MyButton>
                </div>
            </CardContent>
        </Card>
    );
}
