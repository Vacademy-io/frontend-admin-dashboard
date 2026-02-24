import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Upload, CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const DocumentVerification = () => {
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Birth Certificate', verified: false, file: null },
        { id: 2, name: 'Previous School Documents', verified: false, file: null },
        { id: 3, name: 'Address Proof', verified: false, file: null },
        { id: 4, name: 'Student Photograph', verified: false, file: 'photo.jpg' },
    ]);

    const handleVerifyToggle = (id: number) => {
        setDocuments(documents.map(d => d.id === id ? { ...d, verified: !d.verified } : d));
    };

    const verifiedCount = documents.filter(d => d.verified).length;
    const totalCount = documents.length;
    const progress = Math.round((verifiedCount / totalCount) * 100);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
                <p className="text-muted-foreground">Verify student documents before admission approval.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Student</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select onValueChange={setSelectedStudent}>
                                <SelectTrigger className="w-full md:w-[300px]">
                                    <SelectValue placeholder="Search or select student" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="john">John Doe (Class 1-A)</SelectItem>
                                    <SelectItem value="jane">Jane Smith (Class 2-B)</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {selectedStudent && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Checklist</CardTitle>
                                <CardDescription>Review and mark documents as verified.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Verification</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <FileText size={16} />
                                                    {doc.name}
                                                </TableCell>
                                                <TableCell>
                                                    {doc.verified ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                                                        <Upload size={14} /> {doc.file ? 'Replace' : 'Upload'}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={doc.verified}
                                                            onCheckedChange={() => handleVerifyToggle(doc.id)}
                                                        />
                                                        <span className="text-sm text-muted-foreground">{doc.verified ? 'Verified' : 'Unverified'}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {selectedStudent && (
                    <div className="w-full md:w-[350px] space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Verification Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm font-medium">{verifiedCount}/{totalCount} Verified</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="pt-4">
                                    <Button
                                        className="w-full"
                                        disabled={verifiedCount < totalCount}
                                        onClick={() => toast.success("Documents verified successfully")}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Documents
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
