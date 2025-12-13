import { useRef, useCallback, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import {
  Plus,
} from 'lucide-react';
import { useLiveQuery } from '@tanstack/react-db';
import { eventCollection } from '../../collections/events';
import type { Event } from '../../entities/schemas';
import { MODALS, useModal } from '../../components/Modal/useModal';
import './style.css';

// Helper to format date for datetime-local input
const formatDateForInput = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// Helper to get end of day
const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const { openModal } = useModal();
  const [isMutating, setIsMutating] = useState(false);

  // Fetch events using TanStack DB live query
  const { data: eventsData } = useLiveQuery((q) => q.from({ eventCollection }));
  const events = useMemo<Event[]>(() => Array.isArray(eventsData) ? eventsData : [], [eventsData]);

  // Transform events for FullCalendar
  const calendarEvents = useMemo(() => events.map((event) => ({
    id: event.id,
    title: event.name,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    extendedProps: {
      description: event.description,
      status: event.status,
      location: event.location,
      capacity: event.capacity,
      hostId: event.hostId,
    },
    classNames: [`event-${event.status}`],
  })), [events]);



  // Calendar event handlers
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;

    // For all-day selections, set appropriate times
    let startTime: Date;
    let endTime: Date;

    if (selectInfo.allDay) {
      startTime = new Date(start);
      startTime.setHours(9, 0, 0, 0);
      endTime = new Date(start);
      endTime.setHours(10, 0, 0, 0);
    } else {
      startTime = start;
      endTime = end;
    }

    // Open modal with the EventForm component
    openModal(MODALS.ADD_EVENT, {
      initialData: {
        startTime: formatDateForInput(startTime),
        endTime: formatDateForInput(endTime),
      },
      isEditing: false
    });

    // Clear selection
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  }, [openModal]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = clickInfo.event;

    // Open modal with the EventForm component
    openModal(MODALS.ADD_EVENT, {
      initialData: {
        id: event.id,
        name: event.title,
        description: event.extendedProps.description || '',
        status: event.extendedProps.status,
        startTime: formatDateForInput(event.start!),
        endTime: formatDateForInput(event.end || getEndOfDay(event.start!)),
        location: event.extendedProps.location || '',
        capacity: event.extendedProps.capacity?.toString() || '',
        hostId: event.extendedProps.hostId || '',
      },
      isEditing: true
    });
  }, [openModal]);

  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const event = dropInfo.event;

    try {
      setIsMutating(true);
      eventCollection.update(event.id, (draft) => {
        draft.startTime = event.start!;
        draft.endTime = event.end || getEndOfDay(event.start!);
        draft.updatedAt = new Date();
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      dropInfo.revert();
    } finally {
      setIsMutating(false);
    }
  }, []);

  const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
    const event = resizeInfo.event;

    try {
      setIsMutating(true);
      eventCollection.update(event.id, (draft) => {
        draft.startTime = event.start!;
        draft.endTime = event.end!;
        draft.updatedAt = new Date();
      });
    } catch (error) {
      console.error('Failed to resize event:', error);
      resizeInfo.revert();
    } finally {
      setIsMutating(false);
    }
  }, []);

  const handleAddEventClick = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const end = new Date(now);
    end.setHours(now.getHours() + 1);

    openModal(MODALS.ADD_EVENT, {
      initialData: {
        startTime: formatDateForInput(now),
        endTime: formatDateForInput(end),
      },
      isEditing: false
    });
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h2>Events Calendar</h2>
        <button className="add-event-btn" onClick={handleAddEventClick}>
          <Plus size={16} />
          New Event
        </button>
      </div>

      <div className="calendar-container">
        {isMutating && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={calendarEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="100%"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
          }}
        />
      </div>
    </div>
  );
}
