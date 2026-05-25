import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router';

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(<BrowserRouter>{ui}</BrowserRouter>, options);

export { screen, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
