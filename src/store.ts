// Zustand Based Store to handle App State
import { create } from 'zustand'
import { combine, devtools } from 'zustand/middleware'

type ActionEvents = 'add' | 'delete' | 'update'

// Modal state interface
interface ModalState {
    isOpen: boolean;
    modalId: string | null;
    content: Record<string, unknown> | null;
}

export const useAppStore = create(
    devtools(
        combine({
            sidebarOpen: { left: true, right: false },
            events: [] as ActionEvents[],
            modal: { isOpen: false, modalId: null, content: null } as ModalState,
        }, (set) => ({
            toggleSidebar: (pos: 'left' | 'right') => set((state) => ({
                sidebarOpen: {
                    ...state.sidebarOpen,
                    [pos]: !state.sidebarOpen[pos]
                }
            })),
            addEvent: (eventName: ActionEvents) => set((state) => ({
                events: Array.from(new Set(state.events).add(eventName))
            })),
            removeEvent: (eventName: ActionEvents) => set((state) => {
                const newEvents = new Set(state.events);
                newEvents.delete(eventName);
                return { events: Array.from(newEvents) };
            }),
            hasEvent: (eventName: ActionEvents) =>
                useAppStore.getState().events.includes(eventName),
            openModal: (modalId: string, content: Record<string, unknown> = {}) => set({
                modal: { isOpen: true, modalId, content }
            }),
            // Simplified: no modalId param needed since we only support one modal at a time
            closeModal: () => set({
                modal: { isOpen: false, modalId: null, content: null }
            }),
        })),
        { name: 'AppStore' } // shows in Redux DevTools
    ));