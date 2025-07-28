import { useState, useEffect } from 'react';
import { CourseSettingsForm } from './CourseSettingsForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2, Settings } from 'lucide-react';
import { getCourseSettings, saveCourseSettings, mergeWithDefaults } from '@/services/course-settings';
import { CourseSettingsData } from '@/types/course-settings';

const CourseSettings = () => {
    const [settings, setSettings] = useState<CourseSettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load course settings on component mount
    useEffect(() => {
        loadCourseSettings();
    }, []);

    const loadCourseSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const courseSettings = await getCourseSettings();
            // Ensure all fields are present by merging with defaults
            const mergedSettings = mergeWithDefaults(courseSettings);
            setSettings(mergedSettings);
        } catch (error) {
            handleError(error, 'load course settings');
        } finally {
            setLoading(false);
        }
    };

    // Error handling for component operations
    const handleError = (error: unknown, operation: string) => {
        console.error(`Error in ${operation}:`, error);
        setError(`Failed to ${operation}. Please try again.`);
        setTimeout(() => setError(null), 5000);
    };

    const handleSaveSettings = async (updatedSettings: CourseSettingsData) => {
        try {
            setSaving(true);
            setError(null);
            await saveCourseSettings(updatedSettings);
            setSettings(updatedSettings);
            setSuccess('Course settings saved successfully!');
            setTimeout(() => setSuccess(null), 5000);
        } catch (error) {
            handleError(error, 'save course settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Success Alert */}
            {success && (
                <Alert variant="default" className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="size-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="flex items-center gap-2 text-lg font-bold">
                        <Settings className="size-6" />
                        Course Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure how courses are created and managed in your institute
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-10 animate-spin text-primary-500" />
                    <p className="mt-4 text-gray-600">Loading course settings...</p>
                </div>
            ) : settings ? (
                <CourseSettingsForm
                    settings={settings}
                    onSave={handleSaveSettings}
                    isSaving={saving}
                />
            ) : (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>
                        Failed to load course settings. Please refresh the page to try again.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default CourseSettings;
