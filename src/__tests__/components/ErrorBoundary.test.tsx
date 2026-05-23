import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

type ThrowingChildProperties = {
  shouldThrow: boolean;
};

function ThrowingChild({ shouldThrow }: ThrowingChildProperties) {
  if (shouldThrow) {
    throw new Error('Test error');
  }

  return <p>Working content</p>;
}

describe('ErrorBoundary', () => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it('renders content without error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('renders fallback UI and can reset the boundary', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
  });
});
