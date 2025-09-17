import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info, MapPin, RefreshCw, AlertTriangle, Eye, CheckCircle, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import {
    MetaWhatsAppTemplate,
    WhatsAppTemplateMapping,
    CreateMappingRequest,
    VacademyDataField,
    PlaceholderMapping
} from '@/types/message-template-types';
import { whatsappTemplateService } from '@/services/whatsapp-template-service';

interface WhatsAppTemplateMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: MetaWhatsAppTemplate | null;
    onMappingSaved: (mapping: WhatsAppTemplateMapping) => void;
}

export const WhatsAppTemplateMappingModal: React.FC<WhatsAppTemplateMappingModalProps> = ({
    isOpen,
    onClose,
    template,
    onMappingSaved,
}) => {
    const [mappings, setMappings] = useState<PlaceholderMapping[]>([]);
    const [vacademyFields, setVacademyFields] = useState<VacademyDataField[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingMapping, setExistingMapping] = useState<WhatsAppTemplateMapping | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && template) {
            loadVacademyFields();
            loadExistingMapping();
            initializeMappings();
        }
    }, [isOpen, template]);

    const loadVacademyFields = async () => {
        try {
            const fields = whatsappTemplateService.getVacademyDataFields();
            setVacademyFields(fields);
        } catch (err) {
            console.error('Error loading Vacademy fields:', err);
            setError('Failed to load available fields');
        }
    };

    const loadExistingMapping = async () => {
        if (!template) return;

        try {
            setLoading(true);
            const mapping = await whatsappTemplateService.getTemplateMappings(template.id);
            setExistingMapping(mapping);
        } catch (err) {
            console.error('Error loading existing mapping:', err);
            // Don't show error for missing mapping - it's expected for new templates
        } finally {
            setLoading(false);
        }
    };

    const initializeMappings = () => {
        if (!template) return;

        // Extract placeholders from template components
        const placeholders: string[] = [];
        template.components.forEach(component => {
            if (component.type === 'BODY' && component.text) {
                // Find placeholders like {{1}}, {{2}}, etc.
                const matches = component.text.match(/\{\{(\d+)\}\}/g);
                if (matches) {
                    matches.forEach(match => {
                        const placeholder = match.replace(/[{}]/g, '');
                        if (!placeholders.includes(placeholder)) {
                            placeholders.push(placeholder);
                        }
                    });
                }
            }
        });

        // Initialize mappings
        const initialMappings: PlaceholderMapping[] = placeholders.map(placeholder => {
            const existing = existingMapping?.mappings.find(m => m.metaPlaceholder === placeholder);
            return {
                metaPlaceholder: placeholder,
                vacademyField: existing?.vacademyField || '',
                fieldLabel: existing?.fieldLabel || '',
                dataType: existing?.dataType || 'text',
            };
        });

        setMappings(initialMappings);

        // Initialize selected categories for existing mappings
        const initialCategories: Record<string, string> = {};
        initialMappings.forEach(mapping => {
            if (mapping.vacademyField) {
                const field = vacademyFields.find(f => f.value === mapping.vacademyField);
                if (field) {
                    initialCategories[mapping.metaPlaceholder] = field.category;
                }
            }
        });
        setSelectedCategories(initialCategories);
    };

    const handleMappingChange = (placeholder: string, vacademyField: string) => {
        const field = vacademyFields.find(f => f.value === vacademyField);
        setMappings(prev => prev.map(mapping =>
            mapping.metaPlaceholder === placeholder
                ? {
                    ...mapping,
                    vacademyField,
                    fieldLabel: field?.label || '',
                    dataType: field?.dataType || 'text',
                }
                : mapping
        ));
    };

    const handleCategoryChange = (placeholder: string, category: string) => {
        // Update selected category
        setSelectedCategories(prev => ({
            ...prev,
            [placeholder]: category
        }));

        // Reset the field when category changes
        setMappings(prev => prev.map(mapping =>
            mapping.metaPlaceholder === placeholder
                ? {
                    ...mapping,
                    vacademyField: '',
                    fieldLabel: '',
                    dataType: 'text',
                }
                : mapping
        ));
    };

    const handleSaveMapping = async () => {
        if (!template) return;

        setSaving(true);
        setError(null);

        try {
            const mappingData: CreateMappingRequest = {
                templateName: template.name,
                templateId: template.id,
                language: template.language,
                mappings: mappings.map(m => ({
                    metaPlaceholder: m.metaPlaceholder,
                    vacademyField: m.vacademyField,
                })),
            };

            let savedMapping: WhatsAppTemplateMapping;
            if (existingMapping) {
                savedMapping = await whatsappTemplateService.updateTemplateMapping(
                    existingMapping.id,
                    mappingData
                );
            } else {
                savedMapping = await whatsappTemplateService.saveTemplateMapping(mappingData);
            }

            onMappingSaved(savedMapping);
            onClose();
        } catch (err) {
            console.error('Error saving mapping:', err);
            setError('Failed to save template mapping. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getTemplatePreview = () => {
        if (!template) return '';

        const bodyComponent = template.components.find(c => c.type === 'BODY');
        if (!bodyComponent?.text) return '';

        let preview = bodyComponent.text;
        mappings.forEach(mapping => {
            if (mapping.vacademyField) {
                const field = vacademyFields.find(f => f.value === mapping.vacademyField);
                const exampleValue = field ? `[${field.label}]` : `[${mapping.vacademyField}]`;
                preview = preview.replace(
                    new RegExp(`\\{\\{${mapping.metaPlaceholder}\\}\\}`, 'g'),
                    exampleValue
                );
            }
        });

        return preview;
    };

    const getFieldsByCategory = (category: string) => {
        return vacademyFields.filter(field => field.category === category);
    };

    const getAvailableCategories = () => {
        const categories = new Set(vacademyFields.map(field => field.category));
        return Array.from(categories);
    };

    const isMappingComplete = () => {
        return mappings.every(mapping => mapping.vacademyField.trim() !== '');
    };

    if (!template) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 border border-green-200">
                            <WhatsAppIcon className="size-5 text-green-600" />
                        </div>
                        Map Dynamic Values
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 min-h-0">
                    {/* Main Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            {/* Template Preview Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                        {getTemplatePreview()}
                                    </div>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50">
                                    <AlertTriangle className="size-4" />
                                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Info Alert */}
                            <Alert className="border-blue-200 bg-blue-50">
                                <Info className="size-4" />
                                <AlertDescription className="text-blue-700">
                                    Map each placeholder from the WhatsApp template to a corresponding field from your Vacademy data.
                                    This will be used to populate the template when sending messages.
                                </AlertDescription>
                            </Alert>

                            {/* Mappings Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Dynamic Value Mappings</h3>
                                <div className="space-y-4">
                                    {mappings.map((mapping, index) => (
                                        <div key={mapping.metaPlaceholder} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <div className="space-y-4">
                                                {/* Placeholder Header */}
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm font-mono">
                                                        {`{{${mapping.metaPlaceholder}}}`}
                                                    </Badge>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="text-sm text-gray-600">Vacademy Data Field</span>
                                                </div>

                                                {/* Data Category Selection */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Data Category</label>
                                                    <Select
                                                        value={mapping.vacademyField ? vacademyFields.find(f => f.value === mapping.vacademyField)?.category || '' : ''}
                                                        onValueChange={(category) => handleCategoryChange(mapping.metaPlaceholder, category)}
                                                    >
                                                        <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                            <SelectValue placeholder="Select data category..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getAvailableCategories().map(category => (
                                                                <SelectItem key={category} value={category}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                                        {category}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Field Selection */}
                                                {selectedCategories[mapping.metaPlaceholder] && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Field</label>
                                                        <Select
                                                            value={mapping.vacademyField}
                                                            onValueChange={(value) => handleMappingChange(mapping.metaPlaceholder, value)}
                                                        >
                                                            <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                                <SelectValue placeholder="Select field..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {getFieldsByCategory(selectedCategories[mapping.metaPlaceholder]).map(field => (
                                                                    <SelectItem key={field.value} value={field.value}>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{field.label}</span>
                                                                            {field.description && (
                                                                                <span className="text-xs text-gray-500 mt-1">
                                                                                    {field.description}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {/* Mapping Status */}
                                                {mapping.fieldLabel && (
                                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <CheckCircle className="size-4 text-green-600" />
                                                        <span className="text-sm text-green-700">
                                                            Mapped to: <span className="font-semibold">{mapping.fieldLabel}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="w-96 border-l border-gray-200 bg-gray-50/50 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Eye className="size-5" />
                                    Preview
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Shows how the message will appear with sample data
                                </p>
                            </div>

                            {/* WhatsApp Message Preview */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <WhatsAppIcon className="size-4 text-green-600" />
                                    WhatsApp Message Preview
                                </h4>
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                                    <div className="text-sm text-green-800 whitespace-pre-wrap font-mono leading-relaxed">
                                        {getTemplatePreview()}
                                    </div>
                                </div>
                            </div>

                            {/* Completion Status */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Completion Status</h4>
                                <div className="space-y-2">
                                    {mappings.map((mapping, index) => (
                                        <div key={mapping.metaPlaceholder} className="flex items-center gap-2">
                                            {mapping.vacademyField ? (
                                                <CheckCircle className="size-4 text-green-600" />
                                            ) : (
                                                <X className="size-4 text-gray-400" />
                                            )}
                                            <span className={`text-sm ${mapping.vacademyField ? 'text-green-700' : 'text-gray-500'}`}>
                                                {`{{${mapping.metaPlaceholder}}}`} {mapping.vacademyField ? 'mapped' : 'pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {isMappingComplete() && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="size-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">All mappings complete!</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-2.5 h-11 font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveMapping}
                        disabled={saving || !isMappingComplete()}
                        className="w-full sm:w-auto px-6 py-2.5 h-11 font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="size-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Complete all'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
