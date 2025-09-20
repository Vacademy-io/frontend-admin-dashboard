import { getInstituteId } from '@/constants/helper';
import {
    MetaWhatsAppTemplate,
    WhatsAppTemplateMapping,
    CreateMappingRequest,
    VacademyDataField,
    VACADEMY_DATA_FIELDS,
    PlaceholderMapping
} from '@/types/message-template-types';

import { MESSAGE_TEMPLATE_BASE } from '@/constants/urls';

const API_BASE_URL = MESSAGE_TEMPLATE_BASE;

// Get access token from localStorage or cookies
const getAccessToken = (): string | null => {
    // Try to get from localStorage first
    const token = localStorage.getItem('accessToken');
    if (token) return token;

    // Try to get from cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith('accessToken='));
    if (tokenCookie) {
        const tokenValue = tokenCookie.split('=')[1];
        return tokenValue ? tokenValue : null;
    }

    return null;
};

// Service for managing WhatsApp templates and mappings
export class WhatsAppTemplateService {
    private static instance: WhatsAppTemplateService;
    private metaTemplatesCache: MetaWhatsAppTemplate[] = [];
    private mappingsCache: WhatsAppTemplateMapping[] = [];
    private lastSyncTime: Date | null = null;

    public static getInstance(): WhatsAppTemplateService {
        if (!WhatsAppTemplateService.instance) {
            WhatsAppTemplateService.instance = new WhatsAppTemplateService();
        }
        return WhatsAppTemplateService.instance;
    }

