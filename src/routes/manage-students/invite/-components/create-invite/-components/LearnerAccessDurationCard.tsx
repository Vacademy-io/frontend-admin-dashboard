import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { Clock } from 'phosphor-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface CustomInviteFormCardProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

const LearnerAccessDurationCard = ({ form }: CustomInviteFormCardProps) => {
    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock size={22} />
                    <CardTitle className="text-2xl font-bold">Learner Access Duration</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={form.watch('accessDurationType')}
                    onValueChange={(value) => form.setValue('accessDurationType', value)}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="define" id="define-validity" />
                        <label htmlFor="define-validity" className="text-base">
                            Define Validity (Days)
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="session" id="same-session" />
                        <label htmlFor="same-session" className="text-base">
                            Same as Session Expiry
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="payment" id="same-payment" />
                        <label htmlFor="same-payment" className="text-base">
                            Same as Payment Plan
                        </label>
                    </div>
                </RadioGroup>
                {form.watch('accessDurationType') === 'define' && (
                    <div className="mt-4 flex flex-col gap-1">
                        <label htmlFor="access-duration-days" className="text-sm font-medium">
                            Access Duration (Days)
                        </label>
                        <Input
                            id="access-duration-days"
                            type="number"
                            min={1}
                            value={form.watch('accessDurationDays')}
                            onChange={(e) => {
                                form.setValue('accessDurationDays', e.target.value);
                            }}
                            placeholder="Enter number of days"
                            className="w-48"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LearnerAccessDurationCard;
