import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Route } from '../index';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import RootErrorComponent from '@/components/core/deafult-error';
import { CertificateStudentData, CertificateGenerationSession } from '@/types/certificate/certificate-types';
import { StudentDataStep } from './student-data-step/student-data-step';
import { PdfAnnotationStep } from './pdf-annotation-step/pdf-annotation-step';
import { MyButton } from '@/components/design-system/button';
import { ArrowLeft, Certificate, FileText, Upload } from '@phosphor-icons/react';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { fetchStudentDetailsByIds } from '../-services/getStudentsByIds';

export const CertificateStudentDataSection = () => {
    console.log('🚀 CertificateStudentDataSection component initializing');
    
    const { setNavHeading } = useNavHeadingStore();
    const search = useSearch({ from: Route.id });
    const router = useRouter();
    
    console.log('🔍 Hooks initialized, search object:', search);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<CertificateGenerationSession>({
        selectedStudents: [],
        currentStep: 'student_data',
    });
    
    console.log('🔍 State initialized, initial session:', session);

    useEffect(() => {
        console.log('🔍 Setting nav heading to "Certificate Generation"');
        setNavHeading('Certificate Generation');
    }, [setNavHeading]);

    useEffect(() => {
        const loadSelectedStudents = async () => {
            try {
                console.log('🔍 Certificate Generation - Starting to load students');
                console.log('🔍 Raw search.students:', search.students);
                
                if (!search.students) {
                    console.log('❌ No students parameter found in URL');
                    setError('No students selected for certificate generation');
                    setIsLoading(false);
                    return;
                }

                console.log('🔍 Processing students parameter...');
                console.log('🔍 search.students type:', typeof search.students);
                console.log('🔍 search.students value:', search.students);
                
                let studentIds: string[];
                
                // Handle both cases: already parsed array or string that needs parsing
                if (Array.isArray(search.students)) {
                    console.log('🔍 Students parameter is already an array');
                    studentIds = search.students;
                } else if (typeof search.students === 'string') {
                    console.log('🔍 Students parameter is a string, attempting to decode and parse...');
                    const decodedStudents = decodeURIComponent(search.students);
                    console.log('🔍 Decoded students string:', decodedStudents);
                    studentIds = JSON.parse(decodedStudents);
                } else {
                    throw new Error('Invalid students parameter type');
                }
                
                console.log('🔍 Final student IDs:', studentIds);
                console.log('🔍 Student IDs type:', typeof studentIds, 'Array?', Array.isArray(studentIds));
                
                if (!Array.isArray(studentIds)) {
                    throw new Error('Student IDs is not an array');
                }

                console.log('🔍 Fetching real student data for', studentIds.length, 'students...');
                
                // Fetch real student data from API using studentIds
                const realStudents = await fetchStudentDetailsByIds(studentIds);
                
                console.log('✅ Real student data fetched successfully:', realStudents.map(s => ({ id: s.user_id, name: s.full_name, email: s.email })));

                setSession(prev => ({
                    ...prev,
                    selectedStudents: realStudents,
                }));
                
                console.log('✅ Session updated successfully');
                setIsLoading(false);
            } catch (err) {
                console.error('❌ Error in loadSelectedStudents:', err);
                console.error('❌ Error details:', {
                    message: err instanceof Error ? err.message : 'Unknown error',
                    stack: err instanceof Error ? err.stack : undefined,
                    searchStudents: search.students
                });
                setError(`Failed to load student data: ${err instanceof Error ? err.message : 'Unknown error'}`);
                setIsLoading(false);
            }
        };

        console.log('🚀 Certificate Generation component mounting/updating');
        loadSelectedStudents();
    }, [search.students]);

    const handleStepChange = (step: 'student_data' | 'pdf_annotation') => {
        setSession(prev => ({ ...prev, currentStep: step }));
    };

    const handleSessionUpdate = (updates: Partial<CertificateGenerationSession>) => {
        setSession(prev => ({ ...prev, ...updates }));
    };

    if (isLoading) {
        console.log('🔄 Component is loading...');
        return <DashboardLoader />;
    }
    
    if (error) {
        console.log('❌ Component has error:', error);
        return <RootErrorComponent />;
    }

    console.log('🔍 About to render main component, session:', session);

    const steps = [
        { key: 'student_data', label: 'Student Data & CSV Upload', icon: FileText },
        { key: 'pdf_annotation', label: 'PDF Annotation', icon: Certificate },
    ];

    try {
        console.log('🎨 Rendering main component JSX...');
        return (
        <section className="animate-fadeIn flex max-w-full flex-col gap-6 overflow-visible">
            {/* Header with back navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <MyButton
                        buttonType="secondary"
                        scale="small"
                        onClick={() => router.navigate({ to: '/manage-students/students-list' })}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Students
                    </MyButton>
                    
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 p-2 shadow-sm">
                            <Certificate className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-neutral-700">
                                Certificate Generation
                            </h1>
                            <p className="text-sm text-neutral-500">
                                {session.selectedStudents.length} students selected
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center gap-1 rounded-lg bg-neutral-50 p-1">
                {steps.map((step, index) => {
                    const isActive = session.currentStep === step.key;
                    const isCompleted = steps.findIndex(s => s.key === session.currentStep) > index;
                    const IconComponent = step.icon;
                    
                    return (
                        <button
                            key={step.key}
                            onClick={() => handleStepChange(step.key as 'student_data' | 'pdf_annotation')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : isCompleted
                                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                    : 'text-neutral-500 hover:bg-white hover:text-neutral-700'
                            )}
                        >
                            <IconComponent 
                                className={cn(
                                    'size-4',
                                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-neutral-400'
                                )} 
                            />
                            {step.label}
                        </button>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="min-h-[600px]">
                {session.currentStep === 'student_data' && (
                    <StudentDataStep 
                        session={session}
                        onSessionUpdate={handleSessionUpdate}
                        onNextStep={() => handleStepChange('pdf_annotation')}
                    />
                )}
                {session.currentStep === 'pdf_annotation' && (
                    <PdfAnnotationStep 
                        session={session}
                        onSessionUpdate={handleSessionUpdate}
                        onPrevStep={() => handleStepChange('student_data')}
                    />
                )}
            </div>
        </section>
        );
    } catch (renderError) {
        console.error('❌ Error rendering main component:', renderError);
        return <RootErrorComponent />;
    }
}; 