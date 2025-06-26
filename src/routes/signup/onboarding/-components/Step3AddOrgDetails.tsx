import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { useNavigate } from '@tanstack/react-router';
import { useAddOrgStore } from '../-zustand-store/step2AddOrgZustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { handleSignupInstitute } from '../../-services/signup-services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useOrganizationStore from '../-zustand-store/step1OrganizationZustand';
import { setAuthorizationCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export interface FormValuesStep1Signup {
  profilePictureUrl: string;
  instituteProfilePic?: string;
  instituteName: string;
  instituteType: string;
  instituteThemeCode?: string;
}

export const organizationDetailsSignupStep1 = z
  .object({
    name: z.string().min(1, 'Name is required'),
    username: z
      .string()
      .min(1, 'Username is required')
      .refine((value) => value === value.toLowerCase(), {
        message: 'Username should not contain uppercase letters',
      }),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    roleType: z.array(z.string()).min(1, 'At least one role type is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof organizationDetailsSignupStep1>;

interface SignupData {
  full_name: string;
  user_name: string;
  email: string;
  password: string;
  user_roles: string[];
  subject_id?: string;
  vendor_id?: string;
  [key: string]: any;
}

export function Step3AddOrgDetails() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { formDataAddOrg, setFormDataAddOrg, resetAddOrgForm } = useAddOrgStore();
  const { formData, resetForm } = useOrganizationStore();
  const [signupData, setSignupData] = useState<SignupData | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationDetailsSignupStep1),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleType: ['ADMIN'],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const signupDataParam = url.searchParams.get('signupData');

    if (signupDataParam) {
      try {
        const decoded = decodeURIComponent(signupDataParam);
        const parsed = JSON.parse(atob(decoded));

        const enrichedSignupData: SignupData = {
          full_name: parsed.name || '',
          user_name: parsed.name?.toLowerCase().replace(/\s/g, '') || '',
          email: parsed.email || '',
          password: parsed.password || '',
          user_roles: ['ADMIN'],
          subject_id: parsed.sub ?? '',
          vendor_id: parsed.provider ?? '',
          ...parsed,
        };

        setSignupData(enrichedSignupData);

        form.reset({
          name: enrichedSignupData.full_name,
          username: enrichedSignupData.user_name,
          email: enrichedSignupData.email,
          password: enrichedSignupData.password,
          confirmPassword: enrichedSignupData.password,
          roleType: enrichedSignupData.user_roles,
        });
      } catch (e) {
        console.error('Failed to decode signupData:', e);
      }
    }
  }, []);

  const { getValues } = form;
  const isValid =
    !!getValues('name') &&
    !!getValues('username') &&
    !!getValues('email') &&
    !!getValues('password') &&
    !!getValues('confirmPassword');

  const handleSignupInstituteMutation = useMutation({
    mutationFn: async ({
      searchParams,
      formData,
      formDataOrg,
      signupData,
    }: {
      searchParams: Record<string, boolean>;
      formData: FormValuesStep1Signup;
      formDataOrg: z.infer<typeof organizationDetailsSignupStep1>;
      signupData?: Record<string, any>;
    }) => {
      return handleSignupInstitute({
        searchParams,
        formData,
        formDataOrg,
        signupData: {
          ...signupData,
          subject_id: signupData?.subject_id ?? '',
          vendor_id: signupData?.vendor_id ?? '',
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
      setAuthorizationCookie(TokenKey.accessToken, data.accessToken);
      setAuthorizationCookie(TokenKey.refreshToken, data.refreshToken);
      resetForm();
      resetAddOrgForm();
      navigate({ to: '/dashboard' });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.ex, {
          className: 'error-toast',
          duration: 2000,
        });
      } else {
        console.error('Unexpected error:', error);
      }
    },
  });

  function onSubmit(values: FormValues) {
    setFormDataAddOrg({ ...values });

    const url = new URL(window.location.href);
    handleSignupInstituteMutation.mutate({
      searchParams: {
        assess: url.searchParams.get('assess') === 'true',
        lms: url.searchParams.get('lms') === 'true',
      },
      formData,
      formDataOrg: values,
      signupData: signupData || undefined,
    });
  }

  return (
    <FormProvider {...form}>
      <form>
        <div className="my-6 flex flex-col items-center justify-center gap-8">
          <h1 className="text-[1.6rem]">Create your profile in the organization</h1>

          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <MyInput
                    inputType="text"
                    inputPlaceholder="Full name (First and Last)"
                    input={value}
                    onChangeFunction={onChange}
                    required
                    error={form.formState.errors.name?.message}
                    size="large"
                    label="Full Name"
                    {...field}
                    className="w-96"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <MyInput
                    inputType="text"
                    inputPlaceholder="Enter Username"
                    input={value}
                    onChangeFunction={onChange}
                    required
                    error={form.formState.errors.username?.message}
                    size="large"
                    label="Username"
                    {...field}
                    className="w-96"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <MyInput
                    inputType="email"
                    inputPlaceholder="Enter Email"
                    input={value}
                    onChangeFunction={onChange}
                    required
                    error={form.formState.errors.email?.message}
                    size="large"
                    label="Email"
                    {...field}
                    className="w-96"
                    disabled={!!signupData?.email}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <MyInput
                    inputType="password"
                    inputPlaceholder="******"
                    input={value}
                    onChangeFunction={onChange}
                    required
                    error={form.formState.errors.password?.message}
                    size="large"
                    label="Password"
                    {...field}
                    className="w-96"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <MyInput
                    inputType="password"
                    inputPlaceholder="******"
                    input={value}
                    onChangeFunction={onChange}
                    required
                    error={form.formState.errors.confirmPassword?.message}
                    size="large"
                    label="Confirm Password"
                    {...field}
                    className="w-96"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <MyButton
            type="button"
            scale="large"
            buttonType="primary"
            layoutVariant="default"
            onClick={form.handleSubmit(onSubmit)}
            className="mt-4"
            disable={!isValid}
          >
            Finish
          </MyButton>
        </div>
      </form>
    </FormProvider>
  );
}

export default Step3AddOrgDetails;
