import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MyButton } from '@/components/design-system/button';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Sparkles, Save, ShieldCheck, Trash2, Plus } from 'lucide-react';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { AI_SERVICE_BASE_URL } from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';
import { toast } from 'sonner';

interface AiSettingsProps {
    isTab?: boolean;
}

const AiSettings: React.FC<AiSettingsProps> = ({ isTab }) => {
    const [openaiKey, setOpenaiKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [defaultModel, setDefaultModel] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const instituteId = getInstituteId();

    useEffect(() => {
        setIsLoading(false);
    }, []);

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
        } catch (error) {
            console.error('Error saving AI keys:', error);
            toast.error('Failed to save AI keys');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!instituteId) return;
        if (!confirm('Are you sure you want to deactivate these keys?')) return;

        try {
            await authenticatedAxiosInstance.delete(
                `${AI_SERVICE_BASE_URL}/api-keys/v1/institute/${instituteId}`
            );
            toast.success('Keys deactivated');
        } catch (error) {
            toast.error('Failed to deactivate keys');
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
            toast.success(`${type === 'openai' ? 'OpenAI' : 'Gemini'} key saved!`);
            if (type === 'openai') setOpenaiKey('');
            else setGeminiKey('');
        } catch (error) {
            toast.error('Failed to save key');
        }
    };

    return (
        <div className={isTab ? 'p-0' : 'p-6'}>
            <Card className="border-indigo-100 shadow-sm">
                <CardHeader className="border-b border-indigo-50 bg-indigo-50/30">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-500 p-2 text-white">
                            <Sparkles className="h-5 w-5" />
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
                            <Label htmlFor="openaiKey" className="text-sm font-medium flex items-center gap-2">
                                OpenAI API Key
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="openaiKey"
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-100"
                                />
                                <MyButton
                                    type="button"
                                    buttonType="secondary"
                                    scale="small"
                                    layoutVariant="icon"
                                    onClick={() => handlePartialSave('openai')}
                                    disabled={!openaiKey}
                                    className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </MyButton>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                Your OpenAI API key is used for GPT-4o and other OpenAI models.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="geminiKey" className="text-sm font-medium flex items-center gap-2">
                                Gemini API Key
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="geminiKey"
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-100"
                                />
                                <MyButton
                                    type="button"
                                    buttonType="secondary"
                                    scale="small"
                                    layoutVariant="icon"
                                    onClick={() => handlePartialSave('gemini')}
                                    disabled={!geminiKey}
                                    className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </MyButton>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                Your Google Gemini API key is used for Gemini 1.5 Pro and Flash models.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2 max-w-sm">
                            <Label htmlFor="defaultModel" className="text-sm font-medium">
                                Default AI Model
                            </Label>
                            <Select value={defaultModel} onValueChange={setDefaultModel}>
                                <SelectTrigger id="defaultModel" className="border-indigo-100 focus:border-indigo-300">
                                    <SelectValue placeholder="System Default" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="openai/gpt-4o">GPT-4o (Recommended)</SelectItem>
                                    <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                                    <SelectItem value="google/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                    <SelectItem value="google/gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-500">
                                The default model used when "Auto" is selected during generation.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-amber-100 p-1 text-amber-600">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-amber-900">Security Note</h4>
                                <p className="mt-1 text-xs text-amber-700">
                                    Your API keys are stored securely and used only for AI-powered course generation.
                                    Never share your API keys with anyone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <MyButton
                            disabled={isSaving}
                            onClick={handleSave}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                        >
                            {isSaving ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Keys
                                </>
                            )}
                        </MyButton>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AiSettings;
