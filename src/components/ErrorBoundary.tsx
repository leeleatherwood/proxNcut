'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-200 p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <div className="bg-slate-800 p-4 rounded border border-slate-700 max-w-2xl w-full overflow-auto">
            <p className="font-mono text-sm text-red-300 mb-2">{this.state.error?.message}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
