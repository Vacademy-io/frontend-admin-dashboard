import { useState, useEffect, useCallback } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Helmet } from 'react-helmet';
import { useNavigate } from '@tanstack/react-router';
import {
    User,
    GraduationCap,
    Users,
    MapPin,
    Check,
    CaretLeft,
    CaretRight,
    FloppyDisk,
    Warning,
    CaretDown,
} from '@phosphor-icons/react';
import { MyButton } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import { StudentDetailsSection } from './sections/StudentDetailsSection';
import { AcademicInfoSection } from './sections/AcademicInfoSection';
import { ParentGuardianSection } from './sections/ParentGuardianSection';
import { AddressSection } from './sections/AddressSection';
import type { Registration } from '../../-types/registration-types';

interface FormSection {
    id: string;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    isComplete: boolean;
    hasErrors: boolean;
}

// Generate new registration ID
const generateRegistrationId = () => {
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `REG-${year}-${String(num).padStart(4, '0')}`;
};

// Initial empty form data
// Initial empty form data
const getInitialFormData = (): Partial<Registration> => ({
    id: generateRegistrationId(),
    status: 'DRAFT',

    // Student
    studentName: '',
    dateOfBirth: '',
    gender: undefined,
    nationality: 'Indian',
    religion: '',
    category: '',
    bloodGroup: '',
    motherTongue: '',
    languagesKnown: [],

    // Academic
    applyingForClass: '',
    preferredBoard: '',
    academicYear: '2025-2026',
    mediumOfInstruction: '',
    previousSchoolName: '',
    previousSchoolBoard: '',
    lastClassAttended: '',
    previousSchoolAddress: '',

    // Parents
    fatherInfo: {
        name: '',
        mobile: '',
        email: '',
        occupation: '',
        annualIncome: '',
    },
    motherInfo: {
        name: '',
        mobile: '',
        email: '',
        occupation: '',
        annualIncome: '',
    },
    guardianInfo: undefined,

    // Emergency Contact
    emergencyContact: {
        name: '',
        relationship: '',
        mobile: '',
    },

    // Address
    // Address
    currentAddress: {
        houseNo: '',
        street: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        pinCode: '',
        country: 'India',
        addressLine1: '', // fallback or remove if not needed
        addressLine2: '',
    },
    permanentAddress: {
        houseNo: '',
        street: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        pinCode: '',
        country: 'India',
        addressLine1: '',
        addressLine2: '',
    },

    siblings: [],
    hasSiblingsInSchool: false,
    documents: [],
});

