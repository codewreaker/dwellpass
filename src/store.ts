// Zustand Based Store to handle App State
import { create } from 'zustand'
import { combine, devtools } from 'zustand/middleware'
import type { ReactNode } from 'react'

type ActionEvents = 'add' | 'delete' | 'update'

// Modal state interface - now accepts any React node
interface ModalState {
    isOpen: boolean;
    modalId: string | null;
    content: Record<string, any> | null; // The actual component/element to render
}

export const useAppStore = create(
    devtools(
        combine({
            sidebarOpen: { left: false, right: false },
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
            openModal: (modalId: string, content: Record<string, any> = {}) => set({
                modal: { isOpen: true, modalId, content }
            }),
            closeModal: (modalId: string) => set({
                modal: { isOpen: false, modalId, content: null }
            }),
        })),
        { name: 'AppStore' } // shows in Redux DevTools
    ));