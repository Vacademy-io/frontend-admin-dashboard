import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Send,
    Sparkles,
    Globe,
    Clock,
    Users,
    Captions,
    Wand2,
    Mic,
    Volume2,
    Layers,
} from 'lucide-react';
import {
    GenerateVideoRequest,
    LANGUAGES,
    VOICE_GENDERS,
    TTS_PROVIDERS,
    TARGET_AUDIENCES,
    TARGET_DURATIONS,
    DEFAULT_OPTIONS,
    CONTENT_TYPES,
    VoiceGender,
    TtsProvider,
    ContentType,
} from '../-services/video-generation';
import { useAIModelsList } from '@/hooks/useAiModels';

interface PromptInputProps {
    onGenerate: (request: GenerateVideoRequest) => void;
    isGenerating: boolean;
    disabled?: boolean;
}

interface OptionBubbleProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    children: React.ReactNode;
}

function OptionBubble({ icon, label, value, children }: OptionBubbleProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 bg-background text-xs font-normal hover:bg-muted"
                >
                    {icon}
                    <span className="hidden text-muted-foreground sm:inline">{label}:</span>
                    <span className="max-w-[100px] truncate font-medium">{value}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
                    {children}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function PromptInput({ onGenerate, isGenerating, disabled }: PromptInputProps) {
    const [prompt, setPrompt] = useState('');
    const [options, setOptions] = useState(DEFAULT_OPTIONS);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { data: modelsList } = useAIModelsList();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    useEffect(() => {
        if (modelsList?.models && modelsList.models.length > 0) {
            const modelExists = modelsList.models.some((m) => m.model_id === options.model);
            if (!modelExists) {
                const defaultModel =
                    modelsList.models.find((m) => m.is_default) || modelsList.models[0];
                if (defaultModel) {
                    setOptions((prev) => ({ ...prev, model: defaultModel.model_id }));
                }
            }
        }
    }, [modelsList, options.model]);

    const handleSubmit = () => {
        if (!prompt.trim() || isGenerating || disabled) return;
        onGenerate({ prompt: prompt.trim(), ...options });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const updateOption = <K extends keyof typeof options>(key: K, value: (typeof options)[K]) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const models = modelsList?.models || [];
    const selectedModel = models.find((m) => m.model_id === options.model);
    const selectedContentType = CONTENT_TYPES.find((c) => c.value === options.content_type);

    const freeModels = models.filter((m) => m.is_free);
    const openaiModels = models.filter((m) => m.provider === 'OpenAI' && !m.is_free);
    const geminiModels = models.filter((m) => m.provider === 'Google' && !m.is_free);
    const otherModels = models.filter(
        (m) => !m.is_free && m.provider !== 'OpenAI' && m.provider !== 'Google'
    );

    return (
        <div className="border-t bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:p-3">
            <div className="mx-auto max-w-4xl space-y-2">
                {/* Option Bubbles */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Content Type Selector - First */}
                    <OptionBubble
                        icon={<Layers className="size-3" />}
                        label="Type"
                        value={selectedContentType?.label || '📹 Video'}
                    >
                        <Select
                            value={options.content_type || 'VIDEO'}
                            onValueChange={(v) => updateOption('content_type', v as ContentType)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                                {CONTENT_TYPES.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                        className="text-xs"
                                    >
                                        <div className="flex flex-col">
                                            <span>{type.label}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {type.description}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Sparkles className="size-3" />}
                        label="Model"
                        value={selectedModel?.name.split(' ')[0] || options.model || 'Select'}
                    >
                        <Select
                            value={options.model}
                            onValueChange={(v) => updateOption('model', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                                {freeModels.length > 0 && (
                                    <>
                                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                            Free Models
                                        </div>
                                        {freeModels.map((model) => (
                                            <SelectItem
                                                key={model.model_id}
                                                value={model.model_id}
                                                className="text-xs"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {openaiModels.length > 0 && (
                                    <>
                                        <div className="mt-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                                            OpenAI Models
                                        </div>
                                        {openaiModels.map((model) => (
                                            <SelectItem
                                                key={model.model_id}
                                                value={model.model_id}
                                                className="text-xs"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {geminiModels.length > 0 && (
                                    <>
                                        <div className="mt-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                                            Gemini Models
                                        </div>
                                        {geminiModels.map((model) => (
                                            <SelectItem
                                                key={model.model_id}
                                                value={model.model_id}
                                                className="text-xs"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {otherModels.length > 0 && (
                                    <>
                                        <div className="mt-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                                            Other Paid Models
                                        </div>
                                        {otherModels.map((model) => (
                                            <SelectItem
                                                key={model.model_id}
                                                value={model.model_id}
                                                className="text-xs"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Globe className="size-3" />}
                        label="Language"
                        value={options.language}
                    >
                        <Select
                            value={options.language}
                            onValueChange={(v) => updateOption('language', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                    Global
                                </div>
                                {LANGUAGES.filter((l) => l.group === 'Global').map((lang) => (
                                    <SelectItem
                                        key={lang.value}
                                        value={lang.value}
                                        className="text-xs"
                                    >
                                        {lang.label}
                                    </SelectItem>
                                ))}
                                <div className="mt-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                                    Indian
                                </div>
                                {LANGUAGES.filter((l) => l.group === 'Indian').map((lang) => (
                                    <SelectItem
                                        key={lang.value}
                                        value={lang.value}
                                        className="text-xs"
                                    >
                                        {lang.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Mic className="size-3" />}
                        label="Voice"
                        value={
                            VOICE_GENDERS.find((v) => v.value === options.voice_gender)?.label ||
                            'Female'
                        }
                    >
                        <Select
                            value={options.voice_gender}
                            onValueChange={(v) => updateOption('voice_gender', v as VoiceGender)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {VOICE_GENDERS.map((gender) => (
                                    <SelectItem
                                        key={gender.value}
                                        value={gender.value}
                                        className="text-xs"
                                    >
                                        {gender.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Volume2 className="size-3" />}
                        label="Audio"
                        value={
                            TTS_PROVIDERS.find(
                                (p) => p.value === options.tts_provider
                            )?.label.split(' ')[0] || 'Standard'
                        }
                    >
                        <Select
                            value={options.tts_provider}
                            onValueChange={(v) => updateOption('tts_provider', v as TtsProvider)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TTS_PROVIDERS.map((provider) => (
                                    <SelectItem
                                        key={provider.value}
                                        value={provider.value}
                                        className="text-xs"
                                    >
                                        {provider.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Users className="size-3" />}
                        label="Audience"
                        value={options.target_audience.split(' ')[0] ?? ''}
                    >
                        <Select
                            value={options.target_audience}
                            onValueChange={(v) => updateOption('target_audience', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TARGET_AUDIENCES.map((aud) => (
                                    <SelectItem key={aud} value={aud} className="text-xs">
                                        {aud}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Clock className="size-3" />}
                        label="Duration"
                        value={options.target_duration}
                    >
                        <Select
                            value={options.target_duration}
                            onValueChange={(v) => updateOption('target_duration', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TARGET_DURATIONS.map((dur) => (
                                    <SelectItem key={dur} value={dur} className="text-xs">
                                        {dur}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <OptionBubble
                        icon={<Wand2 className="size-3" />}
                        label="Quality"
                        value={options.html_quality}
                    >
                        <Select
                            value={options.html_quality}
                            onValueChange={(v) =>
                                updateOption('html_quality', v as 'classic' | 'advanced')
                            }
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="classic" className="text-xs">
                                    Classic
                                </SelectItem>
                                <SelectItem value="advanced" className="text-xs">
                                    Advanced
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </OptionBubble>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 bg-background text-xs font-normal hover:bg-muted"
                            >
                                <Captions className="size-3" />
                                <span className="hidden text-muted-foreground lg:inline">
                                    Captions:
                                </span>
                                <Badge
                                    variant={options.captions_enabled ? 'default' : 'secondary'}
                                    className="h-4 px-1 text-[10px]"
                                >
                                    {options.captions_enabled ? 'On' : 'Off'}
                                </Badge>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3" align="start">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Enable Captions</Label>
                                <Switch
                                    checked={options.captions_enabled}
                                    onCheckedChange={(v) => updateOption('captions_enabled', v)}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Prompt Input */}
                <div className="relative flex items-end gap-2 rounded-lg border bg-muted/30 p-2 shadow-sm transition-all focus-within:border-ring/50 focus-within:ring-1 focus-within:ring-ring">
                    <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe the video you want to create..."
                        className="max-h-[160px] min-h-[36px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isGenerating || disabled}
                        rows={1}
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isGenerating || disabled}
                        size="icon"
                        className="size-8 shrink-0 rounded-md shadow-sm"
                    >
                        <Send className="size-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
