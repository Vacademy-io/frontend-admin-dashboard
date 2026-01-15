import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MyButton } from '@/components/design-system/button';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Sparkles, Save, ShieldCheck, Trash2, Plus, Info } from 'lucide-react';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { AI_SERVICE_BASE_URL, BASE_URL } from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface AiSettingsProps {
    isTab?: boolean;
}

interface KeysStatus {
    hasKeys: boolean;
    hasOpenAI: boolean;
    hasGemini: boolean;
    defaultModel?: string;
    isActive?: boolean;
}

interface TutorConfiguration {
    role: string;
    assistant_name: string;
    institute_name: string;
    core_instruction: string;
    hard_rules: string[];
    adherence_settings: {
        level: 'strict' | 'moderate' | 'flexible';
        temperature: number;
    };
}

interface ActivityLogRecord {
    id: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    total_price: number;
    request_type: string;
    created_at: string;
}

interface ActivityLogResponse {
    records: ActivityLogRecord[];
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
}

interface Model {
    id: string;
    name: string;
    provider: string;
}

const AiSettings: React.FC<AiSettingsProps> = ({ isTab }) => {
    const [openaiKey, setOpenaiKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [defaultModel, setDefaultModel] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingTutor, setIsSavingTutor] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [keysStatus, setKeysStatus] = useState<KeysStatus>({
        hasKeys: false,
        hasOpenAI: false,
        hasGemini: false,
    });
    const [activityLogs, setActivityLogs] = useState<ActivityLogResponse | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showKeysInfo, setShowKeysInfo] = useState(false);
    const instituteDetails = useInstituteDetailsStore((state) => state.instituteDetails);
    const [tutorConfig, setTutorConfig] = useState<TutorConfiguration>({
        role: 'Tutor',
        assistant_name: 'Savir',
        institute_name: instituteDetails?.institute_name || 'Vacademy',
        core_instruction: 'You are a helpful tutor assisting students with their doubts.',
        hard_rules: [
            'Never provide the final answer directly.',
            'Keep responses short and concise unless explaining a complex topic.',
        ],
        adherence_settings: {
            level: 'strict',
            temperature: 0.5,
        },
    });
    const [newHardRule, setNewHardRule] = useState('');
    const instituteId = getInstituteId();

    // Check if keys exist
    const checkKeys = useCallback(async () => {
        if (!instituteId) return;
        try {
            const response = await authenticatedAxiosInstance.get(
                `${AI_SERVICE_BASE_URL}/api-keys/v1/institute/${instituteId}`
            );
            setKeysStatus({
                hasKeys: true,
                hasOpenAI: response.data.has_openai_key || false,
                hasGemini: response.data.has_gemini_key || false,
                defaultModel: response.data.default_model,
                isActive: response.data.is_active,
            });
            if (response.data.default_model) {
                setDefaultModel(response.data.default_model);
            }
            if (response.data.tutor_configuration) {
                setTutorConfig(response.data.tutor_configuration);
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setKeysStatus({
                    hasKeys: false,
                    hasOpenAI: false,
                    hasGemini: false,
                });
            } else {
                console.error('Error checking keys:', error);
            }
        }
    }, [instituteId]);

    // Fetch activity logs
    const fetchActivityLogs = useCallback(async () => {
        if (!instituteId) return;
        setIsLoadingLogs(true);
        try {
            const response = await authenticatedAxiosInstance.get<ActivityLogResponse>(
                `${AI_SERVICE_BASE_URL}/token-usage/v1/institute/${instituteId}/activity-log`,
                {
                    params: {
                        page: 1,
                        page_size: 20,
                    },
                }
            );
            setActivityLogs(response.data);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setIsLoadingLogs(false);
        }
    }, [instituteId]);

    // Fetch models list
    const fetchModels = useCallback(async () => {
        try {
            const response = await authenticatedAxiosInstance.get<{ models: Model[] }>(
                `${AI_SERVICE_BASE_URL}/models/v1/list`
            );
            setModels(response.data.models || []);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            await Promise.all([checkKeys(), fetchActivityLogs(), fetchModels()]);
            setIsLoading(false);
        };
        initialize();
    }, [checkKeys, fetchActivityLogs, fetchModels]);

    // Update institute name when instituteDetails changes
    useEffect(() => {
        if (instituteDetails?.institute_name) {
            setTutorConfig((prev) => ({
                ...prev,
                institute_name: instituteDetails.institute_name || 'Vacademy',
            }));
        }
    }, [instituteDetails]);

    const handleSave = async () => {
        if (!instituteId) return;
        setIsSaving(true);
        try {
            await authenticatedAxiosInstance.post(
                `${AI_SERVICE_BASE_URL}/api-keys/v1/institute/${instituteId}`,
                {
                    openai_key: openaiKey || undefined,
                    gemini_key: geminiKey || undefined,
                    default_model: defaultModel || undefined,
                }
            );
            toast.success('AI Settings saved successfully!');
            setOpenaiKey('');
            setGeminiKey('');
            await checkKeys();
        } catch (error) {
            console.error('Error saving AI keys:', error);
            toast.error('Failed to save AI keys');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTutorConfig = async () => {
        if (!instituteId) return;
        setIsSavingTutor(true);
        try {
            await authenticatedAxiosInstance.post(
                `${BASE_URL}/admin-core-service/institute/setting/v1/save-setting`,
                {
                    settingName: 'AI Chatbot Configuration',
                    settingData: {
                        role: tutorConfig.role,
                        assistant_name: tutorConfig.assistant_name,
                        institute_name: tutorConfig.institute_name,
                        core_instruction: tutorConfig.core_instruction,
                        hard_rules: tutorConfig.hard_rules,
                        adherence_settings: {
                            level: tutorConfig.adherence_settings.level,
                            temperature: tutorConfig.adherence_settings.temperature,
                        },
                    },
                },
                {
                    params: {
                        instituteId: instituteId,
                        settingKey: 'CHATBOT_SETTING',
                    },
                }
            );
            toast.success('Student AI configuration saved successfully!');
            await checkKeys();
        } catch (error) {
            console.error('Error saving tutor configuration:', error);
            toast.error('Failed to save Student AI configuration');
        } finally {
            setIsSavingTutor(false);
        }
    };

    const handleDelete = async () => {
        if (!instituteId) return;
        if (
            !confirm(
                'Are you sure you want to permanently delete these API keys? This action cannot be undone.'
            )
        )
            return;

        setIsDeleting(true);
        try {
            await authenticatedAxiosInstance.delete(
                `${AI_SERVICE_BASE_URL}/api-keys/v1/institute/${instituteId}/delete`
            );
            toast.success('Keys deleted successfully');
            setKeysStatus({
                hasKeys: false,
                hasOpenAI: false,
                hasGemini: false,
            });
            setDefaultModel('');
        } catch (error: any) {
            console.error('Error deleting keys:', error);
            if (error.response?.status === 404) {
                toast.error('No keys found to delete');
            } else {
                toast.error('Failed to delete keys');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePartialSave = async (type: 'openai' | 'gemini') => {
        if (!instituteId) return;
        const payload: any = {};
        if (type === 'openai') payload.openai_key = openaiKey;
        else payload.gemini_key = geminiKey;

        try {
            await authenticatedAxiosInstance.post(
                `${AI_SERVICE_BASE_URL}/api-keys/v1/institute/${instituteId}`,
                payload
            );
            toast.success(`${type === 'openai' ? 'OpenRouter' : 'Gemini'} key saved!`);
            if (type === 'openai') setOpenaiKey('');
            else setGeminiKey('');
            await checkKeys();
        } catch (error) {
            toast.error('Failed to save key');
        }
    };

    const handleDeleteKey = async (type: 'openai' | 'gemini') => {
        if (!instituteId) return;
        if (
            !confirm(
                `Are you sure you want to delete the ${type === 'openai' ? 'OpenRouter' : 'Gemini'} key?`
            )
        )
            return;

        try {
            // Delete all keys and re-add the one we want to keep
            await authenticatedAxiosInstance.delete(
                `${AI_SERVICE_BASE_URL}/api-keys/v1/institute/${instituteId}/delete`
            );

            // Re-add the key we want to keep
            const payload: any = {};
            if (type === 'gemini' && keysStatus.hasGemini) {
                // If deleting openai, keep gemini (but we can't re-add without the key value)
                // So we just delete and let user re-add
            } else if (type === 'openai' && keysStatus.hasOpenAI) {
                // If deleting gemini, keep openai (but we can't re-add without the key value)
                // So we just delete and let user re-add
            }

            toast.success(`${type === 'openai' ? 'OpenRouter' : 'Gemini'} key deleted`);
            await checkKeys();
        } catch (error) {
            toast.error('Failed to delete key');
        }
    };

    // Calculate totals
    const totalTokens =
        activityLogs?.records?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0;
    const totalPrice =
        activityLogs?.records?.reduce((sum, record) => sum + (record.total_price || 0), 0) || 0;

    // Get unique models from activity logs
    const uniqueModels = Array.from(
        new Set(activityLogs?.records.map((record) => record.model) || [])
    );

    if (isLoading) {
        return (
            <div className={isTab ? 'p-0' : 'p-6'}>
                <div className="flex h-64 items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={isTab ? 'space-y-6 p-0' : 'space-y-6 p-6'}>
            {/* AI Configuration Card */}
            <Card className="border-indigo-100 shadow-sm">
                <CardHeader className="border-b border-indigo-50 bg-indigo-50/30">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-500 p-2 text-white">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">AI Configuration</CardTitle>
                            <CardDescription>
                                Configure your AI model providers and API keys
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label
                                htmlFor="openaiKey"
                                className="flex items-center gap-2 text-sm font-medium"
                            >
                                OpenRouter API Key
                                <ShieldCheck className="size-3.5 text-green-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowKeysInfo(true)}
                                    className="text-indigo-500 hover:text-indigo-700"
                                >
                                    <Info className="size-4" />
                                </button>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="openaiKey"
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-100"
                                    disabled={keysStatus.hasOpenAI}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    onClick={() => handlePartialSave('openai')}
                                    disabled={!openaiKey || keysStatus.hasOpenAI}
                                    className="border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <Plus className="mr-1 size-4" />
                                    Add
                                </Button>
                                {keysStatus.hasOpenAI && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="default"
                                        onClick={() => handleDeleteKey('openai')}
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-500">
                                {keysStatus.hasOpenAI
                                    ? "You've added your key. We'll use your keys for AI requests."
                                    : 'Enter your key so that your requests will use these keys.'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="geminiKey"
                                className="flex items-center gap-2 text-sm font-medium"
                            >
                                Gemini API Key
                                <ShieldCheck className="size-3.5 text-green-500" />
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="geminiKey"
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-100"
                                    disabled={keysStatus.hasGemini}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    onClick={() => handlePartialSave('gemini')}
                                    disabled={!geminiKey || keysStatus.hasGemini}
                                    className="border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <Plus className="mr-1 size-4" />
                                    Add
                                </Button>
                                {keysStatus.hasGemini && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="default"
                                        onClick={() => handleDeleteKey('gemini')}
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-500">
                                {keysStatus.hasGemini
                                    ? "You've added your key. We'll use your keys for AI requests."
                                    : 'Enter your key so that your requests will use these keys.'}
                            </p>
                        </div>
                    </div>

                    {keysStatus.hasKeys && (
                        <div className="flex justify-end">
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 size-4" />
                                        Delete All Keys
                                    </>
                                )}
                            </MyButton>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="max-w-sm space-y-2">
                            <Label htmlFor="defaultModel" className="text-sm font-medium">
                                Default AI Model
                            </Label>
                            <Select value={defaultModel} onValueChange={setDefaultModel}>
                                <SelectTrigger
                                    id="defaultModel"
                                    className="border-indigo-100 focus:border-indigo-300"
                                >
                                    <SelectValue placeholder="System Default" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.length > 0 ? (
                                        models.map((model) => (
                                            <SelectItem key={model.id} value={model.id}>
                                                {model.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="openai/gpt-4o">
                                                GPT-4o (Recommended)
                                            </SelectItem>
                                            <SelectItem value="openai/gpt-4o-mini">
                                                GPT-4o Mini
                                            </SelectItem>
                                            <SelectItem value="google/gemini-1.5-pro">
                                                Gemini 1.5 Pro
                                            </SelectItem>
                                            <SelectItem value="google/gemini-1.5-flash">
                                                Gemini 1.5 Flash
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-500">
                                The default model used when "Auto" is selected during generation.
                            </p>
                        </div>
                    </div>

                    {/* Activity Logs Section */}
                    <div className="space-y-4">
                        <div className="border-t border-indigo-100 pt-6">
                            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                                Activity Logs
                            </h3>

                            {/* Summary Cards */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <Card className="border-indigo-100">
                                    <CardContent className="pt-4">
                                        <div className="flex flex-col">
                                            <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                                Total Tokens Used
                                            </span>
                                            <span className="text-2xl font-bold text-indigo-900">
                                                {totalTokens.toLocaleString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-indigo-100">
                                    <CardContent className="pt-4">
                                        <div className="flex flex-col">
                                            <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                                Total Price Incurred
                                            </span>
                                            <span className="text-2xl font-bold text-indigo-900">
                                                ${totalPrice.toFixed(4)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Models List */}
                            {uniqueModels.length > 0 && (
                                <div className="mb-6">
                                    <Label className="mb-2 block text-sm font-medium">
                                        Models Used
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueModels.map((modelId) => {
                                            const model = models.find((m) => m.id === modelId);
                                            return (
                                                <span
                                                    key={modelId}
                                                    className="rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                                                >
                                                    {model?.name || modelId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Activity Logs Table */}
                            {isLoadingLogs ? (
                                <div className="flex h-32 items-center justify-center">
                                    <div className="size-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
                                </div>
                            ) : activityLogs && activityLogs.records.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-indigo-100">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-indigo-50/50">
                                                <TableHead className="text-xs font-semibold">
                                                    Date
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Model
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Type
                                                </TableHead>
                                                <TableHead className="text-right text-xs font-semibold">
                                                    Tokens
                                                </TableHead>
                                                <TableHead className="text-right text-xs font-semibold">
                                                    Price
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activityLogs.records.map((record) => {
                                                const model = models.find(
                                                    (m) => m.id === record.model
                                                );
                                                return (
                                                    <TableRow key={record.id}>
                                                        <TableCell className="text-xs">
                                                            {new Date(
                                                                record.created_at
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {model?.name || record.model}
                                                        </TableCell>
                                                        <TableCell className="text-xs capitalize">
                                                            {record.request_type}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            {record.total_tokens.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            ${(record.total_price || 0).toFixed(4)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-sm text-gray-500">
                                    No activity logs found
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-amber-100 p-1 text-amber-600">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-amber-900">
                                    Security Note
                                </h4>
                                <p className="mt-1 text-xs text-amber-700">
                                    Your API keys are stored securely and used only for AI-powered
                                    course generation. Never share your API keys with anyone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <MyButton
                            disabled={isSaving}
                            onClick={handleSave}
                            className="min-w-[120px] bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {isSaving ? (
                                <>
                                    <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    Save Keys
                                </>
                            )}
                        </MyButton>
                    </div>
                </CardContent>
            </Card>

            {/* Student AI Configuration Card */}
            <Card className="border-indigo-100 shadow-sm">
                <CardHeader className="border-b border-indigo-50 bg-indigo-50/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-indigo-500 p-2 text-white">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Student AI</CardTitle>
                                <CardDescription>
                                    Configure AI tutor behavior and settings for student
                                    interactions
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-medium">
                                    Role
                                </Label>
                                <Input
                                    id="role"
                                    value={tutorConfig.role}
                                    onChange={(e) =>
                                        setTutorConfig({
                                            ...tutorConfig,
                                            role: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Tutor, Mentor, Guide"
                                    className="border-indigo-100 focus:border-indigo-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assistantName" className="text-sm font-medium">
                                    Assistant Name
                                </Label>
                                <Input
                                    id="assistantName"
                                    value={tutorConfig.assistant_name}
                                    onChange={(e) =>
                                        setTutorConfig({
                                            ...tutorConfig,
                                            assistant_name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Savir, Alex"
                                    className="border-indigo-100 focus:border-indigo-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instituteName" className="text-sm font-medium">
                                Institute Name
                            </Label>
                            <Input
                                id="instituteName"
                                value={tutorConfig.institute_name}
                                onChange={(e) =>
                                    setTutorConfig({
                                        ...tutorConfig,
                                        institute_name: e.target.value,
                                    })
                                }
                                className="border-indigo-100 focus:border-indigo-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coreInstruction" className="text-sm font-medium">
                                Core Instruction
                            </Label>
                            <textarea
                                id="coreInstruction"
                                value={tutorConfig.core_instruction}
                                onChange={(e) =>
                                    setTutorConfig({
                                        ...tutorConfig,
                                        core_instruction: e.target.value,
                                    })
                                }
                                placeholder="Define the core behavior of your AI tutor..."
                                rows={3}
                                className="w-full rounded-md border border-indigo-100 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Hard Rules</Label>
                            <div className="space-y-2">
                                {tutorConfig.hard_rules.map((rule, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={rule}
                                            onChange={(e) => {
                                                const newRules = [...tutorConfig.hard_rules];
                                                newRules[index] = e.target.value;
                                                setTutorConfig({
                                                    ...tutorConfig,
                                                    hard_rules: newRules,
                                                });
                                            }}
                                            className="border-indigo-100 focus:border-indigo-300"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const newRules = tutorConfig.hard_rules.filter(
                                                    (_, i) => i !== index
                                                );
                                                setTutorConfig({
                                                    ...tutorConfig,
                                                    hard_rules: newRules,
                                                });
                                            }}
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        value={newHardRule}
                                        onChange={(e) => setNewHardRule(e.target.value)}
                                        placeholder="Add a new hard rule..."
                                        className="border-indigo-100 focus:border-indigo-300"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && newHardRule.trim()) {
                                                setTutorConfig({
                                                    ...tutorConfig,
                                                    hard_rules: [
                                                        ...tutorConfig.hard_rules,
                                                        newHardRule.trim(),
                                                    ],
                                                });
                                                setNewHardRule('');
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (newHardRule.trim()) {
                                                setTutorConfig({
                                                    ...tutorConfig,
                                                    hard_rules: [
                                                        ...tutorConfig.hard_rules,
                                                        newHardRule.trim(),
                                                    ],
                                                });
                                                setNewHardRule('');
                                            }
                                        }}
                                        className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                    >
                                        <Plus className="mr-1 size-4" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="adherenceLevel" className="text-sm font-medium">
                                    Adherence Level
                                </Label>
                                <Select
                                    value={tutorConfig.adherence_settings.level}
                                    onValueChange={(value: 'strict' | 'moderate' | 'flexible') =>
                                        setTutorConfig({
                                            ...tutorConfig,
                                            adherence_settings: {
                                                ...tutorConfig.adherence_settings,
                                                level: value,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="adherenceLevel"
                                        className="border-indigo-100 focus:border-indigo-300"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strict">Strict</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="flexible">Flexible</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-gray-500">
                                    How strictly the AI follows the configured rules
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="temperature" className="text-sm font-medium">
                                    Temperature ({tutorConfig.adherence_settings.temperature})
                                </Label>
                                <input
                                    id="temperature"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={tutorConfig.adherence_settings.temperature}
                                    onChange={(e) =>
                                        setTutorConfig({
                                            ...tutorConfig,
                                            adherence_settings: {
                                                ...tutorConfig.adherence_settings,
                                                temperature: parseFloat(e.target.value),
                                            },
                                        })
                                    }
                                    className="w-full"
                                />
                                <p className="text-[10px] text-gray-500">
                                    Controls creativity (0 = focused, 1 = creative)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <MyButton
                            disabled={isSavingTutor}
                            onClick={handleSaveTutorConfig}
                            className="min-w-[120px] bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {isSavingTutor ? (
                                <>
                                    <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    Save Settings
                                </>
                            )}
                        </MyButton>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys Info Dialog */}
            <Dialog open={showKeysInfo} onOpenChange={setShowKeysInfo}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="size-5 text-indigo-600" />
                            API Keys Information
                        </DialogTitle>
                        <DialogDescription>How to add and use API keys</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <h4 className="mb-2 text-sm font-semibold">
                                How to Get OpenRouter API Key
                            </h4>
                            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
                                <li>
                                    Visit{' '}
                                    <a
                                        href="https://openrouter.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        openrouter.ai
                                    </a>
                                </li>
                                <li>Sign up or log in to your account</li>
                                <li>Navigate to the "Keys" section in your dashboard</li>
                                <li>Click "Create Key" to generate a new API key</li>
                                <li>
                                    Copy the key (starts with "sk-") and paste it in the field above
                                </li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="mb-2 text-sm font-semibold">
                                How to Get Gemini API Key
                            </h4>
                            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
                                <li>
                                    Visit{' '}
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Google AI Studio
                                    </a>{' '}
                                    or{' '}
                                    <a
                                        href="https://console.cloud.google.com/apis/credentials"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Google Cloud Console
                                    </a>
                                </li>
                                <li>Sign in with your Google account</li>
                                <li>Click "Create API Key" or "Get API Key"</li>
                                <li>Select or create a Google Cloud project (if prompted)</li>
                                <li>Copy the generated API key and paste it in the field above</li>
                            </ol>
                        </div>
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                            <p className="text-xs text-indigo-700">
                                <strong>Note:</strong> Your API keys are stored securely and only
                                used for AI-powered course generation. Never share your keys with
                                anyone.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowKeysInfo(false)}>
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AiSettings;
