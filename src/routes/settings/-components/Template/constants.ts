// Template badge configurations
export const TEMPLATE_TYPE_CONFIG = {
    marketing: 'bg-blue-100 text-blue-800 border-blue-200',
    utility: 'bg-orange-100 text-orange-800 border-orange-200',
    transactional: 'bg-purple-100 text-purple-800 border-purple-200',
} as const;

export const STATUS_CONFIG = {
    active: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
} as const;

export const WHATSAPP_STATUS_CONFIG = {
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    DISABLED: 'bg-gray-100 text-gray-600 border-gray-200',
} as const;

export const WHATSAPP_CATEGORY_CONFIG = {
    TRANSACTIONAL: 'bg-purple-100 text-purple-800 border-purple-200',
    MARKETING: 'bg-blue-100 text-blue-800 border-blue-200',
    UTILITY: 'bg-orange-100 text-orange-800 border-orange-200',
} as const;

export const MAPPING_STATUS_CONFIG = {
    configured: 'bg-blue-100 text-blue-800 border-blue-200',
    notConfigured: 'bg-gray-100 text-gray-600 border-gray-200',
} as const;

// Template type detection keywords
export const TEMPLATE_TYPE_KEYWORDS = {
    marketing: ['welcome', 'enrollment'],
    utility: ['assignment', 'reminder'],
    transactional: ['certificate', 'completion'],
} as const;

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
    short: {
        day: '2-digit' as const,
        month: '2-digit' as const,
        year: 'numeric' as const,
    },
    long: {
        year: 'numeric' as const,
        month: 'short' as const,
        day: 'numeric' as const,
        hour: '2-digit' as const,
        minute: '2-digit' as const,
    },
} as const;
