'use client' // Error boundaries must be Client Components

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    // Define a state variable to track whether is an error or not
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error: error }
  }

  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo: errorInfo })
    // Optionally send to analytics or logging service
    // logErrorToMyService(error, errorInfo); 
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 border border-red-400 rounded bg-red-50 text-red-700">
          <h2 className="text-lg font-semibold">Oops, something went wrong.</h2>
          <p>We encountered an error loading this part of the application. Please try refreshing the page.</p>
          {/* Optionally display error details during development */}
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-2 text-sm">
              <summary>Error Details (Development Only)</summary>
              <pre className="mt-1 p-2 bg-red-100 text-red-900 rounded overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    // Return children components in case of no error
    return this.props.children
  }
}

export default ErrorBoundary 