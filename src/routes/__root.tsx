import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const TanStackRouterDevtools =
    process.env.NODE_ENV === "production"
        ? () => null // Render nothing in production
        : React.lazy(() =>
              // Lazy load in development
              import("@tanstack/router-devtools").then((res) => ({
                  default: res.TanStackRouterDevtools,
              })),
          );

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    beforeLoad: ({ location }) => {
        if (location.pathname === "/") {
            throw redirect({
                to: "/login",
            });
        }
    },

    component: () => (
        <>
            <Outlet />

            {/* Development tools */}
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
            <ReactQueryDevtools initialIsOpen={false} />
        </>
    ),
});
