import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import App from './App';
import submissionsReducer from './store/submissionsSlice';
import { configureStore } from '@reduxjs/toolkit';

function renderApp() {
  const store = configureStore({
    reducer: {
      submissions: submissionsReducer,
    },
  });

  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

describe('App', () => {
  it('renders forms page', () => {
    renderApp();

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
    renderApp();

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
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal on outside click', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );
    await user.click(screen.getByRole('dialog').parentElement ?? document.body);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders react hook form in the same modal component', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    );

    expect(
      screen.getByRole('dialog', { name: 'React Hook Form' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('stores uncontrolled form submissions in Redux history', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Age'), '36');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.selectOptions(screen.getByLabelText('Gender'), 'female');
    await user.click(screen.getByLabelText('Accept Terms and Conditions'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Age: 36')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gender: female')).toBeInTheDocument();
    expect(screen.getByText('Terms accepted: yes')).toBeInTheDocument();
    expect(screen.getByText('uncontrolled')).toBeInTheDocument();
  });

  it('stores react hook form submissions in Redux history', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    );
    await user.type(screen.getByLabelText('Name'), 'Grace Hopper');
    await user.type(screen.getByLabelText('Age'), '85');
    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.selectOptions(screen.getByLabelText('Gender'), 'female');
    await user.click(screen.getByLabelText('Accept Terms and Conditions'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Age: 85')).toBeInTheDocument();
    expect(screen.getByText('grace@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gender: female')).toBeInTheDocument();
    expect(screen.getByText('Terms accepted: yes')).toBeInTheDocument();
    expect(screen.getByText('hook-form')).toBeInTheDocument();
  });
});
