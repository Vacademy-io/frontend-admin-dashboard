import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
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
import { Switch } from '@/components/ui/switch';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import useLocalStorage from '@/hooks/use-local-storage';
import TipTapEditor from '@/components/tiptap/TipTapEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, Tablet, Laptop } from 'lucide-react';
import { MultiSelect, type OptionType } from '@/components/design-system/multi-select';
import { getInstituteTags, getUserCountsByTags, type TagItem } from '@/services/tag-management';
import { getInstituteId } from '@/constants/helper';

export const Route = createFileRoute('/announcement/create/')({
    component: () => (
        <LayoutContainer>
            <CreateAnnouncementPage />
        </LayoutContainer>
    ),
});

function CreateAnnouncementPage() {
    const { setNavHeading } = useNavHeadingStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Minimal starter state; real UI will dynamically build this
    const [title, setTitle] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [contentView, setContentView] = useState<'editor' | 'source'>('editor');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'laptop'>('laptop');
    const DEVICE_PRESETS: Record<typeof previewDevice, { label: string; width: number }> = {
        mobile: { label: 'Mobile', width: 390 }, // iPhone 14 width
        tablet: { label: 'Tablet', width: 768 }, // iPad portrait
        laptop: { label: 'Laptop', width: 1280 }, // common laptop width
    };
    const isFullHtmlDoc = useMemo(() => {
        const s = htmlContent || '';
        return (
            /<html[\s\S]*<\/html>/i.test(s) ||
            /<head[\s\S]*<\/head>/i.test(s) ||
            /<body[\s\S]*<\/body>/i.test(s)
        );
    }, [htmlContent]);
    const [selectedModes, setSelectedModes] = useState<ModeType[]>([]);
    const [modeSettings, setModeSettings] = useState<Record<ModeType, Record<string, unknown>>>(
        {} as Record<ModeType, Record<string, unknown>>
    );
    const [selectedMediums, setSelectedMediums] = useState<MediumType[]>(['PUSH_NOTIFICATION']);
    const [mediumConfigs, setMediumConfigs] = useState<Record<MediumType, Record<string, unknown>>>(
        {
            PUSH_NOTIFICATION: { title: '', body: '' },
            EMAIL: { subject: '', body: '' },
            WHATSAPP: { template: '', variables: {} },
        }
    );
    const [recipients, setRecipients] = useState<CreateAnnouncementRequest['recipients']>([
        { recipientType: 'ROLE', recipientId: 'STUDENT' },
    ]);
    // For TAG recipient rows, hold selected tagIds by row index
    const [tagSelections, setTagSelections] = useState<Record<number, string[]>>({});
    const [tagOptions, setTagOptions] = useState<OptionType[]>([]);
    const [tagMapById, setTagMapById] = useState<Record<string, TagItem>>({});
    const [tagsLoading, setTagsLoading] = useState(false);
    const [estimatedUsers, setEstimatedUsers] = useState<number | null>(null);
    const [estimatingUsers, setEstimatingUsers] = useState(false);
    const [scheduleType, setScheduleType] = useState<'IMMEDIATE' | 'ONE_TIME' | 'RECURRING'>(
        'IMMEDIATE'
    );
    // Persist timezone in localStorage
    const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const { getValue: getSavedTz, setValue: setSavedTz } = useLocalStorage<string>(
        'announcement_timezone',
        defaultTz
    );
    const [timezone, setTimezone] = useState<string>(getSavedTz());
    const [oneTimeStart, setOneTimeStart] = useState<string>('');
    const [oneTimeEnd] = useState<string>('');
    const [cronExpression, setCronExpression] = useState<string>('');

    // Permissions
    const [allowedModes, setAllowedModes] = useState<Record<ModeType, boolean>>(
        {} as Record<ModeType, boolean>
    );
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const userRoles = useMemo(() => getUserRoles(accessToken), [accessToken]);
    const primaryRole = userRoles?.[0] ?? 'TEACHER';

    useEffect(() => {
        setNavHeading('Create Announcement');
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

    // Optional UX: estimate users for selected tags (ANY-of semantics)
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

    // Prefill from schedule page (query: scheduleType, startDate)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const sp = new URLSearchParams(window.location.search);
            const st = sp.get('scheduleType');
            const sd = sp.get('startDate');
            if (st === 'ONE_TIME') {
                setScheduleType('ONE_TIME');
                if (sd) {
                    // Convert ISO to input datetime-local format (YYYY-MM-DDTHH:mm)
                    const dt = new Date(sd);
                    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                    setOneTimeStart(local);
                }
            }
        } catch {
            /* no-op */
        }
    }, []);

    // Persist timezone whenever it changes
    useEffect(() => {
        if (timezone) setSavedTz(timezone);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timezone]);

    useEffect(() => {
        // Check institute permissions for each mode
        const allModes: ModeType[] = [
            'SYSTEM_ALERT',
            'DASHBOARD_PIN',
            'DM',
            'STREAM',
            'RESOURCES',
            'COMMUNITY',
            'TASKS',
        ];
        (async () => {
            try {
                // Ensure settings exist (optional fetch)
                await InstituteAnnouncementSettingsService.get().catch(() => undefined);
                const results = await Promise.all(
                    allModes.map(async (mode) => {
                        try {
                            const res: { allowed?: boolean } =
                                await InstituteAnnouncementSettingsService.checkPermissions({
                                    userRole: primaryRole,
                                    action: 'send',
                                    modeType: mode,
                                });
                            return { mode, allowed: res?.allowed ?? true };
                        } catch (e) {
                            // If API not available for a specific mode, default allow
                            return { mode, allowed: true };
                        }
                    })
                );
                const map = results.reduce(
                    (acc, r) => {
                        acc[r.mode] = r.allowed;
                        return acc;
                    },
                    {} as Record<ModeType, boolean>
                );
                setAllowedModes(map);
            } finally {
                setLoadingPermissions(false);
            }
        })();
    }, [primaryRole]);

    return (
        <div className="p-4">
            {/* TODO: Build dynamic UI based on institute + notification settings */}
            <h2 className="text-xl font-semibold">Create Announcement</h2>
            <div className="mt-6 grid max-w-3xl gap-8">
                {/* Basic */}
                <section className="grid gap-3">
                    <Label>Title</Label>
                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                    <Label>Content</Label>
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
                                placeholder={'Write the announcement content'}
                                minHeight={160}
                            />
                        </div>
                    )}
                    {contentView === 'source' && (
                        <Textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className={`min-h-[160px] ${errors.content ? 'border-red-500' : ''}`}
                            placeholder="Paste or edit raw HTML for the announcement..."
                        />
                    )}
                    {/* Preview Modal */}
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogContent className="w-[95vw] max-w-none">
                            <DialogHeader>
                                <DialogTitle>Preview</DialogTitle>
                                <div className="mt-2 flex items-center gap-2">
                                    <Button
                                        variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                                        size="sm"
                                        aria-pressed={previewDevice === 'mobile'}
                                        onClick={() => setPreviewDevice('mobile')}
                                    >
                                        <Smartphone className="mr-1 size-3.5" /> Mobile
                                    </Button>
                                    <Button
                                        variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                                        size="sm"
                                        aria-pressed={previewDevice === 'tablet'}
                                        onClick={() => setPreviewDevice('tablet')}
                                    >
                                        <Tablet className="mr-1 size-3.5" /> Tablet
                                    </Button>
                                    <Button
                                        variant={previewDevice === 'laptop' ? 'default' : 'outline'}
                                        size="sm"
                                        aria-pressed={previewDevice === 'laptop'}
                                        onClick={() => setPreviewDevice('laptop')}
                                    >
                                        <Laptop className="mr-1 size-3.5" /> Laptop
                                    </Button>
                                </div>
                            </DialogHeader>
                            <div className="flex max-h-[80vh] w-full items-center justify-center overflow-auto p-2">
                                <div
                                    className="mx-auto overflow-hidden rounded border bg-white shadow"
                                    style={{
                                        width: DEVICE_PRESETS[previewDevice].width,
                                        height: '75vh',
                                        transition: 'width 200ms ease',
                                    }}
                                >
                                    <iframe
                                        title="Announcement Preview"
                                        sandbox="allow-same-origin"
                                        className="size-full"
                                        srcDoc={
                                            isFullHtmlDoc
                                                ? htmlContent
                                                : `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=${DEVICE_PRESETS[previewDevice].width}, initial-scale=1" /><style>*,*::before,*::after{box-sizing:border-box}body{margin:0;padding:16px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}img,video{max-width:100%;height:auto}.container,.ProseMirror{max-width:none!important}</style></head><body>${htmlContent}</body></html>`
                                        }
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {errors.content && <p className="text-xs text-red-600">{errors.content}</p>}
                </section>

                <Separator />

                {/* Recipients */}
                <section className="grid gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Recipients</h3>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setRecipients((prev) => [
                                    ...prev,
                                    {
                                        recipientType: 'ROLE',
                                        recipientId: 'STUDENT',
                                        recipientName: '',
                                    },
                                ])
                            }
                        >
                            Add
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Tags target users linked to the selected tags. If multiple tags are
                        selected, users with any of those tags will receive the announcement.
                        Recipients (Role/Package Session/User/Tag) may be mixed; server dedupes.
                        <a
                            href="https://docs.vacademy.io/notification/announcements"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            Announcement API usage
                        </a>
                    </div>
                    <div className="grid gap-3">
                        {recipients.map((r, idx) => (
                            <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                <Select
                                    value={r.recipientType}
                                    onValueChange={(val) => {
                                        const updated = [...recipients];
                                        updated[idx] = {
                                            ...r,
                                            recipientType: val as
                                                | 'ROLE'
                                                | 'USER'
                                                | 'PACKAGE_SESSION'
                                                | 'TAG',
                                            recipientId: '',
                                        };
                                        setRecipients(updated);
                                        // Initialize/clear tag selections when switching types
                                        setTagSelections((prev) => {
                                            const next = { ...prev };
                                            if (val === 'TAG') next[idx] = next[idx] || [];
                                            else delete next[idx];
                                            return next;
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ROLE">ROLE</SelectItem>
                                        <SelectItem value="PACKAGE_SESSION">
                                            PACKAGE_SESSION
                                        </SelectItem>
                                        <SelectItem value="USER">USER</SelectItem>
                                        <SelectItem value="TAG">TAG</SelectItem>
                                    </SelectContent>
                                </Select>
                                {r.recipientType === 'ROLE' ? (
                                    <Select
                                        value={r.recipientId}
                                        onValueChange={(val) => {
                                            const updated = [...recipients];
                                            updated[idx] = { ...r, recipientId: val };
                                            setRecipients(updated);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                            <SelectItem value="TEACHER">TEACHER</SelectItem>
                                            <SelectItem value="STUDENT">STUDENT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : r.recipientType === 'PACKAGE_SESSION' ? (
                                    <Input
                                        placeholder={'Package Session ID'}
                                        value={r.recipientId}
                                        onChange={(e) => {
                                            const updated = [...recipients];
                                            updated[idx] = { ...r, recipientId: e.target.value };
                                            setRecipients(updated);
                                        }}
                                    />
                                ) : r.recipientType === 'USER' ? (
                                    <Input
                                        placeholder={'User ID'}
                                        value={r.recipientId}
                                        onChange={(e) => {
                                            const updated = [...recipients];
                                            updated[idx] = { ...r, recipientId: e.target.value };
                                            setRecipients(updated);
                                        }}
                                    />
                                ) : (
                                    <div className="col-span-2">
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
                                            Tags target users linked to the selected tags. If
                                            multiple tags are selected, users with any of those tags
                                            will receive the announcement.
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setRecipients(recipients.filter((_, i) => i !== idx))
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                    {/* Estimated users (optional UX) */}
                    {Object.values(tagSelections).flat().length > 0 && (
                        <div className="text-xs text-neutral-600">
                            {estimatingUsers
                                ? 'Estimating users…'
                                : `Estimated users (any of selected tags): ${estimatedUsers ?? '—'}`}
                        </div>
                    )}
                </section>

                <Separator />

                {/* Modes */}
                <section className="grid gap-3">
                    <h3 className="text-lg font-medium">Modes</h3>
                    {loadingPermissions ? (
                        <div className="text-sm text-neutral-500">Loading permissions…</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            {(
                                [
                                    'SYSTEM_ALERT',
                                    'DASHBOARD_PIN',
                                    'DM',
                                    'STREAM',
                                    'RESOURCES',
                                    'COMMUNITY',
                                    'TASKS',
                                ] as ModeType[]
                            ).map((m) => (
                                <label key={m} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedModes.includes(m)}
                                        onCheckedChange={(checked) => {
                                            const isChecked = Boolean(checked);
                                            setSelectedModes((prev) =>
                                                isChecked
                                                    ? [...prev, m]
                                                    : prev.filter((x) => x !== m)
                                            );
                                            if (isChecked && !modeSettings[m]) {
                                                // initialize minimal settings
                                                setModeSettings((prev) => ({
                                                    ...prev,
                                                    [m]: defaultModeSettings(m),
                                                }));
                                            }
                                        }}
                                        disabled={allowedModes[m] === false}
                                    />
                                    <span
                                        className={
                                            allowedModes[m] === false ? 'text-neutral-400' : ''
                                        }
                                    >
                                        {m}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Mode-specific settings */}
                    <div className="grid gap-4">
                        {selectedModes.map((m) => (
                            <div key={m} className="rounded-md border p-4">
                                <div className="mb-2 font-medium">{m} settings</div>
                                {renderModeSettingsForm(
                                    m,
                                    modeSettings[m],
                                    (updated) =>
                                        setModeSettings((prev) => ({ ...prev, [m]: updated })),
                                    errors,
                                    `modes.${m}`
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <Separator />

                {/* Mediums */}
                <section className="grid gap-3">
                    <h3 className="text-lg font-medium">Mediums</h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        {(['PUSH_NOTIFICATION', 'EMAIL', 'WHATSAPP'] as MediumType[]).map((med) => (
                            <label key={med} className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedMediums.includes(med)}
                                    onCheckedChange={(checked) => {
                                        const isChecked = Boolean(checked);
                                        setSelectedMediums((prev) =>
                                            isChecked
                                                ? [...prev, med]
                                                : prev.filter((x) => x !== med)
                                        );
                                    }}
                                />
                                <span>{med}</span>
                            </label>
                        ))}
                    </div>

                    {/* Medium configs */}
                    <div className="grid gap-4">
                        {selectedMediums.includes('PUSH_NOTIFICATION') && (
                            <div className="rounded-md border p-4">
                                <div className="mb-2 font-medium">Push Notification</div>
                                <div className="grid gap-2 md:grid-cols-2">
                                    <Input
                                        placeholder="Title"
                                        value={
                                            (mediumConfigs.PUSH_NOTIFICATION?.title as string) ?? ''
                                        }
                                        onChange={(e) =>
                                            setMediumConfigs((prev) => ({
                                                ...prev,
                                                PUSH_NOTIFICATION: {
                                                    ...prev.PUSH_NOTIFICATION,
                                                    title: e.target.value,
                                                },
                                            }))
                                        }
                                    />
                                    <Input
                                        placeholder="Body"
                                        value={
                                            (mediumConfigs.PUSH_NOTIFICATION?.body as string) ?? ''
                                        }
                                        onChange={(e) =>
                                            setMediumConfigs((prev) => ({
                                                ...prev,
                                                PUSH_NOTIFICATION: {
                                                    ...prev.PUSH_NOTIFICATION,
                                                    body: e.target.value,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        {selectedMediums.includes('EMAIL') && (
                            <div className="rounded-md border p-4">
                                <div className="mb-2 font-medium">Email</div>
                                <p className="text-sm text-neutral-600">
                                    Subject and body will use the Title and Content provided above.
                                </p>
                            </div>
                        )}
                        {selectedMediums.includes('WHATSAPP') && (
                            <div className="rounded-md border p-4">
                                <div className="mb-2 font-medium">WhatsApp</div>
                                <div className="grid gap-2">
                                    <Input
                                        placeholder="Template Name"
                                        value={(mediumConfigs.WHATSAPP?.template as string) ?? ''}
                                        onChange={(e) =>
                                            setMediumConfigs((prev) => ({
                                                ...prev,
                                                WHATSAPP: {
                                                    ...prev.WHATSAPP,
                                                    template: e.target.value,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        )}
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
                        <Input
                            placeholder="Timezone (e.g., Asia/Kolkata)"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                        />
                    </div>
                    {scheduleType === 'ONE_TIME' && (
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <Label>Run at</Label>
                                <Input
                                    type="datetime-local"
                                    value={oneTimeStart}
                                    onChange={(e) => setOneTimeStart(e.target.value)}
                                    className={errors['schedule.startDate'] ? 'border-red-500' : ''}
                                />
                                {errors['schedule.startDate'] && (
                                    <p className="text-xs text-red-600">
                                        {errors['schedule.startDate']}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {scheduleType === 'RECURRING' && (
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <Label>Cron Expression</Label>
                                <Input
                                    placeholder="0 0 9 * * ?"
                                    value={cronExpression}
                                    onChange={(e) => setCronExpression(e.target.value)}
                                    className={
                                        errors['schedule.cronExpression'] ? 'border-red-500' : ''
                                    }
                                />
                                {errors['schedule.cronExpression'] && (
                                    <p className="text-xs text-red-600">
                                        {errors['schedule.cronExpression']}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <Separator />

                <div>
                    <Button
                        disabled={
                            isSubmitting || !title || !htmlContent || selectedModes.length === 0
                        }
                        onClick={async () => {
                            try {
                                // Validate required fields per selected mode
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

                                for (const m of selectedModes) {
                                    const s = (modeSettings[m] || {}) as Record<string, unknown>;
                                    if (m === 'SYSTEM_ALERT') {
                                        const p = (s.priority as string) || '';
                                        if (!p) {
                                            validationErrors.push(
                                                'SYSTEM_ALERT: priority is required'
                                            );
                                            fieldErrors['modes.SYSTEM_ALERT.priority'] =
                                                'Priority is required';
                                        }
                                    }
                                    if (m === 'DASHBOARD_PIN') {
                                        const start = (s.pinStartTime as string) || '';
                                        const end = (s.pinEndTime as string) || '';
                                        const pos = (s.position as string) || '';
                                        if (!pos) {
                                            validationErrors.push(
                                                'DASHBOARD_PIN: position is required'
                                            );
                                            fieldErrors['modes.DASHBOARD_PIN.position'] =
                                                'Position is required';
                                        }
                                        if (!start || !end) {
                                            validationErrors.push(
                                                'DASHBOARD_PIN: start and end time are required'
                                            );
                                            if (!start)
                                                fieldErrors['modes.DASHBOARD_PIN.pinStartTime'] =
                                                    'Start time is required';
                                            if (!end)
                                                fieldErrors['modes.DASHBOARD_PIN.pinEndTime'] =
                                                    'End time is required';
                                        }
                                        if (start && end && new Date(start) >= new Date(end)) {
                                            validationErrors.push(
                                                'DASHBOARD_PIN: end time must be after start time'
                                            );
                                            fieldErrors['modes.DASHBOARD_PIN.pinEndTime'] =
                                                'End time must be after start';
                                        }
                                    }
                                    if (m === 'RESOURCES') {
                                        const folder = (s.folderName as string) || '';
                                        if (!folder) {
                                            validationErrors.push(
                                                'RESOURCES: folderName is required'
                                            );
                                            fieldErrors['modes.RESOURCES.folderName'] =
                                                'Folder name is required';
                                        }
                                    }
                                    if (m === 'COMMUNITY') {
                                        const cType = (s.communityType as string) || '';
                                        if (!cType) {
                                            validationErrors.push(
                                                'COMMUNITY: communityType is required'
                                            );
                                            fieldErrors['modes.COMMUNITY.communityType'] =
                                                'Community type is required';
                                        }
                                    }
                                    if (m === 'TASKS') {
                                        const slides = (s.slideIds as string[] | undefined) || [];
                                        const goLive = (s.goLiveDateTime as string) || '';
                                        const deadline = (s.deadlineDateTime as string) || '';
                                        const tTitle = (s.taskTitle as string) || '';
                                        if (!tTitle) {
                                            validationErrors.push('TASKS: taskTitle is required');
                                            fieldErrors['modes.TASKS.taskTitle'] =
                                                'Task title is required';
                                        }
                                        if (!slides.length) {
                                            validationErrors.push(
                                                'TASKS: slideIds must include at least one slide'
                                            );
                                            fieldErrors['modes.TASKS.slideIds'] =
                                                'At least one slide is required';
                                        }
                                        if (!goLive || !deadline) {
                                            validationErrors.push(
                                                'TASKS: go live and deadline are required'
                                            );
                                            if (!goLive)
                                                fieldErrors['modes.TASKS.goLiveDateTime'] =
                                                    'Go live is required';
                                            if (!deadline)
                                                fieldErrors['modes.TASKS.deadlineDateTime'] =
                                                    'Deadline is required';
                                        }
                                        if (
                                            goLive &&
                                            deadline &&
                                            new Date(goLive) >= new Date(deadline)
                                        ) {
                                            validationErrors.push(
                                                'TASKS: deadline must be after go live'
                                            );
                                            fieldErrors['modes.TASKS.deadlineDateTime'] =
                                                'Deadline must be after go live';
                                        }
                                    }
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
                                        validationErrors.push(
                                            'Schedule: cron expression is required for recurring'
                                        );
                                        fieldErrors['schedule.cronExpression'] =
                                            'Cron expression is required';
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

                                // Validate TAG recipients (require institute and at least one tag per TAG row)
                                const anyTagRow = recipients.some((r) => r.recipientType === 'TAG');
                                if (anyTagRow) {
                                    const missingTags = recipients.some(
                                        (r, idx) =>
                                            r.recipientType === 'TAG' && !tagSelections[idx]?.length
                                    );
                                    if (missingTags) {
                                        toast({
                                            title: 'Select at least one tag',
                                            description:
                                                'You have a TAG recipient without any selected tags.',
                                            variant: 'destructive',
                                        });
                                        return;
                                    }
                                    const instId = getInstituteId();
                                    if (!instId) {
                                        toast({
                                            title: 'Institute required',
                                            description:
                                                'An institute must be selected to target TAG recipients.',
                                            variant: 'destructive',
                                        });
                                        return;
                                    }
                                }

                                // Expand TAG selections into recipient entries with names
                                const expandedRecipients: CreateAnnouncementRequest['recipients'] =
                                    [];
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
                                const payload: Omit<CreateAnnouncementRequest, 'instituteId'> = {
                                    title,
                                    content: { type: 'html', content: htmlContent },
                                    createdBy: getUserId(),
                                    createdByName: getUserName(),
                                    createdByRole: primaryRole,
                                    recipients: expandedRecipients,
                                    modes: selectedModes.map((m) => ({
                                        modeType: m,
                                        settings: modeSettings[m] ?? {},
                                    })),
                                    mediums: selectedMediums.map((med) => ({
                                        mediumType: med,
                                        config:
                                            med === 'EMAIL'
                                                ? {
                                                      ...(mediumConfigs[med] ?? {}),
                                                      subject: title,
                                                      body: htmlContent,
                                                  }
                                                : mediumConfigs[med] ?? {},
                                    })),
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
                                                    endDate: oneTimeEnd
                                                        ? new Date(oneTimeEnd).toISOString()
                                                        : undefined,
                                                }
                                              : {
                                                    scheduleType,
                                                    timezone,
                                                    cronExpression: cronExpression || undefined,
                                                },
                                };
                                await AnnouncementService.create(payload);
                                // Fire a success Sonner toast immediately
                                try {
                                    const { toast: sonnerToast } = await import('sonner');
                                    sonnerToast.success('Announcement created');
                                } catch {
                                    // fallback to existing toast
                                    toast({ title: 'Announcement created' });
                                }
                                // Reset minimal fields
                                setTitle('');
                                setHtmlContent('');
                                setSelectedModes([]);
                                setModeSettings({} as Record<ModeType, Record<string, unknown>>);
                                setSelectedMediums(['PUSH_NOTIFICATION']);
                            } catch (err: unknown) {
                                // Try to parse API validation errors and show inline + toast
                                const anyErr = err as {
                                    response?: {
                                        data?: {
                                            details?: Record<string, string>;
                                            message?: string;
                                        };
                                    };
                                };
                                const details = anyErr?.response?.data?.details as
                                    | Record<string, string>
                                    | undefined;

                                if (details && typeof details === 'object') {
                                    const fieldErrors: Record<string, string> = {};

                                    Object.entries(details).forEach(([key, message]) => {
                                        // Map backend field paths to our local error keys
                                        if (key.startsWith('scheduling.')) {
                                            // scheduling.startDate -> schedule.startDate
                                            const localKey = `schedule.${key.split('.').slice(1).join('.')}`;
                                            fieldErrors[localKey] = message;
                                        } else if (key.startsWith('content.')) {
                                            fieldErrors['content'] = message;
                                        } else if (key === 'title') {
                                            fieldErrors['title'] = message;
                                        } else {
                                            // Fallback: attach to a general bucket if needed
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
                        }}
                    >
                        {isSubmitting ? 'Submitting…' : 'Create Announcement'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function defaultModeSettings(mode: ModeType): Record<string, unknown> {
    switch (mode) {
        case 'SYSTEM_ALERT':
            return { priority: 'HIGH', expiresAt: '' };
        case 'DASHBOARD_PIN':
            return { priority: 10, pinStartTime: '', pinEndTime: '', position: 'TOP' };
        case 'DM':
            return { messagePriority: 5, allowReplies: true };
        case 'STREAM':
            return { packageSessionId: '', streamType: 'LIVE' };
        case 'RESOURCES':
            return { folderName: '', category: '', accessLevel: 'STUDENTS' };
        case 'COMMUNITY':
            return { communityType: 'SCHOOL', tags: [] };
        case 'TASKS':
            return {
                slideIds: [],
                goLiveDateTime: '',
                deadlineDateTime: '',
                status: 'SCHEDULED',
                taskTitle: '',
                taskDescription: '',
                estimatedDurationMinutes: 0,
                maxAttempts: 1,
                isMandatory: false,
                autoStatusUpdate: true,
                reminderBeforeMinutes: 0,
            };
    }
}

function renderModeSettingsForm(
    mode: ModeType,
    settings: Record<string, unknown>,
    onChange: (updated: Record<string, unknown>) => void,
    errors?: Record<string, string>,
    errorPrefix?: string
) {
    const set = (key: string, value: unknown) => onChange({ ...settings, [key]: value });
    switch (mode) {
        case 'SYSTEM_ALERT':
            return (
                <div className="grid gap-3 md:grid-cols-3">
                    <Select
                        value={(settings.priority as string) || 'LOW'}
                        onValueChange={(v) => set('priority', v)}
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
                    <div>
                        <Label>Expires At</Label>
                        <Input
                            type="datetime-local"
                            value={(settings.expiresAt as string) || ''}
                            onChange={(e) => set('expiresAt', e.target.value)}
                        />
                        {errors && errorPrefix && errors[`${errorPrefix}.priority`] && (
                            <p className="text-xs text-red-600">
                                {errors[`${errorPrefix}.priority`]}
                            </p>
                        )}
                    </div>
                </div>
            );

        case 'DASHBOARD_PIN':
            return (
                <div className="grid gap-3 md:grid-cols-4">
                    <Input
                        type="number"
                        placeholder="Priority"
                        value={Number(settings.priority ?? 10)}
                        onChange={(e) => set('priority', Number(e.target.value))}
                    />
                    <Select
                        value={(settings.position as string) || 'TOP'}
                        onValueChange={(v) => set('position', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TOP">TOP</SelectItem>
                            <SelectItem value="BOTTOM">BOTTOM</SelectItem>
                        </SelectContent>
                    </Select>
                    <div>
                        <Label>Pin Start</Label>
                        <Input
                            type="datetime-local"
                            value={(settings.pinStartTime as string) || ''}
                            onChange={(e) => set('pinStartTime', e.target.value)}
                        />
                        {errors && errorPrefix && errors[`${errorPrefix}.pinStartTime`] && (
                            <p className="text-xs text-red-600">
                                {errors[`${errorPrefix}.pinStartTime`]}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label>Pin End</Label>
                        <Input
                            type="datetime-local"
                            value={(settings.pinEndTime as string) || ''}
                            onChange={(e) => set('pinEndTime', e.target.value)}
                        />
                        {errors && errorPrefix && errors[`${errorPrefix}.pinEndTime`] && (
                            <p className="text-xs text-red-600">
                                {errors[`${errorPrefix}.pinEndTime`]}
                            </p>
                        )}
                    </div>
                    {errors && errorPrefix && errors[`${errorPrefix}.position`] && (
                        <p className="col-span-4 text-xs text-red-600">
                            {errors[`${errorPrefix}.position`]}
                        </p>
                    )}
                </div>
            );

        case 'DM':
            return (
                <div className="grid gap-3 md:grid-cols-3">
                    <Input
                        type="number"
                        placeholder="Message Priority"
                        value={Number(settings.messagePriority ?? 5)}
                        onChange={(e) => set('messagePriority', Number(e.target.value))}
                    />
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={Boolean(settings.allowReplies)}
                            onCheckedChange={(v) => set('allowReplies', Boolean(v))}
                        />
                        <Label>Allow Replies</Label>
                    </div>
                </div>
            );

        case 'STREAM':
            return (
                <div className="grid gap-3 md:grid-cols-3">
                    <Input
                        placeholder="Package Session ID"
                        value={(settings.packageSessionId as string) || ''}
                        onChange={(e) => set('packageSessionId', e.target.value)}
                    />
                    <Select
                        value={(settings.streamType as string) || 'LIVE'}
                        onValueChange={(v) => set('streamType', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Stream Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LIVE">LIVE</SelectItem>
                            <SelectItem value="RECORDED">RECORDED</SelectItem>
                            <SelectItem value="UPCOMING">UPCOMING</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            );

        case 'RESOURCES':
            return (
                <div className="grid gap-3 md:grid-cols-3">
                    <Input
                        placeholder="Folder Name"
                        value={(settings.folderName as string) || ''}
                        onChange={(e) => set('folderName', e.target.value)}
                    />
                    {errors && errorPrefix && errors[`${errorPrefix}.folderName`] && (
                        <p className="text-xs text-red-600">
                            {errors[`${errorPrefix}.folderName`]}
                        </p>
                    )}
                    <Input
                        placeholder="Category"
                        value={(settings.category as string) || ''}
                        onChange={(e) => set('category', e.target.value)}
                    />
                    <Select
                        value={(settings.accessLevel as string) || 'STUDENTS'}
                        onValueChange={(v) => set('accessLevel', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Access Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STUDENTS">STUDENTS</SelectItem>
                            <SelectItem value="TEACHERS">TEACHERS</SelectItem>
                            <SelectItem value="ALL">ALL</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            );

        case 'COMMUNITY':
            return (
                <div className="grid gap-3 md:grid-cols-3">
                    <Select
                        value={(settings.communityType as string) || 'SCHOOL'}
                        onValueChange={(v) => set('communityType', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Community Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SCHOOL">SCHOOL</SelectItem>
                            <SelectItem value="CLASS">CLASS</SelectItem>
                            <SelectItem value="CLUB">CLUB</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors && errorPrefix && errors[`${errorPrefix}.communityType`] && (
                        <p className="text-xs text-red-600">
                            {errors[`${errorPrefix}.communityType`]}
                        </p>
                    )}
                    <Input
                        placeholder="Tags (comma separated)"
                        value={
                            Array.isArray(settings.tags)
                                ? (settings.tags as string[]).join(',')
                                : ''
                        }
                        onChange={(e) =>
                            set(
                                'tags',
                                e.target.value.split(',').map((t) => t.trim())
                            )
                        }
                    />
                </div>
            );

        case 'TASKS':
            return (
                <div className="grid gap-3 md:grid-cols-2">
                    <Input
                        placeholder="Task Title"
                        value={(settings.taskTitle as string) || ''}
                        onChange={(e) => set('taskTitle', e.target.value)}
                    />
                    {errors && errorPrefix && errors[`${errorPrefix}.taskTitle`] && (
                        <p className="text-xs text-red-600">{errors[`${errorPrefix}.taskTitle`]}</p>
                    )}
                    <Input
                        placeholder="Estimated Minutes"
                        type="number"
                        value={Number(settings.estimatedDurationMinutes ?? 0)}
                        onChange={(e) => set('estimatedDurationMinutes', Number(e.target.value))}
                    />
                    <Textarea
                        placeholder="Task Description"
                        value={(settings.taskDescription as string) || ''}
                        onChange={(e) => set('taskDescription', e.target.value)}
                    />
                    <Input
                        placeholder="Slide IDs (comma separated)"
                        value={
                            Array.isArray(settings.slideIds)
                                ? (settings.slideIds as string[]).join(',')
                                : ''
                        }
                        onChange={(e) =>
                            set(
                                'slideIds',
                                e.target.value.split(',').map((t) => t.trim())
                            )
                        }
                    />
                    {errors && errorPrefix && errors[`${errorPrefix}.slideIds`] && (
                        <p className="text-xs text-red-600">{errors[`${errorPrefix}.slideIds`]}</p>
                    )}
                    <div>
                        <Label>Go Live</Label>
                        <Input
                            type="datetime-local"
                            value={(settings.goLiveDateTime as string) || ''}
                            onChange={(e) => set('goLiveDateTime', e.target.value)}
                        />
                        {errors && errorPrefix && errors[`${errorPrefix}.goLiveDateTime`] && (
                            <p className="text-xs text-red-600">
                                {errors[`${errorPrefix}.goLiveDateTime`]}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label>Deadline</Label>
                        <Input
                            type="datetime-local"
                            value={(settings.deadlineDateTime as string) || ''}
                            onChange={(e) => set('deadlineDateTime', e.target.value)}
                        />
                        {errors && errorPrefix && errors[`${errorPrefix}.deadlineDateTime`] && (
                            <p className="text-xs text-red-600">
                                {errors[`${errorPrefix}.deadlineDateTime`]}
                            </p>
                        )}
                    </div>
                    <Select
                        value={(settings.status as string) || 'SCHEDULED'}
                        onValueChange={(v) => set('status', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DRAFT">DRAFT</SelectItem>
                            <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                            <SelectItem value="LIVE">LIVE</SelectItem>
                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                            <SelectItem value="OVERDUE">OVERDUE</SelectItem>
                            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={Boolean(settings.isMandatory)}
                            onCheckedChange={(v) => set('isMandatory', Boolean(v))}
                        />
                        <Label>Mandatory</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={Boolean(settings.autoStatusUpdate)}
                            onCheckedChange={(v) => set('autoStatusUpdate', Boolean(v))}
                        />
                        <Label>Auto Status Update</Label>
                    </div>
                    <Input
                        placeholder="Reminder Before Minutes"
                        type="number"
                        value={Number(settings.reminderBeforeMinutes ?? 0)}
                        onChange={(e) => set('reminderBeforeMinutes', Number(e.target.value))}
                    />
                </div>
            );
    }
}
