import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Package, CurrencyInr, Users } from '@phosphor-icons/react';
import {
    BulkCourseItem,
    GlobalDefaults,
    BulkCreateResponse,
    PaymentOptionItem,
} from '../-types/bulk-create-types';

interface PreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courses: BulkCourseItem[];
    globalDefaults: GlobalDefaults;
    paymentOptions: PaymentOptionItem[];
    dryRunResult?: BulkCreateResponse;
    isSubmitting: boolean;
    onConfirm: () => void;
}

const PAYMENT_TYPE_LABELS = {
    FREE: 'Free',
    ONE_TIME: 'One-Time',
    SUBSCRIPTION: 'Subscription',
    DONATION: 'Donation',
};

export function PreviewDialog({
    open,
    onOpenChange,
    courses,
    globalDefaults,
    paymentOptions,
    dryRunResult,
    isSubmitting,
    onConfirm,
}: PreviewDialogProps) {
    const getEffectivePayment = (course: BulkCourseItem) => {
        if (course.payment_config.payment_option_id) {
            const option = paymentOptions.find(
                (p) => p.id === course.payment_config.payment_option_id
            );
            return option ? `${option.name}` : 'Custom Option';
        }

        const config = course.payment_config.payment_type
            ? course.payment_config
            : globalDefaults.enabled
              ? globalDefaults.payment_config
              : course.payment_config;

        if (config.payment_type === 'FREE') return 'Free';
        if (config.price) return `₹${config.price} (${PAYMENT_TYPE_LABELS[config.payment_type]})`;
        return PAYMENT_TYPE_LABELS[config.payment_type];
    };

    const getEffectiveBatches = (course: BulkCourseItem) => {
        if (course.batches.length > 0) return course.batches;
        if (globalDefaults.enabled && globalDefaults.batches.length > 0)
            return globalDefaults.batches;
        return [{ level_name: 'DEFAULT', session_name: 'DEFAULT', level_id: null, session_id: null }];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Review & Confirm</DialogTitle>
                    <DialogDescription>
                        Review the courses that will be created. Validation has passed.
                    </DialogDescription>
                </DialogHeader>

                {dryRunResult && (
                    <div className="mb-4 flex items-center gap-4 rounded-lg bg-green-50 p-3">
                        <CheckCircle className="size-6 text-green-600" weight="fill" />
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                Validation Successful
                            </p>
                            <p className="text-xs text-green-600">
                                {dryRunResult.success_count} course(s) ready to be created
                            </p>
                        </div>
                    </div>
                )}

                <ScrollArea className="max-h-[50vh]">
                    <div className="space-y-3 pr-4">
                        {courses.map((course, index) => {
                            const result = dryRunResult?.results.find((r) => r.index === index);
                            const batches = getEffectiveBatches(course);

                            return (
                                <div
                                    key={course.id}
                                    className="rounded-lg border border-neutral-200 p-4"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="size-5 text-primary-600" />
                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    {course.course_name || 'Unnamed Course'}
                                                </h4>
                                                <p className="text-xs text-neutral-500">
                                                    {course.course_type}
                                                </p>
                                            </div>
                                        </div>
                                        {result && (
                                            <Badge
                                                variant={
                                                    result.status === 'SUCCESS'
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="text-xs"
                                            >
                                                {result.status === 'SUCCESS' ? (
                                                    <CheckCircle className="mr-1 size-3" />
                                                ) : (
                                                    <XCircle className="mr-1 size-3" />
                                                )}
                                                {result.status}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-1.5 text-neutral-600">
                                            <CurrencyInr className="size-3.5" />
                                            <span>{getEffectivePayment(course)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-neutral-600">
                                            <Users className="size-3.5" />
                                            <span>
                                                {batches.length} batch
                                                {batches.length !== 1 ? 'es' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {batches.map((batch, bIdx) => (
                                            <Badge
                                                key={bIdx}
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                {batch.level_name || 'DEFAULT'}/
                                                {batch.session_name || 'DEFAULT'}
                                            </Badge>
                                        ))}
                                    </div>

                                    {course.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {course.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {result?.error_message && (
                                        <p className="mt-2 text-xs text-red-600">
                                            {result.error_message}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Go Back & Edit
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : `Create ${courses.length} Course(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
