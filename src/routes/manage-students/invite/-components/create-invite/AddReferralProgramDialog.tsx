import React from 'react';
import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MyButton } from '@/components/design-system/button';
import { UseFormReturn } from 'react-hook-form';
import { AddReferralFormValues, InviteLinkFormValues } from './GenerateInviteLinkSchema';
import { Switch as ShadSwitch } from '@/components/ui/switch';

interface AddReferralProgramDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
    addReferralForm: UseFormReturn<AddReferralFormValues>;
    handleAddReferral: (values: AddReferralFormValues) => void;
}

export function AddReferralProgramDialog({
    form,
    addReferralForm,
    handleAddReferral,
}: AddReferralProgramDialogProps) {
    return (
        <ShadDialog
            open={form.watch('showAddReferralDialog')}
            onOpenChange={(open) => form.setValue('showAddReferralDialog', open)}
        >
            <ShadDialogContent className="max-w-md">
                <ShadDialogHeader>
                    <ShadDialogTitle>Add New Referral Program</ShadDialogTitle>
                </ShadDialogHeader>
                <Form {...addReferralForm}>
                    <form
                        className="space-y-4"
                        onSubmit={addReferralForm.handleSubmit(handleAddReferral)}
                    >
                        <FormField
                            control={addReferralForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter program name" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addReferralForm.control}
                            name="refereeBenefit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referee Benefit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. ₹200 off" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addReferralForm.control}
                            name="referrerTiers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referrer Tiers</FormLabel>
                                    <div className="space-y-2">
                                        {field.value.map((tier, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="e.g. 5 referrals"
                                                    value={tier.tier}
                                                    onChange={(e) => {
                                                        const newTiers = [...field.value];
                                                        if (newTiers[idx]) {
                                                            newTiers[idx].tier = e.target.value;
                                                            field.onChange(newTiers);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Reward (Gift/Calendar)"
                                                    value={tier.reward}
                                                    onChange={(e) => {
                                                        const newTiers = [...field.value];
                                                        if (newTiers[idx]) {
                                                            newTiers[idx].reward = e.target.value;
                                                            field.onChange(newTiers);
                                                        }
                                                    }}
                                                />
                                                <MyButton
                                                    type="button"
                                                    scale="small"
                                                    buttonType="secondary"
                                                    onClick={() => {
                                                        const newTiers = field.value.filter(
                                                            (_, i) => i !== idx
                                                        );
                                                        field.onChange(newTiers);
                                                    }}
                                                    className="px-2"
                                                    disabled={field.value.length === 1}
                                                >
                                                    Remove
                                                </MyButton>
                                            </div>
                                        ))}
                                        <MyButton
                                            type="button"
                                            scale="small"
                                            buttonType="secondary"
                                            onClick={() =>
                                                field.onChange([
                                                    ...field.value,
                                                    { tier: '', reward: '' },
                                                ])
                                            }
                                            className="mt-1"
                                        >
                                            + Add Tier
                                        </MyButton>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addReferralForm.control}
                            name="vestingPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vesting Period</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 30 days" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addReferralForm.control}
                            name="combineOffers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Combine Offers</FormLabel>
                                    <FormControl>
                                        <ShadSwitch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <MyButton type="submit" scale="small" buttonType="primary">
                                Save
                            </MyButton>
                        </div>
                    </form>
                </Form>
            </ShadDialogContent>
        </ShadDialog>
    );
}
