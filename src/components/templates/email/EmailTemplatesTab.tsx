import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Search, Edit, Eye } from 'lucide-react';
import { MyButton } from '@/components/design-system/button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageTemplate, CreateTemplateRequest } from '@/types/message-template-types';
import {
    createMessageTemplate,
    getMessageTemplates,
    updateMessageTemplate,
    deleteMessageTemplate,
} from '@/services/message-template-service';
import { templateCacheService } from '@/services/template-cache-service';
import { TemplateEditor } from '../shared/TemplateEditor';
import { TemplatePreview } from '../shared/TemplatePreview';
import { TEMPLATE_TYPE_CONFIG, STATUS_CONFIG, TEMPLATE_TYPE_KEYWORDS, DATE_FORMAT_OPTIONS } from '../shared/constants';

export const EmailTemplatesTab: React.FC = () => {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Load templates
    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const emailTemplates = await templateCacheService.getTemplates('EMAIL');
            setTemplates(emailTemplates);
            setFilteredTemplates(emailTemplates);
        } catch (error) {
            // Error is already handled by toast.error
        } finally {
            setIsLoading(false);
        }
    };

    // Filter templates based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter((template) =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [searchQuery, templates]);

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleCreateTemplate = () => {
        setEditingTemplate(null);
        setShowEditor(true);
    };

    const handleEditTemplate = (template: MessageTemplate) => {
        setEditingTemplate(template);
        setShowEditor(true);
    };

    const handlePreviewTemplate = (template: MessageTemplate) => {
        setPreviewTemplate(template);
        setShowPreview(true);
    };

    const handleSaveTemplate = async (templateData: CreateTemplateRequest) => {
        console.log('handleSaveTemplate called with:', templateData);
        setIsSaving(true);
        try {
            if (editingTemplate) {
                console.log('Updating existing template:', editingTemplate.id);
                // Update existing template
                await updateMessageTemplate({
                    id: editingTemplate.id,
                    ...templateData,
                });
            } else {
                console.log('Creating new template');
                // Create new template
                await createMessageTemplate(templateData);
            }

            // Clear cache and reload templates
            templateCacheService.clearCache('EMAIL');
            await loadTemplates();

            setShowEditor(false);
            setEditingTemplate(null);
        } catch (error) {
            console.error('Error in handleSaveTemplate:', error);
            // Error is already handled by toast.error
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        setIsDeleting(true);
        try {
            await deleteMessageTemplate(templateId);
            templateCacheService.clearCache('EMAIL');
            await loadTemplates();
            setShowDeleteDialog(false);
            setDeleteTemplateId(null);
        } catch (error) {
            // Error is already handled by toast.error
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDelete = (templateId: string) => {
        setDeleteTemplateId(templateId);
        setShowDeleteDialog(true);
    };

    const getTemplateType = (template: MessageTemplate): keyof typeof TEMPLATE_TYPE_CONFIG => {
        const name = template.name.toLowerCase();
        for (const [type, keywords] of Object.entries(TEMPLATE_TYPE_KEYWORDS)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return type as keyof typeof TEMPLATE_TYPE_CONFIG;
            }
        }
        return 'utility';
    };

    const getStatusColor = (status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Email Templates</h2>
                    <p className="text-sm text-muted-foreground">
                        Create and manage email templates for bulk communications
                    </p>
                </div>
                <MyButton
                    buttonType="primary"
                    scale="medium"
                    onClick={handleCreateTemplate}
                >
                    <Plus className="mr-2 size-4" />
                    Create Template
                </MyButton>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Templates List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="ml-2">Loading templates...</span>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                    <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Search className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                        {searchQuery ? 'No templates found' : 'No email templates'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery
                            ? 'Try adjusting your search terms'
                            : 'Get started by creating your first email template'
                        }
                    </p>
                    {!searchQuery && (
                        <MyButton
                            buttonType="primary"
                            scale="medium"
                            onClick={handleCreateTemplate}
                        >
                            <Plus className="mr-2 size-4" />
                            Create Template
                        </MyButton>
                    )}
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTemplates.map((template) => {
                                const templateType = getTemplateType(template);
                                const typeConfig = TEMPLATE_TYPE_CONFIG[templateType];

                                return (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{ backgroundColor: typeConfig.color }}
                                                />
                                                {template.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate">
                                                {template.subject || 'No subject'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={typeConfig.badgeClass}>
                                                {typeConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-800">
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(template.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handlePreviewTemplate(template)}
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTemplate(template)}
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => confirmDelete(template.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Template Editor Dialog */}
            {showEditor && (
                <TemplateEditor
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onClose={() => {
                        setShowEditor(false);
                        setEditingTemplate(null);
                    }}
                    isSaving={isSaving}
                />
            )}

            {/* Template Preview Dialog */}
            {showPreview && previewTemplate && (
                <>
                    <TemplatePreview
                        template={previewTemplate}
                        isOpen={showPreview}
                        onClose={() => {
                            setShowPreview(false);
                            setPreviewTemplate(null);
                        }}
                    />
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTemplateId && handleDeleteTemplate(deleteTemplateId)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
