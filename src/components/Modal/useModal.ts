import { useAppStore } from '../../store';

export const MODALS = {
  ADD_EVENT: 'add_event',
  ADD_USER: 'add_user',
  // Future modals can be added here
};

/**
 * useModal hook - Provides API for opening/closing modals
 * Components can pass any React element/component to be rendered in the modal.
 * The modal acts as a pure container with no business logic.
 * 
 * Usage:
 * const { openModal, closeModal } = useModal();
 * openModal(<MyForm onSubmit={handleSubmit} />);
 */
export function useModal() {
  const { modal, openModal, closeModal } = useAppStore();

  return {
    openModal,
    closeModal,
    isModalOpen: modal.isOpen,
  };
}
