import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { CertificateStudentDataSection } from './-components/certificate-student-data-section';
import { Helmet } from 'react-helmet';

interface CertificateStudentDataSearchParams {
    students?: string | string[];
}

export const Route = createFileRoute('/certificate-generation/student-data/')({
    component: CertificateStudentData,
    validateSearch: (search): CertificateStudentDataSearchParams => {
        console.log('🔍 Route validateSearch called with:', search);
        console.log('🔍 Route validateSearch - students type:', typeof search.students);
        console.log('🔍 Route validateSearch - students value:', search.students);
        
        const result = {
            students: search.students as string | string[] | undefined,
        };
        console.log('🔍 Route validateSearch result:', result);
        return result;
    },
});

export function CertificateStudentData() {
    console.log('🚀 CertificateStudentData component rendering');
    
    try {
        return (
            <LayoutContainer>
                <Helmet>
                    <title>Certificate Generation - Student Data</title>
                    <meta
                        name="description"
                        content="Manage student data and upload dynamic information for certificate generation."
                    />
                </Helmet>
                <CertificateStudentDataSection />
            </LayoutContainer>
        );
    } catch (error) {
        console.error('❌ Error rendering CertificateStudentData:', error);
        throw error;
    }
} 