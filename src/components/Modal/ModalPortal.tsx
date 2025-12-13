import { createPortal } from 'react-dom';
import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../store';
import { SignInForm } from '../../containers/SignInModal';
import { EventForm } from '../EventForm';
import { MODALS, type ModalId } from './useModal';
import { X } from 'lucide-react';

import './modal.css';


const DefaultModal = (args: unknown) => <code>{JSON.stringify(args)}</code>;


// Define modal map outside of component to avoid creating components during render
const MODAL_COMPONENTS: Record<ModalId | 'default', React.ComponentType<any>> = {
  [MODALS.ADD_USER]: SignInForm,
  [MODALS.ADD_EVENT]: EventForm,
  default: DefaultModal,
};

/**
 * ModalPortal component - Centralized modal container
 * 
 * Features:
 * - Renders modal content via React Portal at document.body
 * - Provides shared overlay with click-outside-to-close
 * - Handles Escape key to close
 * - Prevents body scroll when open
 * - Applies consistent animations
 */
export default function ModalPortal() {
  const { modal, closeModal } = useAppStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  // Handle click outside modal content
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeModal();
    }
  }, [closeModal]);

  // Add/remove event listeners and prevent body scroll
  useEffect(() => {
    if (modal.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [modal.isOpen, handleKeyDown]);

  if (!modal.isOpen || !modal.modalId) {
    return null;
  }

  const ModalElement = MODAL_COMPONENTS[modal.modalId as ModalId] || MODAL_COMPONENTS.default;

  // Use portal to render modal content at document.body level
  return createPortal(
    <div 
      ref={overlayRef}
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close" 
          onClick={closeModal}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
        <ModalElement {...(modal.content ?? {})} onClose={closeModal} />
      </div>
    </div>,
    document.body
  );
}
