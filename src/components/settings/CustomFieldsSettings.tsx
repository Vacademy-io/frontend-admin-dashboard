import React, { useState, useEffect } from 'react';
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
    GripVertical,
    Loader2,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MyButton } from '../design-system/button';

// Import service functions and types
import {
    getCustomFieldSettings,
    saveCustomFieldSettings,
    createTempCustomField,
    createNewFieldGroup,
    isTempField,
    tempFieldToNewField,
    type CustomFieldSettingsData,
    type CustomField as ServiceCustomField,
    type FixedField as ServiceFixedField,
    type FieldGroup as ServiceFieldGroup,
    type GroupField as ServiceGroupField,
    type FieldVisibility as ServiceFieldVisibility,
    type NewCustomField,
} from '@/services/custom-field-settings';
import { getInstituteId } from '@/constants/helper';

// Use service types for the component
type FieldVisibility = ServiceFieldVisibility;
type CustomField = ServiceCustomField;
type FixedField = ServiceFixedField;
type FieldGroup = ServiceFieldGroup;
type GroupField = ServiceGroupField;

const visibilityLabels = [
    { key: 'learnersList', label: "Learner's List", icon: Users },
    { key: 'enrollRequestList', label: 'Enroll Request List', icon: ClipboardList },
    { key: 'inviteList', label: 'Invite List', icon: Users },
    { key: 'assessmentRegistration', label: 'Assessment Registration', icon: FileText },
    { key: 'liveSessionRegistration', label: 'Live Session Registration', icon: Calendar },
    { key: 'learnerProfile', label: 'Learner Profile', icon: User },
];

