import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2, RefreshCw, Settings, Search, ExternalLink } from 'lucide-react';
import { MyButton } from '@/components/design-system/button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    MetaWhatsAppTemplate,
    WhatsAppTemplateMapping
} from '@/types/message-template-types';
import { whatsappTemplateService } from '@/services/whatsapp-template-service';
import { WhatsAppTemplateMappingModal } from './WhatsAppTemplateMappingModal';

export const WhatsAppTemplatesTab: React.FC = () => {
    const [templates, setTemplates] = useState<MetaWhatsAppTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<MetaWhatsAppTemplate[]>([]);
    const [mappings, setMappings] = useState<WhatsAppTemplateMapping[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<MetaWhatsAppTemplate | null>(null);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    useEffect(() => {
        loadTemplates();
        loadMappings();
    }, []);

    useEffect(() => {
        // Filter templates based on search query
        if (searchQuery.trim() === '') {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [templates, searchQuery]);

    const loadTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const metaTemplates = await whatsappTemplateService.getMetaTemplates();
            setTemplates(metaTemplates);
            setLastSyncTime(whatsappTemplateService.getLastSyncTime());
        } catch (err) {
            console.error('Error loading WhatsApp templates:', err);
            setError('Failed to load WhatsApp templates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadMappings = async () => {
        try {
            const templateMappings = await whatsappTemplateService.getAllMappings();
            setMappings(templateMappings);
        } catch (err) {
            console.error('Error loading template mappings:', err);
            // Don't show error for mappings - it's not critical for the main view
        }
    };

    const handleSyncTemplates = async () => {
        setSyncing(true);
        setError(null);
        try {
            const metaTemplates = await whatsappTemplateService.syncMetaTemplates();
            setTemplates(metaTemplates);
            setLastSyncTime(whatsappTemplateService.getLastSyncTime());
            setSuccess('WhatsApp templates synced successfully!');
        } catch (err) {
            console.error('Error syncing templates:', err);
            setError('Failed to sync templates. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    const handleMapDynamicValues = (template: MetaWhatsAppTemplate) => {
        setSelectedTemplate(template);
        setShowMappingModal(true);
    };

    const handleMappingSaved = (mapping: WhatsAppTemplateMapping) => {
        setMappings(prev => {
            const existingIndex = prev.findIndex(m => m.templateId === mapping.templateId);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = mapping;
                return updated;
            } else {
                return [...prev, mapping];
            }
        });
        setSuccess('Template mapping saved successfully!');
    };

    const handleCloseMappingModal = () => {
        setShowMappingModal(false);
        setSelectedTemplate(null);
    };

    const getTemplateMapping = (templateId: string) => {
        return mappings.find(m => m.templateId === templateId);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            APPROVED: { className: 'bg-green-100 text-green-800 border-green-200' },
            PENDING: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            REJECTED: { className: 'bg-red-100 text-red-800 border-red-200' },
            DISABLED: { className: 'bg-gray-100 text-gray-600 border-gray-200' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

        return (
            <Badge className={config.className}>
                {status}
            </Badge>
        );
    };

    const getMappingStatus = (templateId: string) => {
        const mapping = getTemplateMapping(templateId);
        if (mapping && mapping.mappings.length > 0) {
            return (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Configured
                </Badge>
            );
        }
        return (
            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                Not Configured
            </Badge>
        );
    };

    const getCategoryBadge = (category: string) => {
        const categoryConfig = {
            TRANSACTIONAL: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
            MARKETING: { className: 'bg-blue-100 text-blue-800 border-blue-200' },
            UTILITY: { className: 'bg-orange-100 text-orange-800 border-orange-200' },
        };

        const config = categoryConfig[category as keyof typeof categoryConfig] || { className: 'bg-gray-100 text-gray-600 border-gray-200' };

        return (
            <Badge className={config.className}>
                {category}
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

    const approvedTemplates = filteredTemplates.filter(t => t.status === 'APPROVED');

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
                <h2 className="text-lg font-semibold">WhatsApp Templates</h2>
                <p className="text-sm text-muted-foreground">
                    Map your Meta-approved WhatsApp templates to internal data fields.
                </p>
            </div>

            {/* WhatsApp Template Management Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">WhatsApp Template Management</h3>
                <p className="text-sm text-blue-700">
                    Templates must be created and approved through Meta's WhatsApp Business API or Business Manager.
                    Use this interface to sync approved templates and map dynamic values to your CRM data.
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
                    onClick={handleSyncTemplates}
                    disabled={syncing || loading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Templates'}
                </MyButton>
            </div>

            {/* Template Count */}
            <div className="text-sm text-gray-600">
                WhatsApp Templates ({approvedTemplates.length})
            </div>

            {/* Templates Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-10 animate-spin text-primary-500" />
                    <p className="mt-4 text-gray-600">Loading WhatsApp templates...</p>
                </div>
            ) : approvedTemplates.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ExternalLink className="size-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Templates</h3>
                    <p className="text-gray-600 mb-4">
                        No approved WhatsApp templates found. Create templates through Meta's Business Manager first.
                    </p>
                    <MyButton onClick={handleSyncTemplates} disabled={syncing}>
                        <RefreshCw className={`size-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                        Sync Templates
                    </MyButton>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Template Name</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Language</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Category</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Status</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Mappings</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6">Last Synced</TableHead>
                                <TableHead className="font-semibold text-gray-900 py-4 px-6 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvedTemplates.map((template, index) => {
                                const mapping = getTemplateMapping(template.id);
                                return (
                                    <TableRow
                                        key={template.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                                            index === approvedTemplates.length - 1 ? 'border-b-0' : ''
                                        }`}
                                    >
                                        <TableCell className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{template.name}</div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                                                {template.language.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            {getCategoryBadge(template.category)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            {getStatusBadge(template.status)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            {getMappingStatus(template.id)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="text-sm text-gray-600">
                                                {lastSyncTime ? formatDate(lastSyncTime.toISOString()) : 'Never'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center justify-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleMapDynamicValues(template)}
                                                    className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:border-blue-200"
                                                >
                                                    <Settings className="size-4" />
                                                    <span className="text-sm font-medium">
                                                        {mapping ? 'Edit Mappings' : 'Map Values'}
                                                    </span>
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

            {/* Mapping Modal */}
            {selectedTemplate && (
                <WhatsAppTemplateMappingModal
                    isOpen={showMappingModal}
                    onClose={handleCloseMappingModal}
                    template={selectedTemplate}
                    onMappingSaved={handleMappingSaved}
                />
            )}
        </div>
    );
};
