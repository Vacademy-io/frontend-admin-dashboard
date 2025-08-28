import React, { useState } from 'react';
import {
    Eye,
    EyeOff,
    Edit2,
    Plus,
    Save,
    X,
    Settings,
    Users,
    FileText,
    Calendar,
    User,
    ClipboardList,
    Trash2,
} from 'lucide-react';

// Types
interface FieldVisibility {
    learnersList: boolean;
    enrollRequestList: boolean;
    inviteList: boolean;
    assessmentRegistration: boolean;
    liveSessionRegistration: boolean;
    learnerProfile: boolean;
}

interface CustomField {
    id: string;
    name: string;
    type: 'text' | 'dropdown';
    options?: string[];
    visibility: FieldVisibility;
}

interface FixedField {
    id: string;
    name: string;
    visibility: FieldVisibility;
}

// Dummy data
const initialFixedFields: FixedField[] = [
    {
        id: 'name',
        name: 'Name',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: true,
            assessmentRegistration: true,
            liveSessionRegistration: true,
            learnerProfile: true,
        },
    },
    {
        id: 'email',
        name: 'Email',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: true,
            assessmentRegistration: true,
            liveSessionRegistration: true,
            learnerProfile: true,
        },
    },
    {
        id: 'phone',
        name: 'Phone',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: true,
            assessmentRegistration: true,
            liveSessionRegistration: true,
            learnerProfile: true,
        },
    },
    {
        id: 'username',
        name: 'Username',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'password',
        name: 'Password',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: false,
        },
    },
    {
        id: 'batch',
        name: 'Batch (Preferred Batch)',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
];

const initialInstituteFields: CustomField[] = [
    {
        id: 'enrollmentNumber',
        name: 'Enrollment Number',
        type: 'text',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: true,
            liveSessionRegistration: true,
            learnerProfile: true,
        },
    },
    {
        id: 'collegeSchool',
        name: 'College/School',
        type: 'text',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'gender',
        name: 'Gender',
        type: 'dropdown',
        options: ['Male', 'Female', 'Other'],
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: true,
            liveSessionRegistration: true,
            learnerProfile: true,
        },
    },
    {
        id: 'fatherGuardianName',
        name: "Father/Male Guardian's Name",
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'motherGuardianName',
        name: "Mother/Female Guardian's Name",
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'fatherGuardianMobile',
        name: "Father/Male Guardian's Mobile Number",
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'fatherGuardianEmail',
        name: "Father/Male Guardian's Email ID",
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'motherGuardianMobile',
        name: "Mother/Female Guardian's Mobile Number",
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'motherGuardianEmail',
        name: "Mother/Female Guardian's Email ID",
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'city',
        name: 'City',
        type: 'text',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'state',
        name: 'State',
        type: 'text',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'sessionExpiry',
        name: 'Session Expiry',
        type: 'text',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: 'status',
        name: 'Status',
        type: 'dropdown',
        options: ['Active', 'Inactive', 'Pending', 'Suspended'],
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
];

