import { Component, ErrorInfo, ReactNode } from 'react';
import '../styles/ErrorBoundary.css';

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
        <div className="error-boundary" role="alert">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something Went Wrong</h2>
            <p className="error-message">{this.state.error.message}</p>
            <details className="error-details">
              <summary>Error Details</summary>
              <pre className="error-stack">{this.state.error.stack}</pre>
            </details>
            <div className="error-actions">
              <button
                className="btn btn-primary"
                onClick={this.handleRetry}
                aria-label="Retry"
              >
                🔄 Retry
              </button>
              <button
                className="btn btn-secondary"
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
