import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import App from './App';
import countriesReducer from './store/countriesSlice';
import submissionsReducer from './store/submissionsSlice';

const testAvatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });

function renderApp() {
  const store = configureStore({
    reducer: {
      countries: countriesReducer,
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
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
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
    await user.upload(screen.getByLabelText('Profile image'), testAvatar);
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.type(screen.getByLabelText('Confirm password'), 'Password1!');
    await user.type(screen.getByLabelText('Country'), 'Poland');
    await user.click(screen.getByLabelText('Accept Terms and Conditions'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Age: 36')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gender: female')).toBeInTheDocument();
    expect(screen.getByText('Terms accepted: yes')).toBeInTheDocument();
    expect(screen.getByText('Country: Poland')).toBeInTheDocument();
    expect(screen.getByAltText('Ada Lovelace profile')).toBeInTheDocument();
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
    await user.upload(screen.getByLabelText('Profile image'), testAvatar);
    await waitFor(() => {
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.type(screen.getByLabelText('Confirm password'), 'Password1!');
    await user.type(screen.getByLabelText('Country'), 'Ukraine');
    await user.click(screen.getByLabelText('Accept Terms and Conditions'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Age: 85')).toBeInTheDocument();
    expect(screen.getByText('grace@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gender: female')).toBeInTheDocument();
    expect(screen.getByText('Terms accepted: yes')).toBeInTheDocument();
    expect(screen.getByText('Country: Ukraine')).toBeInTheDocument();
    expect(screen.getByAltText('Grace Hopper profile')).toBeInTheDocument();
    expect(screen.getByText('hook-form')).toBeInTheDocument();
  });
});