const initialCustomFields: CustomField[] = [
    {
        id: '1',
        name: 'Department',
        type: 'dropdown',
        options: ['Computer Science', 'Electrical', 'Mechanical', 'Civil'],
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
    {
        id: '2',
        name: 'Student ID',
        type: 'text',
        visibility: {
            learnersList: true,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: true,
            liveSessionRegistration: true,
            learnerProfile: true,
        },
    },
    {
        id: '3',
        name: 'Address',
        type: 'text',
        visibility: {
            learnersList: false,
            enrollRequestList: true,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: true,
        },
    },
];

const visibilityLabels = [
    { key: 'learnersList', label: "Learner's List", icon: Users },
    { key: 'enrollRequestList', label: 'Enroll Request List', icon: ClipboardList },
    { key: 'inviteList', label: 'Invite List', icon: Users },
    { key: 'assessmentRegistration', label: 'Assessment Registration', icon: FileText },
    { key: 'liveSessionRegistration', label: 'Live Session Registration', icon: Calendar },
    { key: 'learnerProfile', label: 'Learner Profile', icon: User },
];

const CustomFieldsSettings: React.FC = () => {
    const [fixedFields, setFixedFields] = useState<FixedField[]>(initialFixedFields);
    const [instituteFields, setInstituteFields] = useState<CustomField[]>(initialInstituteFields);
    const [customFields, setCustomFields] = useState<CustomField[]>(initialCustomFields);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);
    const [newField, setNewField] = useState<Partial<CustomField>>({
        name: '',
        type: 'text',
        options: [],
        visibility: {
            learnersList: false,
            enrollRequestList: false,
            inviteList: false,
            assessmentRegistration: false,
            liveSessionRegistration: false,
            learnerProfile: false,
        },
    });

    const handleFixedFieldVisibilityChange = (
        fieldId: string,
        visibilityKey: keyof FieldVisibility
    ) => {
        setFixedFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          visibility: {
                              ...field.visibility,
                              [visibilityKey]: !field.visibility[visibilityKey],
                          },
                      }
                    : field
            )
        );
    };

    const handleInstituteFieldVisibilityChange = (
        fieldId: string,
        visibilityKey: keyof FieldVisibility
    ) => {
        setInstituteFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          visibility: {
                              ...field.visibility,
                              [visibilityKey]: !field.visibility[visibilityKey],
                          },
                      }
                    : field
            )
        );
    };

    const handleInstituteFieldNameChange = (fieldId: string, newName: string) => {
        setInstituteFields((prev) =>
            prev.map((field) => (field.id === fieldId ? { ...field, name: newName } : field))
        );
    };

    const handleInstituteFieldTypeChange = (fieldId: string, newType: 'text' | 'dropdown') => {
        setInstituteFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          type: newType,
                          options: newType === 'dropdown' ? ['Option 1'] : undefined,
                      }
                    : field
            )
        );
    };

    const handleRemoveInstituteField = (fieldId: string) => {
        setInstituteFields((prev) => prev.filter((field) => field.id !== fieldId));
    };

    const handleCustomFieldVisibilityChange = (
        fieldId: string,
        visibilityKey: keyof FieldVisibility
    ) => {
        setCustomFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          visibility: {
                              ...field.visibility,
                              [visibilityKey]: !field.visibility[visibilityKey],
                          },
                      }
                    : field
            )
        );
    };

    const handleCustomFieldNameChange = (fieldId: string, newName: string) => {
        setCustomFields((prev) =>
            prev.map((field) => (field.id === fieldId ? { ...field, name: newName } : field))
        );
    };

    const handleCustomFieldTypeChange = (fieldId: string, newType: 'text' | 'dropdown') => {
        setCustomFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          type: newType,
                          options: newType === 'dropdown' ? ['Option 1'] : undefined,
                      }
                    : field
            )
        );
    };

    const handleRemoveCustomField = (fieldId: string) => {
        setCustomFields((prev) => prev.filter((field) => field.id !== fieldId));
    };

    const handleAddOption = (fieldId: string, optionValue: string) => {
        if (optionValue.trim()) {
            // Check if it's an institute field or custom field
            const isInstituteField = instituteFields.some((field) => field.id === fieldId);
            if (isInstituteField) {
                setInstituteFields((prev) =>
                    prev.map((field) =>
                        field.id === fieldId
                            ? {
                                  ...field,
                                  options: [...(field.options || []), optionValue.trim()],
                              }
                            : field
                    )
                );
            } else {
                setCustomFields((prev) =>
                    prev.map((field) =>
                        field.id === fieldId
                            ? {
                                  ...field,
                                  options: [...(field.options || []), optionValue.trim()],
                              }
                            : field
                    )
                );
            }
        }
    };

    const handleRemoveOption = (fieldId: string, optionIndex: number) => {
        // Check if it's an institute field or custom field
        const isInstituteField = instituteFields.some((field) => field.id === fieldId);
        if (isInstituteField) {
            setInstituteFields((prev) =>
                prev.map((field) =>
                    field.id === fieldId
                        ? {
                              ...field,
                              options: field.options?.filter((_, index) => index !== optionIndex),
                          }
                        : field
                )
            );
        } else {
            setCustomFields((prev) =>
                prev.map((field) =>
                    field.id === fieldId
                        ? {
                              ...field,
                              options: field.options?.filter((_, index) => index !== optionIndex),
                          }
                        : field
                )
            );
        }
    };

    const handleEditOption = (fieldId: string, optionIndex: number, newValue: string) => {
        // Check if it's an institute field or custom field
        const isInstituteField = instituteFields.some((field) => field.id === fieldId);
        if (isInstituteField) {
            setInstituteFields((prev) =>
                prev.map((field) =>
                    field.id === fieldId
                        ? {
                              ...field,
                              options: field.options?.map((option, index) =>
                                  index === optionIndex ? newValue : option
                              ),
                          }
                        : field
                )
            );
        } else {
            setCustomFields((prev) =>
                prev.map((field) =>
                    field.id === fieldId
                        ? {
                              ...field,
                              options: field.options?.map((option, index) =>
                                  index === optionIndex ? newValue : option
                              ),
                          }
                        : field
                )
            );
        }
    };

    const handleAddCustomField = () => {
        if (newField.name && newField.type) {
            const field: CustomField = {
                id: Date.now().toString(),
                name: newField.name,
                type: newField.type,
                options: newField.type === 'dropdown' ? newField.options : undefined,
                visibility: newField.visibility!,
            };
            setCustomFields((prev) => [...prev, field]);
            setNewField({
                name: '',
                type: 'text',
                options: [],
                visibility: {
                    learnersList: false,
                    enrollRequestList: false,
                    inviteList: false,
                    assessmentRegistration: false,
                    liveSessionRegistration: false,
                    learnerProfile: false,
                },
            });
            setShowAddModal(false);
        }
    };

    const handleSaveChanges = () => {
        // TODO: API call to save changes
        console.log('Saving changes:', { fixedFields, instituteFields, customFields });
    };

    const VisibilityToggle: React.FC<{
        checked: boolean;
        onChange: () => void;
        label: string;
        icon: React.ComponentType<any>;
    }> = ({ checked, onChange, label, icon: Icon }) => (
        <button
            onClick={onChange}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                checked
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={label}
        >
            {checked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="hidden lg:inline">{label}</span>
        </button>
    );

    const DropdownOptionsManager: React.FC<{ field: CustomField }> = ({ field }) => {
        const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
        const [editingValue, setEditingValue] = useState('');
        const [newOptionValue, setNewOptionValue] = useState('');

        const startEditing = (index: number, value: string) => {
            setEditingOptionIndex(index);
            setEditingValue(value);
        };

        const saveEdit = () => {
            if (editingOptionIndex !== null && editingValue.trim()) {
                handleEditOption(field.id, editingOptionIndex, editingValue.trim());
                setEditingOptionIndex(null);
                setEditingValue('');
            }
        };

        const cancelEdit = () => {
            setEditingOptionIndex(null);
            setEditingValue('');
        };

        const handleAddOptionForField = () => {
            if (newOptionValue.trim()) {
                handleAddOption(field.id, newOptionValue);
                setNewOptionValue('');
            }
        };

        return (
            <div className="mt-3 border-l-2 border-green-200 pl-4">
                <p className="mb-2 text-sm text-gray-600">Options:</p>
                <div className="space-y-2">
                    {field.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {editingOptionIndex === index ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveEdit}
                                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="rounded bg-gray-500 px-2 py-1 text-xs text-white hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 rounded bg-green-100 px-2 py-1 text-sm text-green-800">
                                        {option}
                                    </span>
                                    <button
                                        onClick={() => startEditing(index, option)}
                                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveOption(field.id, index)}
                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            placeholder="Add new option"
                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddOptionForField();
                            }}
                        />
                        <button
                            onClick={handleAddOptionForField}
                            disabled={!newOptionValue.trim()}
                            className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600 disabled:opacity-50"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Custom Fields Settings</h1>
                    <p className="mt-2 text-gray-600">
                        Configure how fields appear across different parts of the system
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Custom Field
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-white transition-colors "
                    >
                        <Save className="size-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Institute Fields Section - Consolidated */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Institute Fields
                    </h2>
                </div>

                <div className="p-6 space-y-8">
                    {/* Fixed Institute Fields Subsection */}
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                                            Field Name
                                        </th>
                                        {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                            <th
                                                key={key}
                                                className="px-2 py-3 text-center font-medium text-gray-700"
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <Icon className="h-4 w-4 text-gray-500" />
                                                    <span className="text-xs">{label}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fixedFields.map((field) => (
                                        <tr
                                            key={field.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <span className="font-medium text-gray-900">
                                                    {field.name}
                                                </span>
                                                <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                                    System Field
                                                </span>
                                            </td>
                                            {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                                <td key={key} className="px-2 py-4 text-center">
                                                    <VisibilityToggle
                                                        checked={
                                                            field.visibility[
                                                                key as keyof FieldVisibility
                                                            ]
                                                        }
                                                        onChange={() =>
                                                            handleFixedFieldVisibilityChange(
                                                                field.id,
                                                                key as keyof FieldVisibility
                                                            )
                                                        }
                                                        label={label}
                                                        icon={Icon}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Institute Fields Subsection */}
                    <div>
                        {instituteFields.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <Settings className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                                <p>No standard institute fields available.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {instituteFields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                    >
                                        {/* Field Name and Delete Button Row */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-48">
                                                    <input
                                                        type="text"
                                                        value={field.name}
                                                        onChange={(e) =>
                                                            handleInstituteFieldNameChange(
                                                                field.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Field name"
                                                    />
                                                </div>
                                                <div className="w-48">
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) =>
                                                            handleInstituteFieldTypeChange(
                                                                field.id,
                                                                e.target.value as 'text' | 'dropdown'
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="text">Text Field</option>
                                                        <option value="dropdown">Dropdown</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveInstituteField(field.id)}
                                                className="rounded bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                                                title="Delete field"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Visibility Controls */}
                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-2">
                                                {visibilityLabels.map(
                                                    ({ key, label, icon: Icon }) => (
                                                        <VisibilityToggle
                                                            key={key}
                                                            checked={
                                                                field.visibility[
                                                                    key as keyof FieldVisibility
                                                                ]
                                                            }
                                                            onChange={() =>
                                                                handleInstituteFieldVisibilityChange(
                                                                    field.id,
                                                                    key as keyof FieldVisibility
                                                                )
                                                            }
                                                            label={label}
                                                            icon={Icon}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Dropdown Options Manager */}
                                        {field.type === 'dropdown' && (
                                            <DropdownOptionsManager field={field} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Custom Fields Subsection */}
                    <div>
                        {customFields.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <Edit2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                                <p>No custom fields created yet.</p>
                                <p className="text-sm">Click Add Custom Field to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {customFields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                    >
                                        {/* Field Name and Delete Button Row */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-48">
                                                    <input
                                                        type="text"
                                                        value={field.name}
                                                        onChange={(e) =>
                                                            handleCustomFieldNameChange(
                                                                field.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Field name"
                                                    />
                                                </div>
                                                <div className="w-48">
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) =>
                                                            handleCustomFieldTypeChange(
                                                                field.id,
                                                                e.target.value as 'text' | 'dropdown'
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="text">Text Field</option>
                                                        <option value="dropdown">Dropdown</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCustomField(field.id)}
                                                className="rounded bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                                                title="Delete field"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Visibility Controls */}
                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-2">
                                                {visibilityLabels.map(
                                                    ({ key, label, icon: Icon }) => (
                                                        <VisibilityToggle
                                                            key={key}
                                                            checked={
                                                                field.visibility[
                                                                    key as keyof FieldVisibility
                                                                ]
                                                            }
                                                            onChange={() =>
                                                                handleCustomFieldVisibilityChange(
                                                                    field.id,
                                                                    key as keyof FieldVisibility
                                                                )
                                                            }
                                                            label={label}
                                                            icon={Icon}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Dropdown Options Manager */}
                                        {field.type === 'dropdown' && (
                                            <DropdownOptionsManager field={field} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Custom Field Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Add Custom Field
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Field Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Field Name *
                                </label>
                                <input
                                    type="text"
                                    value={newField.name}
                                    onChange={(e) =>
                                        setNewField((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter field name"
                                />
                            </div>

                            {/* Field Type */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Field Type *
                                </label>
                                <select
                                    value={newField.type}
                                    onChange={(e) =>
                                        setNewField((prev) => ({
                                            ...prev,
                                            type: e.target.value as 'text' | 'dropdown',
                                            options:
                                                e.target.value === 'dropdown'
                                                    ? ['Option 1']
                                                    : undefined,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="text">Text Field</option>
                                    <option value="dropdown">Dropdown with options</option>
                                </select>
                            </div>

                            {/* Initial Options for Dropdown */}
                            {newField.type === 'dropdown' && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Initial Options
                                    </label>
                                    <div className="space-y-2">
                                        {newField.options?.map((option, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) =>
                                                        setNewField((prev) => ({
                                                            ...prev,
                                                            options: prev.options?.map((opt, i) =>
                                                                i === index ? e.target.value : opt
                                                            ),
                                                        }))
                                                    }
                                                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder={`Option ${index + 1}`}
                                                />
                                                <button
                                                    onClick={() =>
                                                        setNewField((prev) => ({
                                                            ...prev,
                                                            options: prev.options?.filter(
                                                                (_, i) => i !== index
                                                            ),
                                                        }))
                                                    }
                                                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setNewField((prev) => ({
                                                    ...prev,
                                                    options: [
                                                        ...(prev.options || []),
                                                        `Option ${(prev.options?.length || 0) + 1}`,
                                                    ],
                                                }))
                                            }
                                            className="flex items-center gap-2 rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add Option
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Visibility Settings */}
                            <div>
                                <label className="mb-3 block text-sm font-medium text-gray-700">
                                    Where should this field appear?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                        <label
                                            key={key}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    newField.visibility?.[
                                                        key as keyof FieldVisibility
                                                    ] || false
                                                }
                                                onChange={(e) =>
                                                    setNewField((prev) => ({
                                                        ...prev,
                                                        visibility: {
                                                            ...prev.visibility!,
                                                            [key]: e.target.checked,
                                                        },
                                                    }))
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Icon className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCustomField}
                                disabled={!newField.name}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Add Field
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomFieldsSettings;
