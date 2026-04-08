import React from "react";

interface State { hasError: boolean; error?: Error | null }

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary p-6">
          <div className="max-w-xl w-full bg-white rounded-2xl p-8 border border-border shadow-sm">
            <h2 className="text-[18px] font-semibold text-destructive mb-3">Ocorreu um erro</h2>
            <pre className="text-[13px] text-destructive/80 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap overflow-auto">
              {String(this.state.error)}
            </pre>
            <p className="mt-4 text-[13px] text-muted-foreground">
              Recarregue a página ou abra o console do navegador para mais detalhes.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
