import { Component, ErrorInfo, ReactNode, useEffect, useRef, useState } from 'react';
import { Warning, ArrowClockwise } from '@phosphor-icons/react';
import { MyButton } from '@/components/design-system/button';
import { useTheme } from '@/providers/theme/theme-provider';
import ClipLoader from 'react-spinners/ClipLoader';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 px-6 py-12 text-center">
                    <div className="mb-6 rounded-full bg-red-100 p-4">
                        <Warning className="size-12 text-red-600" />
                    </div>

                    <h2 className="mb-3 text-xl font-semibold text-neutral-800">
                        Something went wrong
                    </h2>

                    <p className="mb-6 max-w-md text-sm leading-relaxed text-neutral-600">
                        We encountered an unexpected error while loading this content. This might be
                        due to a temporary issue or insufficient permissions.
                    </p>

                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <MyButton
                            onClick={this.handleReset}
                            buttonType="primary"
                            scale="medium"
                            className="flex items-center gap-2"
                        >
                            <ArrowClockwise className="size-4" />
                            Try Again
                        </MyButton>

                        <MyButton
                            onClick={() => window.location.reload()}
                            buttonType="secondary"
                            scale="medium"
                        >
                            Reload Page
                        </MyButton>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-6 max-w-full overflow-auto rounded-lg bg-red-100 p-4 text-left">
                            <summary className="mb-2 cursor-pointer text-sm font-medium text-red-800">
                                Error Details (Development)
                            </summary>
                            <pre className="whitespace-pre-wrap break-words text-xs text-red-700">
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

// Learning messages for status panel
const learningMessages = ['Loading...', 'Setting up...', 'Almost ready...'];

