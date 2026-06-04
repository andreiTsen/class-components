import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders forms page', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'React Forms' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    ).toBeInTheDocument();
    expect(screen.getByText('No submissions yet')).toBeInTheDocument();
  });

  it('opens uncontrolled form in an accessible portal modal', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );

    const dialog = screen.getByRole('dialog', { name: 'Uncontrolled Form' });
    const nameInput = screen.getByLabelText('Name');

    expect(dialog).toBeInTheDocument();
    expect(nameInput).toHaveFocus();
  });

  it('closes modal with Escape', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal on outside click', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );
    await user.click(screen.getByRole('dialog').parentElement ?? document.body);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders react hook form in the same modal component', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    );

    expect(
      screen.getByRole('dialog', { name: 'React Hook Form' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });
});
