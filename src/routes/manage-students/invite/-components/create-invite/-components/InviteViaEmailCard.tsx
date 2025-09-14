import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { X } from 'phosphor-react';
import { Input } from '@/components/ui/input';
import { MyButton } from '@/components/design-system/button';

interface InviteViaEmailCardProps {
    form: UseFormReturn<InviteLinkFormValues>;
    isValidEmail: (email: string) => boolean;
    handleAddInviteeEmail: () => void;
    handleRemoveInviteeEmail: (email: string) => void;
}

const InviteViaEmailCard = ({
    form,
    isValidEmail,
    handleAddInviteeEmail,
    handleRemoveInviteeEmail,
}: InviteViaEmailCardProps) => {
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Invite via email</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-end gap-2">
                    <div className="flex-1">
                        <label
                            htmlFor="invitee-email-input"
                            className="mb-1 block text-sm font-medium"
                        >
                            Enter invitee email
                        </label>
                        <Input
                            id="invitee-email-input"
                            type="email"
                            value={form.watch('inviteeEmail')}
                            onChange={(e) => {
                                form.setValue('inviteeEmail', e.target.value);
                            }}
                            placeholder="you@email.com"
                            className="w-full"
                        />
                    </div>
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="primary"
                        className="mb-0"
                        disable={
                            !isValidEmail(form.watch('inviteeEmail')) ||
                            form.watch('inviteeEmails').includes(form.watch('inviteeEmail'))
                        }
                        onClick={handleAddInviteeEmail}
                    >
                        Add
                    </MyButton>
                </div>
                {form.watch('inviteeEmails').length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {form.watch('inviteeEmails').map((email) => (
                            <span
                                key={email}
                                className="text-primary-700 flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm"
                            >
                                {email}
                                <button
                                    type="button"
                                    className="ml-1 text-primary-500 hover:text-danger-600"
                                    onClick={() => {
                                        handleRemoveInviteeEmail(email);
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default InviteViaEmailCard;