// Shimmer Card Component
const ShimmerCard = ({
    className = '',
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
        <div className="shimmer-wrapper">{children}</div>
    </div>
);

// Shimmer Bar Component
const ShimmerBar = ({
    width = '100%',
    height = 'h-4',
    className = '',
}: {
    width?: string;
    height?: string;
    className?: string;
}) => <div className={`${height} shimmer rounded bg-slate-200 ${className}`} style={{ width }} />;

// Main dashboard loader component (keeps props for compatibility)
export const DashboardLoader = ({
    height = '',
    size = 20,
    fullscreen = false,
}: {
    height?: string;
    size?: number;
    fullscreen?: boolean;
}) => {
    const { getPrimaryColorCode } = useTheme();
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % learningMessages.length);
        }, 2000);

        const dotsInterval = setInterval(() => {
            setDots((prev) => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 400);

        return () => {
            clearInterval(messageInterval);
            clearInterval(dotsInterval);
        };
    }, []);

    const containerMinHeight = height || '60vh';

    useEffect(() => {
        const element = containerRef.current;
        if (!element || typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width, height } = entry.contentRect;
            setContainerSize({ width, height });
        });

        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, []);

    // Compact mode when both width and height are small (embedded/small containers)
    const isCompact =
        containerSize.width > 0 &&
        containerSize.height > 0 &&
        containerSize.width <= 640 &&
        containerSize.height <= 420;

    if (isCompact) {
        return (
            <div
                className={`${fullscreen ? 'fixed inset-0 overflow-auto' : 'w-full'} bg-slate-50`}
                style={{ minHeight: containerMinHeight }}
                ref={containerRef}
            >
                <div className="flex min-h-full items-center justify-center p-6">
                    <div className="text-center">
                        <ClipLoader
                            size={size || 32}
                            color={getPrimaryColorCode()}
                            speedMultiplier={0.8}
                        />
                        <p className="mt-3 text-xs font-medium text-slate-700">
                            {learningMessages[messageIndex]}
                            {dots}
                        </p>
                    </div>
                </div>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
          @keyframes loadingProgress {
            0% { width: 20%; }
            50% { width: 75%; }
            100% { width: 20%; }
          }

          @keyframes shimmer {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }

          .shimmer {
            background: #e2e8f0;
            animation: shimmer 1.5s linear infinite;
          }

          .shimmer-wrapper {
            position: relative;
            overflow: hidden;
          }
        `,
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`${fullscreen ? 'fixed inset-0 overflow-auto' : 'w-full'} bg-slate-50`}
            style={{ minHeight: containerMinHeight }}
            ref={containerRef}
        >
            <div className="mx-auto flex min-h-full max-w-screen-2xl flex-col lg:flex-row">
                {/* Main Content Area with Shimmer Cards */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full">
                        {/* Header Section */}
                        <div className="mb-8">
                            <ShimmerCard className="mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <ShimmerBar
                                            width="100%"
                                            height="h-6"
                                            className="max-w-[200px]"
                                        />
                                        <ShimmerBar
                                            width="100%"
                                            height="h-4"
                                            className="max-w-[300px]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <ShimmerBar
                                            width="100%"
                                            height="h-8"
                                            className="max-w-[80px]"
                                        />
                                        <ShimmerBar
                                            width="100%"
                                            height="h-8"
                                            className="max-w-[100px]"
                                        />
                                    </div>
                                </div>
                            </ShimmerCard>
                        </div>

                        {/* Stats Cards Row */}
                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <ShimmerCard key={i}>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <ShimmerBar width="60px" height="h-4" />
                                            <ShimmerBar
                                                width="24px"
                                                height="h-6"
                                                className="rounded-full"
                                            />
                                        </div>
                                        <ShimmerBar width="80px" height="h-8" />
                                        <ShimmerBar width="120px" height="h-3" />
                                    </div>
                                </ShimmerCard>
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Column - Large Card */}
                            <div className="lg:col-span-2">
                                <ShimmerCard className="min-h-64 md:min-h-72 lg:min-h-80">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <ShimmerBar
                                                width="100%"
                                                height="h-5"
                                                className="max-w-[150px]"
                                            />
                                            <ShimmerBar
                                                width="100%"
                                                height="h-4"
                                                className="max-w-[60px]"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <ShimmerBar width="100%" height="h-32" />
                                            <div className="flex gap-4">
                                                <ShimmerBar
                                                    width="100%"
                                                    height="h-4"
                                                    className="max-w-[80px]"
                                                />
                                                <ShimmerBar
                                                    width="100%"
                                                    height="h-4"
                                                    className="max-w-[100px]"
                                                />
                                                <ShimmerBar
                                                    width="100%"
                                                    height="h-4"
                                                    className="max-w-[60px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ShimmerCard>
                            </div>

                            {/* Right Column - Smaller Cards */}
                            <div className="space-y-4">
                                <ShimmerCard className="min-h-32 md:min-h-36">
                                    <div className="space-y-3">
                                        <ShimmerBar
                                            width="100%"
                                            height="h-4"
                                            className="max-w-[120px]"
                                        />
                                        <ShimmerBar width="100%" height="h-16" />
                                        <ShimmerBar
                                            width="100%"
                                            height="h-3"
                                            className="max-w-[80px]"
                                        />
                                    </div>
                                </ShimmerCard>
                                <ShimmerCard className="min-h-32 md:min-h-36">
                                    <div className="space-y-3">
                                        <ShimmerBar
                                            width="100%"
                                            height="h-4"
                                            className="max-w-[100px]"
                                        />
                                        <ShimmerBar width="100%" height="h-16" />
                                        <ShimmerBar
                                            width="100%"
                                            height="h-3"
                                            className="max-w-[90px]"
                                        />
                                    </div>
                                </ShimmerCard>
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <ShimmerCard key={i}>
                                    <div className="flex items-center gap-4">
                                        <ShimmerBar
                                            width="48px"
                                            height="h-12"
                                            className="rounded-full"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <ShimmerBar
                                                width="100%"
                                                height="h-4"
                                                className="max-w-[200px]"
                                            />
                                            <ShimmerBar
                                                width="100%"
                                                height="h-3"
                                                className="max-w-[300px]"
                                            />
                                        </div>
                                        <ShimmerBar
                                            width="100%"
                                            height="h-8"
                                            className="max-w-[80px]"
                                        />
                                    </div>
                                </ShimmerCard>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading Status Panel */}
                <div className="border-l border-slate-200 bg-white p-6 lg:w-80">
                    <div className="sticky top-6">
                        {/* Logo/Icon Section */}
                        <div className="mb-8 text-center">
                            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <svg
                                    className="size-8 animate-pulse text-slate-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        <div className="mb-6 text-center">
                            <ClipLoader
                                size={size || 32}
                                color={getPrimaryColorCode()}
                                speedMultiplier={0.8}
                            />
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-1.5 rounded-full bg-slate-600 transition-all duration-300 ease-out"
                                    style={{
                                        width: '65%',
                                        animation: 'loadingProgress 2.5s ease-in-out infinite',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Dynamic Message */}
                        <div className="mb-8 space-y-3 text-center">
                            <p className="text-sm font-medium text-slate-800 transition-opacity duration-500">
                                {learningMessages[messageIndex]}
                                {dots}
                            </p>
                            <p className="text-xs leading-relaxed text-slate-500">
                                {"We're setting up everything for your best learning experience"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
          @keyframes loadingProgress {
            0% { width: 20%; }
            50% { width: 75%; }
            100% { width: 20%; }
          }

          @keyframes shimmer {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }

          .shimmer {
            background: #e2e8f0;
            animation: shimmer 1.5s linear infinite;
          }

          .shimmer-wrapper {
            position: relative;
            overflow: hidden;
          }
        `,
                }}
            />
        </div>
    );
};
