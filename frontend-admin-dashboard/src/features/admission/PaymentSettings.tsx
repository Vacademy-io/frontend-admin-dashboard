import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, CreditCard, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';


const MethodCard = ({ title, icon: Icon, enabled, defaultEnabled, hasSettings }: { title: string, icon: any, enabled?: boolean, defaultEnabled?: boolean, hasSettings?: boolean }) => {
    const [active, setActive] = useState(defaultEnabled || false);

    return (
        <Card className={cn("transition-colors", active ? "border-primary" : "")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mt-2">
                    <Switch id={title} checked={active} onCheckedChange={setActive} />
                    <Label htmlFor={title}>{active ? 'Enabled' : 'Disabled'}</Label>
                </div>
            </CardContent>
        </Card>
    );
}

export const PaymentSettings = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
                <p className="text-muted-foreground">Configure how fees and payments work for admissions.</p>
            </div>

            <Tabs defaultValue="fee-types" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="fee-types">Fee Types</TabsTrigger>
                    <TabsTrigger value="fee-structure">Fee Structure</TabsTrigger>
                    <TabsTrigger value="installments">Installment Plans</TabsTrigger>
                    <TabsTrigger value="methods">Payment Methods</TabsTrigger>
                </TabsList>

                {/* TAB 1: FEE TYPES */}
                <TabsContent value="fee-types" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl">Fee Types</CardTitle>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Fee Type
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fee Type Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Installments</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Admission Fee</TableCell>
                                        <TableCell>One-time</TableCell>
                                        <TableCell>No</TableCell>
                                        <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Tuition Fee</TableCell>
                                        <TableCell>Recurring</TableCell>
                                        <TableCell>Yes</TableCell>
                                        <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: FEE STRUCTURE */}
                <TabsContent value="fee-structure" className="space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <Label>Academic Session:</Label>
                        <Select defaultValue="2025-2026">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2025-2026">2025-2026</SelectItem>
                                <SelectItem value="2026-2027">2026-2027</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl">Class-wise Fee Structure</CardTitle>
                            <Button variant="outline">Set Fee Structure</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Fee Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Class 1</TableCell>
                                        <TableCell>Tuition Fee</TableCell>
                                        <TableCell>₹ 25,000</TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Class 1</TableCell>
                                        <TableCell>Admission Fee</TableCell>
                                        <TableCell>₹ 5,000</TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: INSTALLMENT PLANS */}
                <TabsContent value="installments" className="space-y-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl">Installment Plans</CardTitle>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Plan
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Fee Type</TableHead>
                                        <TableHead>No. of Installments</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Quarterly Plan</TableCell>
                                        <TableCell>Tuition Fee</TableCell>
                                        <TableCell>4</TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Monthly Plan</TableCell>
                                        <TableCell>Tuition Fee</TableCell>
                                        <TableCell>12</TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 4: PAYMENT METHODS */}
                <TabsContent value="methods" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <MethodCard title="Razorpay Online" icon={CreditCard} enabled defaultEnabled hasSettings />
                        <MethodCard title="Cash" icon={Landmark} enabled defaultEnabled />
                        <MethodCard title="UPI" icon={CreditCard} enabled />
                        <MethodCard title="Bank Transfer" icon={Landmark} enabled />
                    </div>

                    <Card className="mt-6 border-blue-200 bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="text-base">Razorpay Configuration</CardTitle>
                            <CardDescription>Enter your API keys to enable online payments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="key-id">Razorpay Key ID</Label>
                                <Input id="key-id" type="password" placeholder="rzp_test_..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="key-secret">Razorpay Secret</Label>
                                <Input id="key-secret" type="password" placeholder="Enter secret" />
                            </div>
                            <Button onClick={() => toast.success("Settings saved")}>Save Keys</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};





