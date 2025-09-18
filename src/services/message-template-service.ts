import {
    MessageTemplate,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateListResponse,
} from '@/types/message-template-types';
import { getInstituteId } from '@/constants/helper';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://backend-stage.vacademy.io/admin-core-service';

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

// Helper function to safely parse settingJson
const parseSettingJson = (
    settingJson: string | undefined
): { variables: string[]; isDefault: boolean } => {
    if (!settingJson || settingJson === 'string') {
        return { variables: [], isDefault: false };
    }

    try {
        const settings = JSON.parse(settingJson);
        return {
            variables: settings.variables || [],
            isDefault: settings.isDefault || false,
        };
    } catch (error) {
        console.warn('Failed to parse settingJson:', settingJson, error);
        return { variables: [], isDefault: false };
    }
};

export const createMessageTemplate = async (
    template: CreateTemplateRequest
): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const instituteId = getInstituteId();
        const response = await fetch(`${API_BASE_URL}/institute/template/v1/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                type: template.type,
                vendorId: 'default',
                instituteId: instituteId,
                name: template.name,
                subject: template.subject || '',
                content: template.content,
                contentType: 'text/plain',
                settingJson: {
                    variables: template.variables || [],
                    isDefault: template.isDefault || false,
                },
                canDelete: true,
                createdBy: 'current-user',
                updatedBy: 'current-user',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create template: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Transform the API response to match our MessageTemplate interface
        return {
            id: result.id || result.templateId,
            name: result.name,
            type: result.type?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
            subject: result.subject || '',
            content: result.content,
            variables: parseSettingJson(result.settingJson).variables,
            isDefault: parseSettingJson(result.settingJson).isDefault,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error creating template:', error);
        throw error;
    }
};

export const getMessageTemplates = async (
    type?: 'EMAIL' | 'WHATSAPP',
    page = 1,
    limit = 50
): Promise<TemplateListResponse> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const instituteId = getInstituteId();

        // Always use the general endpoint to get all templates, then filter client-side
        // This ensures we get all templates regardless of case sensitivity issues
        const url = `${API_BASE_URL}/institute/template/v1/institute/${instituteId}`;

        const response = await fetch(url, {
            headers: {
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch templates: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Debug logging to understand the API response structure
        console.log('getMessageTemplates API Response:', {
            type,
            url,
            result,
            isArray: Array.isArray(result),
        });

        // Transform the API response to match our TemplateListResponse interface
        // The API returns an array directly, not wrapped in an object
        let templates = Array.isArray(result) ? result : result.templates || result.data || [];

        // Filter by type if specified (normalize both to uppercase for comparison)
        if (type) {
            templates = templates.filter((template: Record<string, unknown>) => {
                const templateType = (template.type as string)?.toUpperCase();
                const filterType = type.toUpperCase();
                return templateType === filterType;
            });
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTemplates = templates.slice(startIndex, endIndex);

        // Transform templates to match our MessageTemplate interface
        const transformedTemplates = paginatedTemplates.map((template: Record<string, unknown>) => {
            const { variables, isDefault } = parseSettingJson(template.settingJson as string);

            return {
                id: (template.id || template.templateId) as string,
                name: template.name as string,
                type: (template.type as string)?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
                subject: (template.subject as string) || '',
                content: template.content as string,
                variables: variables,
                isDefault: isDefault,
                createdAt: (template.createdAt as string) || new Date().toISOString(),
                updatedAt: (template.updatedAt as string) || new Date().toISOString(),
            };
        });

        console.log('Transformed templates:', {
            originalCount: templates.length,
            paginatedCount: paginatedTemplates.length,
            transformedCount: transformedTemplates.length,
            transformedTemplates,
        });

        return {
            templates: transformedTemplates,
            total: templates.length,
            page: page,
            limit: limit,
        };
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }
};

export const getMessageTemplate = async (id: string): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch(`${API_BASE_URL}/institute/template/v1/get/${id}`, {
            headers: {
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch template: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Transform the API response to match our MessageTemplate interface
        return {
            id: result.id || result.templateId,
            name: result.name,
            type: result.type?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
            subject: result.subject || '',
            content: result.content,
            variables: parseSettingJson(result.settingJson).variables,
            isDefault: parseSettingJson(result.settingJson).isDefault,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching template:', error);
        throw error;
    }
};

export const updateMessageTemplate = async (
    template: UpdateTemplateRequest
): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const { id, ...updateData } = template;

        const response = await fetch(`${API_BASE_URL}/institute/template/v1/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                id: id,
                type: updateData.type || 'email',
                vendorId: 'default',
                name: updateData.name || '',
                subject: updateData.subject || '',
                content: updateData.content || '',
                contentType: 'text/plain',
                settingJson: {
                    variables: updateData.variables || [],
                    isDefault: updateData.isDefault || false,
                },
                canDelete: true,
                updatedBy: 'current-user',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update template: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Transform the API response to match our MessageTemplate interface
        return {
            id: result.id || result.templateId,
            name: result.name,
            type: result.type?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
            subject: result.subject || '',
            content: result.content,
            variables: parseSettingJson(result.settingJson).variables,
            isDefault: parseSettingJson(result.settingJson).isDefault,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error updating template:', error);
        throw error;
    }
};

