import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { handleOAuthCallback } from '@/hooks/login/oauth-login';

function OAuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const processOAuth = async () => {
            const result = await handleOAuthCallback();

            if (result.success) {
                toast.success('Authentication successful');

                if (result.signupData) {
                    navigate({
                        to: '/signup/onboarding',
                        search: {
                            assess: result.state?.includes('assess') ?? false,
                            lms: result.state?.includes('lms') ?? false,
                            signupData: btoa(JSON.stringify(result.signupData)),
                        },
                    });
                } else {
                    navigate({ to: '/dashboard' });
                }
            } else {
                toast.error('OAuth authentication failed');
                navigate({ to: '/signup' });
            }
        };

        processOAuth();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                <p className="text-sm text-neutral-600">Finalizing login, please wait...</p>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/signup/oauth/callback')({
    component: OAuthCallbackPage,
});
