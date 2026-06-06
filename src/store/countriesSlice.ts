import { createSlice } from '@reduxjs/toolkit';

type CountriesState = {
  items: string[];
};

const initialState: CountriesState = {
  items: ['Poland', 'Ukraine', 'Germany', 'France', 'United States'],
};

const countriesSlice = createSlice({
  initialState,
  name: 'countries',
  reducers: {},
});

export default countriesSlice.reducer;
