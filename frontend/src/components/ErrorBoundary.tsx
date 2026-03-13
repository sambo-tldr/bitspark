import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-display gradient-text">Something Went Wrong</h1>
            <p className="text-body text-muted-foreground">
              An unexpected error occurred. Please refresh the page or return home.
            </p>
            {this.state.error && (
              <pre className="glass rounded-lg p-4 text-caption text-muted-foreground text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center h-11 px-8 rounded-full gradient-primary text-primary-foreground font-medium"
              >
                Return Home
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center h-11 px-8 rounded-full border border-border bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
