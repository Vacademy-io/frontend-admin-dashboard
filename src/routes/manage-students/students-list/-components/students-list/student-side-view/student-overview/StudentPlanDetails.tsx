import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { Clock, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getUserPlans, UserPlan } from '@/services/user-plan';
import { toast } from 'sonner';
import { formatDate } from 'date-fns';
import { Card } from '@/components/ui/card';

interface StudentPlanDetailsProps {
    userId: string;
    instituteId?: string;
}

const StudentPlanDetails = ({ userId, instituteId }: StudentPlanDetailsProps) => {
    const [activePlan, setActivePlan] = useState<UserPlan | null>(null);
    const [isLoadingActive, setIsLoadingActive] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [allPlans, setAllPlans] = useState<UserPlan[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 5;
    const loadActivePlan = useCallback(async () => {
        if (!userId) return;

        try {
            setIsLoadingActive(true);
            const response = await getUserPlans(1, 1, ['ACTIVE'], userId, instituteId);

            if (response.content && response.content.length > 0) {
                const plan = response.content[0];
                if (plan) {
                    setActivePlan(plan);
                }
            }
        } catch (error) {
            console.error('Error loading active plan:', error);
        } finally {
            setIsLoadingActive(false);
        }
    }, [userId, instituteId]);

    // Load active plan on component mount
    useEffect(() => {
        loadActivePlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, instituteId]);

    const handleViewDetails = async () => {
        if (!userId) return;

        try {
            setShowDetailsDialog(true);
            setCurrentPage(1);
            setIsLoadingHistory(true);
            const response = await getUserPlans(
                1,
                pageSize,
                ['ACTIVE', 'EXPIRED'],
                userId,
                instituteId
            );
            setAllPlans(response.content || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error loading plan history:', error);
            toast.error('Failed to load plan history');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handlePageChange = async (pageNo: number) => {
        if (!userId) return;

        try {
            setIsLoadingHistory(true);
            const response = await getUserPlans(
                pageNo,
                pageSize,
                ['ACTIVE', 'EXPIRED'],
                userId,
                instituteId
            );
            setAllPlans(response.content || []);
            setCurrentPage(pageNo);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error loading page:', error);
            toast.error('Failed to load plans');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const getCurrencySymbol = (currency: string): string => {
        const symbols: { [key: string]: string } = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            JPY: '¥',
        };
        return symbols[currency] || currency;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'EXPIRED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Extract plan name and details from nested structure
    const getPlanName = (plan: UserPlan): string => {
        try {
            if (plan.payment_plan_dto?.name) {
                return plan.payment_plan_dto.name;
            }
            if (typeof plan.plan_json === 'string') {
                const parsed = JSON.parse(plan.plan_json);
                return parsed.name || 'Unknown Plan';
            }
            return 'Unknown Plan';
        } catch {
            return 'Unknown Plan';
        }
    };
    const getOptionName = (plan: UserPlan): string => {
        try {
            if (plan.payment_option?.name) {
                return plan.payment_option.name;
            }
            return 'Unknown Payment Option';
        } catch {
            return 'Unknown Payment Option';
        }
    };

    const getPlanCurrency = (plan: UserPlan): string => {
        return plan.payment_plan_dto?.currency || 'N/A';
    };
    const getPlanAmount = (plan: UserPlan): number => {
        return plan.payment_plan_dto?.actual_price || 0;
    };

    const getPlanValidity = (plan: UserPlan): number | undefined => {
        return plan.payment_plan_dto?.validity_in_days;
    };
    const getExpiryDate = (plan: UserPlan): string | null => {
        const validityDays = getPlanValidity(plan);
        if (validityDays) {
            const today = new Date();
            today.setDate(today.getDate() + validityDays);
            return formatDate(today, 'dd MMM yyyy');
        }
        return null;
    };

    return (
        <>
            {/* Plan Details Card */}
            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2.5">
                    <div className="rounded-md bg-gradient-to-br from-primary-50 to-primary-100 p-1.5">
                        <Clock className="size-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="mb-0.5 text-xs font-medium text-neutral-700">Active Plan</h4>
                    </div>
                </div>

                {isLoadingActive ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-4 animate-spin text-primary-400" />
                    </div>
                ) : activePlan ? (
                    <div className="space-y-2">
                        <div className="rounded-md bg-neutral-50 p-2.5">
                            <div className="flex items-center justify-between">
                                <span className="mb-2 text-xs font-semibold text-neutral-900">
                                    {getOptionName(activePlan)} - {getPlanName(activePlan)}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                    {activePlan.payment_plan_dto?.status || activePlan.status}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {getPlanValidity(activePlan) && (
                                    <span className="text-[10px] text-neutral-600">
                                        Valid till {getExpiryDate(activePlan)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <MyButton
                            onClick={handleViewDetails}
                            buttonType="secondary"
                            scale="small"
                            className="w-full text-xs"
                        >
                            <Eye className="mr-1 size-3" />
                            View All Plans
                        </MyButton>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-md bg-blue-50 p-2 text-[10px] text-blue-700">
                        <AlertCircle className="size-3 shrink-0" />
                        <span>No active plan</span>
                    </div>
                )}
            </div>

            {/* Plans History Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-h-[70vh] w-[600px] overflow-y-auto ">
                    <DialogHeader>
                        <DialogTitle>Payment Plans History</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        {isLoadingHistory ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="size-6 animate-spin text-primary-400" />
                            </div>
                        ) : allPlans.length === 0 ? (
                            <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>No plans found.</span>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {allPlans.map((plan) => (
                                        <Card
                                            key={plan.id}
                                            className="rounded-md border border-neutral-200 p-3"
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-semibold text-neutral-900">
                                                        {getOptionName(plan)} - {getPlanName(plan)}
                                                    </h5>
                                                    <p className="mt-1 text-xs text-neutral-600">
                                                        Type: {plan.payment_option.type}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge
                                                    className={`text-xs ${getStatusColor(
                                                        plan.payment_plan_dto?.status || plan.status
                                                    )}`}
                                                >
                                                    {plan.payment_plan_dto?.status || plan.status}
                                                </Badge>
                                                {getPlanCurrency(plan) !== 'N/A' && (
                                                    <span className="text-xs text-neutral-600">
                                                        {getCurrencySymbol(getPlanCurrency(plan))}
                                                        {getPlanAmount(plan)}
                                                    </span>
                                                )}
                                                {getPlanValidity(plan) && (
                                                    <span className="text-xs text-neutral-600">
                                                        Valid till {getExpiryDate(plan)}
                                                    </span>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <span className="text-sm text-neutral-600">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <div className="flex gap-2">
                                            <MyButton
                                                buttonType="secondary"
                                                scale="small"
                                                disable={currentPage === 1 || isLoadingHistory}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                Previous
                                            </MyButton>
                                            <MyButton
                                                buttonType="secondary"
                                                scale="small"
                                                disable={
                                                    currentPage === totalPages || isLoadingHistory
                                                }
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Next
                                            </MyButton>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StudentPlanDetails;
