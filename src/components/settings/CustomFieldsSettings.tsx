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
    FolderPlus,
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
    required: boolean;
}

interface FixedField {
    id: string;
    name: string;
    visibility: FieldVisibility;
    required: boolean;
}

interface FieldGroup {
    id: string;
    name: string;
    fields: (CustomField | FixedField | GroupField)[];
    groups?: FieldGroup[];
}

interface GroupField {
    id: string;
    name: string;
    type: 'group';
    isGroup: true;
    originalGroup: FieldGroup;
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
        required: true,
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
        required: true,
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
        required: false,
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
        required: true,
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
        required: true,
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
        required: false,
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
        required: true,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: true,
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
        required: false,
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
        required: true,
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
        required: false,
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
    const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
    const [newGroup, setNewGroup] = useState<Partial<FieldGroup>>({
        name: '',
        fields: [],
    });
    const [newField, setNewField] = useState<Partial<CustomField>>({
        name: '',
        type: 'text',
        options: [],
        required: false,
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

    const handleFixedFieldRequiredChange = (fieldId: string) => {
        setFixedFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          required: !field.required,
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

    const handleInstituteFieldRequiredChange = (fieldId: string) => {
        setInstituteFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          required: !field.required,
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

    const handleCustomFieldRequiredChange = (fieldId: string) => {
        setCustomFields((prev) =>
            prev.map((field) =>
                field.id === fieldId
                    ? {
                          ...field,
                          required: !field.required,
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
                required: newField.required || false,
                visibility: newField.visibility!,
            };
            setCustomFields((prev) => [...prev, field]);
            setNewField({
                name: '',
                type: 'text',
                options: [],
                required: false,
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
        console.log('Saving changes:', { fixedFields, instituteFields, customFields, fieldGroups });
    };

    const handleFieldSelection = (fieldId: string) => {
        setSelectedFields((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(fieldId)) {
                newSet.delete(fieldId);
            } else {
                newSet.add(fieldId);
            }
            return newSet;
        });
    };

    const handleCreateGroup = () => {
        if (selectedFields.size === 0) return;

        const selectedFieldIds = Array.from(selectedFields);
        const allFields = [...fixedFields, ...instituteFields, ...customFields];
        const selectedFieldObjects = allFields.filter((field) =>
            selectedFieldIds.includes(field.id)
        );

        // Check if any selected items are groups
        const selectedGroups = fieldGroups.filter((group) => selectedFieldIds.includes(group.id));

        // Combine all selected fields and groups into a single fields array
        const allSelectedItems: (CustomField | FixedField | GroupField)[] = [
            ...selectedFieldObjects,
            ...selectedGroups.map((group) => ({
                id: group.id,
                name: group.name,
                type: 'group' as const,
                isGroup: true as const,
                originalGroup: group,
            })),
        ];

        setNewGroup({
            name: '',
            fields: allSelectedItems,
        });
        setShowGroupModal(true);
    };

    const handleAddGroup = () => {
        if (newGroup.name && newGroup.fields && newGroup.fields.length > 0) {
            const group: FieldGroup = {
                id: Date.now().toString(),
                name: newGroup.name,
                fields: newGroup.fields,
            };
            setFieldGroups((prev) => [...prev, group]);
            setNewGroup({ name: '', fields: [] });
            setShowGroupModal(false);
            setSelectedFields(new Set());
        }
    };

    const handleAddFieldToGroup = (groupId: string) => {
        if (newField.name && newField.type) {
            const field: CustomField = {
                id: Date.now().toString(),
                name: newField.name,
                type: newField.type,
                options: newField.type === 'dropdown' ? newField.options : undefined,
                required: newField.required || false,
                visibility: newField.visibility!,
            };

            setFieldGroups((prev) =>
                prev.map((group) =>
                    group.id === groupId ? { ...group, fields: [...group.fields, field] } : group
                )
            );

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
        }
    };

    const handleRemoveGroup = (groupId: string) => {
        setFieldGroups((prev) => prev.filter((group) => group.id !== groupId));
    };

    const handleRemoveFieldFromGroup = (groupId: string, fieldId: string) => {
        setFieldGroups((prev) =>
            prev.map((group) =>
                group.id === groupId
                    ? { ...group, fields: group.fields.filter((field) => field.id !== fieldId) }
                    : group
            )
        );
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
            {checked ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
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
                                        <Edit2 className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveOption(field.id, index)}
                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                    >
                                        <Trash2 className="size-3" />
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
                            <Plus className="size-3" />
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
                    <h1 className="text-2xl font-bold text-gray-900">Custom Fields Settings</h1>
                    <p className="mt-2 text-gray-600">
                        Configure how fields appear across different parts of the system
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateGroup}
                        disabled={selectedFields.size === 0}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FolderPlus className="size-4" />
                        Add Group
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                        <Plus className="size-4" />
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
                        <Settings className="size-5 text-blue-600" />
                        Institute Fields
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Select fields and groups using the checkboxes on the left to create groups.
                        All fields are part of institute fields. You can create nested groups by
                        selecting existing groups. Use the &quot;Add Group&quot; button to combine
                        selected items.
                    </p>
                </div>

                <div className="space-y-6 p-6">
                    {/* All Institute Fields */}
                    <div className="space-y-4">
                        {/* System Fields Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                                            Select
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                                            Field Name
                                        </th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                                            Required
                                        </th>
                                        {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                            <th
                                                key={key}
                                                className="px-2 py-3 text-center font-medium text-gray-700"
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <Icon className="size-4 text-gray-500" />
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
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.has(field.id)}
                                                    onChange={() => handleFieldSelection(field.id)}
                                                    className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <span className="font-medium text-gray-900">
                                                            {field.name}
                                                        </span>
                                                        {field.required && (
                                                            <span className="absolute -right-1 -top-3 mb-1 text-lg font-bold text-red-500">
                                                                *
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                                        System Field
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <label className="relative inline-flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={() =>
                                                            handleFixedFieldRequiredChange(field.id)
                                                        }
                                                        className="peer sr-only"
                                                    />
                                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                                </label>
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

                        {/* Editable Institute Fields */}
                        {instituteFields.map((field) => (
                            <div
                                key={field.id}
                                className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                            >
                                {/* Field Name and Delete Button Row */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedFields.has(field.id)}
                                            onChange={() => handleFieldSelection(field.id)}
                                            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="w-48">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) =>
                                                        handleInstituteFieldNameChange(
                                                            field.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Field name"
                                                />
                                                {field.required && (
                                                    <span className="pointer-events-none absolute -top-3 right-2 mt-2 text-lg font-bold text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </div>
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Required:
                                            </span>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={() =>
                                                        handleInstituteFieldRequiredChange(field.id)
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveInstituteField(field.id)}
                                        className="rounded bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                                        title="Delete field"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>

                                {/* Visibility Controls */}
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                            <VisibilityToggle
                                                key={key}
                                                checked={
                                                    field.visibility[key as keyof FieldVisibility]
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
                                        ))}
                                    </div>
                                </div>

                                {/* Dropdown Options Manager */}
                                {field.type === 'dropdown' && (
                                    <DropdownOptionsManager field={field} />
                                )}
                            </div>
                        ))}

                        {/* Custom Fields */}
                        {customFields.map((field) => (
                            <div
                                key={field.id}
                                className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                            >
                                {/* Field Name and Delete Button Row */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedFields.has(field.id)}
                                            onChange={() => handleFieldSelection(field.id)}
                                            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="w-48">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) =>
                                                        handleCustomFieldNameChange(
                                                            field.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Field name"
                                                />
                                                {field.required && (
                                                    <span className="pointer-events-none absolute -top-3 right-2 mt-2 text-lg font-bold text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </div>
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Required:
                                            </span>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={() =>
                                                        handleCustomFieldRequiredChange(field.id)
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCustomField(field.id)}
                                        className="rounded bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                                        title="Delete field"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>

                                {/* Visibility Controls */}
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                            <VisibilityToggle
                                                key={key}
                                                checked={
                                                    field.visibility[key as keyof FieldVisibility]
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
                                        ))}
                                    </div>
                                </div>

                                {/* Dropdown Options Manager */}
                                {field.type === 'dropdown' && (
                                    <DropdownOptionsManager field={field} />
                                )}
                            </div>
                        ))}

                        {/* Field Groups */}
                        {fieldGroups.map((group) => (
                            <div
                                key={group.id}
                                className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedFields.has(group.id)}
                                            onChange={() => handleFieldSelection(group.id)}
                                            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <h3 className="text-lg font-semibold text-blue-900">
                                            {group.name}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveGroup(group.id)}
                                        className="rounded bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                                        title="Delete group"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* All Fields and Groups */}
                                    {group.fields.map((field) => (
                                        <div
                                            key={field.id}
                                            className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <span className="font-medium text-gray-900">
                                                        {field.name}
                                                    </span>
                                                    {'required' in field && field.required && (
                                                        <span className="absolute -right-1 -top-3 text-lg font-bold text-red-500">
                                                            *
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                    {'isGroup' in field && field.isGroup
                                                        ? `Group (${field.originalGroup.fields.length} fields)`
                                                        : 'type' in field
                                                          ? field.type
                                                          : 'System Field'}
                                                </span>
                                                {'type' in field &&
                                                    field.type === 'dropdown' &&
                                                    field.options && (
                                                        <span className="text-sm text-gray-600">
                                                            {field.options.length} options
                                                        </span>
                                                    )}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleRemoveFieldFromGroup(group.id, field.id)
                                                }
                                                className="rounded bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500"
                                                title="Remove from group"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Field to Group */}
                                <div className="mt-4 border-t border-blue-200 pt-4">
                                    <h4 className="mb-3 text-sm font-medium text-blue-900">
                                        Add Field to Group
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={newField.name}
                                                onChange={(e) =>
                                                    setNewField((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-blue-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                placeholder="Field name"
                                            />
                                            {newField.required && (
                                                <span className="pointer-events-none absolute right-2 top-3 text-lg font-bold text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </div>
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
                                            className="w-48 rounded-lg border border-blue-300 px-3 py-2 focus:ring-blue-500"
                                        >
                                            <option value="text">Text Field</option>
                                            <option value="dropdown">Dropdown</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Required:
                                            </span>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={newField.required || false}
                                                    onChange={(e) =>
                                                        setNewField((prev) => ({
                                                            ...prev,
                                                            required: e.target.checked,
                                                        }))
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => handleAddFieldToGroup(group.id)}
                                            disabled={!newField.name}
                                            className="rounded-lg bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {instituteFields.length === 0 &&
                            customFields.length === 0 &&
                            fieldGroups.length === 0 && (
                                <div className="py-8 text-center text-gray-500">
                                    <Settings className="mx-auto mb-3 size-10 text-gray-300" />
                                    <p>No institute fields available.</p>
                                    <p className="text-sm">
                                        Click Add Custom Field to get started.
                                    </p>
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
                                    <X className="size-6" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Field Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Field Name *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newField.name}
                                        onChange={(e) =>
                                            setNewField((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter field name"
                                    />
                                    {newField.required && (
                                        <span className="pointer-events-none absolute right-2 top-3 text-lg font-bold text-red-500">
                                            *
                                        </span>
                                    )}
                                </div>
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

                            {/* Required Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Required Field
                                </label>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={newField.required}
                                        onChange={(e) =>
                                            setNewField((prev) => ({
                                                ...prev,
                                                required: e.target.checked,
                                            }))
                                        }
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                        {newField.required ? 'Required' : 'Optional'}
                                    </span>
                                </label>
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
                                                    <Trash2 className="size-3" />
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
                                            <Plus className="size-3" />
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
                                                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Icon className="size-4 text-gray-500" />
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

            {/* Add Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Create Field Group
                                </h3>
                                <button
                                    onClick={() => setShowGroupModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="size-6" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Group Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Group Name *
                                </label>
                                <input
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) =>
                                        setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter group name"
                                />
                            </div>

                            {/* Selected Items Preview */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Selected Items ({newGroup.fields?.length || 0})
                                </label>
                                <div className="space-y-2">
                                    {newGroup.fields?.map((field) => (
                                        <div
                                            key={field.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <span className="font-medium text-gray-900">
                                                        {field.name}
                                                    </span>
                                                    {'required' in field && field.required && (
                                                        <span className="absolute -right-1 -top-3 text-lg font-bold text-red-500">
                                                            *
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                    {'isGroup' in field && field.isGroup
                                                        ? `Group (${field.originalGroup.fields.length} fields)`
                                                        : 'type' in field
                                                          ? field.type
                                                          : 'System Field'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add Custom Field to Group */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Add Custom Field to Group
                                </label>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={newField.name}
                                                onChange={(e) =>
                                                    setNewField((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                placeholder="Field name"
                                            />
                                            {newField.required && (
                                                <span className="pointer-events-none absolute right-2 top-3 text-lg font-bold text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </div>
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
                                            className="w-48 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="text">Text Field</option>
                                            <option value="dropdown">Dropdown</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Required:
                                            </span>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={newField.required || false}
                                                    onChange={(e) =>
                                                        setNewField((prev) => ({
                                                            ...prev,
                                                            required: e.target.checked,
                                                        }))
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (newField.name && newField.type) {
                                                    const field: CustomField = {
                                                        id: Date.now().toString(),
                                                        name: newField.name,
                                                        type: newField.type,
                                                        options:
                                                            newField.type === 'dropdown'
                                                                ? newField.options
                                                                : undefined,
                                                        required: newField.required || false,
                                                        visibility: newField.visibility!,
                                                    };
                                                    setNewGroup((prev) => ({
                                                        ...prev,
                                                        fields: [...(prev.fields || []), field],
                                                    }));
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
                                                }
                                            }}
                                            disabled={!newField.name}
                                            className="rounded-lg bg-green-600 p-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>

                                    {/* Initial Options for Dropdown */}
                                    {newField.type === 'dropdown' && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Initial Options
                                            </label>
                                            <div className="space-y-2">
                                                {newField.options?.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) =>
                                                                setNewField((prev) => ({
                                                                    ...prev,
                                                                    options: prev.options?.map(
                                                                        (opt, i) =>
                                                                            i === index
                                                                                ? e.target.value
                                                                                : opt
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
                                                            <Trash2 className="size-3" />
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
                                                    <Plus className="size-3" />
                                                    Add Option
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                            <button
                                onClick={() => setShowGroupModal(false)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddGroup}
                                disabled={
                                    !newGroup.name ||
                                    !newGroup.fields ||
                                    newGroup.fields.length === 0
                                }
                                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomFieldsSettings;
