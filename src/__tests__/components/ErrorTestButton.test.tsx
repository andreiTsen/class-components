import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import ErrorBoundary from '../../components/ErrorBoundary';
import ErrorTestButton from '../../components/ErrorTestButton';

describe('ErrorTestButton', () => {
  it('shows the error message through ErrorBoundary after click', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ErrorTestButton />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: 'Test Error' }));

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
  });
});
