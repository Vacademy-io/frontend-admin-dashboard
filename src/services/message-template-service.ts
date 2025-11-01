import {
    MessageTemplate,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateListResponse,
} from '@/types/message-template-types';
import { getInstituteId } from '@/constants/helper';
import {
    CREATE_MESSAGE_TEMPLATE,
    GET_MESSAGE_TEMPLATES,
    GET_MESSAGE_TEMPLATE,
    UPDATE_MESSAGE_TEMPLATE,
    DELETE_MESSAGE_TEMPLATE,
    SEARCH_MESSAGE_TEMPLATES,
    MESSAGE_TEMPLATE_BASE,
} from '@/constants/urls';

import { getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

// Get access token from cookies using the standard method
const getAccessToken = (): string | null => {
    return getTokenFromCookie(TokenKey.accessToken);
};

// Helper function to safely parse settingJson
const parseSettingJson = (
    settingJson: string | object | undefined
): { variables: string[]; isDefault: boolean; templateType: 'marketing' | 'utility' | 'transactional' } => {
    if (!settingJson) {
        return { variables: [], isDefault: false, templateType: 'utility' };
    }

    // If it's already an object, return it directly
    if (typeof settingJson === 'object') {
        return {
            variables: (settingJson as any).variables || [],
            isDefault: (settingJson as any).isDefault || false,
            templateType: ((settingJson as any).templateType as 'marketing' | 'utility' | 'transactional') || 'utility',
        };
    }

    // If it's a string, try to parse it
    if (typeof settingJson === 'string') {
        try {
            const settings = JSON.parse(settingJson);
            return {
                variables: settings.variables || [],
                isDefault: settings.isDefault || false,
                templateType: (settings.templateType as 'marketing' | 'utility' | 'transactional') || 'utility',
            };
        } catch (error) {
            return { variables: [], isDefault: false, templateType: 'utility' };
        }
    }

    return { variables: [], isDefault: false, templateType: 'utility' };
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
        if (!instituteId) {
            throw new Error('Institute ID not found. Please login again.');
        }
        
        const payload = {
            type: template.type?.toLowerCase() || 'email',
            vendorId: 'default',
            instituteId: instituteId,
            name: template.name,
            subject: template.subject || '',
            content: template.content, // HTML content from GrapesJS editor
            contentType: 'text/html', // HTML content with base64 images for email templates
            settingJson: {
                variables: template.variables || [],
                isDefault: template.isDefault || false,
                templateType: template.templateType || 'utility',
            },
            dynamicParameters: {},
            canDelete: true,
            createdBy: 'current-user',
            updatedBy: 'current-user',
        };

        const response = await fetch(CREATE_MESSAGE_TEMPLATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin,
                'Referer': window.location.origin + '/',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Create template API error:', {
                status: response.status,
                statusText: response.statusText,
                errorText,
                hasToken: !!accessToken,
                hasInstituteId: !!instituteId,
            });
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
            templateType: parseSettingJson(result.settingJson).templateType,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
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
        const url = `${GET_MESSAGE_TEMPLATES}/${instituteId}`;

        const response = await fetch(url, {
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin,
                'Referer': window.location.origin + '/',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch templates: ${response.status} ${errorText}`);
        }

        const result = await response.json();

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
            const { variables, isDefault, templateType } = parseSettingJson(template.settingJson as string);

            return {
                id: (template.id || template.templateId) as string,
                name: template.name as string,
                type: (template.type as string)?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
                subject: (template.subject as string) || '',
                content: template.content as string,
                variables: variables,
                isDefault: isDefault,
                templateType: templateType,
                createdAt: (template.createdAt as string) || new Date().toISOString(),
                updatedAt: (template.updatedAt as string) || new Date().toISOString(),
            };
        });

        return {
            templates: transformedTemplates,
            total: templates.length,
            page: page,
            limit: limit,
        };
    } catch (error) {
        throw error;
    }
};

export const getMessageTemplate = async (id: string): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        if (!id || id.trim() === '') {
            throw new Error('Template ID is required');
        }

        const instituteId = getInstituteId();
        
        // Try different endpoint formats
        // Format 1: /get/{id} (current)
        // Format 2: /{id} (like delete endpoint)
        // Format 3: /get?id={id}&instituteId={instituteId} (with query parameters)
        // Format 4: /{id}?instituteId={instituteId}
        const urls = [
            `${GET_MESSAGE_TEMPLATE}/${id}`,
            `${MESSAGE_TEMPLATE_BASE}/${id}`,
            `${GET_MESSAGE_TEMPLATE}?id=${id}&instituteId=${instituteId}`,
            `${MESSAGE_TEMPLATE_BASE}/${id}?instituteId=${instituteId}`,
        ];

        let lastError: Error | null = null;

        for (const url of urls) {
            try {
                console.log('Trying to fetch template from URL:', url);

                const response = await fetch(url, {
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'Origin': window.location.origin,
                        'Referer': window.location.origin + '/',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Template API response:', result);

                    // Transform the API response to match our MessageTemplate interface
                    const transformed = {
                        id: result.id || result.templateId,
                        name: result.name,
                        type: result.type?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
                        subject: result.subject || '',
                        content: result.content || '',
                        variables: parseSettingJson(result.settingJson).variables,
                        isDefault: parseSettingJson(result.settingJson).isDefault,
                        templateType: parseSettingJson(result.settingJson).templateType,
                        createdAt: result.createdAt || new Date().toISOString(),
                        updatedAt: result.updatedAt || new Date().toISOString(),
                    };

                    console.log('Transformed template:', {
                        id: transformed.id,
                        name: transformed.name,
                        type: transformed.type,
                        hasContent: !!transformed.content,
                        contentLength: transformed.content?.length || 0,
                    });

                    return transformed;
                } else {
                    const errorText = await response.text();
                    lastError = new Error(`Failed to fetch template: ${response.status} ${errorText || response.statusText}`);
                    console.warn(`Attempt failed for ${url}:`, {
                        status: response.status,
                        statusText: response.statusText,
                        errorText,
                    });
                }
            } catch (err) {
                lastError = err as Error;
                console.warn(`Error trying ${url}:`, err);
            }
        }

        // If all attempts failed, throw the last error
        if (lastError) {
            console.error('All endpoint attempts failed:', urls);
            throw lastError;
        }

        throw new Error('Failed to fetch template: All endpoint formats failed');
    } catch (error) {
        console.error('Error in getMessageTemplate:', error);
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

        const instituteId = getInstituteId();
        if (!instituteId) {
            throw new Error('Institute ID not found. Please login again.');
        }
        
        const { id, ...updateData } = template;

        const payload = {
            id: id,
            type: updateData.type?.toLowerCase() || 'email',
            vendorId: 'default',
            instituteId: instituteId,
            name: updateData.name || '',
            subject: updateData.subject || '',
            content: updateData.content || '', // HTML content from GrapesJS editor
            contentType: 'text/html', // HTML content with base64 images for email templates
            settingJson: {
                variables: updateData.variables || [],
                isDefault: updateData.isDefault || false,
                templateType: updateData.templateType || 'utility',
            },
            dynamicParameters: {},
            canDelete: true,
            updatedBy: 'current-user',
        };


        const response = await fetch(UPDATE_MESSAGE_TEMPLATE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin,
                'Referer': window.location.origin + '/',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update template API error:', {
                status: response.status,
                statusText: response.statusText,
                errorText,
                hasToken: !!accessToken,
                hasInstituteId: !!instituteId,
            });
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
            templateType: parseSettingJson(result.settingJson).templateType,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        throw error;
    }
};

export const deleteMessageTemplate = async (id: string): Promise<void> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        // Use correct URL structure: base URL + ID (matching your curl command)
        const deleteUrl = `${MESSAGE_TEMPLATE_BASE}/${id}`;

        // Check if template has deletion restrictions
        try {
            const template = await getMessageTemplate(id);
            if (template.isDefault) {
                throw new Error('Cannot delete default template');
            }
        } catch (error) {
            // Continue with deletion even if template fetch fails
        }

        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete template: ${response.status} ${errorText}`);
        }
    } catch (error) {
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

        const response = await fetch(`${MESSAGE_TEMPLATE_BASE}/set-default/${id}`, {
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
            templateType: parseSettingJson(result.settingJson).templateType,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
        throw error;
    }
};

export const duplicateTemplate = async (id: string): Promise<MessageTemplate> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch(`${MESSAGE_TEMPLATE_BASE}/duplicate/${id}`, {
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
            templateType: parseSettingJson(result.settingJson).templateType,
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
        };
    } catch (error) {
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

        const response = await fetch(SEARCH_MESSAGE_TEMPLATES, {
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
                const { variables, isDefault, templateType } = parseSettingJson(template.settingJson as string);
                return {
                    id: (template.id || template.templateId) as string,
                    name: template.name as string,
                    type: (template.type as string)?.toUpperCase() || 'EMAIL', // Normalize type to uppercase
                    subject: (template.subject as string) || '',
                    content: template.content as string,
                    variables: variables,
                    isDefault: isDefault,
                    templateType: templateType,
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
        throw error;
    }
};