// Sortable Item Components
interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, disabled = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'shadow-lg' : ''}`}>
            <div className="flex items-center gap-2">
                {!disabled && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex cursor-grab items-center justify-center p-1 text-gray-400 transition-colors hover:text-gray-600 active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                        title="Drag to reorder"
                    >
                        <GripVertical className="size-4" />
                    </Button>
                )}
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
};

// Sortable Table Row Component for system fields
interface SortableTableRowProps {
    id: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const SortableTableRow: React.FC<SortableTableRowProps> = ({ id, children, disabled = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`border-b border-gray-100 hover:bg-gray-50 ${isDragging ? 'bg-white shadow-lg' : ''}`}
            {...attributes}
        >
            <td className="p-4 text-center">
                <div
                    className={`flex items-center justify-center p-1 transition-colors ${
                        disabled
                            ? 'cursor-not-allowed text-gray-300'
                            : 'cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing'
                    }`}
                    {...(!disabled ? listeners : {})}
                    title={disabled ? 'This field cannot be reordered' : 'Drag to reorder'}
                >
                    <GripVertical className="size-4" />
                </div>
            </td>
            {children}
        </tr>
    );
};

const CustomFieldsSettings: React.FC = () => {
    // State for settings data
    const [fixedFields, setFixedFields] = useState<FixedField[]>([]);
    const [instituteFields, setInstituteFields] = useState<CustomField[]>([]);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // UI states
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

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // CRITICAL FIX: Clear cache to ensure we get fresh UUID data from backend
            console.log('🔍 [DEBUG] Clearing cache to force fresh API call...');
            localStorage.removeItem('custom-field-settings-cache');

            // Debug localStorage and institute ID
            const instituteId = getInstituteId();
            console.log('🔍 [DEBUG] Institute ID check:', {
                instituteId,
                localStorageKeys: Object.keys(localStorage),
                selectedInstituteId: localStorage.getItem('selectedInstituteId'),
            });

            // IMPORTANT: Always force refresh to get latest UUIDs from backend
            const settings = await getCustomFieldSettings(true); // Force API call

            console.log('🔍 [DEBUG] Loaded settings - Field IDs check:', {
                fixedFields: settings.fixedFields.map((f) => ({ id: f.id, name: f.name })),
                customFields: settings.customFields.map((f) => ({ id: f.id, name: f.name })),
                instituteFields: settings.instituteFields.map((f) => ({ id: f.id, name: f.name })),
                totalFields:
                    settings.fixedFields.length +
                    settings.customFields.length +
                    settings.instituteFields.length,
            });

            // Check if settings were cached after the API call
            const cachedAfterLoad = localStorage.getItem('custom-field-settings-cache');
            console.log('🔍 [DEBUG] Cache status after load:', {
                hasCachedData: !!cachedAfterLoad,
                cacheLength: cachedAfterLoad ? cachedAfterLoad.length : 0,
            });

            setFixedFields(settings.fixedFields);
            setInstituteFields(settings.instituteFields);
            setCustomFields(settings.customFields);
            setFieldGroups(settings.fieldGroups);
        } catch (err) {
            console.error('❌ [DEBUG] Error loading custom field settings:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to load settings. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Drag and Drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Drag End Handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        // Determine which list contains the dragged item
        const activeId = active.id as string;
        const overId = over.id as string;

        // Handle fixed/system fields reordering
        const fixedFieldIds = fixedFields.map((field) => field.id);
        if (fixedFieldIds.includes(activeId)) {
            const oldIndex = fixedFields.findIndex((field) => field.id === activeId);
            const newIndex = fixedFields.findIndex((field) => field.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                setFixedFields(arrayMove(fixedFields, oldIndex, newIndex));
            }
            return;
        }

        // Handle institute fields reordering
        const instituteFieldIds = instituteFields.map((field) => field.id);
        if (instituteFieldIds.includes(activeId)) {
            const oldIndex = instituteFields.findIndex((field) => field.id === activeId);
            const newIndex = instituteFields.findIndex((field) => field.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                setInstituteFields(arrayMove(instituteFields, oldIndex, newIndex));
            }
            return;
        }

        // Handle custom fields reordering
        const customFieldIds = customFields.map((field) => field.id);
        if (customFieldIds.includes(activeId)) {
            const oldIndex = customFields.findIndex((field) => field.id === activeId);
            const newIndex = customFields.findIndex((field) => field.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                setCustomFields(arrayMove(customFields, oldIndex, newIndex));
            }
            return;
        }

        // Handle field groups reordering
        const groupIds = fieldGroups.map((group) => group.id);
        if (groupIds.includes(activeId)) {
            const oldIndex = fieldGroups.findIndex((group) => group.id === activeId);
            const newIndex = fieldGroups.findIndex((group) => group.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                setFieldGroups(arrayMove(fieldGroups, oldIndex, newIndex));
            }
            return;
        }

        // Handle fields within a group reordering
        for (const group of fieldGroups) {
            const groupFieldIds = group.fields.map((field) => field.id);
            if (groupFieldIds.includes(activeId)) {
                const oldIndex = group.fields.findIndex((field) => field.id === activeId);
                const newIndex = group.fields.findIndex((field) => field.id === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    setFieldGroups((prev) =>
                        prev.map((g) =>
                            g.id === group.id
                                ? { ...g, fields: arrayMove(g.fields, oldIndex, newIndex) }
                                : g
                        )
                    );
                }
                return;
            }
        }
    };

    // Create a combined list of all items for the main container
    const getAllItemIds = () => {
        const allItems = [];

        // Add fixed/system fields
        allItems.push(...fixedFields.map((field) => field.id));

        // Add institute fields
        allItems.push(...instituteFields.map((field) => field.id));

        // Add custom fields
        allItems.push(...customFields.map((field) => field.id));

        // Add field groups
        allItems.push(...fieldGroups.map((group) => group.id));

        return allItems;
    };
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
            const field = createTempCustomField(
                newField.name,
                newField.type,
                newField.type === 'dropdown' ? newField.options : undefined
            );

            // Set visibility and required status
            field.visibility = newField.visibility!;
            field.required = newField.required || false;

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

    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSaveMessage(null);

            // Separate temporary fields from existing fields
            const existingCustomFields = customFields.filter((field) => !isTempField(field));
            const tempCustomFields = customFields.filter((field) => isTempField(field));

            // Convert temporary fields to new fields (these will get IDs from backend)
            const newCustomFields: NewCustomField[] = tempCustomFields.map(tempFieldToNewField);

            // For now, we'll still include temp fields in the save
            // In a real implementation, you'd handle new vs existing fields differently
            // The backend would need to distinguish between updates and creates

            // Create the settings data object
            const settingsData: CustomFieldSettingsData = {
                fixedFields,
                instituteFields,
                customFields: existingCustomFields, // Only send existing fields
                fieldGroups,
                lastUpdated: new Date().toISOString(),
                version: 1,
            };

            console.log('🔍 [DEBUG] About to save - Field IDs check:', {
                fixedFields: settingsData.fixedFields.map((f) => ({ id: f.id, name: f.name })),
                customFields: settingsData.customFields.map((f) => ({ id: f.id, name: f.name })),
                instituteFields: settingsData.instituteFields.map((f) => ({
                    id: f.id,
                    name: f.name,
                })),
            });

            // TODO: Handle newCustomFields separately or enhance the API
            // to accept both existing and new fields
            console.log('New fields to be created:', newCustomFields);

            const result = await saveCustomFieldSettings(settingsData);

            if (result.success) {
                setSaveMessage('Settings saved successfully!');
                // Clear the message after 3 seconds
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error saving custom field settings:', err);
            setError('Failed to save settings. Please try again.');
            // Clear the error after 5 seconds
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsSaving(false);
        }
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

        // For now, just create an empty group since the type handling is complex
        // In a real implementation, you would convert selected fields to group fields
        setNewGroup({
            name: '',
            fields: [],
        });
        setShowGroupModal(true);
    };

    const handleAddGroup = () => {
        if (newGroup.name && newGroup.fields && newGroup.fields.length > 0) {
            const group = createNewFieldGroup(newGroup.name);
            // Note: The service createNewFieldGroup creates an empty group template
            // We would need to add the selected fields to the group separately
            // For now, we'll create a basic group structure with a temporary ID
            const groupWithId = {
                ...group,
                id: `temp_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            setFieldGroups((prev) => [...prev, groupWithId]);
            setNewGroup({ name: '', fields: [] });
            setShowGroupModal(false);
            setSelectedFields(new Set());
        }
    };

    const handleAddFieldToGroup = (groupId: string) => {
        if (newField.name && newField.type) {
            const field = createTempCustomField(
                newField.name,
                newField.type,
                newField.type === 'dropdown' ? newField.options : undefined
            );

            // Set visibility and required status
            field.visibility = newField.visibility!;
            field.required = newField.required || false;

            // Convert to GroupField by adding groupInternalOrder
            const groupField: GroupField = {
                ...field,
                groupInternalOrder: 0, // Will be updated based on current group length
            };

            setFieldGroups((prev) =>
                prev.map((group) =>
                    group.id === groupId
                        ? {
                              ...group,
                              fields: [
                                  ...group.fields,
                                  {
                                      ...groupField,
                                      groupInternalOrder: group.fields.length,
                                  },
                              ],
                          }
                        : group
                )
            );

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
    }> = ({ checked, onChange, label }) => (
        <Button
            variant={checked ? 'secondary' : 'outline'}
            size="sm"
            onClick={onChange}
            className={`flex items-center gap-2 ${
                checked
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={label}
        >
            {checked ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            <span className="hidden lg:inline">{label}</span>
        </Button>
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
            <div className="mt-4 rounded-lg  bg-primary-50/50 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary-500"></div>
                    <h4 className="text-sm font-semibold">Options</h4>
                    <Badge
                        variant="secondary"
                        className="bg-primary-500 text-xs text-white hover:text-black"
                    >
                        {field.options?.length || 0}
                    </Badge>
                </div>
                <div className="space-y-3">
                    {field.options?.map((option, index) => (
                        <div
                            key={index}
                            className="group flex items-center gap-3 rounded-md bg-white/70 p-2 shadow-sm transition-all duration-200"
                        >
                            {editingOptionIndex === index ? (
                                <>
                                    <div className="flex size-6 items-center justify-center rounded-full bg-primary-100">
                                        <div className="size-2 animate-pulse rounded-full bg-primary-500"></div>
                                    </div>
                                    <Input
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        className="flex-1 border-primary-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={saveEdit}
                                            size="sm"
                                            variant="default"
                                            className="h-8 bg-primary-300 px-3 text-xs text-white shadow-sm transition-all duration-200 hover:bg-primary-500 hover:shadow-md"
                                        >
                                            <Save className="mr-1 size-3" />
                                            Save
                                        </Button>
                                        <Button
                                            onClick={cancelEdit}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 border-gray-300 px-3 text-xs text-gray-600 transition-all duration-200 hover:bg-gray-50"
                                        >
                                            <X className="mr-1 size-3" />
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex size-6 items-center justify-center rounded-full bg-primary-400 text-xs font-medium text-white">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 rounded-md border border-primary-500 px-3 py-2 text-sm font-medium text-emerald-800 shadow-inner">
                                        {option}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
                                        <Button
                                            onClick={() => startEditing(index, option)}
                                            size="sm"
                                            variant="ghost"
                                            className="size-8 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                            title="Edit option"
                                        >
                                            <Edit2 className="size-3.5" />
                                        </Button>
                                        <Button
                                            onClick={() => handleRemoveOption(field.id, index)}
                                            size="sm"
                                            variant="ghost"
                                            className="size-8 p-0 text-red-500 hover:bg-red-100 hover:text-red-600"
                                            title="Delete option"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Add New Option */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary-400">
                            <Plus className="size-3 text-white" />
                        </div>
                        <Input
                            type="text"
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            placeholder="Type new option and press Enter..."
                            className="flex-1 border-primary-200 bg-white/80 text-sm shadow-sm focus:border-primary-400 focus:bg-white focus:ring-primary-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddOptionForField();
                            }}
                        />
                        <Button
                            onClick={handleAddOptionForField}
                            disabled={!newOptionValue.trim()}
                            size="sm"
                            variant="default"
                            className="h-8  bg-primary-400 px-4 text-xs text-white shadow-sm transition-all duration-200 hover:bg-primary-500 hover:shadow-md disabled:bg-gray-300 disabled:opacity-50"
                        >
                            <Plus className="mr-1 size-3" />
                            Add
                        </Button>
                    </div>

                    {/* Empty state when no options */}
                    {(!field.options || field.options.length === 0) && (
                        <div className="py-6 text-center">
                            <div className="mx-auto mb-2 size-12 rounded-full bg-primary-100 p-3">
                                <Plus className="size-full text-white" />
                            </div>
                            <p className="text-sm font-medium text-primary-500">No options yet</p>
                            <p className="text-xs text-primary-500">
                                Add your first dropdown option above
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Custom Fields Settings</h1>
                        <p className="mt-2 text-gray-600">
                            Configure how fields appear across different parts of the system.
                        </p>
                        {/* Debug Info */}
                        <div className="mt-2 text-xs text-gray-500">
                            Institute ID: {getInstituteId() || 'Not found'} | Cache:{' '}
                            {localStorage.getItem('custom-field-settings-cache')
                                ? 'Present'
                                : 'Missing'}{' '}
                            | Fields:{' '}
                            {fixedFields.length + customFields.length + instituteFields.length}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MyButton
                            onClick={() => {
                                console.log('🔍 [DEBUG] localStorage inspection:', {
                                    keys: Object.keys(localStorage),
                                    cache: localStorage.getItem('custom-field-settings-cache'),
                                    instituteId: getInstituteId(),
                                    selectedInstituteId:
                                        localStorage.getItem('selectedInstituteId'),
                                });
                            }}
                            buttonType="secondary"
                            className="bg-purple-500 text-white hover:bg-purple-600"
                        >
                            🔍 Debug Storage
                        </MyButton>
                        <MyButton
                            onClick={() => {
                                localStorage.removeItem('custom-field-settings-cache');
                                loadSettings();
                            }}
                            buttonType="secondary"
                            className="bg-orange-500 text-white hover:bg-orange-600"
                        >
                            🔄 Force Refresh
                        </MyButton>
                        <MyButton
                            onClick={handleCreateGroup}
                            disabled={selectedFields.size === 0}
                            buttonType="secondary"
                        >
                            <FolderPlus className="size-4" />
                            Add Group
                        </MyButton>
                        <MyButton onClick={() => setShowAddModal(true)} buttonType="secondary">
                            <Plus className="size-4" />
                            Add Custom Field
                        </MyButton>
                        <MyButton
                            onClick={handleSaveChanges}
                            className="flex items-center gap-2"
                            disable={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {isSaving ? 'Saving...' : 'Save'}
                        </MyButton>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {saveMessage && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                        <CheckCircle className="size-4" />
                        {saveMessage}
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                        <AlertCircle className="size-4" />
                        {error}
                    </div>
                )}

                {/* Loading State - Commented out for now */}
                {/* {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Loader2 className="size-6 animate-spin" />
                            <span>Loading custom field settings...</span>
                        </div>
                    </div>
                )} */}

                {/* Institute Fields Section - Only show when not loading */}
                {!isLoading && (
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Settings className="size-5 text-blue-600" />
                                Institute Fields
                            </CardTitle>
                            <p className="mt-2 text-sm text-gray-600">
                                Select fields and groups using the checkboxes on the left to create
                                groups. All fields are part of institute fields. You can create
                                nested groups by selecting existing groups. Use the &quot;Add
                                Group&quot; button to combine selected items.
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <SortableContext
                                items={getAllItemIds()}
                                strategy={verticalListSortingStrategy}
                            >
                                {/* All Institute Fields */}
                                <div className="space-y-4">
                                    {/* System Fields Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-4 py-3 text-center font-medium text-gray-700"></th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                                                        Select
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                                                        Field Name
                                                    </th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                                                        Required
                                                    </th>
                                                    {visibilityLabels.map(
                                                        ({ key, label, icon: Icon }) => (
                                                            <th
                                                                key={key}
                                                                className="px-2 py-3 text-center font-medium text-gray-700"
                                                            >
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Icon className="size-4 text-gray-500" />
                                                                    <span className="text-xs">
                                                                        {label}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fixedFields.map((field) => (
                                                    <SortableTableRow
                                                        key={field.id}
                                                        id={field.id}
                                                        disabled={false}
                                                    >
                                                        <td className="p-4 text-center">
                                                            <Checkbox
                                                                checked={selectedFields.has(
                                                                    field.id
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handleFieldSelection(field.id)
                                                                }
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
                                                            <Switch
                                                                checked={field.required}
                                                                onCheckedChange={() =>
                                                                    handleFixedFieldRequiredChange(
                                                                        field.id
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        {visibilityLabels.map(({ key, label }) => (
                                                            <td
                                                                key={key}
                                                                className="px-2 py-4 text-center"
                                                            >
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
                                                                />
                                                            </td>
                                                        ))}
                                                    </SortableTableRow>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Editable Institute Fields */}
                                    {instituteFields.map((field) => (
                                        <SortableItem key={field.id} id={field.id}>
                                            <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                                                {/* Field Name and Delete Button Row */}
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={selectedFields.has(field.id)}
                                                            onCheckedChange={() =>
                                                                handleFieldSelection(field.id)
                                                            }
                                                        />
                                                        <div className="w-48">
                                                            <div className="relative">
                                                                <Input
                                                                    type="text"
                                                                    value={field.name}
                                                                    onChange={(e) =>
                                                                        handleInstituteFieldNameChange(
                                                                            field.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-full pr-8"
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
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(value) =>
                                                                    handleInstituteFieldTypeChange(
                                                                        field.id,
                                                                        value as 'text' | 'dropdown'
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="text">
                                                                        Text Field
                                                                    </SelectItem>
                                                                    <SelectItem value="dropdown">
                                                                        Dropdown
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Required:
                                                            </span>
                                                            <Switch
                                                                checked={field.required}
                                                                onCheckedChange={() =>
                                                                    handleInstituteFieldRequiredChange(
                                                                        field.id
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            handleRemoveInstituteField(field.id)
                                                        }
                                                        variant="destructive"
                                                        size="sm"
                                                        className="bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                                                        title="Delete field"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>

                                                {/* Visibility Controls */}
                                                <div className="mb-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {visibilityLabels.map(({ key, label }) => (
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
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Dropdown Options Manager */}
                                                {field.type === 'dropdown' && (
                                                    <DropdownOptionsManager field={field} />
                                                )}
                                            </div>
                                        </SortableItem>
                                    ))}

                                    {/* Custom Fields */}
                                    {customFields.map((field) => (
                                        <SortableItem key={field.id} id={field.id}>
                                            <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                                                {/* Field Name and Delete Button Row */}
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={selectedFields.has(field.id)}
                                                            onCheckedChange={() =>
                                                                handleFieldSelection(field.id)
                                                            }
                                                        />
                                                        <div className="w-48">
                                                            <div className="relative">
                                                                <Input
                                                                    type="text"
                                                                    value={field.name}
                                                                    onChange={(e) =>
                                                                        handleCustomFieldNameChange(
                                                                            field.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-full pr-8"
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
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(value) =>
                                                                    handleCustomFieldTypeChange(
                                                                        field.id,
                                                                        value as 'text' | 'dropdown'
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="text">
                                                                        Text Field
                                                                    </SelectItem>
                                                                    <SelectItem value="dropdown">
                                                                        Dropdown
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Required:
                                                            </span>
                                                            <Switch
                                                                checked={field.required}
                                                                onCheckedChange={() =>
                                                                    handleCustomFieldRequiredChange(
                                                                        field.id
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            handleRemoveCustomField(field.id)
                                                        }
                                                        variant="destructive"
                                                        size="sm"
                                                        className="bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                                                        title="Delete field"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>

                                                {/* Visibility Controls */}
                                                <div className="mb-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {visibilityLabels.map(({ key, label }) => (
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
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Dropdown Options Manager */}
                                                {field.type === 'dropdown' && (
                                                    <DropdownOptionsManager field={field} />
                                                )}
                                            </div>
                                        </SortableItem>
                                    ))}

                                    {/* Field Groups */}
                                    {fieldGroups.map((group) => (
                                        <SortableItem key={group.id} id={group.id}>
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={selectedFields.has(group.id)}
                                                            onCheckedChange={() =>
                                                                handleFieldSelection(group.id)
                                                            }
                                                        />
                                                        <h3 className="text-lg font-semibold text-blue-900">
                                                            {group.name}
                                                        </h3>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleRemoveGroup(group.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                        className="bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                                                        title="Delete group"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>

                                                <SortableContext
                                                    items={group.fields.map((field) => field.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-3">
                                                        {/* All Fields and Groups */}
                                                        {group.fields.map((field) => (
                                                            <SortableItem
                                                                key={field.id}
                                                                id={field.id}
                                                            >
                                                                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="relative">
                                                                            <span className="font-medium text-gray-900">
                                                                                {field.name}
                                                                            </span>
                                                                            {'required' in field &&
                                                                                field.required && (
                                                                                    <span className="absolute -right-1 -top-3 text-lg font-bold text-red-500">
                                                                                        *
                                                                                    </span>
                                                                                )}
                                                                        </div>
                                                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                                            {'isGroup' in field &&
                                                                            field.isGroup
                                                                                ? `Group (${field.originalGroup.fields.length} fields)`
                                                                                : 'type' in field
                                                                                  ? field.type
                                                                                  : 'System Field'}
                                                                        </span>
                                                                        {'type' in field &&
                                                                            field.type ===
                                                                                'dropdown' &&
                                                                            field.options && (
                                                                                <span className="text-sm text-gray-600">
                                                                                    {
                                                                                        field
                                                                                            .options
                                                                                            .length
                                                                                    }{' '}
                                                                                    options
                                                                                </span>
                                                                            )}
                                                                    </div>
                                                                    <Button
                                                                        onClick={() =>
                                                                            handleRemoveFieldFromGroup(
                                                                                group.id,
                                                                                field.id
                                                                            )
                                                                        }
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500"
                                                                        title="Remove from group"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </Button>
                                                                </div>
                                                            </SortableItem>
                                                        ))}
                                                    </div>
                                                </SortableContext>

                                                {/* Add Field to Group */}
                                                <div className="mt-4 border-t border-blue-200 pt-4">
                                                    <h4 className="mb-3 text-sm font-medium text-blue-900">
                                                        Add Field to Group
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                type="text"
                                                                value={newField.name}
                                                                onChange={(e) =>
                                                                    setNewField((prev) => ({
                                                                        ...prev,
                                                                        name: e.target.value,
                                                                    }))
                                                                }
                                                                className="w-full pr-8"
                                                                placeholder="Field name"
                                                            />
                                                            {newField.required && (
                                                                <span className="pointer-events-none absolute right-2 top-3 text-lg font-bold text-red-500">
                                                                    *
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Select
                                                            value={newField.type}
                                                            onValueChange={(value) =>
                                                                setNewField((prev) => ({
                                                                    ...prev,
                                                                    type: value as
                                                                        | 'text'
                                                                        | 'dropdown',
                                                                    options:
                                                                        value === 'dropdown'
                                                                            ? ['Option 1']
                                                                            : undefined,
                                                                }))
                                                            }
                                                        >
                                                            <SelectTrigger className="w-48">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="text">
                                                                    Text Field
                                                                </SelectItem>
                                                                <SelectItem value="dropdown">
                                                                    Dropdown
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Required:
                                                            </span>
                                                            <Switch
                                                                checked={newField.required || false}
                                                                onCheckedChange={(checked) =>
                                                                    setNewField((prev) => ({
                                                                        ...prev,
                                                                        required: checked,
                                                                    }))
                                                                }
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={() =>
                                                                handleAddFieldToGroup(group.id)
                                                            }
                                                            disabled={!newField.name}
                                                            size="sm"
                                                            className="bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Plus className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </SortableItem>
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
                            </SortableContext>
                        </CardContent>
                    </Card>
                )}

                {/* Create Field Group Dialog */}
                <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
                    <DialogContent className="max-h-[90vh] min-w-fit overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Create Field Group
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Group Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="groupName"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="groupName"
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) =>
                                        setNewGroup((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter name"
                                    className="w-full"
                                />
                            </div>

                            {/* Selected Items Preview */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Selected Items ({newGroup.fields?.length || 0})
                                </Label>
                                <div className="space-y-2">
                                    {newGroup.fields?.map((field) => (
                                        <Card key={field.id} className="bg-gray-50 p-3">
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
                                                <Badge variant="secondary" className="text-xs">
                                                    {'isGroup' in field && field.isGroup
                                                        ? `Group (${field.originalGroup.fields.length} fields)`
                                                        : 'type' in field
                                                          ? field.type
                                                          : 'System Field'}
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Add Custom Field to Group */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">
                                    Add Custom Field to Group only
                                </Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Input
                                            type="text"
                                            value={newField.name}
                                            onChange={(e) =>
                                                setNewField((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder="Field name"
                                            className="pr-8"
                                        />
                                        {newField.required && (
                                            <span className="pointer-events-none absolute right-2 top-3 text-lg font-bold text-red-500">
                                                *
                                            </span>
                                        )}
                                    </div>
                                    <Select
                                        value={newField.type}
                                        onValueChange={(value) =>
                                            setNewField((prev) => ({
                                                ...prev,
                                                type: value as 'text' | 'dropdown',
                                                options:
                                                    value === 'dropdown' ? ['Option 1'] : undefined,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text Field</SelectItem>
                                            <SelectItem value="dropdown">Dropdown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Required:
                                        </Label>
                                        <Switch
                                            checked={newField.required || false}
                                            onCheckedChange={(checked) =>
                                                setNewField((prev) => ({
                                                    ...prev,
                                                    required: checked,
                                                }))
                                            }
                                        />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            if (newField.name && newField.type) {
                                                const field = createTempCustomField(
                                                    newField.name,
                                                    newField.type,
                                                    newField.type === 'dropdown'
                                                        ? newField.options
                                                        : undefined
                                                );

                                                // Set visibility and required status
                                                field.visibility = newField.visibility!;
                                                field.required = newField.required || false;

                                                // Convert to GroupField format
                                                const groupField: GroupField = {
                                                    ...field,
                                                    groupInternalOrder: 0, // Will be updated
                                                };

                                                setNewGroup((prev) => ({
                                                    ...prev,
                                                    fields: [...(prev.fields || []), groupField],
                                                }));
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
                                            }
                                        }}
                                        disabled={!newField.name}
                                        size="sm"
                                        className="bg-primary-500 text-white"
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>{' '}
                                {/* Initial Options for Dropdown */}
                                {newField.type === 'dropdown' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Initial Options
                                        </Label>
                                        <div className="space-y-2">
                                            {newField.options?.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Input
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
                                                        placeholder={`Option ${index + 1}`}
                                                        className="flex-1 text-sm"
                                                    />
                                                    <Button
                                                        onClick={() =>
                                                            setNewField((prev) => ({
                                                                ...prev,
                                                                options: prev.options?.filter(
                                                                    (_, i) => i !== index
                                                                ),
                                                            }))
                                                        }
                                                        variant="destructive"
                                                        size="sm"
                                                        className="px-2 py-1"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                onClick={() =>
                                                    setNewField((prev) => ({
                                                        ...prev,
                                                        options: [
                                                            ...(prev.options || []),
                                                            `Option ${(prev.options?.length || 0) + 1}`,
                                                        ],
                                                    }))
                                                }
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Plus className="size-3" />
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button onClick={() => setShowGroupModal(false)} variant="outline">
                                Cancel
                            </Button>
                            <MyButton
                                onClick={handleAddGroup}
                                disable={!newGroup.name || !newGroup.fields?.length}
                            >
                                Create Group
                            </MyButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add Custom Field Dialog */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-h-[90vh] min-w-fit overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Add Custom Field
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Field Name */}
                            <div className="relative space-y-2">
                                <Label
                                    htmlFor="fieldName"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Field Name *
                                </Label>

                                <Input
                                    id="fieldName"
                                    type="text"
                                    value={newField.name}
                                    onChange={(e) =>
                                        setNewField((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="w-full pr-8"
                                    placeholder="Enter field name"
                                />

                                {newField.required && (
                                    <span className="pointer-events-none absolute right-2 top-0 text-lg font-bold text-red-500">
                                        *
                                    </span>
                                )}
                            </div>

                            {/* Field Type */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="fieldType"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Field Type *
                                </Label>
                                <Select
                                    value={newField.type}
                                    onValueChange={(value) =>
                                        setNewField((prev) => ({
                                            ...prev,
                                            type: value as 'text' | 'dropdown',
                                            options:
                                                value === 'dropdown' ? ['Option 1'] : undefined,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text Field</SelectItem>
                                        <SelectItem value="dropdown">
                                            Dropdown with options
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Required Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Required Field
                                </Label>
                                <div className="flex items-center space-x-3">
                                    <Switch
                                        checked={newField.required}
                                        onCheckedChange={(checked) =>
                                            setNewField((prev) => ({
                                                ...prev,
                                                required: checked,
                                            }))
                                        }
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        {newField.required ? 'Required' : 'Optional'}
                                    </span>
                                </div>
                            </div>

                            {/* Initial Options for Dropdown */}
                            {newField.type === 'dropdown' && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Initial Options
                                    </Label>
                                    <div className="space-y-2">
                                        {newField.options?.map((option, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
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
                                                    className="flex-1"
                                                    placeholder={`Option ${index + 1}`}
                                                />
                                                <Button
                                                    onClick={() =>
                                                        setNewField((prev) => ({
                                                            ...prev,
                                                            options: prev.options?.filter(
                                                                (_, i) => i !== index
                                                            ),
                                                        }))
                                                    }
                                                    variant="destructive"
                                                    size="sm"
                                                    className="px-2 py-1"
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            onClick={() =>
                                                setNewField((prev) => ({
                                                    ...prev,
                                                    options: [
                                                        ...(prev.options || []),
                                                        `Option ${(prev.options?.length || 0) + 1}`,
                                                    ],
                                                }))
                                            }
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="size-3" />
                                            Add Option
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Visibility Settings */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    Where should this field appear?
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {visibilityLabels.map(({ key, label, icon: Icon }) => (
                                        <Card
                                            key={key}
                                            className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                                            onClick={() =>
                                                setNewField((prev) => ({
                                                    ...prev,
                                                    visibility: {
                                                        ...prev.visibility!,
                                                        [key]: !prev.visibility?.[
                                                            key as keyof FieldVisibility
                                                        ],
                                                    },
                                                }))
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={
                                                        newField.visibility?.[
                                                            key as keyof FieldVisibility
                                                        ] || false
                                                    }
                                                    onCheckedChange={(checked) =>
                                                        setNewField((prev) => ({
                                                            ...prev,
                                                            visibility: {
                                                                ...prev.visibility!,
                                                                [key]: checked,
                                                            },
                                                        }))
                                                    }
                                                />
                                                <Icon className="size-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {label}
                                                </span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button onClick={() => setShowAddModal(false)} variant="outline">
                                Cancel
                            </Button>
                            <MyButton onClick={handleAddCustomField} disable={!newField.name}>
                                Add Field
                            </MyButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DndContext>
    );
};

export default CustomFieldsSettings;
