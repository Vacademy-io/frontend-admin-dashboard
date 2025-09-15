import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MyButton } from '@/components/design-system/button';
import {
    MessageTemplate,
    TEMPLATE_VARIABLES,
    ALL_TEMPLATE_VARIABLES
} from '@/types/message-template-types';
import {
    Edit,
    Trash2,
    Eye,
    Star,
    Mail,
    MessageCircle,
    Calendar,
    User,
    FileText
} from 'lucide-react';

interface TemplateListProps {
    templates: MessageTemplate[];
    onEdit: (template: MessageTemplate) => void;
    onDelete: (template: MessageTemplate) => void;
    onPreview: (template: MessageTemplate) => void;
    isDeleting: boolean;
}

export const TemplateList: React.FC<TemplateListProps> = ({
    templates,
    onEdit,
    onDelete,
    onPreview,
    isDeleting,
}) => {
    const getTypeIcon = (type: 'EMAIL' | 'WHATSAPP') => {
        return type === 'EMAIL' ? (
            <Mail className="size-4 text-blue-600" />
        ) : (
            <MessageCircle className="size-4 text-green-600" />
        );
    };

    const getTypeColor = (type: 'EMAIL' | 'WHATSAPP') => {
        return type === 'EMAIL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const extractVariables = (content: string): string[] => {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const matches = content.match(variableRegex);
        return matches ? [...new Set(matches)] : [];
    };

    const getPreviewContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    if (templates.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="size-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
                    <p className="text-gray-600 text-center mb-4">
                        Create your first message template to get started with bulk messaging.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
                const contentVariables = extractVariables(template.content);
                const subjectVariables = template.subject ? extractVariables(template.subject) : [];
                const allVariables = [...new Set([...contentVariables, ...subjectVariables])];

                return (
                    <Card key={template.id} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(template.type)}
                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                </div>
                                <div className="flex items-center gap-1">
                                    {template.isDefault && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Star className="size-3 mr-1" />
                                            Default
                                        </Badge>
                                    )}
                                    <Badge className={`text-xs ${getTypeColor(template.type)}`}>
                                        {template.type.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Subject (for email templates) */}
                            {template.subject && (
                                <div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">Subject:</p>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {getPreviewContent(template.subject, 80)}
                                    </p>
                                </div>
                            )}

                            {/* Content Preview */}
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Content:</p>
                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                    {getPreviewContent(template.content)}
                                </p>
                            </div>

                            {/* Variables */}
                            {allVariables.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2">Variables:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {allVariables.slice(0, 3).map((variable, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {variable}
                                            </Badge>
                                        ))}
                                        {allVariables.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{allVariables.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {formatDate(template.updatedAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="size-3" />
                                    {template.createdBy}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onPreview(template)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Eye className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(template)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(template)}
                                        disabled={isDeleting}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
