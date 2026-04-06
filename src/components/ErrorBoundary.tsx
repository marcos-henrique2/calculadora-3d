import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted">
          <div className="max-w-xl p-8 bg-white rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Ocorreu um erro</h2>
            <pre className="whitespace-pre-wrap text-sm text-destructive/80 bg-destructive/5 p-3 rounded-lg">
              {String(this.state.error)}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              Recarregue a página ou abra o console para mais detalhes.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;