export const deleteMessageTemplate = async (id: string): Promise<void> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch(`${API_BASE_URL}/institute/template/v1/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete template: ${response.status} ${errorText}`);
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
};

export const setDefaultTemplate = async (
    id: string,
    type: 'EMAIL' | 'WHATSAPP'
): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch(`${API_BASE_URL}/institute/template/v1/set-default/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ type }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to set default template: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Transform the API response to match our MessageTemplate interface
        return {
            id: result.id || result.templateId,
            name: result.name,
            type: result.type?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
            subject: result.subject || '',
            content: result.content,
            variables: parseSettingJson(result.settingJson).variables,
            isDefault: parseSettingJson(result.settingJson).isDefault,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error setting default template:', error);
        throw error;
    }
};

export const duplicateTemplate = async (id: string): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch(`${API_BASE_URL}/institute/template/v1/duplicate/${id}`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to duplicate template: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Transform the API response to match our MessageTemplate interface
        return {
            id: result.id || result.templateId,
            name: result.name,
            type: result.type?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
            subject: result.subject || '',
            content: result.content,
            variables: parseSettingJson(result.settingJson).variables,
            isDefault: parseSettingJson(result.settingJson).isDefault,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error duplicating template:', error);
        throw error;
    }
};

// Search templates with filters
export const searchMessageTemplates = async (searchParams: {
    type?: 'EMAIL' | 'WHATSAPP';
    searchText?: string;
    canDelete?: boolean;
    contentType?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}): Promise<TemplateListResponse> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const instituteId = getInstituteId();
        const searchData = {
            instituteId: instituteId,
            type: searchParams.type || '',
            vendorId: 'default',
            searchText: searchParams.searchText || '',
            canDelete: searchParams.canDelete ?? true,
            contentType: searchParams.contentType || 'text/plain',
            page: searchParams.page || 0,
            size: searchParams.size || 50,
            sortBy: searchParams.sortBy || 'createdAt',
            sortDirection: searchParams.sortDirection || 'desc',
        };

        const response = await fetch(`${API_BASE_URL}/institute/template/v1/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(searchData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to search templates: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        // Transform the API response to match our TemplateListResponse interface
        const templates = (result.content || result.templates || result.data || []).map(
            (template: Record<string, unknown>) => {
                const { variables, isDefault } = parseSettingJson(template.settingJson as string);
                return {
                    id: (template.id || template.templateId) as string,
                    name: template.name as string,
                    type: (template.type as string)?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
                    subject: (template.subject as string) || '',
                    content: template.content as string,
                    variables: variables,
                    isDefault: isDefault,
                    createdAt: (template.createdAt as string) || new Date().toISOString(),
                    updatedAt: (template.updatedAt as string) || new Date().toISOString(),
                };
            }
        );

        return {
            templates,
            total: result.totalElements || result.total || 0,
            page: result.number || result.page || 0,
            limit: result.size || result.limit || 50,
        };
    } catch (error) {
        console.error('Error searching templates:', error);
        throw error;
    }
};
