import { useState, useRef, useEffect } from 'preact/hooks';

const Modal = ({ isOpen, closeModal, children }) => {
  const modalRef = useRef();
  const focusableElementsRef = useRef([]);
  const [isClosing, setIsClosing] = useState(false); 

  const getFocusableElements = () => {
    return modalRef.current
      ? Array.from(modalRef.current.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      : [];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose(); // close modal if clicked outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close modal on Esc key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // focus trap
  useEffect(() => {
    if (isOpen) {
      focusableElementsRef.current = getFocusableElements();
      if (focusableElementsRef.current.length > 0) {
        focusableElementsRef.current[0].focus();
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true); 

    setTimeout(() => { 
        setIsClosing(false);
    }, 300);

    setTimeout(() => {
        closeModal();
    }, 50);
  };

  const handleTabKeyNavigation = (event) => {
    const { key, shiftKey } = event;

    if (key === 'Tab' && focusableElementsRef.current.length > 0) {
      const focusable = focusableElementsRef.current;
      const currentIndex = focusable.indexOf(document.activeElement);

      if (shiftKey) {
        if (currentIndex === 0) {
          focusable[focusable.length - 1].focus();
          event.preventDefault();
        }
      } else {
        if (currentIndex === focusable.length - 1) {
          focusable[0].focus();
          event.preventDefault();
        }
      }
    }
  };

  return isOpen || isClosing ? (
    <>
      <div
        className={`modal-overlay ${isOpen ? '' : 'closing'}`}
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-labelledby="modal-title"
        aria-hidden={!isOpen}
        tabIndex={-1}
        onKeyDown={handleTabKeyNavigation}
        className={`modal ${isOpen ? '' : 'closing'}`}
      >
        <div className="modal-content">
            <button className="modal-close-btn" tabIndex={0} onClick={handleClose} aria-label="Close modal">
                <i className="bi bi-x-lg"></i>
            </button>
            {children}
        </div>
      </div>
    </>
  ) : null;
};

export default Modal;
