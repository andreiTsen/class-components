import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from '../../context/ThemeContext';
import { setupStore } from '../../store/store';

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(
    <Provider store={setupStore()}>
      <ThemeProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </ThemeProvider>
    </Provider>,
    options
  );

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
