import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import Submissions from '../components/Submissions/Submissions';
import countriesReducer from '../store/countriesSlice';
import submissionsReducer, { type Submission } from '../store/submissionsSlice';

const submission: Submission = {
  age: '36',
  avatarBase64: 'data:image/png;base64,YXZhdGFy',
  confirmPassword: 'Password1!',
  country: 'Poland',
  email: 'ada@example.com',
  formType: 'uncontrolled',
  gender: 'female',
  id: 'old-submission',
  name: 'Ada Lovelace',
  password: 'Password1!',
  termsAccepted: false,
};

describe('Submissions', () => {
  it('renders non-highlighted submissions with declined terms', () => {
    const store = configureStore({
      preloadedState: {
        countries: {
          items: ['Poland'],
        },
        submissions: {
          items: [submission],
          lastSubmittedId: 'new-submission',
        },
      },
      reducer: {
        countries: countriesReducer,
        submissions: submissionsReducer,
      },
    });

    render(
      <Provider store={store}>
        <Submissions />
      </Provider>
    );

    expect(screen.getByText('Terms accepted: no')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace').closest('li')).not.toHaveClass(
      'submissions__item--new'
    );
  });
});
