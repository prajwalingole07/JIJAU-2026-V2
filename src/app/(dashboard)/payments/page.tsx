"use client";

import { useState, useRef, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  IndianRupee, 
  Receipt, 
  History, 
  Wallet, 
  TrendingUp, 
  AlertCircle,
  Eye,
  Camera,
  CalendarX,
  GraduationCap,
  Users,
  HardHat,
  CheckCircle2,
  CalendarDays,
  PlusCircle,
  X,
  Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Teacher, Payment, Student, FeePayment } from '@/lib/types';
import { SCHOOL_NAME } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeeReceiptDialog } from '@/components/payments/fee-receipt';

export default function FeesAndSalaryPage() {
  const { teachers, students, payments, feePayments, addPayment, addFeePayment, staffAttendance, currentUser } = useSchoolStore();
  const { toast } = useToast();
  
  const [staffHistoryOpen, setStaffHistoryOpen] = useState(false);
  const [studentHistoryOpen, setStudentHistoryOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Teacher | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    amount: "",
    mode: "Cash" as "Cash" | "Online",
    screenshot: "",
    remarks: "",
    date: new Date().toISOString().split('T')[0]
  });

  const totalExpectedFees = students.reduce((sum, s) => sum + (s.totalFees || 0), 0);
  const totalCollectedFees = students.reduce((sum, s) => sum + (s.feesPaid || 0), 0);
  const outstandingDues = totalExpectedFees - totalCollectedFees;
  const receiptStudent = selectedReceipt
    ? students.find((student) => student.id === selectedReceipt.studentId) || selectedStudent
    : null;

  const createReceiptNumber = (student: Student) => {
    const year = new Date(formData.date).getFullYear();
    const shortStudentId = student.id.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "STUD";
    const sequence = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `JES-${year}-${shortStudentId}-${sequence}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, screenshot: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStaffPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: selectedStaff.id,
      teacherName: selectedStaff.fullName,
      amount: parseFloat(formData.amount),
      status: 'Paid',
      mode: formData.mode,
      date: new Date(formData.date).toLocaleDateString('en-GB'),
      screenshot: formData.screenshot,
      remarks: formData.remarks
    };

    addPayment(newPayment);
    toast({ title: "Disbursement Committed", description: `Transaction recorded for ${selectedStaff.fullName}` });
    resetForm();
  };

  const handleStudentFeePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const newFeePayment: FeePayment = {
      id: Math.random().toString(36).substr(2, 9),
      receiptNumber: createReceiptNumber(selectedStudent),
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      amount: parseFloat(formData.amount),
      mode: formData.mode,
      date: new Date(formData.date).toLocaleDateString('en-GB'),
      screenshot: formData.screenshot,
      remarks: formData.remarks
    };

    addFeePayment(newFeePayment);
    setSelectedReceipt(newFeePayment);
    toast({ title: "Fee Collected", description: `Recorded payment of ₹${parseFloat(formData.amount).toLocaleString()} for ${selectedStudent.fullName}` });
    resetForm();
  };

  const resetForm = () => {
    setFormData({ amount: "", mode: "Cash", screenshot: "", remarks: "", date: new Date().toISOString().split('T')[0] });
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold tracking-tight text-primary uppercase">Fees & Salary</h2>
          <p className="text-muted-foreground font-medium text-[15px]">
            Tracking school revenues and staff payroll for {SCHOOL_NAME.toUpperCase()}.
          </p>
        </div>

        <Tabs defaultValue="fees">
          <div className="mb-8 max-w-full overflow-x-auto rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
            <TabsList className="h-auto min-w-max bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="fees" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
              >
                <GraduationCap className="h-4 w-4" /> Student Fees
              </TabsTrigger>
              <TabsTrigger 
                value="teachers" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
              >
                <Users className="h-4 w-4" /> Academic Faculty Salary
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
              >
                <HardHat className="h-4 w-4" /> Staff Faculty Salary
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fees" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Expected Fees</p>
                    <p className="text-3xl font-black text-[#1F2937]">₹{totalExpectedFees.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-full bg-orange-50">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fees Collected</p>
                    <p className="text-3xl font-black text-[#22C55E]">₹{totalCollectedFees.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-full bg-green-50">
                    <Wallet className="h-8 w-8 text-[#22C55E]" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outstanding Dues</p>
                    <p className="text-3xl font-black text-[#EF4444]">₹{outstandingDues.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-full bg-red-50">
                    <AlertCircle className="h-8 w-8 text-[#EF4444]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-xl rounded-[24px] overflow-hidden bg-white">
              <div className="bg-primary px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-black text-white tracking-wide uppercase">Student Fee Directory</h3>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input 
                    placeholder="Search student..." 
                    className="pl-10 h-10 bg-white/10 border-none text-white placeholder:text-white/50 rounded-xl font-bold"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 border-none hover:bg-gray-50/80">
                      <TableHead className="pl-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Student Name</TableHead>
                      <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Class</TableHead>
                      <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Expected Fee</TableHead>
                      <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Paid</TableHead>
                      <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Balance</TableHead>
                      <TableHead className="text-right pr-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest">
                          No students matching criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 group">
                          <TableCell className="pl-8 py-6">
                            <span className="text-lg font-black text-primary tracking-tight">{student.fullName}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-bold border-gray-200">Class {student.class}</Badge>
                          </TableCell>
                          <TableCell className="text-lg font-black text-[#1F2937]">₹{student.totalFees.toLocaleString()}</TableCell>
                          <TableCell className="text-lg font-black text-[#22C55E]">₹{student.feesPaid.toLocaleString()}</TableCell>
                          <TableCell className="text-lg font-black text-[#EF4444]">₹{(student.totalFees - student.feesPaid).toLocaleString()}</TableCell>
                          <TableCell className="text-right pr-8">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-white border-gray-200 text-gray-600 rounded-xl px-5 h-10 hover:bg-primary hover:text-white transition-all font-bold shadow-sm"
                              onClick={() => { setSelectedStudent(student); setStudentHistoryOpen(true); }}
                            >
                              <History className="h-4 w-4 mr-2" /> View Ledger
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <PayrollAuditCard 
              title="ACADEMIC FACULTY SALARY AUDIT" 
              staffType="Academic" 
              teachers={teachers} 
              payments={payments} 
              attendance={staffAttendance}
              onViewHistory={(s: Teacher) => { setSelectedStaff(s); setStaffHistoryOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="staff">
            <PayrollAuditCard 
              title="STAFF FACULTY SALARY AUDIT" 
              staffType="Support" 
              teachers={teachers} 
              payments={payments} 
              attendance={staffAttendance}
              onViewHistory={(s: Teacher) => { setSelectedStaff(s); setStaffHistoryOpen(true); }}
            />
          </TabsContent>
        </Tabs>

        {/* Staff Ledger Dialog */}
        <Dialog open={staffHistoryOpen} onOpenChange={setStaffHistoryOpen}>
          <DialogContent className="flex max-h-[94svh] w-[96vw] max-w-[1000px] flex-col overflow-hidden border-none p-0 shadow-2xl md:h-[90vh] rounded-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>Staff Salary Profile - {selectedStaff?.fullName}</DialogTitle>
              <DialogDescription>Detailed ledger and transaction recording for {selectedStaff?.fullName}</DialogDescription>
            </DialogHeader>
            <div className="bg-primary text-white px-5 py-5 sm:px-8 sm:py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black tracking-tight leading-none uppercase">Staff Salary Profile</h2>
                <p className="text-[13px] font-medium opacity-80">Comprehensive Ledger & Audit Log</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-black text-xs tracking-wider uppercase">
                {currentUser?.fullName?.replace(/\s+/g, '')}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:flex-row">
              <div className="flex max-h-[42svh] w-full flex-col border-b border-gray-100 md:max-h-none md:w-[45%] md:border-b-0 md:border-r">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2 text-primary">
                    <History className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Transaction Audit Trail</span>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {payments.filter(p => p.teacherId === selectedStaff?.id).length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center gap-3 text-gray-300">
                        <History className="h-10 w-10 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No transactions yet</p>
                      </div>
                    ) : (
                      payments
                        .filter(p => p.teacherId === selectedStaff?.id)
                        .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime())
                        .map((p) => (
                          <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-xl font-black text-[#1F2937]">₹{p.amount.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.mode} PAYMENT</p>
                              </div>
                              <Badge className={p.mode === 'Online' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'}>{p.mode}</Badge>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                              <span className="text-xs font-bold text-gray-400">{p.date}</span>
                              {p.screenshot && (
                                <Button variant="ghost" size="sm" className="h-8 text-primary font-bold" onClick={() => setSelectedScreenshot(p.screenshot || null)}>
                                  <Eye className="h-3.5 w-3.5 mr-2" /> View Proof
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex min-h-0 flex-1 flex-col bg-white">
                <ScrollArea className="flex-1 p-5 sm:p-8">
                  <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 sm:mb-10">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                      <p className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">Monthly Salary</p>
                      <p className="text-2xl font-black text-[#1F2937]">₹{selectedStaff?.baseSalary.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#F0FDF4] p-6 rounded-2xl border border-green-50">
                      <p className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest">Total Paid</p>
                      <p className="text-2xl font-black text-[#1F2937]">₹{payments.filter(p => p.teacherId === selectedStaff?.id).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <form onSubmit={handleStaffPayment} className="space-y-5">
                    <div className="flex items-center gap-2 text-primary border-b border-gray-100 pb-4 mb-4">
                      <PlusCircle className="h-4 w-4" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Record Salary Payment</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Disbursed (₹)</Label>
                        <Input type="number" className="bg-gray-50 border-none h-12 rounded-xl font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</Label>
                        <Input type="date" className="bg-gray-50 border-none h-12 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</Label>
                      <Select value={formData.mode} onValueChange={(val: any) => setFormData({...formData, mode: val})}>
                        <SelectTrigger className="bg-gray-50 border-none h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Cash">Physical Cash</SelectItem><SelectItem value="Online">Online Transfer</SelectItem></SelectContent>
                      </Select>
                    </div>
                    {formData.mode === 'Online' && (
                      <div 
                        className="h-24 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formData.screenshot ? <p className="text-xs font-bold text-green-600">Proof Attached</p> : <p className="text-xs font-bold text-gray-400">Click to upload proof</p>}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>
                    )}
                    <Button type="submit" className="w-full bg-primary h-14 font-black rounded-xl shadow-lg">Commit Payment</Button>
                  </form>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Ledger Dialog */}
        <Dialog open={studentHistoryOpen} onOpenChange={setStudentHistoryOpen}>
          <DialogContent className="flex max-h-[94svh] w-[96vw] max-w-[1000px] flex-col overflow-hidden border-none p-0 shadow-2xl md:h-[90vh] rounded-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>Student Fee Ledger - {selectedStudent?.fullName}</DialogTitle>
            </DialogHeader>
            <div className="bg-[#22C55E] text-white px-5 py-5 sm:px-8 sm:py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black tracking-tight leading-none uppercase">Student Fee Profile</h2>
                <p className="text-[13px] font-medium opacity-80">{selectedStudent?.fullName} • Class {selectedStudent?.class}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-black text-xs tracking-wider uppercase">
                {currentUser?.fullName?.replace(/\s+/g, '')}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:flex-row">
              <div className="flex max-h-[42svh] w-full flex-col border-b border-gray-100 md:max-h-none md:w-[45%] md:border-b-0 md:border-r">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                   <div className="flex items-center gap-2 text-[#22C55E]">
                    <History className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Fee Collection Ledger</span>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {feePayments.filter(p => p.studentId === selectedStudent?.id).length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center gap-3 text-gray-300">
                        <Receipt className="h-10 w-10 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No fee records found</p>
                      </div>
                    ) : (
                      feePayments
                        .filter(p => p.studentId === selectedStudent?.id)
                        .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime())
                        .map((p) => (
                          <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-xl font-black text-[#1F2937]">₹{p.amount.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.mode} RECEIPT</p>
                              </div>
                              <Badge className="bg-green-50 text-green-700">{p.mode}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-50">
                              <span className="text-xs font-bold text-gray-400">{p.date}</span>
                              <Button variant="ghost" size="sm" className="h-8 text-[#22C55E] font-bold" onClick={() => setSelectedReceipt(p)}>
                                <Receipt className="h-3.5 w-3.5 mr-2" /> Receipt
                              </Button>
                              {p.screenshot && (
                                <Button variant="ghost" size="sm" className="h-8 text-primary font-bold" onClick={() => setSelectedScreenshot(p.screenshot || null)}>
                                  <Eye className="h-3.5 w-3.5 mr-2" /> Proof
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex min-h-0 flex-1 flex-col bg-white">
                <ScrollArea className="flex-1 p-5 sm:p-8">
                  <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 sm:mb-10">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                      <p className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">Total Course Fee</p>
                      <p className="text-2xl font-black text-[#1F2937]">₹{selectedStudent?.totalFees.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#FEF2F2] p-6 rounded-2xl border border-red-50">
                      <p className="text-[10px] font-black text-[#EF4444] uppercase tracking-widest">Remaining Balance</p>
                      <p className="text-2xl font-black text-[#EF4444]">₹{(selectedStudent ? selectedStudent.totalFees - selectedStudent.feesPaid : 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <form onSubmit={handleStudentFeePayment} className="space-y-5">
                    <div className="flex items-center gap-2 text-[#22C55E] border-b border-gray-100 pb-4 mb-4">
                      <PlusCircle className="h-4 w-4" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Record Fee Payment</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Collected (₹)</Label>
                        <Input type="number" className="bg-gray-50 border-none h-12 rounded-xl font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collection Date</Label>
                        <Input type="date" className="bg-gray-50 border-none h-12 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collection Mode</Label>
                      <Select value={formData.mode} onValueChange={(val: any) => setFormData({...formData, mode: val})}>
                        <SelectTrigger className="bg-gray-50 border-none h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Cash">Physical Cash</SelectItem><SelectItem value="Online">Online Transfer</SelectItem></SelectContent>
                      </Select>
                    </div>
                    {formData.mode === 'Online' && (
                      <div 
                        className="h-24 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formData.screenshot ? <p className="text-xs font-bold text-green-600">Receipt Attached</p> : <p className="text-xs font-bold text-gray-400">Click to upload transaction proof</p>}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>
                    )}
                    <Button type="submit" className="w-full bg-[#22C55E] hover:bg-[#22C55E]/90 h-14 font-black rounded-xl shadow-lg">Save Fee Record</Button>
                  </form>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Universal Screenshot Preview */}
        <Dialog open={!!selectedScreenshot} onOpenChange={(val) => !val && setSelectedScreenshot(null)}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full p-0 overflow-hidden bg-black border-none rounded-3xl">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="ghost" size="icon" onClick={() => setSelectedScreenshot(null)} className="text-white hover:bg-white/20">
                <X className="h-6 w-6" />
              </Button>
            </div>
            {selectedScreenshot && <img src={selectedScreenshot} className="w-full h-auto max-h-[80vh] object-contain" alt="Payment Proof" />}
            <div className="bg-black/50 backdrop-blur-md p-6 text-center text-white/60 text-xs font-black uppercase tracking-widest">Transaction Proof Preview</div>
          </DialogContent>
        </Dialog>

        <FeeReceiptDialog
          payment={selectedReceipt}
          student={receiptStudent}
          open={!!selectedReceipt}
          onOpenChange={(open) => {
            if (!open) setSelectedReceipt(null);
          }}
          collectedBy={currentUser?.fullName}
          allPayments={selectedReceipt ? feePayments.filter((p) => p.studentId === selectedReceipt.studentId) : []}
        />
      </div>
    </DashboardLayout>
  );
}

function PayrollAuditCard({ title, staffType, teachers, payments, attendance, onViewHistory }: any) {
  const filtered = teachers.filter((t: Teacher) => t.category === staffType);

  return (
    <Card className="border-none shadow-xl rounded-[24px] overflow-hidden bg-white">
      <div className="bg-primary px-8 py-6">
        <h3 className="text-xl font-black text-white tracking-wide uppercase">{title}</h3>
      </div>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 border-none hover:bg-gray-50/80">
              <TableHead className="pl-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Employee Name</TableHead>
              <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Leaves</TableHead>
              <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Monthly Salary</TableHead>
              <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Cleared</TableHead>
              <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Remaining Bal.</TableHead>
              <TableHead className="text-right pr-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest">No records found</TableCell>
              </TableRow>
            ) : (
              filtered.map((staff: Teacher) => {
                const totalPaid = payments
                  .filter((p: Payment) => p.teacherId === staff.id)
                  .reduce((sum: number, p: Payment) => sum + p.amount, 0);
                const leaves = attendance.filter((a: any) => a.teacherId === staff.id && a.status === 'Absent').length;
                const balance = staff.baseSalary - totalPaid;
                return (
                  <TableRow key={staff.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 group">
                    <TableCell className="pl-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-primary tracking-tight">{staff.fullName}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{staff.academicRole === 'None' ? staff.subject : staff.academicRole}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-50 text-red-700 border-none font-black text-xs px-2 h-6">{leaves} Days</Badge>
                    </TableCell>
                    <TableCell className="text-lg font-black text-[#1F2937]">₹{staff.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-lg font-black text-[#22C55E]">₹{totalPaid.toLocaleString()}</TableCell>
                    <TableCell className="text-lg font-black text-[#EF4444]">₹{balance.toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-600 rounded-xl px-5 h-10 hover:bg-primary hover:text-white transition-all font-bold" onClick={() => onViewHistory(staff)}>
                        <History className="h-4 w-4 mr-2" /> View Ledger
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
