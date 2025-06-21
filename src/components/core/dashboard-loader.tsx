import { Component, ErrorInfo, ReactNode } from 'react';
import { Warning, ArrowClockwise } from '@phosphor-icons/react';
import { MyButton } from '@/components/design-system/button';

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

// Main dashboard loader component
export const DashboardLoader = ({ height = '', size = 20 }: { height?: string; size?: number }) => {
    console.log(height, size);
    return (
        <div className="flex h-full min-h-[400px] w-full items-center justify-center">
            <div className="relative">
                {/* Outer ring */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500"></div>

                {/* Inner ring */}
                <div
                    className="absolute inset-2 h-12 w-12 animate-spin rounded-full border-4 border-neutral-100 border-t-primary-400"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                ></div>

                {/* Center dot */}
                <div className="absolute inset-6 h-4 w-4 animate-pulse rounded-full bg-primary-500"></div>
            </div>
        </div>
    );
};
