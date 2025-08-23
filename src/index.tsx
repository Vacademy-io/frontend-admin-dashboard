import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import RootErrorComponent from './components/core/deafult-error';
import RootNotFoundComponent from './components/core/default-not-found';
import RootPendingComponent from './components/core/default-pending';
import './index.css';
// import { ThemeProvider } from "./providers/theme-provider";
import { SidebarProvider } from './components/ui/sidebar';
import { routeTree } from './routeTree.gen';
import './i18n';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './providers/theme/theme-provider';
import { CourseSettingsProvider } from './providers/course-settings-provider';

// Initialize Amplitude as early as possible on client
if (typeof window !== 'undefined') {
    import('./lib/amplitude')
        .then((m) => m.initializeAmplitude())
        .catch(() => {
            // Ignore analytics failures
        });
}

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
    defaultNotFoundComponent: RootNotFoundComponent,
    defaultErrorComponent: RootErrorComponent,
    defaultPendingComponent: RootPendingComponent,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    // Dev-only: filter noisy DOMNodeInserted deprecation warning from third-party libs
    if (!import.meta.env.PROD) {
        const originalWarn = console.warn.bind(console);
        console.warn = (...args: unknown[]) => {
            const first = args?.[0];
            if (
                typeof first === 'string' &&
                first.includes("Listener added for a 'DOMNodeInserted' mutation event")
            ) {
                return;
            }
            originalWarn(...args);
        };
    }

    const root = ReactDOM.createRoot(rootElement);
    const app = (
        // <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <CourseSettingsProvider>
                    <SidebarProvider>
                        <RouterProvider router={router} />
                        <Toaster />
                    </SidebarProvider>
                </CourseSettingsProvider>
            </QueryClientProvider>
        </ThemeProvider>
        // </ThemeProvider>
    );

    // Disable StrictMode in development to suppress noisy library warnings (e.g., findDOMNode)
    root.render(import.meta.env.PROD ? <StrictMode>{app}</StrictMode> : app);
}
