import { createPortal } from 'react-dom';
import { useAppStore } from '../../store';
import { SignInForm } from '../../containers/SignInModal';
import { EventForm } from '../EventForm';
import { MODALS } from './useModal'


import './modal.css';


const DefaultModal = (args: any) => <code>{JSON.stringify(args)}</code>;


// Define modal map outside of component to avoid creating components during render
const MODAL_COMPONENTS: Record<string, React.ComponentType<any>> = {
  [MODALS.ADD_USER]: SignInForm,
  [MODALS.ADD_EVENT]: EventForm,
  default: DefaultModal,
};

/**
 * ModalPortal component - Pure presentation layer for modals
 * Simply renders whatever React node is passed to it via the modal system.
 * Uses React Portal to render at document.body level, avoiding CSS stacking,
 * overflow, and z-index issues.
 * 
 * This component contains NO business logic - it's just a container.
 */
export default function ModalPortal() {
  const { modal } = useAppStore();

  if (!modal.isOpen || !modal.content) {
    return null;
  }

  const ModalElement = (MODAL_COMPONENTS[modal.modalId || 'default'] || MODAL_COMPONENTS.default) as React.ComponentType<any>;

  // Use portal to render modal content at document.body level
  return createPortal(
    <ModalElement {...modal.content} />,
    document.body
  );
}