export function RegistrationFormPage() {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState(0);
    const [formData, setFormData] = useState<Partial<Registration>>(getInitialFormData());
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);

    const handleSaveDraft = useCallback(
        async (isAutoSave = false) => {
            setIsSaving(true);
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500));
                setLastSaved(new Date());
                if (!isAutoSave) {
                    console.log('Draft saved:', formData);
                }
            } catch (error) {
                console.error('Failed to save draft:', error);
            } finally {
                setIsSaving(false);
            }
        },
        [formData]
    );

    const sections: FormSection[] = [
        {
            id: 'student',
            label: 'Student Details',
            shortLabel: 'Student',
            icon: <User size={20} />,
            isComplete: Boolean(
                formData.studentName &&
                    formData.dateOfBirth &&
                    formData.gender &&
                    formData.nationality
            ),
            hasErrors: false,
        },
        {
            id: 'academic',
            label: 'Academic Info',
            shortLabel: 'Academic',
            icon: <GraduationCap size={20} />,
            isComplete: Boolean(
                formData.applyingForClass && formData.preferredBoard && formData.previousSchoolName
            ),
            hasErrors: false,
        },
        {
            id: 'parent',
            label: 'Parent & Guardian',
            shortLabel: 'Parent',
            icon: <Users size={20} />,
            isComplete: Boolean(
                (formData.fatherInfo?.name && formData.fatherInfo?.mobile) ||
                    (formData.motherInfo?.name && formData.motherInfo?.mobile)
            ),
            hasErrors: false,
        },
        {
            id: 'address',
            label: 'Address',
            shortLabel: 'Address',
            icon: <MapPin size={20} />,
            isComplete: Boolean(
                formData.currentAddress?.city &&
                    formData.currentAddress?.state &&
                    formData.currentAddress?.pincode
            ),
            hasErrors: false,
        },
    ];

    const completedSections = sections.filter((s) => s.isComplete).length;
    const progress = Math.round((completedSections / sections.length) * 100);

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">New Registration</span>
            </div>
        );
    }, [setNavHeading]);

    // Auto-save every 30 seconds
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            handleSaveDraft(true);
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [formData, handleSaveDraft]);

    const handleNext = () => {
        if (activeSection < sections.length - 1) {
            setActiveSection(activeSection + 1);
        }
    };

    const handlePrevious = () => {
        if (activeSection > 0) {
            setActiveSection(activeSection - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('Registration submitted:', formData);
            navigate({ to: '/admissions/registration/new' });
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const updateFormData = (updates: Partial<Registration>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const renderSectionContent = () => {
        switch (activeSection) {
            case 0:
                return (
                    <StudentDetailsSection formData={formData} updateFormData={updateFormData} />
                );
            case 1:
                return <AcademicInfoSection formData={formData} updateFormData={updateFormData} />;
            case 2:
                return (
                    <ParentGuardianSection formData={formData} updateFormData={updateFormData} />
                );
            case 3:
                return <AddressSection formData={formData} updateFormData={updateFormData} />;
            default:
                return null;
        }
    };

    return (
        <>
            <Helmet>
                <title>New Registration - Admissions</title>
                <meta name="description" content="Complete student registration form" />
            </Helmet>

            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">
                            Student Registration Form
                        </h1>
                        <p className="mt-1 flex items-center gap-3 text-sm text-neutral-600">
                            <span className="font-mono font-medium text-primary-600">
                                {formData.id}
                            </span>
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                Draft
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Progress */}
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-200">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-neutral-600">
                                {progress}%
                            </span>
                        </div>
                        {/* Last saved */}
                        {lastSaved && (
                            <span className="hidden text-xs text-neutral-500 sm:block">
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex min-h-0 flex-1 gap-6">
                    {/* Mobile Navigation Dropdown */}
                    <div className="mb-4 lg:hidden">
                        <button
                            onClick={() => setShowMobileNav(!showMobileNav)}
                            className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3"
                        >
                            <div className="flex items-center gap-2">
                                {sections[activeSection]?.icon}
                                <span className="font-medium">
                                    {sections[activeSection]?.label}
                                </span>
                            </div>
                            <CaretDown
                                size={18}
                                className={cn(
                                    'transition-transform',
                                    showMobileNav && 'rotate-180'
                                )}
                            />
                        </button>
                        {showMobileNav && (
                            <div className="absolute inset-x-4 z-10 mt-1 rounded-lg border border-neutral-200 bg-white shadow-lg">
                                {sections.map((section, index) => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(index);
                                            setShowMobileNav(false);
                                        }}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                            index === activeSection
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'hover:bg-neutral-50'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                                                section.isComplete
                                                    ? 'bg-green-100 text-green-700'
                                                    : index === activeSection
                                                      ? 'bg-primary-100 text-primary-700'
                                                      : 'bg-neutral-100 text-neutral-500'
                                            )}
                                        >
                                            {section.isComplete ? (
                                                <Check size={14} weight="bold" />
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Sidebar Navigation */}
                    <div className="sticky top-0 hidden h-fit w-64 shrink-0 rounded-lg border border-neutral-200 bg-white lg:block">
                        <div className="p-2">
                            {sections.map((section, index) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(index)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all',
                                        index === activeSection
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-neutral-600 hover:bg-neutral-50'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                                            section.isComplete
                                                ? 'bg-green-100 text-green-700'
                                                : index === activeSection
                                                  ? 'bg-primary-500 text-white'
                                                  : 'bg-neutral-100 text-neutral-500'
                                        )}
                                    >
                                        {section.isComplete ? (
                                            <Check size={16} weight="bold" />
                                        ) : (
                                            section.icon
                                        )}
                                    </span>
                                    <div className="flex flex-col">
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                index === activeSection
                                                    ? 'text-primary-700'
                                                    : 'text-neutral-700'
                                            )}
                                        >
                                            {section.label}
                                        </span>
                                        {section.hasErrors && (
                                            <span className="flex items-center gap-1 text-xs text-red-600">
                                                <Warning size={12} />
                                                Has errors
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
                        {/* Section Header */}
                        <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                                {sections[activeSection]?.icon}
                                {sections[activeSection]?.label}
                            </h2>
                            <p className="mt-1 text-sm text-neutral-500">
                                Step {activeSection + 1} of {sections.length}
                            </p>
                        </div>

                        {/* Section Content */}
                        <div className="flex-1 overflow-y-auto p-6">{renderSectionContent()}</div>

                        {/* Footer Navigation */}
                        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4">
                            <MyButton
                                buttonType="secondary"
                                onClick={handlePrevious}
                                disabled={activeSection === 0}
                                className="h-10"
                            >
                                <CaretLeft size={18} className="mr-1" />
                                Previous
                            </MyButton>

                            <div className="flex items-center gap-3">
                                <MyButton
                                    buttonType="secondary"
                                    onClick={() => handleSaveDraft(false)}
                                    disabled={isSaving}
                                    className="h-10"
                                >
                                    <FloppyDisk size={18} className="mr-1.5" />
                                    {isSaving ? 'Saving...' : 'Save Draft'}
                                </MyButton>

                                {activeSection === sections.length - 1 ? (
                                    <MyButton
                                        buttonType="primary"
                                        onClick={handleSubmit}
                                        disabled={isSaving}
                                        className="h-10 bg-green-600 hover:bg-green-700"
                                    >
                                        Submit Registration
                                    </MyButton>
                                ) : (
                                    <MyButton
                                        buttonType="primary"
                                        onClick={handleNext}
                                        className="h-10"
                                    >
                                        Next
                                        <CaretRight size={18} className="ml-1" />
                                    </MyButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
