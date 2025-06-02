import { MyButton } from '@/components/design-system/button';
import { Switch } from '@/components/ui/switch';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { DotsSixVertical, Plus, TrashSimple } from 'phosphor-react';
import { AddCustomFieldDialog, DropdownOption } from './AddCustomFieldDialog';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { InviteForm } from '../../-schema/InviteFormSchema';
import { useEffect } from 'react';

interface CustomFieldsSectionProps {
    toggleIsRequired: (id: number) => void;
    handleAddOpenFieldValues: (
        type: string,
        name: string,
        oldKey: boolean,
        options?: DropdownOption[]
    ) => void;
    handleDeleteOpenField: (id: number) => void;
}

export const CustomFieldsSection = ({
    toggleIsRequired,
    handleAddOpenFieldValues,
    handleDeleteOpenField,
}: CustomFieldsSectionProps) => {
    const { watch, control, setValue } = useFormContext<InviteForm>();
    const customFields = watch('custom_fields');

    const { move } = useFieldArray({
        control,
        name: 'custom_fields',
    });

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        move(activeIndex, overIndex);

        // Update the field order after moving without triggering form submission
        const updatedFields = watch('custom_fields');
        setValue('custom_fields', updatedFields, {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false
        });
    };

    const handleAddCustomField = (
        type: string,
        name: string,
        oldKey: boolean,
        options?: DropdownOption[]
    ) => {
        handleAddOpenFieldValues(type, name, oldKey, options);
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-title font-semibold">Invite input field</p>
            <Sortable value={customFields || []} onMove={handleMove} fast={false}>
                <div className="flex flex-col gap-4">
                    {customFields?.map((field, index) => (
                        <SortableItem key={field.id || index} value={field.id || index} asChild>
                            <div className="flex items-center gap-4">
                                <div className="flex w-3/4 items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2">
                                    <h1 className="text-sm">
                                        {field.name}
                                        {field.oldKey && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                        {!field.oldKey && field.isRequired && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                    </h1>
                                    <div className="flex items-center gap-6">
                                        {!field.oldKey && (
                                            <MyButton
                                                type="button"
                                                scale="small"
                                                buttonType="secondary"
                                                className="min-w-6 !rounded-sm !p-0"
                                                onClick={() => handleDeleteOpenField(field.id)}
                                            >
                                                <TrashSimple className="!size-4 text-danger-500" />
                                            </MyButton>
                                        )}
                                        <div className="drag-handle-container">
                                            <SortableDragHandle
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-grab hover:bg-neutral-100 active:cursor-grabbing !p-0"
                                            >
                                                <DotsSixVertical size={20} className="shrink-0" />
                                            </SortableDragHandle>
                                        </div>
                                    </div>
                                </div>
                                {!field.oldKey && (
                                    <>
                                        <h1 className="text-sm">Required</h1>
                                        <Switch
                                            checked={field.isRequired}
                                            onCheckedChange={() => toggleIsRequired(field.id)}
                                        />
                                    </>
                                )}
                            </div>
                        </SortableItem>
                    ))}
                </div>
            </Sortable>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                {!customFields?.some((field) => field.name === 'Gender') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'Gender', false)}
                    >
                        <Plus size={32} /> Add Gender
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'State') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'State', false)}
                    >
                        <Plus size={32} /> Add State
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'City') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'City', false)}
                    >
                        <Plus size={32} /> Add City
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'School/College') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() =>
                            handleAddOpenFieldValues('textfield', 'School/College', false)
                        }
                    >
                        <Plus size={32} /> Add School/College
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'Address') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'Address', false)}
                    >
                        <Plus size={32} /> Add Address
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'Pincode') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'Pincode', false)}
                    >
                        <Plus size={32} /> Pincode
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'Father Name') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'Father Name', false)}
                    >
                        <Plus size={32} /> Father Name
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'Mother Name') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'Mother Name', false)}
                    >
                        <Plus size={32} /> Mother Name
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'Parent Phone Number') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() =>
                            handleAddOpenFieldValues('textfield', 'Parent Phone Number', false)
                        }
                    >
                        <Plus size={32} /> Parent Phone Number
                    </MyButton>
                )}
                {!customFields?.some((field) => field.name === 'Parent Email') && (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        onClick={() => handleAddOpenFieldValues('textfield', 'Parent Email', false)}
                    >
                        <Plus size={32} /> Parent Email
                    </MyButton>
                )}

                <AddCustomFieldDialog
                    trigger={
                        <MyButton type="button" scale="medium" buttonType="secondary">
                            <Plus size={32} /> Add Custom Field
                        </MyButton>
                    }
                    onAddField={handleAddCustomField}
                />
            </div>
        </div>
    );
};
