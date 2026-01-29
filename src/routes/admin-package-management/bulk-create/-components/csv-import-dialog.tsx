import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    DownloadSimple,
    UploadSimple,
    CheckCircle,
    Warning,
    ArrowRight,
    ArrowLeft,
} from '@phosphor-icons/react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import {
    BulkCourseItem,
    LevelOption,
    SessionOption,
    CourseType,
    PaymentType,
} from '../-types/bulk-create-types';

interface CsvImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    levels: LevelOption[];
    sessions: SessionOption[];
    onImport: (courses: BulkCourseItem[]) => void;
}

const STEP_TITLES = {
    1: 'Configuration & Template',
    2: 'Upload & Import',
};

const STEP_DESCRIPTIONS = {
    1: 'Select the target level and session for the imported courses, and download the template.',
    2: 'Upload your filled CSV file to import courses.',
};

const COURSE_TYPES: { value: CourseType; label: string }[] = [
    { value: 'COURSE', label: 'Course' },
    { value: 'MEMBERSHIP', label: 'Membership' },
    { value: 'PRODUCT', label: 'Product' },
    { value: 'SERVICE', label: 'Service' },
];

export function CsvImportDialog({
    open,
    onOpenChange,
    levels,
    sessions,
    onImport,
}: CsvImportDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedLevelId, setSelectedLevelId] = useState<string>('');
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [selectedCourseType, setSelectedCourseType] = useState<CourseType>('COURSE');
    const [parsedCourses, setParsedCourses] = useState<BulkCourseItem[]>([]);
    const [importStats, setImportStats] = useState<{ total: number; valid: number } | null>(null);

    const resetState = () => {
        setStep(1);
        setSelectedLevelId('');
        setSelectedSessionId('');
        setSelectedCourseType('COURSE');
        setParsedCourses([]);
        setImportStats(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            'Course Name',
            'Course Type (COURSE/MEMBERSHIP/PRODUCT/SERVICE)',
            'Payment Type (FREE/ONE_TIME/SUBSCRIPTION/DONATION)',
            'Price',
            'Tags (comma separated)',
            'Description (HTML allowed)',
            'Validity (Days)',
            'About the Course (HTML)',
            'Why Learn (HTML)',
            'Who Should Learn (HTML)',
            'Max Slots',
            'Available Slots',
        ];

        const sampleRows = [
            [
                'Introduction to Python',
                'COURSE',
                'ONE_TIME',
                '499',
                'python,coding,beginner',
                '<p>Learn Python basics</p>',
                '180',
                '<p>Detailed about...</p>',
                '<p>Great career...</p>',
                '<p>Beginners...</p>',
                '50',
                '45',
            ],
            [
                'Advanced React Patterns',
                'COURSE',
                'SUBSCRIPTION',
                '999',
                'react,frontend,advanced',
                '<p>Master React patterns</p>',
                '365',
                '',
                '',
                '',
                '',
                '',
            ],
        ];

        const csvContent = [
            headers.join(','),
            ...sampleRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'bulk_course_import_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const courses: BulkCourseItem[] = [];
                let validCount = 0;

                const selectedLevel = levels.find((l) => l.id === selectedLevelId);
                const selectedSession = sessions.find((s) => s.id === selectedSessionId);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results.data.forEach((row: any) => {
                    const courseName = row['Course Name']?.trim();
                    if (!courseName) return; // Skip empty names

                    // Parse Course Type
                    let courseType: CourseType = selectedCourseType;
                    const typeInput = row['Course Type (COURSE/MEMBERSHIP/PRODUCT/SERVICE)']
                        ?.toString()
                        .toUpperCase();
                    if (
                        typeInput &&
                        ['COURSE', 'MEMBERSHIP', 'PRODUCT', 'SERVICE'].includes(typeInput)
                    ) {
                        courseType = typeInput as CourseType;
                    }

                    // Parse Payment Type
                    let paymentType: PaymentType = 'FREE';
                    const paymentInput = row['Payment Type (FREE/ONE_TIME/SUBSCRIPTION/DONATION)']
                        ?.toString()
                        .toUpperCase();
                    if (['FREE', 'ONE_TIME', 'SUBSCRIPTION', 'DONATION'].includes(paymentInput)) {
                        paymentType = paymentInput as PaymentType;
                    }

                    // Parse Price
                    const priceInput = row['Price'];
                    const price = priceInput ? parseFloat(priceInput) : undefined;

                    // Parse Validity
                    const validityInput = row['Validity (Days)'];
                    const validity = validityInput ? parseInt(validityInput) : undefined;

                    // Parse Tags
                    const tagsInput = row['Tags (comma separated)'];
                    const tags = tagsInput
                        ? tagsInput
                              .split(',')
                              .map((t: string) => t.trim())
                              .filter(Boolean)
                        : [];

                    // Parse Description and Metadata
                    const description = row['Description (HTML allowed)'] || '';
                    const aboutCourse = row['About the Course (HTML)'] || '';
                    const whyLearn = row['Why Learn (HTML)'] || '';
                    const whoShouldLearn = row['Who Should Learn (HTML)'] || '';

                    // Parse Inventory
                    const maxSlotsInput = row['Max Slots'];
                    const maxSlots = maxSlotsInput ? parseInt(maxSlotsInput) : null;
                    const availableSlotsInput = row['Available Slots'];
                    const availableSlots = availableSlotsInput
                        ? parseInt(availableSlotsInput)
                        : null;

                    courses.push({
                        id: uuidv4(),
                        course_name: courseName,
                        course_type: courseType,
                        tags: tags,
                        publish_to_catalogue: true, // Default to published
                        batches:
                            selectedLevel && selectedSession
                                ? [
                                      {
                                          level_id: selectedLevel.id,
                                          session_id: selectedSession.id,
                                          level_name: selectedLevel.name,
                                          session_name: selectedSession.name,
                                          inventory_config: {
                                              max_slots: isNaN(Number(maxSlots))
                                                  ? null
                                                  : Number(maxSlots),
                                              available_slots: isNaN(Number(availableSlots))
                                                  ? isNaN(Number(maxSlots))
                                                      ? null
                                                      : Number(maxSlots)
                                                  : Number(availableSlots),
                                          },
                                      },
                                  ]
                                : [],
                        payment_config: {
                            payment_type: paymentType,
                            price: isNaN(Number(price)) ? undefined : Number(price),
                            validity_in_days: isNaN(Number(validity))
                                ? undefined
                                : Number(validity),
                            currency: 'INR',
                        },
                        course_html_description: description,
                        about_the_course_html: aboutCourse,
                        why_learn_html: whyLearn,
                        who_should_learn_html: whoShouldLearn,
                        course_depth: 5,
                    });
                    validCount++;
                });

                setParsedCourses(courses);
                setImportStats({ total: results.data.length, valid: validCount });
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
            },
        });
    };

    const handleImport = () => {
        if (parsedCourses.length === 0) {
            toast.error('No valid courses to import');
            return;
        }
        onImport(parsedCourses);
        toast.success(`Imported ${parsedCourses.length} courses`);
        handleOpenChange(false);
    };

    const canProceedToUpload = selectedLevelId && selectedSessionId;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{STEP_TITLES[step]}</DialogTitle>
                    <DialogDescription>{STEP_DESCRIPTIONS[step]}</DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Level *</Label>
                            <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {levels.map((level) => (
                                        <SelectItem key={level.id} value={level.id}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Session *</Label>
                            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Session" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map((session) => (
                                        <SelectItem key={session.id} value={session.id}>
                                            {session.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Course Type *</Label>
                            <Select
                                value={selectedCourseType}
                                onValueChange={(val) => setSelectedCourseType(val as CourseType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Course Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COURSE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleDownloadTemplate}
                            >
                                <DownloadSimple className="mr-2 size-4" />
                                Download CSV Template
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-4">
                        {!importStats ? (
                            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-neutral-200 p-8">
                                <UploadSimple className="size-10 text-neutral-400" />
                                <div className="text-center text-sm text-neutral-500">
                                    <p className="font-medium text-neutral-900">
                                        Click to upload CSV
                                    </p>
                                    <p>or drag and drop here</p>
                                </div>
                                <Input
                                    type="file"
                                    accept=".csv"
                                    className="absolute inset-0 h-full scale-110 cursor-pointer opacity-0"
                                    onChange={handleFileUpload}
                                />
                                {/* Visible Button underneath input */}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="pointer-events-none"
                                >
                                    Select File
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-neutral-50 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <CheckCircle className="size-5 text-green-600" weight="fill" />
                                    <h4 className="font-medium text-neutral-900">File Parsed</h4>
                                </div>
                                <ul className="space-y-1 text-sm text-neutral-600">
                                    <li>Total Rows: {importStats.total}</li>
                                    <li>Valid Courses: {importStats.valid}</li>
                                    <li>
                                        Target Batch:{' '}
                                        {levels.find((l) => l.id === selectedLevelId)?.name} /{' '}
                                        {sessions.find((s) => s.id === selectedSessionId)?.name}
                                    </li>
                                </ul>
                                {importStats.valid === 0 && (
                                    <div className="mt-3 flex items-start gap-2 text-xs text-red-600">
                                        <Warning className="size-4 shrink-0" />
                                        <p>
                                            No valid courses found. Please check column headers
                                            matching the template.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {step === 1 ? (
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!canProceedToUpload}
                            className="w-full sm:w-auto"
                        >
                            Next
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                    ) : (
                        <div className="flex w-full justify-between gap-2">
                            <Button variant="ghost" onClick={() => setStep(1)}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!importStats || importStats.valid === 0}
                            >
                                Import {importStats?.valid || 0} Courses
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
