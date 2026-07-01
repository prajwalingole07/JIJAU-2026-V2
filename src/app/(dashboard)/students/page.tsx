"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CASTE_OPTIONS, normalizeCaste } from "@/lib/constants";
import { Plus, Search, Trash2, Edit2, Download, User, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Student } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useSchoolStore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Male" as "Male" | "Female" | "Other",
    rollNumber: "",
    motherName: "",
    class: "1st",
    division: "A",
    mobile: "",
    address: "Tungi",
    admissionDate: new Date().toISOString().split('T')[0],
    casteInput: "OPEN",
    aadhaarNumber: "",
    totalFees: "0",
    feesPaid: "0"
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         s.class.toLowerCase().includes(search.toLowerCase()) ||
                         (s.mobile || "").includes(search);
    
    const balance = s.totalFees - s.feesPaid;
    if (statusFilter === 'Completed') return matchesSearch && balance <= 0;
    if (statusFilter === 'Pending') return matchesSearch && balance > 0;
    return matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      totalFees: parseFloat(formData.totalFees) || 0,
      feesPaid: parseFloat(formData.feesPaid) || 0,
      casteNormalized: normalizeCaste(formData.casteInput),
    };
    
    if (editingId) {
      updateStudent(editingId, data as any);
      toast({ title: "Student Record Updated" });
      setIsEditOpen(false);
    } else {
      const newStudent: Student = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      } as Student;
      addStudent(newStudent);
      toast({ title: "New Enrollment Successful" });
      setIsAddOpen(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      gender: "Male",
      rollNumber: "",
      motherName: "",
      class: "1st",
      division: "A",
      mobile: "",
      address: "Tungi",
      admissionDate: new Date().toISOString().split('T')[0],
      casteInput: "OPEN",
      aadhaarNumber: "",
      totalFees: "0",
      feesPaid: "0"
    });
    setEditingId(null);
  };

  const handleEdit = (student: Student) => {
    setFormData({
      fullName: student.fullName,
      gender: student.gender,
      rollNumber: student.rollNumber,
      motherName: student.motherName || "",
      class: student.class,
      division: student.division,
      mobile: student.mobile || "",
      address: student.address,
      admissionDate: student.admissionDate,
      casteInput: student.casteInput,
      aadhaarNumber: student.aadhaarNumber || "",
      totalFees: (student.totalFees || 0).toString(),
      feesPaid: (student.feesPaid || 0).toString()
    });
    setEditingId(student.id);
    setIsEditOpen(true);
  };

  const confirmDelete = (id: string) => {
    deleteStudent(id);
    toast({ title: "Record Removed", variant: "destructive" });
  };

  const exportToExcel = () => {
    const headers = ["Roll #", "Name", "Mobile", "Class", "Category", "Aadhaar", "Total Fees", "Paid", "Balance"];
    const rows = filteredStudents.map(s => [
      s.rollNumber, s.fullName, s.mobile, s.class, s.casteNormalized, s.aadhaarNumber, s.totalFees, s.feesPaid, (s.totalFees - s.feesPaid)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + 
      headers.join(",") + "\n" + 
      rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Student Records</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base">Manage Enrollments & Academic Ledger</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={exportToExcel} variant="outline" className="flex-1 sm:flex-none gap-2 rounded-xl text-xs md:text-sm">
              <Download className="h-4 w-4" /> Export Ledger
            </Button>
            <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none gap-2 bg-primary rounded-xl h-11 px-6 font-semibold text-xs md:text-sm">
                  <Plus className="h-4 w-4" /> New Enrollment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] md:w-full rounded-2xl md:rounded-[2rem] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-bold text-xl md:text-2xl text-[#1F2937]">Register New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 pt-4">
                  <StudentFormFields formData={formData} setFormData={setFormData} />
                  <DialogFooter className="mt-6">
                    <Button type="submit" className="w-full bg-primary h-12 md:h-14 font-bold text-base md:text-lg rounded-xl">
                      Complete Registration
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full rounded-2xl md:rounded-[2rem] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-bold text-xl md:text-2xl text-[#1F2937]">Edit Enrollment Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 pt-4">
              <StudentFormFields formData={formData} setFormData={setFormData} />
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full bg-primary h-12 md:h-14 font-bold text-base md:text-lg rounded-xl">
                  Update Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-4 md:p-6 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10 h-11 bg-gray-50 border-none shadow-inner rounded-xl" 
                placeholder="Search by name, contact or class..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="bg-gray-100 p-1 rounded-xl w-full">
                <TabsTrigger value="All" className="flex-1 md:flex-none rounded-lg px-4 font-bold">All</TabsTrigger>
                <TabsTrigger value="Completed" className="flex-1 md:flex-none rounded-lg px-4 font-bold text-green-600">Completed</TabsTrigger>
                <TabsTrigger value="Pending" className="flex-1 md:flex-none rounded-lg px-4 font-bold text-red-500">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="pl-6 md:pl-8 w-[80px] text-[10px] uppercase font-black">Roll #</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Student Name</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Parent Contact</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Class</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Category</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Fee Balance</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Status</TableHead>
                  <TableHead className="text-right pr-6 md:pr-8 text-[10px] uppercase font-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-gray-400 font-medium italic">
                      No matching enrollments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => {
                    const balance = s.totalFees - s.feesPaid;
                    const isCompleted = balance <= 0;
                    
                    return (
                      <TableRow key={s.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="pl-6 md:pl-8 font-mono text-xs text-gray-400">
                          {s.rollNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-700 whitespace-nowrap">{s.fullName}</span>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{s.gender}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600 font-medium whitespace-nowrap">
                            <Phone className="h-3 w-3 text-primary/50" />
                            {s.mobile || '---'}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-500 whitespace-nowrap">{s.class}-{s.division}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-none font-bold text-[10px] px-2 py-0">
                            {s.casteNormalized}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col whitespace-nowrap">
                            <span className={`text-sm font-bold ${!isCompleted ? 'text-red-500' : 'text-green-600'}`}>
                              ₹{balance.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">Out of ₹{s.totalFees.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isCompleted ? (
                            <Badge className="bg-green-50 text-green-700 border-none flex w-fit gap-1 items-center px-2 py-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-600 border-none flex w-fit gap-1 items-center px-2 py-0.5">
                              <AlertCircle className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6 md:pr-8 space-x-1 md:space-x-2 whitespace-nowrap">
                          <Button 
                            type="button"
                            onClick={() => handleEdit(s)}
                            className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-orange-50 text-orange-600 p-0 hover:bg-orange-100 border-none shadow-none"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 md:h-9 md:w-9 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[90vw] max-w-md rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the student record for <strong>{s.fullName}</strong>. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => confirmDelete(s.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">
                                  Delete Record
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StudentFormFields({ formData, setFormData }: any) {
  const classes = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Full Name</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 focus-visible:ring-1 focus-visible:ring-primary text-sm" 
          placeholder="Enter student name"
          value={formData.fullName} 
          onChange={e => setFormData({...formData, fullName: e.target.value})} 
          required 
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Gender</Label>
        <Select value={formData.gender} onValueChange={val => setFormData({...formData, gender: val})}>
          <SelectTrigger className="bg-[#F3F4F6] border-none h-11 text-sm">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Roll Number</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          placeholder="Roll #"
          value={formData.rollNumber} 
          onChange={e => setFormData({...formData, rollNumber: e.target.value})} 
          required 
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Aadhar Number (12 Digits)</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          placeholder="12-digit Aadhar"
          value={formData.aadhaarNumber} 
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
            setFormData({...formData, aadhaarNumber: val});
          }} 
          pattern="[0-9]{12}"
          required 
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Class</Label>
        <Select value={formData.class} onValueChange={val => setFormData({...formData, class: val})}>
          <SelectTrigger className="bg-[#F3F4F6] border-none h-11 text-sm">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Caste Category</Label>
        <Select value={formData.casteInput} onValueChange={val => setFormData({...formData, casteInput: val})}>
          <SelectTrigger className="bg-[#F3F4F6] border-none h-11 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CASTE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Mother Name</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          placeholder="Enter mother's name"
          value={formData.motherName} 
          onChange={e => setFormData({...formData, motherName: e.target.value})} 
          required 
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Parent Mobile (10 Digits)</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          placeholder="10-digit mobile"
          value={formData.mobile} 
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
            setFormData({...formData, mobile: val});
          }} 
          pattern="[0-9]{10}"
          required 
        />
      </div>

      <div className="space-y-1.5 md:space-y-2 md:col-span-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Address</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          placeholder="Residential Address"
          value={formData.address} 
          onChange={e => setFormData({...formData, address: e.target.value})} 
          required 
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Total Fees (₹)</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          type="number"
          value={formData.totalFees} 
          onChange={e => setFormData({...formData, totalFees: e.target.value})} 
          required 
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[#4B5563] font-semibold text-xs md:text-sm">Fees Paid (₹)</Label>
        <Input 
          className="bg-[#F3F4F6] border-none h-11 text-sm" 
          type="number"
          value={formData.feesPaid} 
          onChange={e => setFormData({...formData, feesPaid: e.target.value})} 
          required 
        />
      </div>
    </div>
  );
}