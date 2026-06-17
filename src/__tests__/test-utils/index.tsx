import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../../context/ThemeContext';
import { setupStore } from '../../store/store';
import messages from '../../../messages/en.json';

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Provider store={setupStore()}>
        <ThemeProvider>{ui}</ThemeProvider>
      </Provider>
    </NextIntlClientProvider>,
    options
  );

export { act, renderHook, screen, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
