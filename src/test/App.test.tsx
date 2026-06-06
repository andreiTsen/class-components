import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import App from '../App';
import countriesReducer from '../store/countriesSlice';
import submissionsReducer from '../store/submissionsSlice';

const testAvatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
const oversizedAvatar = `${'a'.repeat(1_000_000)}a`;

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

    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
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
    await user.click(screen.getByRole('dialog'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps focus inside the modal with Tab navigation', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );

    await user.tab();
    expect(screen.getByLabelText('Age')).toHaveFocus();
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
    expect(screen.getByText('Ada Lovelace').closest('li')).toHaveClass(
      'submissions__item--new'
    );
    expect(screen.getByText('uncontrolled')).toBeInTheDocument();
  });

  it('shows uncontrolled validation errors only after submit', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );

    expect(
      screen.queryByText('Name must start with a capital letter')
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'ada Lovelace');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText('Name must start with a capital letter')
    ).toBeInTheDocument();
  });

  it('shows uncontrolled image validation errors after invalid upload', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    );
    await user.upload(
      screen.getByLabelText('Profile image'),
      new File([oversizedAvatar], 'avatar.png', { type: 'image/png' })
    );

    expect(
      screen.queryByText('Image must be 1MB or smaller')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText('Image must be 1MB or smaller')
    ).toBeInTheDocument();
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
    expect(screen.getByText('Grace Hopper').closest('li')).toHaveClass(
      'submissions__item--new'
    );
    expect(screen.getByText('hook-form')).toBeInTheDocument();
  });

  it('shows react hook form validation errors in real time', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    );
    await user.type(screen.getByLabelText('Name'), 'ada Lovelace');
    await user.tab();

    expect(
      await screen.findByText('Name must start with a capital letter')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
