
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Check, ChevronRight, ChevronLeft, Search, PlusCircle, UserPlus, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type AdmissionSource = 'inquiry' | 'application' | 'direct';
type SearchBy = 'application_no' | 'student_name' | 'parent_mobile';

interface MockData {
    id: string;
    name: string;
    class: string;
    parentName?: string;
    mobile: string;
    source?: string;
    status?: string;
}

const mockInquiries: MockData[] = [
    { id: 'INQ-001', name: 'Aarav Patel', class: 'Class 1', mobile: '9876543210', source: 'Social Media' },
    { id: 'INQ-002', name: 'Vivaan Singh', class: 'Class 2', mobile: '9876543211', source: 'Referral' },
];

const mockRegistrations: MockData[] = [
    { id: 'REG-001', name: 'Diya Sharma', class: 'Class 5', parentName: 'Rohan Sharma', mobile: '9876543212', status: 'Pending' },
    { id: 'REG-002', name: 'Ishaan Gupta', class: 'Class 8', parentName: 'Amit Gupta', mobile: '9876543213', status: 'Approved' },
];

export const AdmissionFormWizard = () => {
    // Stage: 'search' | 'form'
    const [stage, setStage] = useState<'search' | 'form'>('search');

    // Search State
    const [academicYear, setAcademicYear] = useState('2025-2026');
    const [source, setSource] = useState<AdmissionSource>('direct');
    const [searchBy, setSearchBy] = useState<SearchBy>('student_name');
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<MockData[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Form State
    const [activeTab, setActiveTab] = useState('student-details');
    const [admissionId, setAdmissionId] = useState('VAC-ADM-2026-00001');
    const [formData, setFormData] = useState<any>({}); // Determine auto-fill data here

    const handleSearch = () => {
        setHasSearched(true);
        if (source === 'inquiry') {
            // Filter logic would happen here, showing mock data for demo
            setSearchResults(mockInquiries);
        } else if (source === 'application') {
            setSearchResults(mockRegistrations);
        } else {
            setSearchResults([]);
        }
    };

    const startAdmission = (data?: MockData) => {
        setStage('form');
        if (data) {
            // Auto-fill logic mock
            setFormData({
                firstName: data.name.split(' ')[0],
                lastName: data.name.split(' ')[1] || '',
                mobile: data.mobile,
                class: data.class,
                // ... map other fields
            });
            toast.success(`Starting admission for ${data.name}`);
        } else {
            // Empty form
            setFormData({});
            toast.info("Starting fresh admission form");
        }
    };

    // ----------------------------------------------------------------------
    // RENDER: SEARCH SCREEN
    // ----------------------------------------------------------------------
    if (stage === 'search') {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Default Admission Form</h1>
                        <p className="text-muted-foreground">Select a student from inquiry/registration or start directly.</p>
                    </div>
                    <Button onClick={() => startAdmission()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Direct Admission
                    </Button>
                </div>

                {/* SEARCH PANEL */}
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="text-lg">Select Criteria</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-end">
                            <div className="space-y-2">
                                <Label>Academic Year</Label>
                                <Select value={academicYear} onValueChange={setAcademicYear}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>From</Label>
                                <Select value={source} onValueChange={(val: AdmissionSource) => {
                                    setSource(val);
                                    setSearchResults([]);
                                    setHasSearched(false);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inquiry">From Enquiry</SelectItem>
                                        <SelectItem value="application">From Application</SelectItem>
                                        <SelectItem value="direct">Direct Admission</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {source !== 'direct' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Search By</Label>
                                        <Select value={searchBy} onValueChange={(v: SearchBy) => setSearchBy(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student_name">Student Name</SelectItem>
                                                <SelectItem value="parent_mobile">Parent Mobile</SelectItem>
                                                <SelectItem value="application_no">Application No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                placeholder={`Enter ${searchBy.replace('_', ' ')}...`}
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {source !== 'direct' && (
                                <Button className="w-full" onClick={handleSearch}>Search</Button>
                            )}

                            {source === 'direct' && (
                                <Button className="w-full" onClick={() => startAdmission()}>Go to Form</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SEARCH RESULTS: INQUIRY */}
                {source === 'inquiry' && hasSearched && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Inquiry Search Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Inquiry ID</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Parent Mobile</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.length > 0 ? searchResults.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.class}</TableCell>
                                            <TableCell>{item.mobile}</TableCell>
                                            <TableCell>{item.source}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => startAdmission(item)}>Create Admission</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No records found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* SEARCH RESULTS: APPLICATION */}
                {source === 'application' && hasSearched && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Registration Search Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Registration ID</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Parent Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.length > 0 ? searchResults.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.class}</TableCell>
                                            <TableCell>{item.parentName}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'Approved' ? 'default' : 'outline'}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => startAdmission(item)}>Start Admission</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No records found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // RENDER: ADMISSION WIZARD
    // ----------------------------------------------------------------------
    return (
        <AdmissionWizardFormContent
            admissionId={admissionId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBackToSearch={() => setStage('search')}
            initialData={formData}
        />
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: ACTUAL WIZARD FORM
// ----------------------------------------------------------------------

const AdmissionWizardFormContent = ({ admissionId, activeTab, setActiveTab, onBackToSearch, initialData }: any) => {
    const steps = [
        { id: 'student-details', label: '1. Student Details' },
        { id: 'previous-school', label: '2. Previous School & Other' },
        { id: 'parent-details', label: '3. Parent Details' },
        { id: 'address-details', label: '4. Address Details' },
        { id: 'student-documents', label: '5. Student Documents' },
        { id: 'finish', label: '6. Finish' },
    ];

    const nextStep = () => {
        const currentIndex = steps.findIndex(s => s.id === activeTab);
        if (currentIndex !== -1 && currentIndex < steps.length - 1) {
            const next = steps[currentIndex + 1];
            if (next) setActiveTab(next.id);
        }
    };

    const prevStep = () => {
        const currentIndex = steps.findIndex(s => s.id === activeTab);
        if (currentIndex > 0) {
            const prev = steps[currentIndex - 1];
            if (prev) setActiveTab(prev.id);
        }
    };

    const handleSubmit = () => {
        toast.success("Student admitted successfully", {
            description: `Admission ID: ${admissionId} created. Linked to parent.`
        });
    };

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-full">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onBackToSearch} className="h-8 px-2 -ml-2">
                            <ChevronLeft className="h-4 w-4" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Admission Form</h1>
                    </div>
                    <p className="text-muted-foreground">Fill in details. Admission ID: <span className="font-mono font-medium text-primary">{admissionId}</span></p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <div className="w-full border-b pb-0">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none space-x-6">
                        {steps.map((step) => (
                            <TabsTrigger
                                key={step.id}
                                value={step.id}
                                className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium text-muted-foreground transition-all"
                            >
                                {step.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="mt-0">
                    {/* STEP 1: STUDENT DETAILS */}
                    <TabsContent value="student-details" className="mt-0">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Student Details</CardTitle>
                                <CardDescription>Basic information about the student.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-0">
                                <FormItem label="First Name *" placeholder="First Name" value={initialData.firstName} />
                                <FormItem label="Middle Name" placeholder="Middle Name" />
                                <FormItem label="Last Name *" placeholder="Last Name" value={initialData.lastName} />

                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="boy">Boy</SelectItem>
                                            <SelectItem value="girl">Girl</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <FormItem label="Application Number" value="APP-001" disabled />

                                <div className="space-y-2">
                                    <Label>Class *</Label>
                                    <Select defaultValue={initialData.class === "Class 1" ? "1" : "2"}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Class 1</SelectItem>
                                            <SelectItem value="2">Class 2</SelectItem>
                                            <SelectItem value="10">Class 10</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Section *</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="a">A</SelectItem>
                                            <SelectItem value="b">B</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Class Group</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="science">Science</SelectItem>
                                            <SelectItem value="commerce">Commerce</SelectItem>
                                            <SelectItem value="arts">Arts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DatePickerItem label="Date of Admission" />
                                <DatePickerItem label="Date of Birth *" />

                                <FormItem label="Residential Phone No" placeholder="+91" value={initialData.mobile} />

                                <div className="space-y-2">
                                    <Label>Student Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="existing">Existing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Admission Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Admission Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="day_scholar">Day Scholar</SelectItem>
                                            <SelectItem value="hostel">Hostel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Transport</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Transport" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Student Aadhaar Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                            <SelectItem value="enrollment">Enrollment ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <FormItem label="Aadhaar Number" placeholder="XXXX-XXXX-XXXX" />

                            </CardContent>
                            <CardFooterNav onNext={nextStep} />
                        </Card>
                    </TabsContent>

                    {/* STEP 2: PREVIOUS SCHOOL */}
                    <TabsContent value="previous-school" className="mt-0">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Previous School & Other Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 px-0">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-b pb-6">
                                    <h3 className="col-span-full font-semibold">Previous School Details</h3>
                                    <FormItem label="School Name" placeholder="Previous School Name" />
                                    <FormItem label="Previous Class" placeholder="e.g. 9" />
                                    <div className="space-y-2">
                                        <Label>Board</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cbse">CBSE</SelectItem>
                                                <SelectItem value="icse">ICSE</SelectItem>
                                                <SelectItem value="ssc">SSC</SelectItem>
                                                <SelectItem value="ib">IB</SelectItem>
                                                <SelectItem value="igcse">IGCSE</SelectItem>
                                                <SelectItem value="others">Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FormItem label="Year of Passing" placeholder="YYYY" />
                                    <FormItem label="Percentage" placeholder="%" />
                                    <FormItem label="Percentage in Science" placeholder="%" />
                                    <FormItem label="Percentage in Maths" placeholder="%" />
                                    <FormItem label="Previous Admission No" placeholder="ID" />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    <h3 className="col-span-full font-semibold">Other Details</h3>
                                    <FormItem label="Religion" placeholder="Religion" />
                                    <FormItem label="Caste" placeholder="Caste" />
                                    <FormItem label="Mother Tongue" placeholder="Language" />
                                    <FormItem label="Blood Group" placeholder="e.g. O+" />
                                    <FormItem label="Nationality" placeholder="Nationality" />
                                    <div className="space-y-2">
                                        <Label>How did you know us?</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="social">Social Media</SelectItem>
                                                <SelectItem value="friend">Friend/Relative</SelectItem>
                                                <SelectItem value="ad">Advertisement</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooterNav onBack={prevStep} onNext={nextStep} />
                        </Card>
                    </TabsContent>

                    {/* STEP 3: PARENTS */}
                    <TabsContent value="parent-details" className="mt-0">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Parent Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 px-0">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    <h3 className="col-span-full font-semibold flex items-center gap-2">Father Details</h3>
                                    <FormItem label="Father Name *" placeholder="Full Name" />
                                    <FormItem label="Father Mobile *" placeholder="Mobile Number" />
                                    <FormItem label="Father Email" placeholder="email@example.com" />
                                    <FormItem label="Father Aadhaar" placeholder="Aadhaar Number" />
                                    <FormItem label="Qualification" placeholder="Qualification" />
                                    <FormItem label="Occupation" placeholder="Occupation" />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    <h3 className="col-span-full font-semibold flex items-center gap-2">Mother Details</h3>
                                    <FormItem label="Mother Name" placeholder="Full Name" />
                                    <FormItem label="Mother Mobile" placeholder="Mobile Number" />
                                    <FormItem label="Mother Email" placeholder="email@example.com" />
                                    <FormItem label="Mother Aadhaar" placeholder="Aadhaar Number" />
                                    <FormItem label="Qualification" placeholder="Qualification" />
                                    <FormItem label="Occupation" placeholder="Occupation" />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    <h3 className="col-span-full font-semibold flex items-center gap-2">Guardian Details</h3>
                                    <FormItem label="Guardian Name" placeholder="Full Name" />
                                    <FormItem label="Guardian Mobile" placeholder="Mobile Number" />
                                </div>
                            </CardContent>
                            <CardFooterNav onBack={prevStep} onNext={nextStep} />
                        </Card>
                    </TabsContent>

                    {/* STEP 4: ADDRESS */}
                    <TabsContent value="address-details" className="mt-0">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Address Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 px-0">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Current Address</h3>
                                    <div className="grid gap-6 md:grid-cols-1">
                                        <FormItem label="Address" isTextarea placeholder="Current residential address" />
                                        <FormItem label="Nearest Locality" placeholder="Landmark/Locality" />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="same-address" />
                                    <label htmlFor="same-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Current address same as permanent
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Permanent Address</h3>
                                    <div className="grid gap-6 md:grid-cols-1">
                                        <FormItem label="Address *" isTextarea placeholder="Permanent residential address" />
                                        <FormItem label="Nearest Locality *" placeholder="Landmark/Locality" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooterNav onBack={prevStep} onNext={nextStep} />
                        </Card>
                    </TabsContent>

                    {/* STEP 5: DOCUMENTS */}
                    <TabsContent value="student-documents" className="mt-0">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Student Documents</CardTitle>
                                <CardDescription>Toggle YES to enable upload for received documents.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="space-y-4">
                                    {[
                                        'Birth Certificate', 'Transfer Certificate', 'Immunisation Certificate',
                                        'Student Photograph', 'Report Card', 'Blood Group Certificate',
                                        'Health Certificate', 'Father Photograph', 'Mother Photograph',
                                        'Guardian NOC', 'Caste Certificate'
                                    ].map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                            <span className="font-medium">{doc}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`doc-${idx}`} className="text-xs text-muted-foreground mr-1">Submitted?</Label>
                                                    <Select defaultValue="no">
                                                        <SelectTrigger className="w-[80px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="yes">Yes</SelectItem>
                                                            <SelectItem value="no">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Upload size={14} /> Upload
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooterNav onBack={prevStep} onNext={nextStep} />
                        </Card>
                    </TabsContent>

                    {/* STEP 6: FINISH */}
                    <TabsContent value="finish" className="mt-0">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Confirm Admission</CardTitle>
                                <CardDescription>Review and submit to finalize student admission.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 px-0">
                                <div className="rounded-lg border p-4 bg-muted/20">
                                    <h3 className="font-semibold mb-2">Summary</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-muted-foreground">Admission ID:</span> {admissionId}</div>
                                        <div><span className="text-muted-foreground">Class:</span> Class 1 - A</div>
                                        <div><span className="text-muted-foreground">Student:</span> John Doe</div>
                                        <div><span className="text-muted-foreground">Parent:</span> Michael Doe</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="sms" defaultChecked />
                                        <Label htmlFor="sms">Send SMS confirmation</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="email" defaultChecked />
                                        <Label htmlFor="email">Send Email confirmation</Label>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="flex justify-between p-6 pt-0 px-0">
                                <Button variant="outline" onClick={prevStep} disabled={false}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                                    <Check className="mr-2 h-4 w-4" /> Submit Admission
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

const FormItem = ({ label, placeholder, value, disabled, isTextarea }: { label: string, placeholder?: string, value?: string, disabled?: boolean, isTextarea?: boolean }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        {isTextarea ? (
            <Textarea placeholder={placeholder} disabled={disabled} defaultValue={value} />
        ) : (
            <Input placeholder={placeholder} disabled={disabled} defaultValue={value} />
        )}
    </div>
);

const DatePickerItem = ({ label }: { label: string }) => {
    const [date, setDate] = useState<Date>();
    return (
        <div className="space-y-2 flex flex-col">
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !date && "text-muted-foreground")}>
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
            </Popover>
        </div>
    );
}

const CardFooterNav = ({ onBack, onNext }: { onBack?: () => void, onNext: () => void }) => (
    <div className="flex justify-between p-6 pt-0 px-0">
        <Button variant="outline" onClick={onBack} disabled={!onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={onNext}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
    </div>
);
