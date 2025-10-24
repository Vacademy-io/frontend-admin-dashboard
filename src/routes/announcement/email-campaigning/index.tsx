import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useMemo, useState } from 'react';
import {
    AnnouncementService,
    InstituteAnnouncementSettingsService,
    type CreateAnnouncementRequest,
    type ModeType,
    type MediumType,
} from '@/services/announcement';
import { getUserId, getUserName } from '@/utils/userDetails';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import useLocalStorage from '@/hooks/use-local-storage';
import TipTapEditor from '@/components/tiptap/TipTapEditor';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Smartphone,
    Tablet,
    Laptop,
    Plus,
} from 'lucide-react';
import { MultiSelect, type OptionType } from '@/components/design-system/multi-select';
import { TIMEZONE_OPTIONS } from '@/routes/study-library/live-session/schedule/-constants/options';
import { getInstituteTags, getUserCountsByTags, type TagItem } from '@/services/tag-management';
import { getInstituteId } from '@/constants/helper';
import { getMessageTemplates } from '@/services/message-template-service';
import type { MessageTemplate } from '@/types/message-template-types';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { getEmailConfigurations, type EmailConfiguration } from '@/services/email-configuration-service';

export const Route = createFileRoute('/announcement/email-campaigning/')({
    component: () => (
        <LayoutContainer>
            <EmailCampaigningPage />
        </LayoutContainer>
    ),
});

