import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-5" role="alert">
          <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(220,38,38,0.15)] p-10 max-w-xl w-full border-l-4 border-red-600">
            <div className="text-5xl text-center mb-5">⚠️</div>
            <h2 className="text-red-600 text-2xl text-center mb-2.5">Something Went Wrong</h2>
            <p className="text-gray-500 text-base leading-relaxed text-center mb-5">{this.state.error.message}</p>
            <details className="my-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <summary className="cursor-pointer text-gray-500 font-medium select-none hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2">Error Details</summary>
              <pre className="mt-2.5 p-2.5 bg-gray-100 rounded overflow-x-auto text-xs leading-snug text-gray-700">{this.state.error.stack}</pre>
            </details>
            <div className="flex gap-2.5 justify-center mt-5 flex-wrap">
              <button
                className="min-w-[120px] px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md cursor-pointer"
                onClick={this.handleRetry}
                aria-label="Retry"
              >
                🔄 Retry
              </button>
              <button
                className="min-w-[120px] px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-md cursor-pointer"
                onClick={() => (window.location.href = '/')}
                aria-label="Go to home page"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
