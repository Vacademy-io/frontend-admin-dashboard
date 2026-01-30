import { useParams, useNavigate } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { MyButton } from '@/components/design-system/button';
import {
    ArrowLeft,
    FileText,
    User,
    ChalkboardTeacher,
    CurrencyInr,
    Printer,
    FloppyDisk,
} from '@phosphor-icons/react';
import { Helmet } from 'react-helmet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Admission } from '../-types/admission-types';

// Mock data generator for demo purposes
const getMockAdmission = (id: string): Admission => ({
    id,
    registrationId: `REG-${id.split('-')[1] || '2026-0001'}`,
    studentName: 'Aarav Sharma',
    dateOfBirth: '2012-05-15',
    gender: 'MALE',
    parentName: 'Rajesh Sharma',
    parentPhone: '+91 98765 43210',
    applyingForClass: 'Class 8',
    preferredBoard: 'CBSE',
    academicYear: '2026-27',
    status: 'PENDING_VERIFICATION',
    registrationDate: '2026-01-20',
    documentsVerified: false,
    seatConfirmed: false,
    totalFee: 85000,
    paidAmount: 5000,
    pendingAmount: 80000,
    paymentStatus: 'PARTIAL',
});

const SECTIONS = ['A', 'B', 'C', 'D'];

export function AdmissionDetailPage() {
    const { admissionId } = useParams({ from: '/admissions/admission/$admissionId' });
    const navigate = useNavigate();
    const { setNavHeading } = useNavHeadingStore();
    const [admission, setAdmission] = useState<Admission | null>(null);

    useEffect(() => {
        // Simulate fetch
        setAdmission(getMockAdmission(admissionId));
    }, [admissionId]);

    useEffect(() => {
        if (admission) {
            setNavHeading(
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Admission Details</span>
                    <span className="text-neutral-400">/</span>
                    <span className="text-base font-normal text-neutral-600">
                        {admission.studentName}
                    </span>
                    <Badge variant="outline" className="ml-2">
                        {admission.status.replace('_', ' ')}
                    </Badge>
                </div>
            );
        }
    }, [setNavHeading, admission]);

    if (!admission) return <div>Loading...</div>;

    return (
        <div className="space-y-6 pb-20">
            <Helmet>
                <title>
                    {admission.studentName} - {admission.id}
                </title>
            </Helmet>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <MyButton
                    buttonType="secondary"
                    onClick={() => navigate({ to: '/admissions/admission' })}
                >
                    <ArrowLeft size={16} />
                    Back to List
                </MyButton>

                <div className="flex gap-2">
                    <MyButton buttonType="secondary">
                        <Printer size={16} />
                        Print Form
                    </MyButton>
                    <MyButton buttonType="primary">
                        <FloppyDisk size={16} />
                        Save Changes
                    </MyButton>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Student Info */}
                <div className="space-y-6 lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-500">
                                    {admission.studentName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900">
                                        {admission.studentName}
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        Reg ID: {admission.registrationId}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-3 text-sm">
                                <div>
                                    <span className="text-neutral-500">Class:</span>
                                    <span className="float-right font-medium">
                                        {admission.applyingForClass}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500">Gender:</span>
                                    <span className="float-right font-medium">
                                        {admission.gender}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500">DOB:</span>
                                    <span className="float-right font-medium">
                                        {format(new Date(admission.dateOfBirth), 'dd MMM yyyy')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Parent Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 text-sm">
                                <div>
                                    <span className="block text-neutral-500">Parent Name</span>
                                    <span className="font-medium">{admission.parentName}</span>
                                </div>
                                <div>
                                    <span className="block text-neutral-500">Contact</span>
                                    <span className="font-medium">{admission.parentPhone}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Workflow Steps */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Step 1: Document Verification */}
                    <Card
                        className={cn(
                            'transfer-all border-l-4 duration-200',
                            admission.documentsVerified
                                ? 'border-l-green-500 bg-green-50/30'
                                : 'border-l-amber-500'
                        )}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText size={20} />
                                    1. Document Verification
                                </CardTitle>
                                {admission.documentsVerified ? (
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="border-amber-500 text-amber-600"
                                    >
                                        Pending
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Verify uploaded documents against originals
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="flex items-center gap-2 rounded border border-neutral-200 bg-white p-2">
                                        <input type="checkbox" className="size-4" />
                                        <span className="text-sm">Birth Certificate</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border border-neutral-200 bg-white p-2">
                                        <input type="checkbox" className="size-4" />
                                        <span className="text-sm">Previous Marksheet</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border border-neutral-200 bg-white p-2">
                                        <input type="checkbox" className="size-4" />
                                        <span className="text-sm">Transfer Certificate</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border border-neutral-200 bg-white p-2">
                                        <input type="checkbox" className="size-4" />
                                        <span className="text-sm">Aadhaar Card</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Verification Notes</Label>
                                    <Textarea
                                        placeholder="Enter any remarks..."
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-white/50 px-6 py-3">
                            {!admission.documentsVerified && (
                                <MyButton scale="small" className="ml-auto bg-green-600">
                                    Mark as Verified
                                </MyButton>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Step 2: Section Allocation */}
                    <Card
                        className={cn(
                            'transfer-all border-l-4 duration-200',
                            admission.allocatedSection
                                ? 'border-l-green-500 bg-green-50/30'
                                : 'border-l-purple-500'
                        )}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ChalkboardTeacher size={20} />
                                    2. Section Allocation
                                </CardTitle>
                                {admission.allocatedSection ? (
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                        Allocated
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="border-purple-500 text-purple-600"
                                    >
                                        Pending
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Allocate class section and roll number
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Select
                                        value={admission.allocatedSection || ''}
                                        disabled={!admission.documentsVerified}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SECTIONS.map((sec) => (
                                                <SelectItem key={sec} value={sec}>
                                                    Section {sec}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Roll Number</Label>
                                    <Input
                                        placeholder="Auto or Manual"
                                        className="bg-white"
                                        defaultValue={admission.allocatedRollNumber}
                                        disabled={!admission.documentsVerified}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 3: Fee Payment */}
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CurrencyInr size={20} />
                                    3. Fee Payment
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className="border-orange-500 text-orange-600"
                                >
                                    {admission.paymentStatus}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 rounded-lg bg-neutral-50 p-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-neutral-500">Total Fee</p>
                                    <p className="text-lg font-semibold">
                                        ₹{admission.totalFee.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Paid Amount</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        ₹{admission.paidAmount.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Pending</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        ₹{admission.pendingAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-white/50 px-6 py-3">
                            <MyButton
                                scale="small"
                                buttonType="secondary"
                                className="ml-auto"
                                disabled={!admission.allocatedSection}
                            >
                                Record Payment
                            </MyButton>
                        </CardFooter>
                    </Card>

                    {/* Step 4: Enrollment */}
                    <Card className="border-l-4 border-l-blue-500 opacity-75">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User size={20} />
                                4. Final Enrollment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-neutral-500">
                                Confirm admission to generate Admission Number and create student
                                profile.
                            </p>
                        </CardContent>
                        <CardFooter className="border-t bg-white/50 px-6 py-3">
                            <MyButton
                                scale="small"
                                className="ml-auto w-full sm:w-auto"
                                disabled={admission.paymentStatus !== 'COMPLETE'}
                            >
                                Confirm Admission
                            </MyButton>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
