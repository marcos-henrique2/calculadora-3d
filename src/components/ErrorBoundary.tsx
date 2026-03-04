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

  componentDidCatch(error: Error, info: any) {
    // You can log error to an external service here
    // console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted">
          <div className="max-w-xl p-8 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-2">Ocorreu um erro</h2>
            <pre className="whitespace-pre-wrap text-sm text-red-600">{String(this.state.error)}</pre>
            <p className="mt-4 text-sm text-muted-foreground">Abra o console do navegador para mais detalhes.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
