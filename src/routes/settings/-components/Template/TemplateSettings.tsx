import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2, FileText, Plus, Trash2 } from 'lucide-react';
import { MyButton } from '@/components/design-system/button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageTemplate, CreateTemplateRequest } from '@/types/message-template-types';
import {
    createMessageTemplate,
    getMessageTemplates,
    updateMessageTemplate,
    deleteMessageTemplate,
    setDefaultTemplate,
    duplicateTemplate,
} from '@/services/message-template-service';
import { templateCacheService } from '@/services/template-cache-service';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';
import { TemplatePreview } from './TemplatePreview';

export default function TemplateSettings() {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'all' | 'EMAIL' | 'WHATSAPP'>('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);

    useEffect(() => {
        loadTemplates();
    }, [selectedType]);

    const loadTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMessageTemplates(
                selectedType === 'all' ? undefined : selectedType
            );
            setTemplates(response.templates);
        } catch (err) {
            console.error('Error loading templates:', err);
            setError('Failed to load templates. Please try again.');
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
                setSuccess('Template updated successfully!');
            } else {
                await createMessageTemplate(templateData);
                setSuccess('Template created successfully!');
            }
            // Clear cache to ensure fresh data
            templateCacheService.clearCache(templateData.type);
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
            templateCacheService.clearCache(templateToDelete.type);
            setSuccess('Template deleted successfully!');
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

    const handleSetDefault = async (id: string, type: 'EMAIL' | 'WHATSAPP') => {
        setSaving(true);
        setError(null);
        try {
            await setDefaultTemplate(id, type);
            // Clear cache to ensure fresh data
            templateCacheService.clearCache(type);
            setSuccess('Default template updated successfully!');
            await loadTemplates();
        } catch (err) {
            console.error('Error setting default template:', err);
            setError('Failed to set default template.');
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicateTemplate = async (template: MessageTemplate) => {
        setSaving(true);
        setError(null);
        try {
            await duplicateTemplate(template.id);
            // Clear cache to ensure fresh data
            templateCacheService.clearCache(template.type);
            setSuccess('Template duplicated successfully!');
            await loadTemplates();
        } catch (err) {
            console.error('Error duplicating template:', err);
            setError('Failed to duplicate template.');
        } finally {
            setSaving(false);
        }
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
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="flex items-center gap-2 text-lg font-bold">
                        <FileText className="size-6" />
                        Template Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create and manage email and WhatsApp message templates for bulk actions
                    </p>
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

            {/* Filter Tabs */}
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                {[
                    { key: 'all', label: 'All Templates' },
                    { key: 'EMAIL', label: 'Email Templates' },
                    { key: 'WHATSAPP', label: 'WhatsApp Templates' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setSelectedType(tab.key as typeof selectedType)}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            selectedType === tab.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Template List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-10 animate-spin text-primary-500" />
                    <p className="mt-4 text-gray-600">Loading templates...</p>
                </div>
            ) : (
                <TemplateList
                    templates={templates}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                    onSetDefault={handleSetDefault}
                    onDuplicate={handleDuplicateTemplate}
                    onPreview={handlePreviewTemplate}
                    isDeleting={saving}
                />
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
                <DialogContent className="max-w-md p-6">
                    <DialogHeader className="space-y-4 pb-4">
                        <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                                <Trash2 className="size-5 text-red-600" />
                            </div>
                            Delete Template
                        </DialogTitle>
                        <DialogDescription className="text-base leading-relaxed text-gray-600">
                            Are you sure you want to delete the template <span className="font-semibold text-gray-900">"{templateToDelete?.name}"</span>?
                            <br />
                            <span className="text-red-600 font-medium">This action cannot be undone.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={cancelDeleteTemplate}
                            disabled={saving}
                            className="w-full sm:w-auto px-6 py-2.5"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteTemplate}
                            disabled={saving}
                            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 focus:ring-red-500"
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
}
