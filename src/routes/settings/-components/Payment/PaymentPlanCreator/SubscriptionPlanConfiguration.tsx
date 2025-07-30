import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { getCurrencySymbol } from '../utils/utils';

interface CustomInterval {
    value: number;
    unit: 'days' | 'months';
    price: number;
    features?: string[];
    newFeature?: string;
    title?: string;
}

interface SubscriptionPlanConfigurationProps {
    currency: string;
    customIntervals: CustomInterval[];
    featuresGlobal: string[];
    setFeaturesGlobal: (features: string[]) => void;
    onCustomIntervalsChange: (intervals: CustomInterval[]) => void;
}

export const SubscriptionPlanConfiguration: React.FC<SubscriptionPlanConfigurationProps> = ({
    currency,
    customIntervals,
    featuresGlobal,
    setFeaturesGlobal,
    onCustomIntervalsChange,
}) => {
    const addInterval = () => {
        const newInterval = {
            value: 1,
            unit: 'months' as const,
            price: 0,
            features: [...featuresGlobal],
            newFeature: '',
        };
        onCustomIntervalsChange([...customIntervals, newInterval as CustomInterval]);
    };

    const updateInterval = (index: number, updates: Partial<CustomInterval>) => {
        const updatedIntervals = [...customIntervals];
        if (updatedIntervals[index]) {
            const currentInterval = updatedIntervals[index];
            if (!currentInterval) return;
            // Create a new interval with only the properties that are actually defined
            const updatedInterval: CustomInterval = {
                value: updates.value !== undefined ? updates.value : currentInterval.value,
                unit: updates.unit !== undefined ? updates.unit : currentInterval.unit,
                price: updates.price !== undefined ? updates.price : currentInterval.price,
                features:
                    updates.features !== undefined ? updates.features : currentInterval.features,
                newFeature:
                    updates.newFeature !== undefined
                        ? updates.newFeature
                        : currentInterval.newFeature,
                title: updates.title !== undefined ? updates.title : currentInterval.title,
            };

            updatedIntervals[index] = updatedInterval;
        }
        onCustomIntervalsChange(updatedIntervals);
    };

    const removeInterval = (index: number) => {
        const updatedIntervals = customIntervals.filter((_, i) => i !== index);
        onCustomIntervalsChange(updatedIntervals);
    };

    const addFeature = (intervalIndex: number) => {
        const interval = customIntervals[intervalIndex];
        if (!interval) return;
        const newFeature = interval.newFeature?.trim();

        if (newFeature && !featuresGlobal.includes(newFeature)) {
            // Add to global features
            setFeaturesGlobal([...featuresGlobal, newFeature]);

            // Add to all intervals
            const updatedIntervals = customIntervals.map((intv, i) => ({
                ...intv,
                features: [...(intv.features || []), newFeature],
                newFeature: i === intervalIndex ? '' : intv.newFeature,
            }));

            onCustomIntervalsChange(updatedIntervals);
        }
    };

    const toggleFeature = (intervalIndex: number, feature: string, checked: boolean) => {
        const interval = customIntervals[intervalIndex];
        if (!interval) return;
        const currentFeatures = interval.features || [];

        let newFeatures: string[];
        if (checked) {
            newFeatures = [...currentFeatures, feature];
        } else {
            newFeatures = currentFeatures.filter((f) => f !== feature);
        }

        updateInterval(intervalIndex, { features: newFeatures });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Subscription Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Custom Intervals Section */}
                <div className="space-y-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Pricing Intervals</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addInterval}>
                            <Plus className="mr-2 size-4" />
                            Add Pricing Interval
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {customIntervals.map((interval, idx) => (
                            <div key={idx} className="space-y-4 rounded-lg border p-4">
                                <div className="grid flex-1 grid-cols-4 gap-3">
                                    <div>
                                        <Label className="text-xs">Interval Title</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Starter, Pro, 9 Months Access"
                                            value={interval.title || ''}
                                            onChange={(e) =>
                                                updateInterval(idx, { title: e.target.value })
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Interval</Label>
                                        <Input
                                            type="number"
                                            value={interval.value}
                                            onChange={(e) =>
                                                updateInterval(idx, {
                                                    value: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Unit</Label>
                                        <Select
                                            value={interval.unit}
                                            onValueChange={(value: 'days' | 'months') =>
                                                updateInterval(idx, { unit: value })
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="days">Days</SelectItem>
                                                <SelectItem value="months">Months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Price</Label>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className="text-sm">
                                                {getCurrencySymbol(currency)}
                                            </span>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={interval.price}
                                                onChange={(e) =>
                                                    updateInterval(idx, {
                                                        price: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Features for this interval */}
                                <div className="mt-4">
                                    <h4 className="mb-2 text-xs font-semibold">Features</h4>
                                    <div className="space-y-2">
                                        {featuresGlobal.map((feature, fidx) => (
                                            <div key={fidx} className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={
                                                        interval.features?.includes(feature) ||
                                                        false
                                                    }
                                                    onCheckedChange={(checked) =>
                                                        toggleFeature(idx, feature, !!checked)
                                                    }
                                                />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <Input
                                            type="text"
                                            className="flex-1 rounded border px-2 py-1"
                                            placeholder="Add new feature"
                                            value={interval.newFeature || ''}
                                            onChange={(e) =>
                                                updateInterval(idx, { newFeature: e.target.value })
                                            }
                                        />
                                        <Button
                                            type="button"
                                            className="rounded border hover:bg-gray-200"
                                            onClick={() => addFeature(idx)}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Remove interval button */}
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeInterval(idx)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Remove Interval
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