function EmailCampaigningPage() {
    const { setNavHeading } = useNavHeadingStore();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    // Institute details for package sessions
    const instituteQuery = useInstituteQuery();
    const { instituteDetails } = useInstituteDetailsStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Basic state
    const [title, setTitle] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [contentView, setContentView] = useState<'editor' | 'source'>('editor');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'laptop'>('laptop');
    const DEVICE_PRESETS: Record<typeof previewDevice, { label: string; width: number }> = {
        mobile: { label: 'Mobile', width: 390 },
        tablet: { label: 'Tablet', width: 768 },
        laptop: { label: 'Laptop', width: 1280 },
    };

    // Only SYSTEM_ALERT mode for email campaigning (general announcement)
    const [selectedModes] = useState<ModeType[]>(['SYSTEM_ALERT']);
    const [modeSettings, setModeSettings] = useState<Record<ModeType, Record<string, unknown>>>({
        SYSTEM_ALERT: { priority: 'MEDIUM', expiresAt: '' },
        DASHBOARD_PIN: {},
        DM: {},
        STREAM: {},
        RESOURCES: {},
        COMMUNITY: {},
        TASKS: {},
    });
    
    // Only EMAIL medium
    const [selectedMediums] = useState<MediumType[]>(['EMAIL']);
    
    const [recipients, setRecipients] = useState<CreateAnnouncementRequest['recipients']>([
        { recipientType: 'ROLE', recipientId: 'STUDENT' },
    ]);
    
    // For TAG recipient rows
    const [tagSelections, setTagSelections] = useState<Record<number, string[]>>({});
    const [tagOptions, setTagOptions] = useState<OptionType[]>([]);
    const [tagMapById, setTagMapById] = useState<Record<string, TagItem>>({});
    const [tagsLoading, setTagsLoading] = useState(false);
    const [estimatedUsers, setEstimatedUsers] = useState<number | null>(null);
    const [estimatingUsers, setEstimatingUsers] = useState(false);
    const [rowTagEstimates, setRowTagEstimates] = useState<Record<number, number | null>>({});
    
    const [scheduleType, setScheduleType] = useState<'IMMEDIATE' | 'ONE_TIME' | 'RECURRING'>(
        'IMMEDIATE'
    );
    
    // Persist timezone in localStorage
    const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const { getValue: getSavedTz, setValue: setSavedTz } = useLocalStorage<string>(
        'email_campaign_timezone',
        defaultTz
    );
    const [timezone, setTimezone] = useState<string>(getSavedTz());
    const [oneTimeStart, setOneTimeStart] = useState<string>('');
    const [cronExpression, setCronExpression] = useState<string>('');
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Template-related state
    const [useTemplate, setUseTemplate] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [emailTemplates, setEmailTemplates] = useState<MessageTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templatesError, setTemplatesError] = useState<string | null>(null);

    // Email configuration state
    const [emailConfigurations, setEmailConfigurations] = useState<EmailConfiguration[]>([]);
    const [selectedFromEmail, setSelectedFromEmail] = useState<string>('');
    const [emailConfigsLoading, setEmailConfigsLoading] = useState(false);

    // Package session selection state
    const [packageSessionOptions, setPackageSessionOptions] = useState<Array<{
        id: string;
        label: string;
    }>>([]);

    // Exclusion state
    const [exclusions, setExclusions] = useState<Array<{
        id: string;
        recipientType: 'ROLE' | 'USER' | 'PACKAGE_SESSION' | 'TAG';
        recipientId: string;
        recipientName: string;
    }>>([]);
    const [showExclusionSection, setShowExclusionSection] = useState(false);

    // Permissions
    const [allowedModes, setAllowedModes] = useState<Record<ModeType, boolean>>({} as Record<ModeType, boolean>);
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const userRoles = useMemo(() => getUserRoles(accessToken), [accessToken]);
    const primaryRole = userRoles?.[0] ?? 'TEACHER';

    useEffect(() => {
        setNavHeading('Email Campaigning');
    }, [setNavHeading]);

    // Load institute tags for TAG recipients
    useEffect(() => {
        (async () => {
            setTagsLoading(true);
            try {
                const tags = await getInstituteTags();
                const options = tags.map((t) => ({ label: t.tagName, value: t.id }));
                const map: Record<string, TagItem> = {};
                tags.forEach((t) => {
                    map[t.id] = t;
                });
                setTagOptions(options);
                setTagMapById(map);
            } finally {
                setTagsLoading(false);
            }
        })();
    }, []);

    // Load email templates
    const loadEmailTemplates = async () => {
        if (emailTemplates.length > 0 || templatesLoading) return;
        
        setTemplatesLoading(true);
        setTemplatesError(null);
        try {
            const response = await getMessageTemplates('EMAIL');
            setEmailTemplates(response.templates);
        } catch (error) {
            console.error('Error loading email templates:', error);
            setTemplatesError('Failed to load email templates. Please try again.');
            // Set empty array on error to prevent further issues
            setEmailTemplates([]);
        } finally {
            setTemplatesLoading(false);
        }
    };

    // Load email configurations
    useEffect(() => {
        const loadEmailConfigurations = async () => {
            setEmailConfigsLoading(true);
            try {
                const configs = await getEmailConfigurations();
                setEmailConfigurations(configs);
                
                if (configs.length > 0) {
                    const persistedEmail = typeof window !== 'undefined' ? localStorage.getItem('selectedFromEmail') : null;
                    
                    if (persistedEmail && configs.find(c => `${c.email}-${c.name}` === persistedEmail)) {
                        setSelectedFromEmail(persistedEmail);
                    } else {
                        const defaultValue = `${configs[0]?.email}-${configs[0]?.name}`;
                        setSelectedFromEmail(defaultValue || '');
                    }
                }
            } catch (error) {
                console.error('Error loading email configurations:', error);
            } finally {
                setEmailConfigsLoading(false);
            }
        };
        loadEmailConfigurations();
    }, []);

    // Persist selectedFromEmail to localStorage
    useEffect(() => {
        if (selectedFromEmail && typeof window !== 'undefined') {
            localStorage.setItem('selectedFromEmail', selectedFromEmail);
        }
    }, [selectedFromEmail]);

    // Load package session options
    useEffect(() => {
        if (instituteDetails?.batches_for_sessions) {
            const options = instituteDetails.batches_for_sessions.map((batch) => ({
                id: batch.id,
                label: `${batch.package_dto.package_name} - ${batch.level.level_name} - ${batch.session.session_name}`,
            }));
            setPackageSessionOptions(options);
        }
    }, [instituteDetails]);

    // Estimate users for selected tags
    useEffect(() => {
        const allTagIds = Array.from(new Set(Object.values(tagSelections).flat().filter(Boolean)));
        if (allTagIds.length === 0) {
            setEstimatedUsers(null);
            return;
        }
        let cancelled = false;
        (async () => {
            setEstimatingUsers(true);
            try {
                const res = await getUserCountsByTags(allTagIds);
                if (!cancelled) setEstimatedUsers(res?.totalUsers ?? null);
            } catch {
                if (!cancelled) setEstimatedUsers(null);
            } finally {
                if (!cancelled) setEstimatingUsers(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [tagSelections]);

    // Per-row tag estimates
    useEffect(() => {
        const rowIndexes = Object.keys(tagSelections).map(Number);
        const estimatePromises = rowIndexes.map(async (idx) => {
            const tagIds = tagSelections[idx];
            if (!tagIds || tagIds.length === 0) {
                return { idx, count: null };
            }
            try {
                const res = await getUserCountsByTags(tagIds);
                return { idx, count: res?.totalUsers ?? null };
            } catch {
                return { idx, count: null };
            }
        });

        Promise.all(estimatePromises).then((results) => {
            const newEstimates: Record<number, number | null> = {};
            results.forEach(({ idx, count }) => {
                newEstimates[idx] = count;
            });
            setRowTagEstimates(newEstimates);
        });
    }, [tagSelections, tagMapById]);

    // Load permissions
    useEffect(() => {
        (async () => {
            setLoadingPermissions(true);
            try {
                const allowed: Record<ModeType, boolean> = {
                    SYSTEM_ALERT: true, // Always allowed for email campaigning
                    DASHBOARD_PIN: false,
                    DM: false,
                    STREAM: false,
                    RESOURCES: false,
                    COMMUNITY: false,
                    TASKS: false,
                };
                setAllowedModes(allowed);
            } finally {
                setLoadingPermissions(false);
            }
        })();
    }, [primaryRole]);

    // Persist timezone changes to localStorage
    useEffect(() => {
        setSavedTz(timezone);
    }, [timezone, setSavedTz]);

    const handleTemplateSelection = (templateId: string) => {
        const template = emailTemplates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplateId(templateId);
            if (template.subject) {
                setTitle(template.subject);
            }
            if (template.content) {
                setHtmlContent(template.content);
            }
        }
    };

    const addRecipientPreset = (preset: 'ALL_STUDENTS' | 'ALL_TEACHERS') => {
        if (preset === 'ALL_STUDENTS') {
            setRecipients((prev) => [
                ...prev,
                { recipientType: 'ROLE', recipientId: 'STUDENT', recipientName: '' },
            ]);
            return;
        }
        if (preset === 'ALL_TEACHERS') {
            setRecipients((prev) => [
                ...prev,
                { recipientType: 'ROLE', recipientId: 'TEACHER', recipientName: '' },
            ]);
            return;
        }
    };

    const addBatchRecipient = () => {
        const firstBatch = packageSessionOptions[0];
        if (firstBatch) {
            setRecipients((prev) => [
                ...prev,
                { 
                    recipientType: 'PACKAGE_SESSION', 
                    recipientId: firstBatch.id, 
                    recipientName: firstBatch.label 
                },
            ]);
        } else {
            setRecipients((prev) => [
                ...prev,
                { 
                    recipientType: 'PACKAGE_SESSION', 
                    recipientId: '', 
                    recipientName: '' 
                },
            ]);
        }
    };

    const addExclusion = () => {
        setExclusions((prev) => [
            ...prev,
            {
                id: `exclusion-${Date.now()}`,
                recipientType: 'ROLE',
                recipientId: '',
                recipientName: ''
            }
        ]);
    };

    const removeExclusion = (id: string) => {
        setExclusions((prev) => prev.filter(e => e.id !== id));
    };

    const updateExclusion = (id: string, field: 'recipientType' | 'recipientId' | 'recipientName', value: string) => {
        setExclusions((prev) => prev.map(e => {
            if (e.id === id) {
                // If changing recipientType, reset recipientId and recipientName
                if (field === 'recipientType') {
                    return { ...e, [field]: value as 'ROLE' | 'USER' | 'PACKAGE_SESSION' | 'TAG', recipientId: '', recipientName: '' };
                }
                return { ...e, [field]: value };
            }
            return e;
        }));
    };

    const removeRecipientAtIndex = (idx: number) => {
        setRecipients((prev) => prev.filter((_, i) => i !== idx));
        setTagSelections((prev) => {
            const next = { ...prev };
            delete next[idx];
            return next;
        });
    };

    const dateToLocalInput = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const applyScheduleQuickPick = (pick: 'NOW' | 'IN_1H' | 'TOMORROW_9AM' | 'NEXT_MON_9AM') => {
        const target = new Date();
        if (pick === 'NOW') {
            setScheduleType('IMMEDIATE');
            return;
        }
        if (pick === 'IN_1H') {
            target.setHours(target.getHours() + 1);
        } else if (pick === 'TOMORROW_9AM') {
            target.setDate(target.getDate() + 1);
            target.setHours(9, 0, 0, 0);
        } else if (pick === 'NEXT_MON_9AM') {
            const day = target.getDay();
            const delta = (8 - day) % 7 || 7;
            target.setDate(target.getDate() + delta);
            target.setHours(9, 0, 0, 0);
        }
        setScheduleType('ONE_TIME');
        setOneTimeStart(dateToLocalInput(target));
    };

    const applyCronTemplate = (tmpl: 'DAILY_9' | 'MON_9' | 'HOURLY') => {
        if (tmpl === 'DAILY_9') setCronExpression('0 0 9 * * ?');
        else if (tmpl === 'MON_9') setCronExpression('0 0 9 ? * MON');
        else if (tmpl === 'HOURLY') setCronExpression('0 0 * * * ?');
        setScheduleType('RECURRING');
    };

    const reviewRecipientItems = useMemo(() => {
        const items: Array<{ type: string; text: string }> = [];
        recipients.forEach((r, idx) => {
            if (r.recipientType === 'TAG') {
                const ids = tagSelections[idx] || [];
                ids.forEach((tagId) => {
                    const tag = tagMapById[tagId];
                    items.push({ type: 'TAG', text: tag?.tagName || tagId });
                });
            } else {
                items.push({
                    type: r.recipientType === 'PACKAGE_SESSION' ? 'Batch' : r.recipientType,
                    text: r.recipientType === 'PACKAGE_SESSION' 
                        ? packageSessionOptions.find(opt => opt.id === r.recipientId)?.label || r.recipientId || '—'
                        : r.recipientId || r.recipientName || '—'
                });
            }
        });
        return items;
    }, [recipients, tagSelections, tagMapById, packageSessionOptions]);

    const handleSubmit = async () => {
        try {
            // Validate required fields
            const validationErrors: string[] = [];
            const fieldErrors: Record<string, string> = {};
            const trimmedTitle = title.trim();
            const trimmedContent = htmlContent.trim();
            
            if (!trimmedTitle) {
                validationErrors.push('Title is required');
                fieldErrors.title = 'Title is required';
            }
            if (!trimmedContent) {
                validationErrors.push('Content is required');
                fieldErrors.content = 'Content is required';
            }

            // Validate SYSTEM_ALERT mode settings
            const s = (modeSettings.SYSTEM_ALERT || {}) as Record<string, unknown>;
            const p = (s.priority as string) || '';
            if (!p) {
                validationErrors.push('Priority is required');
                fieldErrors['modes.SYSTEM_ALERT.priority'] = 'Priority is required';
            }

            // Scheduling validations
            if (scheduleType === 'ONE_TIME') {
                if (!oneTimeStart) {
                    validationErrors.push('Schedule: run time is required');
                    fieldErrors['schedule.startDate'] = 'Run time is required';
                }
            }
            if (scheduleType === 'RECURRING') {
                if (!cronExpression) {
                    validationErrors.push('Schedule: cron expression is required for recurring');
                    fieldErrors['schedule.cronExpression'] = 'Cron expression is required';
                }
            }

            if (validationErrors.length > 0) {
                setErrors(fieldErrors);
                toast({
                    title: 'Missing required fields',
                    description: validationErrors.slice(0, 4).join('\n'),
                    variant: 'destructive',
                });
                return;
            }
            setErrors({});

            // Validate TAG recipients
            const anyTagRow = recipients.some((r) => r.recipientType === 'TAG');
            if (anyTagRow) {
                const missingTags = recipients.some(
                    (r, idx) => r.recipientType === 'TAG' && !tagSelections[idx]?.length
                );
                if (missingTags) {
                    toast({
                        title: 'Select at least one tag',
                        description: 'You have a TAG recipient without any selected tags.',
                        variant: 'destructive',
                    });
                    return;
                }
                const instId = getInstituteId();
                if (!instId) {
                    toast({
                        title: 'Institute required',
                        description: 'An institute must be selected to target TAG recipients.',
                        variant: 'destructive',
                    });
                    return;
                }
            }

            // Expand TAG selections into recipient entries
            const expandedRecipients: CreateAnnouncementRequest['recipients'] = [];
            recipients.forEach((r, idx) => {
                if (r.recipientType === 'TAG') {
                    const ids = tagSelections[idx] || [];
                    ids.forEach((tagId) => {
                        const tag = tagMapById[tagId];
                        expandedRecipients.push({
                            recipientType: 'TAG',
                            recipientId: tagId,
                            recipientName: tag?.tagName,
                        });
                    });
                } else if (r.recipientType && r.recipientId) {
                    expandedRecipients.push({
                        recipientType: r.recipientType,
                        recipientId: r.recipientId,
                        recipientName: r.recipientName,
                    });
                }
            });

            setIsSubmitting(true);
            const selectedConfig = emailConfigurations.find(c => `${c.email}-${c.name}` === selectedFromEmail);
            const emailType = selectedConfig?.type || 'UTILITY_EMAIL';
            
            // Filter out exclusions without recipientId
            const validExclusions = exclusions.filter(e => e.recipientId && e.recipientId.trim() !== '');
            
            const payload: any = {
                title,
                content: { type: 'html', content: htmlContent },
                createdBy: getUserId(),
                createdByName: getUserName(),
                createdByRole: primaryRole,
                recipients: expandedRecipients,
                exclusions: validExclusions.map(exclusion => ({
                    recipientType: exclusion.recipientType,
                    recipientId: exclusion.recipientId,
                    recipientName: exclusion.recipientName
                })),
                modes: [{
                    modeType: 'SYSTEM_ALERT',
                    settings: modeSettings.SYSTEM_ALERT ?? {},
                }],
                mediums: [{
                    mediumType: 'EMAIL',
                    config: {
                        subject: title,
                        emailType: emailType,
                    }
                }],
                scheduling:
                    scheduleType === 'IMMEDIATE'
                        ? { scheduleType, timezone }
                        : scheduleType === 'ONE_TIME'
                          ? {
                                scheduleType,
                                timezone,
                                startDate: oneTimeStart
                                    ? new Date(oneTimeStart).toISOString()
                                    : undefined,
                            }
                          : {
                                scheduleType,
                                timezone,
                                cronExpression: cronExpression || undefined,
                            },
            };
            
            await AnnouncementService.create(payload);
            
            try {
                const { toast: sonnerToast } = await import('sonner');
                sonnerToast.success('Email campaign created successfully');
            } catch {
                toast({ title: 'Email campaign created successfully' });
            }
            
            // Reset fields
            setTitle('');
            setHtmlContent('');
            setModeSettings({
                SYSTEM_ALERT: { priority: 'MEDIUM', expiresAt: '' },
                DASHBOARD_PIN: {},
                DM: {},
                STREAM: {},
                RESOURCES: {},
                COMMUNITY: {},
                TASKS: {},
            });
        } catch (err: unknown) {
            const anyErr = err as {
                response?: {
                    data?: {
                        details?: Record<string, string>;
                        message?: string;
                    };
                };
            };
            const details = anyErr?.response?.data?.details as Record<string, string> | undefined;

            if (details && typeof details === 'object') {
                const fieldErrors: Record<string, string> = {};
                Object.entries(details).forEach(([key, message]) => {
                    if (key.startsWith('scheduling.')) {
                        const localKey = `schedule.${key.split('.').slice(1).join('.')}`;
                        fieldErrors[localKey] = message;
                    } else if (key.startsWith('content.')) {
                        fieldErrors['content'] = message;
                    } else if (key === 'title') {
                        fieldErrors['title'] = message;
                    } else {
                        fieldErrors[key] = message;
                    }
                });

                setErrors((prev) => ({ ...prev, ...fieldErrors }));

                const msg = Object.values(details).slice(0, 5).join('\n');
                toast({
                    title: 'Please fix the highlighted fields',
                    description: msg,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Failed to create',
                    description:
                        anyErr?.response?.data?.message ||
                        (err instanceof Error ? err.message : 'Try again'),
                    variant: 'destructive',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold">Email Campaigning</h2>
            <div className="mt-6 grid max-w-3xl gap-8">
                {/* Review Dialog */}
                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Review Email Campaign</DialogTitle>
                            <DialogDescription>Confirm details before creating.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div>
                                <div className="text-sm font-medium">Title</div>
                                <div className="text-sm text-neutral-700">{title || '—'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Mode</div>
                                <div className="text-sm text-neutral-700">SYSTEM_ALERT (General Announcement)</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Medium</div>
                                <div className="text-sm text-neutral-700">EMAIL</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Audience</div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {reviewRecipientItems.length === 0 && <span>—</span>}
                                    {reviewRecipientItems.map((it, i) => (
                                        <span key={i} className="rounded-full border px-2 py-0.5">
                                            <span className="font-medium">{it.type}</span>
                                            <span>{' : '}</span>
                                            <span>{it.text}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Schedule</div>
                                <div className="text-sm text-neutral-700">
                                    {scheduleType === 'IMMEDIATE' && `IMMEDIATE (${timezone})`}
                                    {scheduleType === 'ONE_TIME' &&
                                        `ONE_TIME at ${oneTimeStart || '—'} (${timezone})`}
                                    {scheduleType === 'RECURRING' &&
                                        `RECURRING ${cronExpression || '—'} (${timezone})`}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsReviewOpen(false)}>
                                Back
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsReviewOpen(false);
                                    handleSubmit();
                                }}
                                disabled={isSubmitting}
                            >
                                Confirm & Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogContent className="max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>Email Preview</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPreviewDevice('mobile')}
                            >
                                <Smartphone className="mr-1 h-4 w-4" />
                                Mobile
                            </Button>
                            <Button
                                variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPreviewDevice('tablet')}
                            >
                                <Tablet className="mr-1 h-4 w-4" />
                                Tablet
                            </Button>
                            <Button
                                variant={previewDevice === 'laptop' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPreviewDevice('laptop')}
                            >
                                <Laptop className="mr-1 h-4 w-4" />
                                Laptop
                            </Button>
                        </div>
                        <div className="flex justify-center">
                            <div
                                style={{ width: DEVICE_PRESETS[previewDevice].width }}
                                className="border bg-white p-4 shadow-sm"
                            >
                                <div className="mb-2 border-b pb-2">
                                    <div className="text-sm font-semibold">{title || 'Email Subject'}</div>
                                </div>
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: htmlContent || '<p>No content</p>' }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Basic */}
                <section className="grid gap-3">
                    <Label>Title / Email Subject</Label>
                    <Input
                        placeholder="Email Subject"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                    
                    <Label>Email Content</Label>
                    <div className="flex items-center gap-2 self-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setContentView('editor')}
                            disabled={contentView === 'editor'}
                        >
                            Rich Editor
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setContentView('source')}
                            disabled={contentView === 'source'}
                        >
                            HTML Source
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPreviewOpen(true)}
                            disabled={isPreviewOpen}
                        >
                            Preview
                        </Button>
                    </div>
                    {contentView === 'editor' && (
                        <div
                            className={`rounded border bg-white ${errors.content ? 'border-red-500' : 'border-transparent'}`}
                        >
                            <TipTapEditor
                                value={htmlContent}
                                onChange={setHtmlContent}
                                onBlur={() => {}}
                                placeholder={'Write the email content'}
                                minHeight={160}
                            />
                        </div>
                    )}
                    {contentView === 'source' && (
                        <Textarea
                            placeholder="HTML source"
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            rows={10}
                            className={errors.content ? 'border-red-500' : ''}
                        />
                    )}
                    {errors.content && <p className="text-xs text-red-600">{errors.content}</p>}
                </section>

                <Separator />

                {/* Email Template Section */}
                <section className="grid gap-3">
                    <h3 className="text-lg font-medium">Email Template</h3>
                    
                    <div className="mb-4 flex items-center gap-2">
                        <Checkbox
                            id="use-template"
                            checked={useTemplate}
                            onCheckedChange={async (checked) => {
                                setUseTemplate(Boolean(checked));
                                if (checked) {
                                    await loadEmailTemplates();
                                } else {
                                    setSelectedTemplateId('');
                                }
                            }}
                        />
                        <Label htmlFor="use-template" className="text-sm font-medium">
                            Use Email Template
                        </Label>
                    </div>

                    {useTemplate && (
                        <div className="mb-4">
                            <Label className="mb-2 block text-sm font-medium">
                                Select Template
                            </Label>
                            <Select
                                value={selectedTemplateId}
                                onValueChange={(value) => {
                                    if (value === 'add-new-template') {
                                        navigate({ to: '/settings', search: { selectedTab: 'templates' } });
                                    } else {
                                        handleTemplateSelection(value);
                                    }
                                }}
                                disabled={templatesLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={
                                        templatesLoading 
                                            ? "Loading templates..." 
                                            : "Select a template"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {emailTemplates.length > 0 ? (
                                        <>
                                            {emailTemplates.map((template) => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                            <Separator className="my-1" />
                                            <SelectItem value="add-new-template" className="text-primary-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    <span>Add New Template</span>
                                                </div>
                                            </SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="no-templates" disabled>
                                                No templates available
                                            </SelectItem>
                                            <Separator className="my-1" />
                                            <SelectItem value="add-new-template" className="text-primary-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    <span>Add New Template</span>
                                                </div>
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {selectedTemplateId && selectedTemplateId !== 'add-new-template' && (
                                <div className="mt-2 text-xs text-neutral-600">
                                    Template selected: {emailTemplates.find(t => t.id === selectedTemplateId)?.name}
                                </div>
                            )}
                            {templatesError && (
                                <div className="mt-2 text-xs text-red-600">
                                    {templatesError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* From Email selection */}
                    <div className="mb-4">
                        <Label className="mb-2 block text-sm font-medium">
                            From Email
                        </Label>
                        <Select
                            value={selectedFromEmail || ''}
                            onValueChange={(value) => {
                                if (value && value !== 'undefined') {
                                    setSelectedFromEmail(value);
                                }
                            }}
                            disabled={emailConfigsLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={
                                    emailConfigsLoading 
                                        ? "Loading email configurations..." 
                                        : "Select from email"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {emailConfigurations.length > 0 ? (
                                    emailConfigurations.map((config, index) => {
                                        const uniqueValue = `${config.email}-${config.name}`;
                                        return (
                                            <SelectItem key={`${config.email}-${index}`} value={uniqueValue}>
                                                {config.name} ({config.email})
                                            </SelectItem>
                                        );
                                    })
                                ) : (
                                    <SelectItem value="no-configs" disabled>
                                        No email configurations available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {selectedFromEmail && (
                            <div className="mt-2 text-xs text-neutral-600">
                                From: {emailConfigurations.find(c => `${c.email}-${c.name}` === selectedFromEmail)?.email}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-neutral-600">
                        {useTemplate 
                            ? "Template content will be applied to Title and Content above."
                            : "Subject and body will use the Title and Content provided above."
                        }
                    </p>
                </section>

                <Separator />

                {/* Audience */}
                <section className="grid gap-3">
                    <h3 className="text-lg font-medium">Audience</h3>
                    <p className="text-sm text-muted-foreground">
                        Define who should receive this email campaign.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addRecipientPreset('ALL_STUDENTS')}
                        >
                            + All Students
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addRecipientPreset('ALL_TEACHERS')}
                        >
                            + All Teachers
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addBatchRecipient}
                        >
                            + Batch
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setRecipients((prev) => [
                                    ...prev,
                                    { recipientType: 'TAG', recipientId: '', recipientName: '' },
                                ])
                            }
                        >
                            + Tag
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setRecipients((prev) => [
                                    ...prev,
                                    { recipientType: 'USER', recipientId: '', recipientName: '' },
                                ])
                            }
                        >
                            + Specific User
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {recipients.map((r, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <Select
                                    value={r.recipientType}
                                    onValueChange={(v) => {
                                        setRecipients((prev) => {
                                            const copy = [...prev];
                                            copy[idx] = {
                                                recipientType: v as 'ROLE' | 'USER' | 'PACKAGE_SESSION' | 'TAG',
                                                recipientId: '',
                                                recipientName: '',
                                            };
                                            return copy;
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ROLE">Role</SelectItem>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="PACKAGE_SESSION">Batch</SelectItem>
                                        <SelectItem value="TAG">Tag</SelectItem>
                                    </SelectContent>
                                </Select>
                                {r.recipientType === 'ROLE' && (
                                    <Select
                                        value={r.recipientId}
                                        onValueChange={(v) => {
                                            setRecipients((prev) =>
                                                prev.map((item, i) => 
                                                    i === idx 
                                                        ? { recipientType: 'ROLE' as const, recipientId: v, recipientName: '' }
                                                        : item
                                                )
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STUDENT">Student</SelectItem>
                                            <SelectItem value="TEACHER">Teacher</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                                {r.recipientType === 'USER' && (
                                    <Input
                                        placeholder="User ID or email"
                                        value={r.recipientId}
                                        onChange={(e) => {
                                            setRecipients((prev) =>
                                                prev.map((item, i) => 
                                                    i === idx 
                                                        ? { recipientType: 'USER' as const, recipientId: e.target.value, recipientName: '' }
                                                        : item
                                                )
                                            );
                                        }}
                                    />
                                )}
                                {r.recipientType === 'PACKAGE_SESSION' && (
                                    <Select
                                        value={r.recipientId}
                                        onValueChange={(v) => {
                                            const option = packageSessionOptions.find(opt => opt.id === v);
                                            setRecipients((prev) => 
                                                prev.map((item, i) => 
                                                    i === idx 
                                                        ? { 
                                                            recipientType: 'PACKAGE_SESSION' as const,
                                                            recipientId: v, 
                                                            recipientName: option?.label || '' 
                                                          }
                                                        : item
                                                )
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-96">
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packageSessionOptions.map((option) => (
                                                <SelectItem key={option.id} value={option.id}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {r.recipientType === 'TAG' && (
                                    <div className="flex-1">
                                        <MultiSelect
                                            options={tagOptions}
                                            selected={tagSelections[idx] || []}
                                            onChange={(vals) =>
                                                setTagSelections((prev) => ({
                                                    ...prev,
                                                    [idx]: vals,
                                                }))
                                            }
                                            placeholder={
                                                tagsLoading
                                                    ? 'Loading tags…'
                                                    : 'Select one or more tags'
                                            }
                                            disabled={tagsLoading}
                                        />
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Tags target users linked to the selected tags.
                                        </div>
                                        {Array.isArray(tagSelections[idx]) &&
                                            (tagSelections[idx]?.length ?? 0) > 0 && (
                                                <div className="mt-1 text-xs text-neutral-600">
                                                    Estimated users for this row:{' '}
                                                    {rowTagEstimates[idx] ?? '—'}
                                                </div>
                                            )}
                                    </div>
                                )}
                                <Button variant="ghost" onClick={() => removeRecipientAtIndex(idx)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Recipient chips summary */}
                    {recipients.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs">
                            {recipients.map((r, idx) => {
                                if (r.recipientType === 'TAG') {
                                    const ids = tagSelections[idx] || [];
                                    return ids.map((id) => {
                                        const tag = tagMapById[id];
                                        return (
                                            <span
                                                key={`${idx}-${id}`}
                                                className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5"
                                            >
                                                <span className="font-medium">TAG</span>
                                                <span className="text-neutral-600">
                                                    {tag?.tagName || id}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="text-neutral-500 hover:text-neutral-800"
                                                    onClick={() => {
                                                        setTagSelections((prev) => {
                                                            const next = { ...prev };
                                                            next[idx] = (next[idx] || []).filter(
                                                                (x) => x !== id
                                                            );
                                                            return next;
                                                        });
                                                    }}
                                                    aria-label="Remove tag"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    });
                                }
                                return (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5"
                                    >
                                        <span className="font-medium">
                                            {r.recipientType === 'PACKAGE_SESSION' ? 'Batch' : r.recipientType}
                                        </span>
                                        <span className="text-neutral-600">
                                            {r.recipientType === 'PACKAGE_SESSION' 
                                                ? packageSessionOptions.find(opt => opt.id === r.recipientId)?.label || r.recipientId || '—'
                                                : r.recipientId || r.recipientName || '—'
                                            }
                                        </span>
                                        <button
                                            type="button"
                                            className="text-neutral-500 hover:text-neutral-800"
                                            onClick={() => removeRecipientAtIndex(idx)}
                                            aria-label="Remove recipient"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Estimated users */}
                    {Object.values(tagSelections).flat().length > 0 && (
                        <div className="text-xs text-neutral-600">
                            {estimatingUsers
                                ? 'Estimating users…'
                                : `Estimated users (any of selected tags): ${estimatedUsers ?? '—'}`}
                        </div>
                    )}
                </section>

                {/* Exclusions */}
                <section className="grid gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Exclusions</h3>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowExclusionSection(!showExclusionSection)}
                            >
                                {showExclusionSection ? 'Hide' : 'Show'} Exclusions
                            </Button>
                            {showExclusionSection && (
                                <Button
                                    variant="secondary"
                                    onClick={addExclusion}
                                >
                                    + Add Exclusion
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Exclude specific users, roles, batches, or tags from receiving this email campaign.
                    </div>
                    
                    {showExclusionSection && (
                        <div className="grid gap-3">
                            {exclusions.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                                    No exclusions added yet
                                </div>
                            ) : (
                                exclusions.map((exclusion) => (
                                    <div key={exclusion.id} className="flex items-center gap-2 p-3 border rounded-md">
                                        <Select
                                            value={exclusion.recipientType}
                                            onValueChange={(value) => 
                                                updateExclusion(exclusion.id, 'recipientType', value)
                                            }
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ROLE">Role</SelectItem>
                                                <SelectItem value="USER">User</SelectItem>
                                                <SelectItem value="PACKAGE_SESSION">Batch</SelectItem>
                                                <SelectItem value="TAG">Tag</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {exclusion.recipientType === 'ROLE' ? (
                                            <Select
                                                value={exclusion.recipientId}
                                                onValueChange={(value) => {
                                                    updateExclusion(exclusion.id, 'recipientId', value);
                                                    updateExclusion(exclusion.id, 'recipientName', value);
                                                }}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="STUDENT">Student</SelectItem>
                                                    <SelectItem value="TEACHER">Teacher</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : exclusion.recipientType === 'PACKAGE_SESSION' ? (
                                            <Select
                                                value={exclusion.recipientId}
                                                onValueChange={(value) => {
                                                    const option = packageSessionOptions.find(opt => opt.id === value);
                                                    updateExclusion(exclusion.id, 'recipientId', value);
                                                    if (option) {
                                                        updateExclusion(exclusion.id, 'recipientName', option.label);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder="Select batch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packageSessionOptions.map((option) => (
                                                        <SelectItem key={option.id} value={option.id}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : exclusion.recipientType === 'TAG' ? (
                                            <Select
                                                value={exclusion.recipientId}
                                                onValueChange={(value) => {
                                                    const tag = tagMapById[value];
                                                    updateExclusion(exclusion.id, 'recipientId', value);
                                                    if (tag) {
                                                        updateExclusion(exclusion.id, 'recipientName', tag.tagName);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder="Select tag" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tagOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                placeholder="User ID or email"
                                                value={exclusion.recipientId}
                                                onChange={(e) => 
                                                    updateExclusion(exclusion.id, 'recipientId', e.target.value)
                                                }
                                                className="w-48"
                                            />
                                        )}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeExclusion(exclusion.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>

                <Separator />

                {/* Mode Settings - Fixed to SYSTEM_ALERT */}
                <section className="grid gap-3">
                    <h3 className="text-lg font-medium">Campaign Settings</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure the priority and expiration for this email campaign.
                    </p>
                    <div className="rounded-md border p-4">
                        <div className="mb-2 font-medium">Priority & Expiration</div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={(modeSettings.SYSTEM_ALERT?.priority as string) || 'MEDIUM'}
                                    onValueChange={(v) => 
                                        setModeSettings((prev) => ({
                                            ...prev,
                                            SYSTEM_ALERT: { ...prev.SYSTEM_ALERT, priority: v }
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">HIGH</SelectItem>
                                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                                        <SelectItem value="LOW">LOW</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors['modes.SYSTEM_ALERT.priority'] && (
                                    <p className="text-xs text-red-600">
                                        {errors['modes.SYSTEM_ALERT.priority']}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Expires At (Optional)</Label>
                                <Input
                                    type="datetime-local"
                                    value={(modeSettings.SYSTEM_ALERT?.expiresAt as string) || ''}
                                    onChange={(e) => 
                                        setModeSettings((prev) => ({
                                            ...prev,
                                            SYSTEM_ALERT: { ...prev.SYSTEM_ALERT, expiresAt: e.target.value }
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Scheduling */}
                <section className="grid gap-3">
                    <h3 className="text-lg font-medium">Scheduling</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Select
                            value={scheduleType}
                            onValueChange={(v) =>
                                setScheduleType(v as 'IMMEDIATE' | 'ONE_TIME' | 'RECURRING')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Schedule Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IMMEDIATE">IMMEDIATE</SelectItem>
                                <SelectItem value="ONE_TIME">ONE_TIME</SelectItem>
                                <SelectItem value="RECURRING">RECURRING</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={timezone} onValueChange={(v) => setTimezone(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONE_OPTIONS.map((tz) => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-neutral-600">Quick picks:</span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applyScheduleQuickPick('NOW')}
                            >
                                Now
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applyScheduleQuickPick('IN_1H')}
                            >
                                +1h
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applyScheduleQuickPick('TOMORROW_9AM')}
                            >
                                Tmrw 9AM
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applyScheduleQuickPick('NEXT_MON_9AM')}
                            >
                                Mon 9AM
                            </Button>
                        </div>
                    </div>
                    {scheduleType === 'ONE_TIME' && (
                        <div className="grid gap-2">
                            <Label>Run At</Label>
                            <Input
                                type="datetime-local"
                                value={oneTimeStart}
                                onChange={(e) => setOneTimeStart(e.target.value)}
                                className={errors['schedule.startDate'] ? 'border-red-500' : ''}
                            />
                            {errors['schedule.startDate'] && (
                                <p className="text-xs text-red-600">{errors['schedule.startDate']}</p>
                            )}
                        </div>
                    )}
                    {scheduleType === 'RECURRING' && (
                        <div className="grid gap-2">
                            <Label>Cron Expression</Label>
                            <Input
                                placeholder="0 0 9 * * ?"
                                value={cronExpression}
                                onChange={(e) => setCronExpression(e.target.value)}
                                className={errors['schedule.cronExpression'] ? 'border-red-500' : ''}
                            />
                            {errors['schedule.cronExpression'] && (
                                <p className="text-xs text-red-600">
                                    {errors['schedule.cronExpression']}
                                </p>
                            )}
                            <div className="flex gap-2 text-xs">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyCronTemplate('DAILY_9')}
                                >
                                    Daily 9AM
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyCronTemplate('MON_9')}
                                >
                                    Monday 9AM
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyCronTemplate('HOURLY')}
                                >
                                    Hourly
                                </Button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Submit */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending…' : 'Send Email Campaign'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsReviewOpen(true)}
                        disabled={isSubmitting}
                    >
                        Review and Send
                    </Button>
                </div>
            </div>
        </div>
    );
}
