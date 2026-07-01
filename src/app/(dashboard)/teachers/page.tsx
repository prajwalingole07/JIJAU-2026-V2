
"use client";

import { useState, useRef } from 'react';
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
import { Plus, Search, Trash2, Edit2, Camera, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Teacher, AcademicRole } from '@/lib/types';

export default function TeachersDirectoryPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, currentUser } = useSchoolStore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    subject: "",
    experience: "0",
    mobile: "",
    address: "",
    casteInput: "OPEN",
    photo: "",
    username: "",
    password: "",
    aadhaarNumber: "",
    classDetails: "None",
    baseSalary: "0",
    category: "Academic" as const,
    academicRole: "Teacher" as AcademicRole
  });

  const isPrivileged = currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN';

  const filteredTeachers = teachers.filter(t => 
    t.category === 'Academic' && (
      t.fullName.toLowerCase().includes(search.toLowerCase()) || 
      t.subject.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      experience: parseInt(formData.experience) || 0,
      baseSalary: parseFloat(formData.baseSalary) || 0,
      casteNormalized: normalizeCaste(formData.casteInput),
      photo: formData.photo || (editingId ? teachers.find(t => t.id === editingId)?.photo : `https://picsum.photos/seed/${formData.fullName}/200/200`),
    };

    if (editingId) {
      updateTeacher(editingId, data as any);
      toast({ title: "Faculty Directory Updated" });
      setIsEditOpen(false);
    } else {
      const newTeacher = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        username: `TCH_${Math.random().toString(36).substr(2, 4)}`, // Placeholder ID
        password: "user@123" // Default password
      };
      addTeacher(newTeacher as any);
      toast({ title: "Academic Member Added" });
      setIsAddOpen(false);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullName: "", subject: "", experience: "0", mobile: "", 
      address: "", casteInput: "OPEN", photo: "", username: "", password: "",
      aadhaarNumber: "", classDetails: "None", baseSalary: "0", category: "Academic",
      academicRole: "Teacher"
    });
    setEditingId(null);
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      fullName: teacher.fullName,
      subject: teacher.subject,
      experience: teacher.experience.toString(),
      mobile: teacher.mobile,
      address: teacher.address,
      casteInput: teacher.casteInput,
      photo: teacher.photo,
      username: teacher.username,
      password: teacher.password || "",
      aadhaarNumber: teacher.aadhaarNumber,
      classDetails: teacher.classDetails || "None",
      baseSalary: (teacher.baseSalary || 0).toString(),
      category: 'Academic',
      academicRole: teacher.academicRole || 'Teacher'
    });
    setEditingId(teacher.id);
    setIsEditOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Academic Faculty Directory</h2>
            <p className="text-muted-foreground font-medium text-[16px]">Manage academic members and their professional records.</p>
          </div>
          {isPrivileged && (
            <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary h-11 px-6 rounded-xl font-bold">
                  <Plus className="h-4 w-4" /> Add Faculty Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Faculty Enrollment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <DirectoryFormFields formData={formData} setFormData={setFormData} handleFileChange={handleFileChange} fileInputRef={fileInputRef} isPrivileged={isPrivileged} />
                  <DialogFooter className="mt-6">
                    <Button type="submit" className="w-full bg-primary h-12 font-bold rounded-xl">Register in Directory</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Update Faculty Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <DirectoryFormFields formData={formData} setFormData={setFormData} handleFileChange={handleFileChange} fileInputRef={fileInputRef} isPrivileged={isPrivileged} />
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full bg-primary h-12 font-bold rounded-xl">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10 h-10 bg-gray-50 border-none max-w-md shadow-inner" 
                placeholder="Search by name or subject..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="pl-8">Faculty Member</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exp.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium italic">
                      No academic faculty members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={t.photo} />
                            <AvatarFallback>{t.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700">{t.fullName}</span>
                            <span className="text-[10px] font-medium text-gray-400">{t.academicRole}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                          {t.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-600">{t.experience}Y</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-none font-bold">
                          {t.classDetails === 'None' ? 'N/A' : t.classDetails}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {isPrivileged && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(t)} 
                              className="text-orange-600 h-9 w-9 rounded-full bg-orange-50 hover:bg-orange-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-600 h-9 w-9 rounded-full bg-red-50 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove from Directory?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove <strong>{t.fullName}</strong>'s professional record.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteTeacher(t.id)} className="bg-red-600 hover:bg-red-700">
                                    Delete Record
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function DirectoryFormFields({ formData, setFormData, handleFileChange, fileInputRef }: any) {
  const classes = ["None", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 flex flex-col items-center mb-4">
        <div 
          className="relative h-24 w-24 rounded-full bg-muted border-2 border-primary/20 cursor-pointer overflow-hidden shadow-lg group"
          onClick={() => fileInputRef.current?.click()}
        >
          {formData.photo ? (
            <img src={formData.photo} className="h-full w-full object-cover" />
          ) : (
            <User className="h-full w-full p-4 text-gray-400" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-5 w-5 text-white" />
          </div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        <p className="text-[10px] text-primary font-bold mt-1 uppercase">Faculty Photo</p>
      </div>

      <div className="space-y-1 col-span-2">
        <Label>Full Name</Label>
        <Input className="bg-gray-50 border-none rounded-xl" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
      </div>
      <div className="space-y-1">
        <Label>Designation</Label>
        <Select value={formData.academicRole} onValueChange={val => setFormData({...formData, academicRole: val})}>
          <SelectTrigger className="bg-gray-50 border-none rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Principal">Principal</SelectItem>
            <SelectItem value="Vice-Principal">Vice-Principal</SelectItem>
            <SelectItem value="Teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Subject Expertise</Label>
        <Input className="bg-gray-50 border-none rounded-xl" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
      </div>
      <div className="space-y-1">
        <Label>Experience (Years)</Label>
        <Input type="number" className="bg-gray-50 border-none rounded-xl" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
      </div>
      <div className="space-y-1">
        <Label>Allot Class</Label>
        <Select value={formData.classDetails} onValueChange={val => setFormData({...formData, classDetails: val})}>
          <SelectTrigger className="bg-gray-50 border-none rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Mobile Number (10 Digits)</Label>
        <Input 
          className="bg-gray-50 border-none rounded-xl" 
          value={formData.mobile} 
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
            setFormData({...formData, mobile: val});
          }} 
          placeholder="e.g. 9876543210"
          pattern="[0-9]{10}"
          required
        />
      </div>
      <div className="space-y-1">
        <Label>Aadhaar Number (12 Digits)</Label>
        <Input 
          className="bg-gray-50 border-none rounded-xl" 
          value={formData.aadhaarNumber} 
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
            setFormData({...formData, aadhaarNumber: val});
          }} 
          placeholder="e.g. 123456789012"
          pattern="[0-9]{12}"
          required
        />
      </div>
      <div className="space-y-1">
        <Label>Base Salary (₹)</Label>
        <Input type="number" className="bg-gray-50 border-none rounded-xl" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} />
      </div>
      <div className="space-y-1 col-span-2">
        <Label>Address</Label>
        <Input className="bg-gray-50 border-none rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
      </div>
    </div>
  );
}
