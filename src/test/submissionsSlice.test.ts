import { describe, expect, it } from 'vitest';
import submissionsReducer, {
  addSubmission,
  clearSubmissionHighlight,
} from '../store/submissionsSlice';

const submissionPayload = {
  age: '36',
  avatarBase64: 'data:image/png;base64,YXZhdGFy',
  confirmPassword: 'Password1!',
  country: 'Poland',
  email: 'ada@example.com',
  formType: 'uncontrolled' as const,
  gender: 'female',
  name: 'Ada Lovelace',
  password: 'Password1!',
  termsAccepted: true,
};

describe('submissionsSlice', () => {
  it('adds submissions and marks the latest item', () => {
    const state = submissionsReducer(
      undefined,
      addSubmission(submissionPayload)
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject(submissionPayload);
    expect(state.lastSubmittedId).toBe(state.items[0]?.id);
  });

  it('clears latest submission highlight', () => {
    const state = submissionsReducer(
      undefined,
      addSubmission(submissionPayload)
    );
    const nextState = submissionsReducer(state, clearSubmissionHighlight());

    expect(nextState.lastSubmittedId).toBeNull();
  });
});
