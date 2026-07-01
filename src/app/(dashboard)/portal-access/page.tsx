"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { Plus, Search, Key, ShieldCheck, Eye, EyeOff, Save, UserPlus, ShieldOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Teacher } from '@/lib/types';

export default function PortalAccessPage() {
  const { teachers, updateTeacher, addTeacher, currentUser } = useSchoolStore();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    classDetails: "None"
  });

  const isPrivileged = currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN';

  // Filter academic faculty who match search
  const academicFaculty = teachers.filter(t => 
    t.category === 'Academic' && (
      t.fullName.toLowerCase().includes(search.toLowerCase()) || 
      (t.username || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacherId(teacher.id);
    setFormData({
      fullName: teacher.fullName,
      username: teacher.username || "",
      password: teacher.password || "",
      classDetails: teacher.classDetails || "None"
    });
    setIsEditOpen(true);
  };

  const handleCreatePortal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTeacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName.trim(),
      username: formData.username.trim(), // Mixed case preserved
      password: formData.password, // Mixed case preserved
      classDetails: formData.classDetails,
      subject: "General",
      experience: 0,
      mobile: "",
      address: "",
      casteInput: "OPEN",
      casteNormalized: "OPEN",
      photo: `https://picsum.photos/seed/${formData.fullName}/200/200`,
      aadhaarNumber: "",
      baseSalary: 0,
      category: 'Academic',
      academicRole: 'Teacher'
    };

    addTeacher(newTeacher);
    toast({ title: "Portal Created", description: `Access activated for ${formData.fullName}` });
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdatePortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) return;

    updateTeacher(selectedTeacherId, {
      username: formData.username.trim(),
      password: formData.password,
      classDetails: formData.classDetails
    });

    toast({ title: "Access Updated", description: "Portal credentials synchronized." });
    setIsEditOpen(false);
    resetForm();
  };

  const handleRevokeAccess = (teacherId: string) => {
    updateTeacher(teacherId, {
      username: "",
      password: ""
    });
    toast({ title: "Access Revoked", description: "Digital credentials have been cleared." });
  };

  const resetForm = () => {
    setFormData({ fullName: "", username: "", password: "", classDetails: "None" });
    setSelectedTeacherId(null);
    setShowPassword(false);
  };

  const classes = ["None", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-secondary" /> Portal Access Management
            </h2>
            <p className="text-muted-foreground font-medium">Configure digital credentials (case-sensitive passwords) for faculty.</p>
          </div>
          {isPrivileged && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 px-6 rounded-xl bg-primary gap-2 font-bold shadow-lg shadow-orange-100">
                  <Plus className="h-4 w-4" /> Create New Portal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[95vw] md:w-full max-h-[90vh] overflow-y-auto rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-[#1F2937] flex items-center gap-2">
                    <UserPlus className="h-6 w-6 text-primary" /> Create Teacher Portal
                  </DialogTitle>
                  <DialogDescription>Setup digital access with mixed-case credentials.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePortal} className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Teacher Name</Label>
                      <Input 
                        className="bg-gray-50 border-none h-12 rounded-xl font-bold" 
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Portal Username / ID</Label>
                      <Input 
                        className="bg-gray-50 border-none h-12 rounded-xl font-black text-primary" 
                        placeholder="e.g. Maya123"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Access Password</Label>
                      <div className="relative">
                        <Input 
                          className="bg-gray-50 border-none h-12 rounded-xl font-black pr-12" 
                          type={showPassword ? "text" : "password"}
                          placeholder="e.g. Maya@2026#"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Allotted Class</Label>
                      <Select value={formData.classDetails} onValueChange={val => setFormData({...formData, classDetails: val})}>
                        <SelectTrigger className="bg-gray-50 border-none h-12 rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-primary h-14 rounded-xl font-black text-lg gap-3">
                      <Save className="h-5 w-5" /> Activate Portal
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between space-y-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-12 h-12 bg-gray-50 border-none shadow-inner rounded-xl" 
                placeholder="Search portal ID or name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="pl-8 py-5 text-[11px] font-black uppercase tracking-widest">Faculty Member</TableHead>
                  <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest">Allotted Class</TableHead>
                  <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest">Portal ID</TableHead>
                  <TableHead className="text-right pr-8 py-5 text-[11px] font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-gray-400 font-bold italic">
                      No portals created yet. Click "+" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  academicFaculty.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={t.photo} />
                            <AvatarFallback className="bg-primary text-white font-bold">{t.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-gray-700">{t.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 border-none font-bold uppercase tracking-tight">
                          {t.classDetails === 'None' ? 'Not Assigned' : t.classDetails}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {t.username || "---"}
                      </TableCell>
                      <TableCell className="text-right pr-8 space-x-2">
                        {isPrivileged && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-9 px-4 rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold gap-2"
                              onClick={() => handleOpenEdit(t)}
                            >
                              <Key className="h-3.5 w-3.5" /> Manage
                            </Button>

                            {t.username && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 p-0"
                                    title="Revoke Portal Access"
                                  >
                                    <ShieldOff className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Revoke Digital Access?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will clear the username and password for <strong>{t.fullName}</strong>. 
                                      Their teacher record will remain in the directory.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRevokeAccess(t.id)} className="bg-red-600 hover:bg-red-700">
                                      Confirm Revocation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
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

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md w-[95vw] md:w-full max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[#1F2937] flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" /> Edit Portal Access
              </DialogTitle>
              <DialogDescription>Modify mixed-case digital credentials.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePortal} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Portal Username / ID</Label>
                  <Input 
                    className="bg-gray-50 border-none h-12 rounded-xl font-black text-primary" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Access Password</Label>
                  <div className="relative">
                    <Input 
                      className="bg-gray-50 border-none h-12 rounded-xl font-black pr-12" 
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Allotted Class</Label>
                  <Select value={formData.classDetails} onValueChange={val => setFormData({...formData, classDetails: val})}>
                    <SelectTrigger className="bg-gray-50 border-none h-12 rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full bg-primary h-14 rounded-xl font-black text-lg gap-3 shadow-lg shadow-orange-100">
                  <Save className="h-5 w-5" /> Update Portal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}