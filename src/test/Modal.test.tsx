import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from '../components/Modal/Modal';

const expectedCloseCount = 3;

describe('Modal', () => {
  it('opens in a portal, focuses the requested element, and ignores dialog content clicks', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal title="Plain Modal" onClose={onClose}>
        <button data-modal-autofocus type="button">
          First action
        </button>
        <button type="button">Second action</button>
      </Modal>
    );

    const firstAction = screen.getByRole('button', { name: 'First action' });
    const dialog = screen.getByRole('dialog', { name: 'Plain Modal' });

    expect(firstAction).toHaveFocus();
    expect(dialog).toHaveAttribute('open');

    await user.click(firstAction);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('falls back to the close button when no autofocus target is available', () => {
    render(
      <Modal title="Fallback Modal" onClose={vi.fn()}>
        <button type="button">Action</button>
      </Modal>
    );

    expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus();
  });

  it('closes on backdrop click, Escape, and native cancel events', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal title="Closable Modal" onClose={onClose}>
        <button type="button">Action</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Closable Modal' });

    await user.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(expectedCloseCount);
  });

  it('uses native dialog methods when they are available', () => {
    const originalShowModalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'showModal'
    );
    const originalCloseDescriptor = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'close'
    );
    const showModal = vi.fn(function showModalMock(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    const close = vi.fn(function closeMock(this: HTMLDialogElement) {
      this.removeAttribute('open');
    });

    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: showModal,
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: close,
    });

    const { unmount } = render(
      <Modal title="Native Modal" onClose={vi.fn()}>
        <button type="button">Action</button>
      </Modal>
    );

    expect(showModal).toHaveBeenCalledTimes(1);

    unmount();

    expect(close).toHaveBeenCalledTimes(1);

    if (originalShowModalDescriptor) {
      Object.defineProperty(
        HTMLDialogElement.prototype,
        'showModal',
        originalShowModalDescriptor
      );
    }

    if (originalCloseDescriptor) {
      Object.defineProperty(
        HTMLDialogElement.prototype,
        'close',
        originalCloseDescriptor
      );
    }
  });
});
