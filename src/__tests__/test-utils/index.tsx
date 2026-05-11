import { render as rtlRender, screen, waitFor, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  rtlRender(ui, options);

export { screen, waitFor };
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };

