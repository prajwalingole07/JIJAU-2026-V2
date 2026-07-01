
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  LayoutGrid, 
  UserCheck, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit2, 
  Save,
  TrendingUp,
  CalendarCheck,
  GraduationCap,
  Search,
  ImagePlus,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import type { Student } from "@/lib/types";

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(var(--primary))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export default function TeacherDashboard() {
  const { 
    currentUser, 
    students, 
    teachers, 
    staffAttendance, 
    markStaffAttendance, 
    studentAttendance, 
    markStudentAttendance,
    homeworks,
    addHomework,
    updateHomework,
    isLoaded
  } = useSchoolStore();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [markedToday, setMarkedToday] = useState(false);
  const [isHomeworkOpen, setIsHomeworkOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<any>(null);
  const [homeworkContent, setHomeworkContent] = useState("");
  const [homeworkImage, setHomeworkImage] = useState<string>("");
  const homeworkFileInputRef = useRef<HTMLInputElement>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'Present' | 'Absent'>>({});
  
  // State for viewing student lists from cards
  const [viewingList, setViewingList] = useState<'total' | 'present' | 'absent' | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    if (currentUser && isLoaded) {
      const todayStr = new Date().toLocaleDateString();
      const alreadyMarked = staffAttendance.some(a => a.teacherId === currentUser.id && a.date === todayStr);
      setMarkedToday(alreadyMarked);
    }
  }, [currentUser, staffAttendance, isLoaded]);

  const myProfile = useMemo(() => teachers.find(t => t.id === currentUser?.id), [teachers, currentUser]);
  const myClass = myProfile?.classDetails || 'None';
  const myStudents = useMemo(() => students.filter(s => s.class === myClass), [students, myClass]);
  const today = useMemo(() => new Date().toLocaleDateString(), []);

  const todayAtt = useMemo(() => studentAttendance.filter(a => a.class === myClass && a.date === today), [studentAttendance, myClass, today]);
  const presentCount = todayAtt.filter(a => a.status === 'Present').length;
  const absentCount = todayAtt.filter(a => a.status === 'Absent').length;

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString();
      const dayAtt = studentAttendance.filter(a => a.class === myClass && a.date === dateStr);
      data.push({
        date: dateStr.split('/')[0] + '/' + dateStr.split('/')[1],
        present: dayAtt.filter(a => a.status === 'Present').length,
        absent: dayAtt.filter(a => a.status === 'Absent').length,
      });
    }
    return data;
  }, [studentAttendance, myClass]);

  const handleMarkSelfAttendance = () => {
    if (!currentUser) return;
    markStaffAttendance({
      id: Math.random().toString(36).substr(2, 9),
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      date: today,
      status: 'Present',
      approvalStatus: 'Pending'
    });
    toast({ title: "Attendance Marked", description: "Waiting for admin approval." });
    setMarkedToday(true);
  };

  const handleSubmitAttendance = () => {
    const records = myStudents.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      studentId: s.id,
      date: today,
      status: attendanceRecords[s.id] || 'Present',
      class: myClass
    }));
    markStudentAttendance(records);
    toast({ title: "Attendance Ledger Submitted", description: `Records saved for ${myClass}` });
  };

  const handleHomeworkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHomeworkImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHomework = () => {
    if (!currentUser) return;
    if (editingHomework) {
      updateHomework(editingHomework.id, { content: homeworkContent, imageUrl: homeworkImage || undefined });
      toast({ title: "Homework Updated" });
    } else {
      addHomework({
        id: Math.random().toString(36).substr(2, 9),
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        class: myClass,
        date: today,
        content: homeworkContent,
        createdAt: new Date().toISOString(),
        imageUrl: homeworkImage || undefined
      });
      toast({ title: "Homework Posted" });
    }
    setIsHomeworkOpen(false);
    setHomeworkContent("");
    setHomeworkImage("");
    setEditingHomework(null);
  };

  const myHomeworks = useMemo(() => 
    homeworks
      .filter(h => h.teacherId === currentUser?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [homeworks, currentUser]
  );

  const filteredListToShow = useMemo(() => {
    let baseList: Student[] = [];
    if (viewingList === 'total') baseList = myStudents;
    else if (viewingList === 'present') {
      const presentIds = todayAtt.filter(a => a.status === 'Present').map(a => a.studentId);
      baseList = myStudents.filter(s => presentIds.includes(s.id));
    } else if (viewingList === 'absent') {
      const absentIds = todayAtt.filter(a => a.status === 'Absent').map(a => a.studentId);
      baseList = myStudents.filter(s => absentIds.includes(s.id));
    }
    
    return baseList.filter(s => 
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [viewingList, myStudents, todayAtt, studentSearch]);

  const listTitle = {
    total: "Class Roster",
    present: "Students Present Today",
    absent: "Students Absent Today"
  }[viewingList || 'total'];

  if (!currentUser) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-lg">
              <AvatarImage src={currentUser.photo} className="object-cover" />
              <AvatarFallback className="bg-primary text-white text-2xl font-black uppercase">
                {currentUser.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Welcome back, {currentUser.fullName}!</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary/10 text-primary border-none font-bold">Class Teacher: {myClass}</Badge>
                <Badge variant="outline" className="font-bold border-gray-200">Session 2026-27</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-primary text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-100 flex items-center gap-3 font-black">
               <Clock className="h-5 w-5" />
               <span className="text-lg">{today}</span>
             </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-md p-1 rounded-2xl h-auto flex flex-wrap gap-2 w-fit">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-xl px-6 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold"
            >
              <LayoutGrid className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="self-attendance" 
              className="rounded-xl px-6 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold"
            >
              <UserCheck className="h-4 w-4" /> Self Attendance
            </TabsTrigger>
            <TabsTrigger 
              value="attendance" 
              className="rounded-xl px-6 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold"
            >
              <Users className="h-4 w-4" /> Student Attendance
            </TabsTrigger>
            <TabsTrigger 
              value="homework" 
              className="rounded-xl px-6 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold"
            >
              <BookOpen className="h-4 w-4" /> Homework Hub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 m-0 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              <Card 
                className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all cursor-pointer active:scale-95"
                onClick={() => setViewingList('total')}
              >
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
                    <p className="text-4xl font-black text-gray-800">{myStudents.length}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all cursor-pointer active:scale-95"
                onClick={() => setViewingList('present')}
              >
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Present Today</p>
                    <p className="text-4xl font-black text-green-600">{presentCount}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all cursor-pointer active:scale-95"
                onClick={() => setViewingList('absent')}
              >
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Absent Today</p>
                    <p className="text-4xl font-black text-red-500">{absentCount}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <XCircle className="h-7 w-7 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="p-8 bg-white border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight text-[#1F2937]">
                      <TrendingUp className="h-5 w-5 text-primary" /> Student Attendance Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Last 7 Active Days Trend</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[350px] w-full">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                        <Area 
                          type="monotone" 
                          dataKey="present" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorPresent)" 
                          animationDuration={1500}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="absent" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorAbsent)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="self-attendance" className="m-0 outline-none">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden max-w-xl mx-auto mt-6">
              <CardHeader className="p-10 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                  <CalendarCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black text-gray-800">Verify Daily Presence</CardTitle>
                <CardDescription className="text-sm font-medium">Record your attendance for today, {today}.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0 flex flex-col items-center">
                {!markedToday ? (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 h-16 rounded-2xl text-lg font-black shadow-xl shadow-orange-100 transition-all active:scale-95"
                    onClick={handleMarkSelfAttendance}
                  >
                    Confirm Present Today
                  </Button>
                ) : (
                  <div className="w-full bg-green-50 border border-green-100 p-8 rounded-2xl flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                       <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800 font-black uppercase text-sm tracking-widest">Presence Marked</p>
                      <p className="text-green-600 text-xs font-bold mt-1">Pending admin verification.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="m-0 outline-none">
            <Card className="border-none shadow-md rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/20">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black text-gray-800 uppercase tracking-tight">Student Attendance</CardTitle>
                  <CardDescription className="font-bold text-primary">Class {myClass} • {today}</CardDescription>
                </div>
                <Button 
                  className="bg-primary h-12 px-8 rounded-xl font-black text-sm shadow-lg shadow-orange-50 transition-all active:scale-95"
                  onClick={handleSubmitAttendance}
                  disabled={myStudents.length === 0}
                >
                  Submit Records
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 border-none">
                      <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Roll No.</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student Name</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Present</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-24 text-gray-300 font-black uppercase tracking-widest italic">
                          No students enrolled in your class
                        </TableCell>
                      </TableRow>
                    ) : (
                      myStudents.map((s) => (
                        <TableRow key={s.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 group">
                          <TableCell className="pl-8 font-bold text-gray-400">#{s.rollNumber}</TableCell>
                          <TableCell className="font-bold text-gray-700 text-base">{s.fullName}</TableCell>
                          <TableCell className="text-center" colSpan={2}>
                            <RadioGroup
                              value={attendanceRecords[s.id] || 'Present'}
                              onValueChange={(val: any) => setAttendanceRecords(prev => ({...prev, [s.id]: val}))}
                              className="flex items-center justify-center gap-10"
                            >
                              <RadioGroupItem value="Present" id={`p-${s.id}`} className="h-5 w-5 text-green-600 border-green-600" />
                              <RadioGroupItem value="Absent" id={`a-${s.id}`} className="h-5 w-5 text-red-500 border-red-500" />
                            </RadioGroup>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework" className="m-0 outline-none">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Homework Hub</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Daily Assignment Logs</p>
                </div>
                <Button 
                  className="w-full sm:w-auto bg-primary rounded-xl font-black h-12 px-6 gap-2 shadow-lg shadow-orange-50 active:scale-95 transition-all" 
                  onClick={() => { setEditingHomework(null); setHomeworkContent(""); setIsHomeworkOpen(true); }}
                >
                  <Plus className="h-4 w-4" /> Post New Task
                </Button>
              </div>

              <div className="grid gap-6">
                {myHomeworks.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-100 py-24 flex flex-col items-center justify-center text-gray-300 rounded-3xl">
                    <BookOpen className="h-16 w-16 opacity-10 mb-4" />
                    <p className="font-black uppercase tracking-widest text-[10px]">No assignments posted yet</p>
                  </Card>
                ) : (
                  myHomeworks.map((h) => (
                    <Card key={h.id} className="border-none shadow-sm rounded-3xl bg-white group overflow-hidden">
                      <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
                            <CalendarCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-black text-gray-800">{h.date}</CardTitle>
                            <CardDescription className="text-[9px] font-black uppercase tracking-widest text-primary">Class {h.class}</CardDescription>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm" 
                          onClick={() => { setEditingHomework(h); setHomeworkContent(h.content); setHomeworkImage(h.imageUrl || ""); setIsHomeworkOpen(true); }}
                        >
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 space-y-4">
                        <div className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-50/80 whitespace-pre-wrap">
                          {h.content}
                        </div>
                        {h.imageUrl && (
                          <div className="overflow-hidden rounded-2xl border border-gray-100">
                            <img src={h.imageUrl} alt="Homework attachment" className="max-h-72 w-full object-contain bg-gray-50" />
                            <div className="flex justify-end bg-gray-50/60 p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold text-primary"
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = h.imageUrl as string;
                                  a.download = `homework-${h.id}.jpg`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                }}
                              >
                                <Download className="h-3.5 w-3.5" /> Save Image
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <Dialog open={isHomeworkOpen} onOpenChange={(val) => { setIsHomeworkOpen(val); if (!val) { setHomeworkImage(""); } }}>
              <DialogContent className="flex max-h-[94svh] w-[96vw] max-w-xl flex-col overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl">
                <DialogHeader className="bg-primary text-white p-6 sm:p-8 shrink-0">
                  <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    {editingHomework ? 'Update Assignment' : 'Post New Homework'}
                  </DialogTitle>
                  <DialogDescription className="text-white/70 font-bold uppercase tracking-widest text-[10px] mt-1">
                    Academic Ledger Entry
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white">
                  <div className="bg-gray-50 p-6 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div>
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Date</Label>
                      <p className="font-black text-primary text-xl">{editingHomework ? editingHomework.date : today}</p>
                    </div>
                    <div className="text-right">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allotted Class</Label>
                      <p className="font-black text-gray-700 text-xl">{myClass}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Assignment Details</Label>
                    <Textarea 
                      placeholder="Define tasks, reading materials, or projects for today..." 
                      className="min-h-[160px] bg-gray-50 border-none rounded-2xl p-6 font-medium text-base leading-relaxed focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                      value={homeworkContent}
                      onChange={e => setHomeworkContent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Attach Image (optional)</Label>
                    {homeworkImage ? (
                      <div className="relative overflow-hidden rounded-2xl border border-gray-100">
                        <img src={homeworkImage} alt="Homework attachment preview" className="max-h-60 w-full object-contain bg-gray-50" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute right-2 top-2 h-8 px-3 text-xs font-bold"
                          onClick={() => { setHomeworkImage(""); if (homeworkFileInputRef.current) homeworkFileInputRef.current.value = ""; }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100"
                        onClick={() => homeworkFileInputRef.current?.click()}
                      >
                        <ImagePlus className="h-6 w-6 text-gray-400" />
                        <p className="text-xs font-bold text-gray-400">Click to upload a photo for this homework</p>
                      </div>
                    )}
                    <input ref={homeworkFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleHomeworkImageChange} />
                  </div>

                  <DialogFooter className="pt-0 bg-white">
                    <Button className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl text-lg font-black gap-2 shadow-xl shadow-orange-50 transition-all active:scale-95" onClick={handleSaveHomework}>
                      <Save className="h-5 w-5" /> {editingHomework ? 'Update Record' : 'Post to Hub'}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
        
        {/* Student List View Dialog */}
        <Dialog open={!!viewingList} onOpenChange={(val) => { if (!val) { setViewingList(null); setStudentSearch(""); } }}>
          <DialogContent className="flex max-h-[94svh] w-[95vw] max-w-2xl flex-col overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl">
            <DialogHeader className="bg-primary text-white p-6 sm:p-8 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  {viewingList === 'absent' ? <XCircle className="h-6 w-6" /> : viewingList === 'present' ? <CheckCircle2 className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight">{listTitle}</DialogTitle>
                  <DialogDescription className="text-white/70 font-bold uppercase tracking-widest text-[10px] mt-1">
                    Class {myClass} • {today}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col bg-white">
              <div className="p-6 border-b shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by name or roll number..." 
                    className="pl-10 h-11 bg-gray-50 border-none rounded-xl"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="pl-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Roll #</TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Name</TableHead>
                      <TableHead className="pr-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListToShow.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12 text-gray-300 font-bold uppercase text-xs">
                          {viewingList === 'absent' ? 'All are present' : 'No students found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredListToShow.map((s) => {
                        const isPresent = todayAtt.find(a => a.studentId === s.id)?.status === 'Present';
                        const isMarked = todayAtt.some(a => a.studentId === s.id);
                        
                        return (
                          <TableRow key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="pl-8 font-black text-gray-400">#{s.rollNumber}</TableCell>
                            <TableCell className="font-bold text-gray-700">{s.fullName}</TableCell>
                            <TableCell className="pr-8 text-right">
                              {!isMarked ? (
                                <Badge variant="outline" className="text-gray-400 font-bold">Unmarked</Badge>
                              ) : isPresent ? (
                                <Badge className="bg-green-50 text-green-700 border-none font-black text-[10px] uppercase">Present</Badge>
                              ) : (
                                <Badge className="bg-red-50 text-red-600 border-none font-black text-[10px] uppercase">Absent</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-6 sm:p-8 pt-4 bg-gray-50/50 shrink-0">
                <Button className="w-full bg-primary h-12 rounded-xl font-black uppercase text-xs tracking-widest" onClick={() => setViewingList(null)}>
                  Close List
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
