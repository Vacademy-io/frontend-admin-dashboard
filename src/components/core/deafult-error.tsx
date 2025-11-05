import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import { MyButton } from '../design-system/button';
import { removeCookiesAndLogout } from '@/lib/auth/sessionUtility';

function RootErrorComponent() {
    const router = useRouter();
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Unknown error occurred (500)</title>
                <meta
                    name="description"
                    content="An unexpected error occurred on the server. Please try again later or contact support."
                />
            </Helmet>

            <div className="flex h-screen w-screen select-none items-center justify-center px-4 text-gray-700 dark:text-gray-800">
                <div className="text-center">
                    <h1 className="text-9xl font-black">500</h1>
                    <p className="text-2xl font-bold tracking-tight sm:text-4xl">
                        Something Went Wrong !
                    </p>
                    <p className="mt-4 text-gray-500">
                        An unexpected error occurred on our server. We&apos;re working to fix it as
                        quickly as possible.
                        <br />
                        Please try again later or contact support if the problem persists.
                    </p>

                    <div className="my-8 flex justify-center gap-5 text-base">
                        <MyButton asChild className="h-10 min-w-32">
                            <Link to="/dashboard">Return Home</Link>
                        </MyButton>
                        <MyButton
                            buttonType="secondary"
                            className="h-10 min-w-32"
                            onClick={() => router.history.back()}
                        >
                            Go Back
                        </MyButton>
                    </div>
                    <MyButton
                        onClick={() => {
                            removeCookiesAndLogout();
                            navigate({ to: '/login' });
                        }}
                    >
                        Logout
                    </MyButton>
                </div>
            </div>
        </>
    );
}

export default RootErrorComponent;
