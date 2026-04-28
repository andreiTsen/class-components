import { Component } from 'react';

type ErrorTestButtonState = {
  shouldThrowError: boolean;
};

class ErrorTestButton extends Component<
  Record<string, never>,
  ErrorTestButtonState
> {
  state: ErrorTestButtonState = {
    shouldThrowError: false,
  };

  handleClick = () => {
    this.setState({ shouldThrowError: true });
  };

  render() {
    if (this.state.shouldThrowError) {
      throw new Error('Ошібка для тестірованія');
    }

    return (
      <button
        className="error-test-button"
        onClick={this.handleClick}
      >
        Test Error
      </button>
    );
  }
}

export default ErrorTestButton;
