import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const focusableSelector = [
  'button',
  '[href]',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type ModalProperties = {
  children: ReactNode;
  onClose: () => void;
  title: string;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1
  );
}

function keepFocusInsideDialog(event: KeyboardEvent, container: HTMLElement) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements.at(0);
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) {
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function Modal({ children, onClose, title }: ModalProperties) {
  const dialogReference = useRef<HTMLDivElement>(null);
  const titleId = `${title.toLowerCase().replaceAll(' ', '-')}-title`;

  useEffect(() => {
    const activeElement = document.activeElement;
    const initialFocusElement =
      dialogReference.current?.querySelector<HTMLElement>(
        '[data-modal-autofocus]'
      );
    const focusableElements = dialogReference.current
      ? getFocusableElements(dialogReference.current)
      : [];

    initialFocusElement?.focus();

    if (!initialFocusElement) {
      focusableElements[0]?.focus();
    }

    return () => {
      if (activeElement instanceof HTMLElement) {
        activeElement.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogReference.current) {
        return;
      }

      keepFocusInsideDialog(event, dialogReference.current);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal__dialog"
        ref={dialogReference}
        role="dialog"
      >
        <div className="modal__header">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Close modal"
            className="modal__close"
            type="button"
            onClick={onClose}
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
