import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env?.DEV) {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground"
      >
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong.</h1>
          <p className="text-sm text-muted-foreground">
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
          {import.meta.env?.DEV && (
            <pre className="text-left text-xs bg-muted p-3 rounded overflow-auto max-h-48">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ""}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
