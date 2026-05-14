import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ошібка пріложенія:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-boundary">
          <h2>Что-то пошло не так</h2>
          <p>Проізошла ошібка. Вы можете вернуться к работе.</p>
          <button onClick={this.handleReset}>
            Попробовать снова
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
