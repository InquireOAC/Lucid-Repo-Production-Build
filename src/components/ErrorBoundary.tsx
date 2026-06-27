import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  /** Remounts the boundary's subtree when this key changes (e.g. route path),
   *  so navigating away from a crashed screen clears the error. */
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/runtime errors in its subtree and shows a recoverable fallback
 * instead of white-screening the whole app. Wrap the router and the route
 * outlet with this.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Clear the error when the reset key (e.g. the route) changes.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] caught", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/15">
          <span className="text-2xl" aria-hidden>
            🌙
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Something interrupted your dream
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          An unexpected error occurred while loading this screen. You can try again or head back home.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={this.reset}
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-5 py-2.5 rounded-full border border-border/50 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
