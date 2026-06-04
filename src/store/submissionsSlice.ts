import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type FormType = 'uncontrolled' | 'hook-form';

export type FormValues = {
  email: string;
  name: string;
};

export type Submission = FormValues & {
  formType: FormType;
  id: string;
};

type SubmissionsState = {
  items: Submission[];
};

const initialState: SubmissionsState = {
  items: [],
};

const submissionsSlice = createSlice({
  initialState,
  name: 'submissions',
  reducers: {
    addSubmission: (
      state,
      action: PayloadAction<FormValues & { formType: FormType }>
    ) => {
      state.items.push({
        ...action.payload,
        id: `${action.payload.formType}-${Date.now().toString()}`,
      });
    },
  },
});

export const { addSubmission } = submissionsSlice.actions;
export default submissionsSlice.reducer;
