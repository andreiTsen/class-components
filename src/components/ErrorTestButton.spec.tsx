import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../__tests__/test-utils';
import ErrorBoundary from './ErrorBoundary';
import ErrorTestButton from './ErrorTestButton';

describe('ErrorTestButton', () => {
  it('отображает сообщение об ошібке через ErrorBoundary после клика', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ErrorTestButton />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: 'Test Error' }));

    expect(
      screen.getByRole('heading', { name: 'Что-то пошло не так' })
    ).toBeInTheDocument();
  });
});

