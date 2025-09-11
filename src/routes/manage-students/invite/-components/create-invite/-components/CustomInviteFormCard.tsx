import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { MyButton } from '@/components/design-system/button';
import { DotsSixVertical, PencilSimple, Plus, TrashSimple } from 'phosphor-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyInput } from '@/components/design-system/input';
import SelectField from '@/components/design-system/select-field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface CustomInviteFormCardProps {
    form: UseFormReturn<InviteLinkFormValues>;
    updateFieldOrders: () => void;
    handleDeleteOpenField: (id: number) => void;
    toggleIsRequired: (id: number) => void;
    handleAddGender: (type: string, name: string, oldKey: boolean) => void;
    handleAddOpenFieldValues: (type: string, name: string, oldKey: boolean) => void;
    handleValueChange: (id: string, newValue: string) => void;
    handleEditClick: (id: number) => void;
    handleDeleteOptionField: (id: number) => void;
    handleAddDropdownOptions: () => void;
    handleCloseDialog: (type: string, name: string, oldKey: boolean) => void;
}

const CustomInviteFormCard = ({
    form,
    updateFieldOrders,
    handleDeleteOpenField,
    toggleIsRequired,
    handleAddGender,
    handleAddOpenFieldValues,
    handleValueChange,
    handleEditClick,
    handleDeleteOptionField,
    handleAddDropdownOptions,
    handleCloseDialog,
}: CustomInviteFormCardProps) => {
    const { control, getValues } = form;
    const { fields: customFieldsArray, move: moveCustomField } = useFieldArray({
        control,
        name: 'custom_fields',
    });
    const customFields = getValues('custom_fields');
    console.log('customFields', customFields);
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="flex flex-col text-lg font-semibold">
                    <span className="text-2xl font-bold">Customize Invite Form</span>
                    <span className="text-sm text-gray-600">
                        Configure the fields students will fill out
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex w-full flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <Sortable
                            value={customFieldsArray}
                            onMove={({ activeIndex, overIndex }) => {
                                moveCustomField(activeIndex, overIndex);
                                updateFieldOrders();
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                {customFieldsArray.map((field, index) => {
                                    return (
                                        <SortableItem key={field.id} value={field.id} asChild>
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="flex w-3/4 items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2">
                                                    <h1 className="text-sm">
                                                        {field.name}
                                                        {field.oldKey && (
                                                            <span className="text-subtitle text-danger-600">
                                                                *
                                                            </span>
                                                        )}
                                                        {!field.oldKey && field.isRequired && (
                                                            <span className="text-subtitle text-danger-600">
                                                                *
                                                            </span>
                                                        )}
                                                    </h1>
                                                    <div className="flex items-center gap-6">
                                                        {!field.oldKey && (
                                                            <MyButton
                                                                type="button"
                                                                scale="small"
                                                                buttonType="secondary"
                                                                className="min-w-6 !rounded-sm !p-0"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDeleteOpenField(index);
                                                                }}
                                                            >
                                                                <TrashSimple className="!size-4 text-danger-500" />
                                                            </MyButton>
                                                        )}
                                                        <SortableDragHandle
                                                            variant="ghost"
                                                            size="icon"
                                                            className="cursor-grab"
                                                        >
                                                            <DotsSixVertical size={20} />
                                                        </SortableDragHandle>
                                                    </div>
                                                </div>
                                                {!field.oldKey && (
                                                    <>
                                                        <h1 className="text-sm">Required</h1>
                                                        <Switch
                                                            checked={field.isRequired}
                                                            onCheckedChange={() => {
                                                                toggleIsRequired(index);
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </SortableItem>
                                    );
                                })}
                            </div>
                        </Sortable>
                    </div>
                    <div className="mt-2 flex items-center gap-6">
                        {!customFields?.some((field) => field.name === 'Gender') && (
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddGender('dropdown', 'Gender', false);
                                }}
                            >
                                <Plus size={32} /> Add Gender
                            </MyButton>
                        )}
                        {!customFields?.some((field) => field.name === 'State') && (
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddOpenFieldValues('textfield', 'State', false);
                                }}
                            >
                                <Plus size={32} /> Add State
                            </MyButton>
                        )}
                        {!customFields?.some((field) => field.name === 'City') && (
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddOpenFieldValues('textfield', 'City', false);
                                }}
                            >
                                <Plus size={32} /> Add City
                            </MyButton>
                        )}
                        {!customFields?.some((field) => field.name === 'School/College') && (
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddOpenFieldValues('textfield', 'School/College', false);
                                }}
                            >
                                <Plus size={32} /> Add School/College
                            </MyButton>
                        )}
                        <Dialog
                            open={form.watch('isDialogOpen')}
                            onOpenChange={(open) => form.setValue('isDialogOpen', open)}
                        >
                            <DialogTrigger asChild>
                                <MyButton
                                    type="button"
                                    scale="medium"
                                    buttonType="secondary"
                                    onClick={() => form.setValue('isDialogOpen', true)}
                                >
                                    <Plus size={32} /> Add Custom Field
                                </MyButton>
                            </DialogTrigger>
                            <DialogContent className="flex max-h-[80vh] !w-[500px] flex-col p-0">
                                <h1 className="shrink-0 rounded-lg bg-primary-50 p-4 text-primary-500">
                                    Add Custom Field
                                </h1>
                                <div className="flex-1 flex-col gap-4 overflow-y-auto px-4">
                                    <h1>Select the type of custom field you want to add:</h1>
                                    <RadioGroup
                                        defaultValue={form.watch('selectedOptionValue')}
                                        onValueChange={(value) =>
                                            form.setValue('selectedOptionValue', value)
                                        }
                                        className="flex items-center gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="textfield" id="option-one" />
                                            <Label htmlFor="option-one">Text Field</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="dropdown" id="option-two" />
                                            <Label htmlFor="option-two">Dropdown</Label>
                                        </div>
                                    </RadioGroup>
                                    {form.watch('selectedOptionValue') === 'textfield' ? (
                                        <div className="flex flex-col gap-1">
                                            <h1>
                                                Text Field Name
                                                <span className="text-subtitle text-danger-600">
                                                    *
                                                </span>
                                            </h1>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="Type Here"
                                                input={form.watch('textFieldValue')}
                                                onChangeFunction={(e) =>
                                                    form.setValue('textFieldValue', e.target.value)
                                                }
                                                size="large"
                                                className="w-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <h1>
                                                Dropdown Name
                                                <span className="text-subtitle text-danger-600">
                                                    *
                                                </span>
                                            </h1>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="Type Here"
                                                input={form.watch('textFieldValue')}
                                                onChangeFunction={(e) =>
                                                    form.setValue('textFieldValue', e.target.value)
                                                }
                                                size="large"
                                                className="w-full"
                                            />
                                            <h1 className="mt-4">Dropdown Options</h1>
                                            <div className="flex flex-col gap-4">
                                                {form
                                                    .watch('dropdownOptions')
                                                    .map((option, idx) => {
                                                        return (
                                                            <div
                                                                className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-1"
                                                                key={option.id} // Use unique identifier
                                                            >
                                                                <MyInput
                                                                    inputType="text"
                                                                    inputPlaceholder={option.value}
                                                                    input={option.value}
                                                                    onChangeFunction={(e) =>
                                                                        handleValueChange(
                                                                            option.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    size="large"
                                                                    disabled={option.disabled}
                                                                    className="border-none pl-0"
                                                                />
                                                                <div className="flex items-center gap-6">
                                                                    <MyButton
                                                                        type="button"
                                                                        scale="medium"
                                                                        buttonType="secondary"
                                                                        className="h-6 min-w-6 !rounded-sm px-1"
                                                                        onClick={() =>
                                                                            handleEditClick(idx)
                                                                        }
                                                                    >
                                                                        <PencilSimple size={32} />
                                                                    </MyButton>
                                                                    {form.watch('dropdownOptions')
                                                                        .length > 1 && (
                                                                        <MyButton
                                                                            type="button"
                                                                            scale="medium"
                                                                            buttonType="secondary"
                                                                            onClick={() =>
                                                                                handleDeleteOptionField(
                                                                                    idx
                                                                                )
                                                                            }
                                                                            className="h-6 min-w-6 !rounded-sm px-1"
                                                                        >
                                                                            <TrashSimple className="!size-4 text-danger-500" />
                                                                        </MyButton>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                            <MyButton
                                                type="button"
                                                scale="small"
                                                buttonType="secondary"
                                                className="mt-2 w-20 min-w-4 border-none font-thin !text-primary-500"
                                                onClick={handleAddDropdownOptions}
                                            >
                                                <Plus size={18} />
                                                Add
                                            </MyButton>
                                        </div>
                                    )}
                                    <div className="mb-6 flex justify-center">
                                        <MyButton
                                            type="button"
                                            scale="medium"
                                            buttonType="primary"
                                            className="mt-4 w-fit"
                                            onClick={() =>
                                                handleCloseDialog(
                                                    form.watch('selectedOptionValue'),
                                                    form.watch('textFieldValue'),
                                                    false
                                                )
                                            }
                                        >
                                            Done
                                        </MyButton>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Dialog>
                        <DialogTrigger className="flex justify-start">
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                className="mt-4 w-fit"
                            >
                                Preview Registration Form
                            </MyButton>
                        </DialogTrigger>
                        <DialogContent className="flex max-h-[80vh] flex-col p-0">
                            <h1 className="shrink-0 rounded-md bg-primary-50 p-4 font-semibold text-primary-500">
                                Preview Registration Form
                            </h1>
                            <div className="flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
                                {customFields?.map((testInputFields, idx) => {
                                    return (
                                        <div className="flex flex-col items-start gap-4" key={idx}>
                                            {testInputFields.type === 'dropdown' ? (
                                                <SelectField
                                                    label={testInputFields.name}
                                                    labelStyle="font-normal"
                                                    name={testInputFields.name}
                                                    options={
                                                        testInputFields?.options?.map(
                                                            (option, index) => ({
                                                                value: option.value,
                                                                label: option.value,
                                                                _id: index,
                                                            })
                                                        ) || []
                                                    }
                                                    control={form.control}
                                                    className="mt-4 w-full font-thin"
                                                    required={
                                                        testInputFields.isRequired ? true : false
                                                    }
                                                />
                                            ) : (
                                                <div className="flex w-full flex-col gap-[0.4rem]">
                                                    <h1 className="mt-3 text-sm">
                                                        {testInputFields.name}
                                                        {testInputFields.isRequired && (
                                                            <span className="text-subtitle text-danger-600">
                                                                *
                                                            </span>
                                                        )}
                                                    </h1>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder={testInputFields.name}
                                                        input=""
                                                        onChangeFunction={() => {}}
                                                        size="large"
                                                        disabled
                                                        className="!min-w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomInviteFormCard;
