'use client';

import { setupListeners } from '@reduxjs/toolkit/query';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import { ThemeProvider } from '../context/ThemeContext';
import { store } from '../store/store';

setupListeners(store.dispatch);

type ProvidersProperties = {
  children: ReactNode;
};

function Providers({ children }: ProvidersProperties) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default Providers;
