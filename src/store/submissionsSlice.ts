import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FormValues } from '../validation/formSchema';

export type FormType = 'uncontrolled' | 'hook-form';

export type Submission = FormValues & {
  formType: FormType;
  id: string;
};

type SubmissionsState = {
  items: Submission[];
  lastSubmittedId: string | null;
};

const initialState: SubmissionsState = {
  items: [],
  lastSubmittedId: null,
};

const submissionsSlice = createSlice({
  initialState,
  name: 'submissions',
  reducers: {
    addSubmission: (
      state,
      action: PayloadAction<FormValues & { formType: FormType }>
    ) => {
      const id = `${action.payload.formType}-${Date.now().toString()}`;

      state.items.push({
        ...action.payload,
        id,
      });
      state.lastSubmittedId = id;
    },
    clearSubmissionHighlight: (state) => {
      state.lastSubmittedId = null;
    },
  },
});

export const { addSubmission, clearSubmissionHighlight } =
  submissionsSlice.actions;
export default submissionsSlice.reducer;
