import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateTemplateRequest, TEMPLATE_VARIABLES } from '@/types/message-template-types';
import { Plus, X } from 'lucide-react';

interface TemplateVariablesSectionProps {
    formData: CreateTemplateRequest;
    selectedVariable: string;
    onVariableSearch: (search: string) => void;
    onInsertVariable: (variable: string) => void;
    onAddVariable: (variable: string) => void;
    onRemoveVariable: (variable: string) => void;
}

export const TemplateVariablesSection: React.FC<TemplateVariablesSectionProps> = ({
    formData,
    selectedVariable,
    onVariableSearch,
    onInsertVariable,
    onAddVariable,
    onRemoveVariable,
}) => {
    const getSortedVariables = (variables: string[]) => {
        const priorityOrder = [
            '{{name}}',
            '{{email}}',
            '{{mobile_number}}',
            '{{custom_message_text}}',
            '{{course_name}}',
            '{{session_name}}',
            '{{current_date}}',
        ];

        return [...variables].sort((a: string, b: string) => {
            const aIndex = priorityOrder.indexOf(a);
            const bIndex = priorityOrder.indexOf(b);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    };

    const getFilteredVariables = (variables: string[]) => {
        return variables.filter((variable: string) =>
            variable.toLowerCase().includes(selectedVariable.toLowerCase())
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Available Variables</Label>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search variables..."
                        value={selectedVariable}
                        onChange={(e) => onVariableSearch(e.target.value)}
                        className="h-8 w-64"
                    />
                </div>
            </div>

            {/* Variables Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => {
                    const sortedVariables = getSortedVariables(variables);
                    const filteredVariables = getFilteredVariables(sortedVariables);

                    if (filteredVariables.length === 0) return null;

                    return (
                        <div
                            key={category}
                            className="space-y-3 rounded-lg border bg-gray-50 p-4"
                        >
                            <h4 className="text-sm font-semibold capitalize text-gray-800">
                                {category} Variables
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {filteredVariables.map((variable: string) => (
                                    <div key={variable} className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onInsertVariable(variable)}
                                            className="h-7 px-2 text-xs"
                                        >
                                            {variable}
                                        </Button>
                                        {!formData.variables.includes(variable) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onAddVariable(variable)}
                                                className="size-6 p-0 hover:bg-blue-100"
                                            >
                                                <Plus className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Variables */}
            {formData.variables.length > 0 && (
                <div className="space-y-3 rounded-lg border bg-blue-50 p-4">
                    <Label className="text-sm font-medium text-blue-800">
                        Used Variables ({formData.variables.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {formData.variables.map((variable: string) => (
                            <Badge
                                key={variable}
                                variant="secondary"
                                className="flex items-center gap-1 bg-blue-100 text-blue-800"
                            >
                                {variable}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveVariable(variable)}
                                    className="size-4 p-0 hover:bg-transparent"
                                >
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

