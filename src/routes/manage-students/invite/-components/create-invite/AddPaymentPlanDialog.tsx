import React from 'react';
import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MyButton } from '@/components/design-system/button';
import { UseFormReturn } from 'react-hook-form';
import { AddPlanFormValues, InviteLinkFormValues } from './GenerateInviteLinkSchema';

interface AddPaymentPlanDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
    addPlanForm: UseFormReturn<AddPlanFormValues>;
    handleAddPlan: (values: AddPlanFormValues) => void;
}

export function AddPaymentPlanDialog({
    form,
    addPlanForm,
    handleAddPlan,
}: AddPaymentPlanDialogProps) {
    return (
        <ShadDialog
            open={form.watch('showAddPlanDialog')}
            onOpenChange={(open) => form.setValue('showAddPlanDialog', open)}
        >
            <ShadDialogContent className="max-w-md">
                <ShadDialogHeader>
                    <ShadDialogTitle>Add New Payment Plan</ShadDialogTitle>
                </ShadDialogHeader>
                <Form {...addPlanForm}>
                    <form className="space-y-4" onSubmit={addPlanForm.handleSubmit(handleAddPlan)}>
                        <FormField
                            control={addPlanForm.control}
                            name="planType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Type</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select plan type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addPlanForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter plan name" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addPlanForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter plan description" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {addPlanForm.watch('planType') === 'paid' && (
                            <FormField
                                control={addPlanForm.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Charges</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter plan charges (e.g. $49)"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
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
