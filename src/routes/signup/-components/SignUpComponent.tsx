import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { OnboardingSignup, VacademyAssessLogo, VacademyLMSLogo, VacademyLogo } from '@/svgs';
import { MyButton } from '@/components/design-system/button';
import { Plus } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';
import useOrganizationStore from '../onboarding/-zustand-store/step1OrganizationZustand';
import { useEffect } from 'react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { FcGoogle } from 'react-icons/fc';
import { handleOAuthSignUp } from '@/hooks/signup/oauth-signup';

const items = [
    { id: 'assess', label: 'Assess' },
    { id: 'lms', label: 'LMS' },
] as const;

const FormSchema = z.object({
    items: z
        .record(z.boolean())
        .refine((value) => Object.values(value).some((checked) => checked), {
            message: 'You have to select at least one item.',
        }),
});

export function SignUpComponent() {
    const navigate = useNavigate();
    const { resetForm } = useOrganizationStore();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: {
                assess: false,
                lms: false,
            },
        },
        mode: 'onChange',
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    }

    useEffect(() => {
        resetForm();
    }, []);

    return (
        <div className="flex h-screen w-full">
            <div className="flex w-1/2 flex-col items-center justify-center bg-primary-50">
                <VacademyLogo />
                <OnboardingSignup />
            </div>
            <div className="flex w-1/2 items-center justify-center">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex w-[350px] flex-col items-center justify-center space-y-8"
                    >
                        <div className="flex w-full flex-col items-center justify-center">
                            <div className="mb-10">
                                <FormLabel className="text-[1.5rem]">
                                    Evaluate smarter, learn better
                                </FormLabel>
                                <FormDescription className="text-center">
                                    Redefining Education with Insightful Tools for Smarter
                                    Evaluations and Better Learning Outcomes.
                                </FormDescription>
                            </div>

                            <div className="flex w-full flex-col gap-4">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() =>
                                        handleOAuthSignUp('google', {
                                            isSignup: true,
                                            assess: form.getValues('items.assess'),
                                            lms: form.getValues('items.lms'),
                                        })
                                    }
                                    disabled={
                                        !form.getValues('items.assess') &&
                                        !form.getValues('items.lms')
                                    }
                                >
                                    {FcGoogle({ size: 20 })}
                                    Continue with Google
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() =>
                                        handleOAuthSignUp('github', {
                                            isSignup: true,
                                            assess: form.getValues('items.assess'),
                                            lms: form.getValues('items.lms'),
                                        })
                                    }
                                    disabled={
                                        !form.getValues('items.assess') &&
                                        !form.getValues('items.lms')
                                    }
                                >
                                    <GitHubLogoIcon className="size-5" />
                                    Continue with GitHub
                                </button>

                                <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative bg-white px-4 text-sm text-neutral-500">
                                        or continue with
                                    </div>
                                </div>
                            </div>

                            <div className="my-4 flex w-[300px] flex-col gap-4">
                                {items.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name={`items.${item.id}`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border bg-neutral-50 p-2">
                                                <FormLabel className="text-sm font-normal">
                                                    {item.label === 'Assess' && (
                                                        <VacademyAssessLogo />
                                                    )}
                                                    {item.label === 'LMS' && <VacademyLMSLogo />}
                                                </FormLabel>
                                                <FormControl className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className={`mt-1 size-5 border shadow-none ${
                                                            field.value
                                                                ? 'border-none bg-green-500 text-white'
                                                                : 'bg-white'
                                                        }`}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <MyButton
                            type="submit"
                            scale="large"
                            buttonType="primary"
                            layoutVariant="default"
                            onClick={() =>
                                navigate({
                                    to: '/signup/onboarding',
                                    search: {
                                        assess: form.getValues('items').assess ?? false,
                                        lms: form.getValues('items').lms ?? false,
                                    },
                                })
                            }
                            disable={!form.formState.isValid}
                        >
                            <Plus size={32} />
                            Create Free Account
                        </MyButton>

                        <p className="text-sm text-neutral-500">
                            Already have an account?{' '}
                            <span
                                className="cursor-pointer text-primary-500"
                                onClick={() => navigate({ to: '/login' })}
                            >
                                Login
                            </span>
                        </p>
                    </form>
                </Form>
            </div>
        </div>
    );
}
