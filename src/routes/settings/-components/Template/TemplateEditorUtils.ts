import { CreateTemplateRequest } from '@/types/message-template-types';

export const generatePreview = (formData: CreateTemplateRequest, customMessage: string) => {
    const currentDate = new Date().toLocaleDateString();

    const replacements = {
        '{{name}}': 'John Doe',
        '{{email}}': 'john.doe@example.com',
        '{{mobile_number}}': '+1234567890',
        '{{custom_message_text}}': customMessage,
        '{{course_name}}': 'Mathematics Course',
        '{{batch_name}}': 'Batch A',
        '{{session_name}}': 'Session 2024',
        '{{username}}': 'johndoe',
        '{{registration_date}}': '2024-01-15',
        '{{current_date}}': currentDate,
        '{{student_name}}': 'John Doe',
        '{{student_email}}': 'john.doe@example.com',
        '{{student_phone}}': '+1234567890',
        '{{student_id}}': 'STU001',
        '{{enrollment_number}}': 'ENR001',
    };

    let previewSubject = formData.subject || '';
    let previewContent = formData.content || '';

    // Replace all placeholders
    Object.entries(replacements).forEach(([placeholder, value]) => {
        previewSubject = previewSubject.replace(
            new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
            value
        );
        previewContent = previewContent.replace(
            new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
            value
        );
    });

    return { subject: previewSubject, content: previewContent };
};

export const extractVariablesFromContent = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(variableRegex);
    return matches ? [...new Set(matches)] : [];
};

export const insertVariableAtCursor = (
    textarea: HTMLTextAreaElement,
    variable: string,
    currentContent: string,
    setContent: (content: string) => void
) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);
    const newContent = before + variable + after;

    setContent(newContent);

    // Set cursor position after the inserted variable
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
};

