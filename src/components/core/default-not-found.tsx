import { Link, useRouter } from "@tanstack/react-router";
import { Helmet } from "react-helmet";
import { Button } from "../ui/button";

function RootNotFoundComponent() {
    const router = useRouter();

    return (
        <>
            <Helmet>
                <title>Page Not Found (404)</title>
                <meta
                    name="description"
                    content="Page not found. We couldn't find the page you were looking for. Please check the URL or try searching."
                />
            </Helmet>

            <div className="flex h-screen w-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-9xl font-black">404</h1>
                    <p className="text-2xl font-bold tracking-tight sm:text-4xl">
                        Oops! Page Not Found
                    </p>
                    <p className="mt-4 text-gray-500">
                        We couldn&apos;t find the page you were trying to access.
                        <br />
                        This might be due to a typing error, a temporary issue, or the page may have
                        been removed.
                    </p>
                    <div className="text-base-white mt-8 flex justify-center gap-5">
                        <Button asChild variant={"default"} className="h-10 min-w-32">
                            <Link to="/">Return Home</Link>
                        </Button>
                        <Button asChild variant={"default"} className="h-10 min-w-32">
                            <Link onClick={() => router.history.back()}>Go Back</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RootNotFoundComponent;
