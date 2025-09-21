/**
 * Test script for bulk email functionality
 * This can be used to test the implementation
 */

import { bulkEmailService } from './bulkEmailService';

// Test data
const testStudents = [
    {
        user_id: 'test-1',
        full_name: 'John Doe',
        email: 'john@example.com',
        mobile_number: '1234567890',
        username: 'john.doe',
        created_at: '2024-01-01',
        institute_enrollment_id: 'ENR-001',
        package_session_id: 'PKG-001',
        linked_institute_name: 'Test Institute'
    },
    {
        user_id: 'test-2',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        mobile_number: '0987654321',
        username: 'jane.smith',
        created_at: '2024-01-02',
        institute_enrollment_id: 'ENR-002',
        package_session_id: 'PKG-002',
        linked_institute_name: 'Test Institute'
    }
];

const testTemplate = `
Hi {{name}},

Your course: {{course_name}}
Batch: {{batch_name}}
Institute: {{institute_name}}
Attendance: {{attendance_percentage}}%

Best regards,
{{institute_name}}
`;

const testSubject = 'Welcome to {{course_name}} - {{institute_name}}';

// Test function
export async function testBulkEmail() {
    console.log('Testing bulk email functionality...');

    try {
        // Test template validation
        const validation = await bulkEmailService.validateTemplate({
            template: testTemplate,
            subject: 'Test Subject',
            students: testStudents,
            context: 'student-management',
            pageContext: 'student-management',
            notificationType: 'EMAIL',
            source: 'test',
            sourceId: 'test-1'
        });
        console.log('Template validation:', validation);

        // Test preview
        const preview = await bulkEmailService.previewTemplate(
            testTemplate,
            testSubject,
            'student-management',
            testStudents[0]
        );
        console.log('Template preview:', preview);

        // Test bulk email (this will fail with 404 but shows the structure)
        const result = await bulkEmailService.sendBulkEmail({
            template: testTemplate,
            subject: testSubject,
            students: testStudents,
            context: 'student-management',
            notificationType: 'EMAIL',
            source: 'TEST_BULK_EMAIL',
            sourceId: 'test-source-id'
        });

        console.log('Bulk email result:', result);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Export for testing
export { testStudents, testTemplate, testSubject };
