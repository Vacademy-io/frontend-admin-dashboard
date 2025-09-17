import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2, Plus, Trash2, Search, Edit, Eye } from 'lucide-react';
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
import { TemplateEditor } from './TemplateEditor';
import { TemplatePreview } from './TemplatePreview';

export const EmailTemplatesTab: React.FC = () => {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        // Filter templates based on search query
        if (searchQuery.trim() === '') {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [templates, searchQuery]);

    const loadTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMessageTemplates('EMAIL');
            setTemplates(response.templates);
        } catch (err) {
            console.error('Error loading email templates:', err);
            setError('Failed to load email templates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = () => {
        setEditingTemplate(null);
        setShowEditor(true);
    };

    const handleEditTemplate = (template: MessageTemplate) => {
        setEditingTemplate(template);
        setShowEditor(true);
    };

    const handleSaveTemplate = async (templateData: CreateTemplateRequest) => {
        setSaving(true);
        setError(null);
        try {
            if (editingTemplate) {
                await updateMessageTemplate({
                    id: editingTemplate.id,
                    ...templateData,
                });
                setSuccess('Email template updated successfully!');
            } else {
                await createMessageTemplate(templateData);
                setSuccess('Email template created successfully!');
            }
            // Clear cache to ensure fresh data
            templateCacheService.clearCache('EMAIL');
            setShowEditor(false);
            setEditingTemplate(null);
            await loadTemplates();
        } catch (err) {
            console.error('Error saving template:', err);
            setError(editingTemplate ? 'Failed to update template.' : 'Failed to create template.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTemplate = (template: MessageTemplate) => {
        setTemplateToDelete(template);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;

        setSaving(true);
        setError(null);
        try {
            await deleteMessageTemplate(templateToDelete.id);
            // Clear cache to ensure fresh data
            templateCacheService.clearCache('EMAIL');
            setSuccess('Email template deleted successfully!');
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
            await loadTemplates();
        } catch (err) {
            console.error('Error deleting template:', err);
            setError('Failed to delete template.');
        } finally {
            setSaving(false);
        }
    };

    const cancelDeleteTemplate = () => {
        setShowDeleteConfirm(false);
        setTemplateToDelete(null);
    };

    const handlePreviewTemplate = (template: MessageTemplate) => {
        setPreviewTemplate(template);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
        setEditingTemplate(null);
    };

    const handleClosePreview = () => {
        setPreviewTemplate(null);
    };

    // Clear success/error messages after timeout
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [error]);

    const getStatusBadge = (template: MessageTemplate) => {
        if (template.isDefault) {
            return <Badge className="bg-green-100 text-green-800 border-green-200">active</Badge>;
        }
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">draft</Badge>;
    };

    const getTemplateType = (template: MessageTemplate) => {
        // Determine template type based on name or content
        const name = template.name.toLowerCase();
        if (name.includes('welcome') || name.includes('enrollment')) return 'marketing';
        if (name.includes('assignment') || name.includes('reminder')) return 'utility';
        if (name.includes('certificate') || name.includes('completion')) return 'transactional';
        return 'utility';
    };

    const getTemplateTypeBadge = (template: MessageTemplate) => {
        const type = getTemplateType(template);
        const typeConfig = {
            marketing: { className: 'bg-blue-100 text-blue-800 border-blue-200' },
            utility: { className: 'bg-orange-100 text-orange-800 border-orange-200' },
            transactional: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
        };

        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.utility;

        return (
            <Badge className={config.className}>
                {type}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Success Alert */}
            {success && (
                <Alert variant="default" className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="size-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Email Templates</h2>
                <p className="text-sm text-muted-foreground">
                    Create and manage custom email templates with dynamic values from your CRM data.
                </p>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-between">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <MyButton
                    onClick={handleCreateTemplate}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    <Plus className="size-4" />
                    Create Template
                </MyButton>
            </div>

            {/* Template Count */}
            <div className="text-sm text-gray-600">
                Email Templates ({filteredTemplates.length})
            </div>

            {/* Template Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-10 animate-spin text-primary-500" />
                    <p className="mt-4 text-gray-600">Loading email templates...</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Name</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Subject</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Type</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Status</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Last Modified</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTemplates.map((template, index) => (
                                <TableRow
                                    key={template.id}
                                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                                        index === filteredTemplates.length - 1 ? 'border-b-0' : ''
                                    }`}
                                >
                                    <TableCell className="py-4 px-6">
                                        <div className="font-medium text-gray-900">{template.name}</div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 max-w-xs">
                                        <div className="text-sm text-gray-600 truncate">
                                            {template.subject || 'No subject'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        {getTemplateTypeBadge(template)}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        {getStatusBadge(template)}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="text-sm text-gray-600">
                                            {formatDate(template.updatedAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePreviewTemplate(template)}
                                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                                                title="View template"
                                            >
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditTemplate(template)}
                                                className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200"
                                                title="Edit template"
                                            >
                                                <Edit className="size-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteTemplate(template)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                                                title="Delete template"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Template Editor Modal */}
            {showEditor && (
                <TemplateEditor
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onClose={handleCloseEditor}
                    isSaving={saving}
                />
            )}

            {/* Template Preview Modal */}
            {previewTemplate && (
                <TemplatePreview
                    template={previewTemplate}
                    onClose={handleClosePreview}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="max-w-lg mx-4 sm:mx-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200">
                                <Trash2 className="size-6 text-red-600" />
                            </div>
                            Delete Email Template
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 pb-6">
                        <DialogDescription className="text-base leading-relaxed text-gray-600 space-y-3">
                            <p>
                                Are you sure you want to delete the email template{' '}
                                <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                    "{templateToDelete?.name}"
                                </span>?
                            </p>
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertTriangle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-red-700 font-medium text-sm">
                                    This action cannot be undone. The template will be permanently removed from your system.
                                </p>
                            </div>
                        </DialogDescription>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={cancelDeleteTemplate}
                            disabled={saving}
                            className="w-full sm:w-auto px-6 py-2.5 h-11 font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteTemplate}
                            disabled={saving}
                            className="w-full sm:w-auto px-6 py-2.5 h-11 font-medium bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-4 mr-2" />
                                    Delete Template
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
