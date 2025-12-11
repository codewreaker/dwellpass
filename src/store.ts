// Zustand Based Store to handle App State
import { create } from 'zustand'
import { combine, devtools } from 'zustand/middleware'

type ActionEvents = 'add' | 'delete' | 'update'


export const useAppStore = create(
    devtools(
        combine({
            sidebarOpen: { left: false, right: false },
            events: [] as ActionEvents[],
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
                useAppStore.getState().events.includes(eventName)
        })),
        { name: 'AppStore' } // shows in Redux DevTools
    ));