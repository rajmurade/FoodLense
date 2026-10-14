import { Component, type ErrorInfo, type ReactNode } from 'react';
import { uiStrings } from '../data/uiStrings';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FoodCheck error boundary caught an error', error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 text-center text-brand-dark">
          <section
            role="alert"
            aria-labelledby="error-boundary-title"
            className="mx-auto w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-card"
          >
            <h1 id="error-boundary-title" className="text-xl font-bold text-brand">
              {uiStrings.errors.boundaryTitle}
            </h1>
            <p className="text-sm text-brand-dark/80">{uiStrings.errors.boundaryBody}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.reset}
                className="min-h-[44px] rounded-2xl bg-brand px-6 py-2 font-medium text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {uiStrings.errors.retry}
              </button>
              <a
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-brand/40 px-6 py-2 font-medium text-brand transition hover:bg-brand/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {uiStrings.errors.goHome}
              </a>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
