import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  FileText,
  Tag,
  Trash2
} from 'lucide-react';
import { eventCollection } from '../../collections/events';
import type { Event, EventStatus } from '../../entities/schemas';
import { useModal } from '../Modal/useModal';

// Modal form data type - exported for type safety
export interface EventFormData {
  id?: string;
  name: string;
  description: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  hostId: string;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  isEditing?: boolean;
  onClose?: () => void;
}

const initialFormData: EventFormData = {
  name: '',
  description: '',
  status: 'scheduled',
  startTime: '',
  endTime: '',
  location: '',
  capacity: '',
  hostId: '',
};

// Event Form Component
export const EventForm = ({ initialData = {}, isEditing = false, onClose }: EventFormProps) => {
  const { closeModal } = useModal();
  const handleClose = onClose ?? closeModal;
  
  const [formData, setFormData] = useState<EventFormData>({ ...initialFormData, ...initialData });
  const [isMutating, setIsMutating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsMutating(true);
    const now = new Date();
    const eventData = {
      name: formData.name,
      description: formData.description || undefined,
      status: formData.status,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      location: formData.location,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
      hostId: formData.hostId,
    };

    try {
      if (isEditing && formData.id) {
        eventCollection.update(formData.id, (draft) => {
          draft.name = eventData.name;
          draft.description = eventData.description;
          draft.status = eventData.status;
          draft.startTime = eventData.startTime;
          draft.endTime = eventData.endTime;
          draft.location = eventData.location;
          draft.capacity = eventData.capacity;
          draft.hostId = eventData.hostId;
          draft.updatedAt = now;
        });
      } else {
        eventCollection.insert({
          ...eventData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        } as Event);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (formData.id && confirm('Are you sure you want to delete this event?')) {
      setIsMutating(true);
      try {
        eventCollection.delete(formData.id);
        handleClose();
      } catch (error) {
        console.error('Failed to delete event:', error);
      } finally {
        setIsMutating(false);
      }
    }
  };

  return (
    <div className="event-modal">
      <div className="modal-header">
        <h2>{isEditing ? 'Edit Event' : 'New Event'}</h2>
        <p>{isEditing ? 'Update event details' : 'Create a new calendar event'}</p>
      </div>

      <div className="modal-body">
        <form className="event-form" onSubmit={handleSubmit}>
            {/* Event Name */}
            <div className="form-group full-width">
              <label>
                <CalendarIcon size={14} />
                Event Name
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter event name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ paddingLeft: '0.75rem' }}
                />
              </div>
            </div>

            {/* Start & End Time */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Clock size={14} />
                  Start Time
                </label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    style={{ paddingLeft: '0.75rem' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <Clock size={14} />
                  End Time
                </label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    style={{ paddingLeft: '0.75rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-group full-width">
              <label>
                <MapPin size={14} />
                Location
              </label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={14} />
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Status & Capacity */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Tag size={14} />
                  Status
                </label>
                <div className="input-wrapper">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '0.75rem' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <Users size={14} />
                  Capacity
                </label>
                <div className="input-wrapper">
                  <Users className="input-icon" size={14} />
                  <input
                    type="number"
                    name="capacity"
                    placeholder="Max attendees"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Host ID */}
            <div className="form-group full-width">
              <label>
                <Users size={14} />
                Host ID
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="hostId"
                  placeholder="Host ID (Current User)"
                  value={formData.hostId}
                  onChange={handleInputChange}
                  required
                  style={{ paddingLeft: '0.75rem' }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>
                <FileText size={14} />
                Description
              </label>
              <div className="input-wrapper">
                <textarea
                  name="description"
                  placeholder="Enter event description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              {isEditing && (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={handleDelete}
                  disabled={isMutating}
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={isMutating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={isMutating}
              >
                {isMutating ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>

        {isMutating && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
  );
};
