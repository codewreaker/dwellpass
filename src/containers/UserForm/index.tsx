/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Trash2
} from 'lucide-react';
import { userCollection } from '../../collections/user';
import type { UserType } from '../../entities/schemas';
import { Button, Input } from '../../components/ui';
import type { LauncherState } from '../../store';
import './style.css';

// Modal form data type - exported for type safety
export interface UserFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UserFormProps {
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
  onClose?: () => void;
}

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export const launchUserForm = (
  args: UserFormProps = {},
  openLauncher: (args: Omit<LauncherState, "isOpen">) => void
) => {
  openLauncher({
    content: <UserForm {...args} />,
  });
};

// User Form Component
const UserForm = ({ initialData = {}, isEditing = false, onClose }: UserFormProps) => {

  const [formData, setFormData] = useState<UserFormData>({ ...initialFormData, ...initialData });
  const [isMutating, setIsMutating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsMutating(true);
    const now = Date.now();
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
    };

    try {
      if (isEditing && formData.id) {
        userCollection?.update(formData.id, (draft) => {
          draft.firstName = userData.firstName;
          draft.lastName = userData.lastName;
          draft.email = userData.email;
          draft.phone = userData.phone;
          draft.updatedAt = now;
        });
      } else {
        userCollection?.insert({
          ...userData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        } as UserType);
      }
      onClose?.();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (formData.id && confirm('Are you sure you want to delete this user?')) {
      setIsMutating(true);
      try {
        userCollection?.delete(formData.id);
        onClose?.();
      } catch (error) {
        console.error('Failed to delete user:', error);
      } finally {
        setIsMutating(false);
      }
    }
  };

  return (
    <div className="user-modal">
      <div className="modal-header">
        <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
        <p>{isEditing ? 'Update user details' : 'Create a new community member'}</p>
      </div>

      <div className="modal-body">
        <form className="user-form" onSubmit={handleSubmit}>
          {/* First Name & Last Name */}
          <div className="form-row">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              leftIcon={<User size={14} />}
            />
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              leftIcon={<User size={14} />}
            />
          </div>

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            leftIcon={<Mail size={14} />}
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleInputChange}
            leftIcon={<Phone size={14} />}
          />

          {/* Form Actions */}
          <div className="form-actions">
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isMutating}
                leftIcon={<Trash2 size={14} />}
              >
                Delete
              </Button>
            )}
            <div className="actions-right">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isMutating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isMutating}
              >
                {isMutating ? 'Saving...' : isEditing ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
