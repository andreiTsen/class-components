import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

type ModalProperties = {
  children: ReactNode;
  onClose: () => void;
  title: string;
};

function Modal({ children, onClose, title }: ModalProperties) {
  const closeButtonReference = useRef<HTMLButtonElement>(null);
  const dialogReference = useRef<HTMLDialogElement>(null);
  const previousFocusReference = useRef<HTMLElement | null>(null);
  const titleId = `${title.toLowerCase().replaceAll(' ', '-')}-title`;

  useEffect(() => {
    const dialog = dialogReference.current;

    if (!dialog) {
      return;
    }

    previousFocusReference.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    const initialFocusElement =
      dialog.querySelector<HTMLElement>('[data-modal-autofocus]') ??
      closeButtonReference.current;

    initialFocusElement?.focus();

    return () => {
      if (dialog.open && typeof dialog.close === 'function') {
        dialog.close();
      }

      if (dialog.hasAttribute('open')) {
        dialog.removeAttribute('open');
      }

      previousFocusReference.current?.focus();
    };
  }, []);

  return createPortal(
    <dialog
      aria-labelledby={titleId}
      aria-modal="true"
      className="modal"
      ref={dialogReference}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div className="modal__dialog">
        <div className="modal__header">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Close modal"
            className="modal__close"
            ref={closeButtonReference}
            type="button"
            onClick={onClose}
          >
            X
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body
  );
}

export default Modal;