    // Sync approved templates from Meta WhatsApp Business API
    async syncMetaTemplates(): Promise<MetaWhatsAppTemplate[]> {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const instituteId = getInstituteId();
            const url = `${API_BASE_URL}/whatsapp/templates/sync`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ instituteId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to sync templates: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            this.metaTemplatesCache = result.templates || [];
            this.lastSyncTime = new Date();

            return this.metaTemplatesCache;
        } catch (error) {
            console.error('Error syncing Meta templates:', error);
            // Return mock data when API is not available
            console.warn('WhatsApp API not available, returning mock data');
            return this.getMockTemplates();
        }
    }

    // Mock data for development when API is not available
    private getMockTemplates(): MetaWhatsAppTemplate[] {
        const mockTemplates: MetaWhatsAppTemplate[] = [
            {
                id: 'course_enrollment_confirmation',
                name: 'course_enrollment_confirmation',
                language: 'en',
                status: 'APPROVED',
                category: 'TRANSACTIONAL',
                components: [
                    {
                        type: 'BODY',
                        text: 'Hi {{1}}, you have been successfully enrolled in the course {{2}}. Your start date is {{3}}.'
                    }
                ],
                createdAt: '2024-01-20T10:00:00Z',
                updatedAt: '2024-01-20T10:00:00Z'
            },
            {
                id: 'assignment_reminder',
                name: 'assignment_reminder',
                language: 'en',
                status: 'APPROVED',
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: 'Hi {{1}}, this is a reminder that your assignment {{2}} is due on {{3}}.',
                    }
                ],
                createdAt: '2024-01-19T10:00:00Z',
                updatedAt: '2024-01-19T10:00:00Z'
            },
            {
                id: 'batch_completion_congratulations',
                name: 'batch_completion_congratulations',
                language: 'en',
                status: 'APPROVED',
                category: 'TRANSACTIONAL',
                components: [
                    {
                        type: 'BODY',
                        text: 'Congratulations {{1}}! You have successfully completed the {{2}} batch. Your certificate is ready for download.',
                    }
                ],
                createdAt: '2024-01-18T10:00:00Z',
                updatedAt: '2024-01-18T10:00:00Z'
            },
            {
                id: 'new_batch_announcement',
                name: 'new_batch_announcement',
                language: 'en',
                status: 'PENDING',
                category: 'MARKETING',
                components: [
                    {
                        type: 'BODY',
                        text: 'Exciting news! A new batch of {{1}} is starting on {{2}}. Register now to secure your spot!',
                    }
                ],
                createdAt: '2024-01-17T10:00:00Z',
                updatedAt: '2024-01-17T10:00:00Z'
            }
        ];

        this.metaTemplatesCache = mockTemplates;
        this.lastSyncTime = new Date();
        return mockTemplates;
    }

    // Get approved templates from Meta
    async getMetaTemplates(forceRefresh = false): Promise<MetaWhatsAppTemplate[]> {
        if (forceRefresh || this.metaTemplatesCache.length === 0) {
            return await this.syncMetaTemplates();
        }
        return this.metaTemplatesCache;
    }

    // Get template mappings for a specific template
    async getTemplateMappings(templateId: string): Promise<WhatsAppTemplateMapping | null> {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const instituteId = getInstituteId();
            const url = `${API_BASE_URL}/whatsapp/mappings/${templateId}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.status === 404) {
                return null; // No mapping exists yet
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to get mappings: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            return result.mapping;
        } catch (error) {
            console.error('Error getting template mappings:', error);
            // Return null when API is not available (no mapping exists yet)
            console.warn('WhatsApp mappings API not available, returning null');
            return null;
        }
    }

    // Save template mapping
    async saveTemplateMapping(mappingData: CreateMappingRequest): Promise<WhatsAppTemplateMapping> {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const instituteId = getInstituteId();
            const url = `${API_BASE_URL}/whatsapp/mappings`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    ...mappingData,
                    instituteId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save mapping: ${response.status} ${errorText}`);
            }

            const result = await response.json();

            // Update cache
            const existingIndex = this.mappingsCache.findIndex(m => m.templateId === mappingData.templateId);
            if (existingIndex >= 0) {
                this.mappingsCache[existingIndex] = result.mapping;
            } else {
                this.mappingsCache.push(result.mapping);
            }

            return result.mapping;
        } catch (error) {
            console.error('Error saving template mapping:', error);
            // Create a mock mapping for development when API is not available
            console.warn('WhatsApp mappings API not available, creating mock mapping');
            const mockMapping: WhatsAppTemplateMapping = {
                id: `mock-${Date.now()}`,
                templateName: mappingData.templateName,
                templateId: mappingData.templateId,
                language: mappingData.language,
                mappings: mappingData.mappings.map((m: Omit<PlaceholderMapping, 'fieldLabel' | 'dataType'>): PlaceholderMapping => ({
                    metaPlaceholder: m.metaPlaceholder,
                    vacademyField: m.vacademyField,
                    fieldLabel: this.getFieldLabel(m.vacademyField),
                    dataType: this.getFieldDataType(m.vacademyField),
                })),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                instituteId: getInstituteId() || 'unknown',
            };

            // Update cache
            this.mappingsCache.push(mockMapping);
            return mockMapping;
        }
    }

    // Helper method to get field label
    private getFieldLabel(vacademyField: string): string {
        const field = VACADEMY_DATA_FIELDS.find((f: VacademyDataField) => f.value === vacademyField);
        return field?.label || vacademyField;
    }

    // Helper method to get field data type
    private getFieldDataType(vacademyField: string): 'text' | 'number' | 'date' | 'boolean' {
        const field = VACADEMY_DATA_FIELDS.find((f: VacademyDataField) => f.value === vacademyField);
        return field?.dataType || 'text';
    }

    // Update template mapping
    async updateTemplateMapping(mappingId: string, mappingData: CreateMappingRequest): Promise<WhatsAppTemplateMapping> {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const instituteId = getInstituteId();
            const url = `${API_BASE_URL}/whatsapp/mappings/${mappingId}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    ...mappingData,
                    instituteId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update mapping: ${response.status} ${errorText}`);
            }

            const result = await response.json();

            // Update cache
            const existingIndex = this.mappingsCache.findIndex(m => m.id === mappingId);
            if (existingIndex >= 0) {
                this.mappingsCache[existingIndex] = result.mapping;
            }

            return result.mapping;
        } catch (error) {
            console.error('Error updating template mapping:', error);
            // Update mock mapping for development when API is not available
            console.warn('WhatsApp mappings API not available, updating mock mapping');
            const existingIndex = this.mappingsCache.findIndex(m => m.id === mappingId);
            if (existingIndex >= 0) {
                const existingMapping = this.mappingsCache[existingIndex];
                if (existingMapping) {
                    const updatedMapping: WhatsAppTemplateMapping = {
                        id: existingMapping.id,
                        templateName: mappingData.templateName,
                        templateId: mappingData.templateId,
                        language: mappingData.language,
                        mappings: mappingData.mappings.map((m: Omit<PlaceholderMapping, 'fieldLabel' | 'dataType'>): PlaceholderMapping => ({
                            metaPlaceholder: m.metaPlaceholder,
                            vacademyField: m.vacademyField,
                            fieldLabel: this.getFieldLabel(m.vacademyField),
                            dataType: this.getFieldDataType(m.vacademyField),
                        })),
                        createdAt: existingMapping.createdAt,
                        updatedAt: new Date().toISOString(),
                        instituteId: existingMapping.instituteId,
                    };
                    this.mappingsCache[existingIndex] = updatedMapping;
                    return updatedMapping;
                }
            }
            throw error;
        }
    }

    // Delete template mapping
    async deleteTemplateMapping(mappingId: string): Promise<void> {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const url = `${API_BASE_URL}/whatsapp/mappings/${mappingId}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete mapping: ${response.status} ${errorText}`);
            }

            // Remove from cache
            this.mappingsCache = this.mappingsCache.filter(m => m.id !== mappingId);
        } catch (error) {
            console.error('Error deleting template mapping:', error);
            throw error;
        }
    }

    // Get all template mappings for the institute
    async getAllMappings(): Promise<WhatsAppTemplateMapping[]> {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const instituteId = getInstituteId();
            const url = `${API_BASE_URL}/whatsapp/mappings?instituteId=${instituteId}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to get mappings: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            this.mappingsCache = result.mappings || [];
            return this.mappingsCache;
        } catch (error) {
            console.error('Error getting all mappings:', error);
            // Return mock mappings when API is not available
            console.warn('WhatsApp mappings API not available, returning mock mappings');
            return this.getMockMappings();
        }
    }

    // Mock mappings for development when API is not available
    private getMockMappings(): WhatsAppTemplateMapping[] {
        const mockMappings: WhatsAppTemplateMapping[] = [
            {
                id: 'mock-mapping-1',
                templateName: 'course_enrollment_confirmation',
                templateId: 'course_enrollment_confirmation',
                language: 'en',
                mappings: [
                    {
                        metaPlaceholder: '1',
                        vacademyField: 'learner.firstName',
                        fieldLabel: 'First Name',
                        dataType: 'text'
                    },
                    {
                        metaPlaceholder: '2',
                        vacademyField: 'course.name',
                        fieldLabel: 'Course Name',
                        dataType: 'text'
                    },
                    {
                        metaPlaceholder: '3',
                        vacademyField: 'batch.startDate',
                        fieldLabel: 'Start Date',
                        dataType: 'date'
                    }
                ],
                createdAt: '2024-01-20T10:00:00Z',
                updatedAt: '2024-01-20T10:00:00Z',
                instituteId: getInstituteId() || 'unknown',
            },
            {
                id: 'mock-mapping-3',
                templateName: 'batch_completion_congratulations',
                templateId: 'batch_completion_congratulations',
                language: 'en',
                mappings: [
                    {
                        metaPlaceholder: '1',
                        vacademyField: 'learner.fullName',
                        fieldLabel: 'Full Name',
                        dataType: 'text'
                    },
                    {
                        metaPlaceholder: '2',
                        vacademyField: 'batch.name',
                        fieldLabel: 'Batch Name',
                        dataType: 'text'
                    }
                ],
                createdAt: '2024-01-18T10:00:00Z',
                updatedAt: '2024-01-18T10:00:00Z',
                instituteId: getInstituteId() || 'unknown',
            }
        ];

        this.mappingsCache = mockMappings;
        return mockMappings;
    }

    // Get Vacademy data fields for mapping
    getVacademyDataFields(): VacademyDataField[] {
        return VACADEMY_DATA_FIELDS;
    }

    // Get fields by category
    getFieldsByCategory(category: string): VacademyDataField[] {
        return VACADEMY_DATA_FIELDS.filter((field: VacademyDataField) => field.category === category);
    }

    // Get available categories
    getAvailableCategories(): string[] {
        const categories = new Set(VACADEMY_DATA_FIELDS.map((field: VacademyDataField) => field.category));
        return Array.from(categories);
    }

    // Clear cache
    clearCache(): void {
        this.metaTemplatesCache = [];
        this.mappingsCache = [];
        this.lastSyncTime = null;
    }

    // Get last sync time
    getLastSyncTime(): Date | null {
        return this.lastSyncTime;
    }
}

// Export singleton instance
export const whatsappTemplateService = WhatsAppTemplateService.getInstance();
