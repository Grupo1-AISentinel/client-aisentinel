import { Component } from 'react';
import ErrorState from './ErrorState.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorState
            title="Error inesperado"
            description={this.state.error?.message || 'Ocurrió un error al renderizar la página.'}
            onRetry={this.handleReset}
          />
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
