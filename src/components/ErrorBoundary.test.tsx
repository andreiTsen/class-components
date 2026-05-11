import { Component, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../__tests__/test-utils';
import ErrorBoundary from './ErrorBoundary';

type ThrowingChildProps = {
  shouldThrow: boolean;
};

class ThrowingChild extends Component<ThrowingChildProps> {
  render(): ReactNode {
    if (this.props.shouldThrow) {
      throw new Error('Test error');
    }

    return <p>Working content</p>;
  }
}

describe('ErrorBoundary', () => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it('рендерит контент без ошібки', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('рендерит резервный UI и может сбросить границу', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: 'Что-то пошло не так' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }));

    expect(
      screen.getByRole('heading', { name: 'Что-то пошло не так' })
    ).toBeInTheDocument();
  });
});

