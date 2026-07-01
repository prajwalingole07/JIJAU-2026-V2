"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarIcon, XCircle, Check, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AttendancePage() {
  const { students, staffAttendance, updateStaffAttendanceStatus, markStudentAttendance, currentUser } = useSchoolStore();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("1st");
  const [currentDate, setCurrentDate] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'Present' | 'Absent'>>({});

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  const handleSubmitAttendance = () => {
    const records = filteredStudents.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      studentId: s.id,
      date: new Date().toLocaleDateString(),
      status: attendanceRecords[s.id] || 'Present',
      class: selectedClass
    }));

    markStudentAttendance(records);
    toast({ title: "Attendance Submitted", description: `Attendance recorded for ${selectedClass}` });
  };

  const canApproveStaff = currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN';
  const pendingStaff = staffAttendance.filter(a => a.approvalStatus === 'Pending');
  const staffRecords = [...staffAttendance].sort((a, b) => {
    if (a.approvalStatus === 'Pending' && b.approvalStatus !== 'Pending') return -1;
    if (a.approvalStatus !== 'Pending' && b.approvalStatus === 'Pending') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const classOptions = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">School Attendance</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-[16px]">
              Monitor and manage daily presence records.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-semibold text-gray-500 text-xs md:text-sm self-end">
            <CalendarIcon className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
        </div>

        <Tabs defaultValue="student">
          <TabsList className="bg-orange-50 p-1 rounded-xl w-full md:w-auto">
            <TabsTrigger value="student" className="flex-1 md:flex-none rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Students</TabsTrigger>
            {canApproveStaff && (
              <TabsTrigger value="staff" className="flex-1 md:flex-none rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Teachers Attendance
                {pendingStaff.length > 0 && (
                  <Badge className="ml-2 bg-orange-100 text-orange-700 border-none text-[10px]">
                    {pendingStaff.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="student" className="mt-6">
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg md:text-[20px] font-bold text-[#1F2937]">Daily Attendance</CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-muted/30 border-none h-11">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map(c => (
                        <SelectItem key={c} value={c}>
                          {["Nursery", "LKG", "UKG"].includes(c) ? c : `${c} Std.`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 h-11 font-bold"
                    onClick={handleSubmitAttendance}
                  >
                    Submit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F9FAFB] border-y border-gray-100">
                      <TableHead className="pl-6 md:pl-8 text-[10px] font-black uppercase tracking-wider text-gray-400">Roll #</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider text-gray-400">Name</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Present</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16 text-gray-400 font-medium italic">
                          No students in {selectedClass}.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student, idx) => (
                        <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="pl-6 md:pl-8 font-bold text-gray-400">#{student.rollNumber || idx + 1}</TableCell>
                          <TableCell className="font-bold text-gray-700">{student.fullName}</TableCell>
                          <TableCell className="text-center" colSpan={2}>
                            <RadioGroup
                              value={attendanceRecords[student.id] || 'Present'}
                              onValueChange={(val: any) => setAttendanceRecords(prev => ({...prev, [student.id]: val}))}
                              className="flex items-center justify-center gap-10"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <RadioGroupItem value="Present" id={`p-${student.id}`} className="h-6 w-6 text-[#22C55E] border-[#22C55E]" />
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <RadioGroupItem value="Absent" id={`a-${student.id}`} className="h-6 w-6 text-[#EF4444] border-[#EF4444]" />
                              </div>
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

          {canApproveStaff && (
            <TabsContent value="staff" className="mt-6">
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="p-4 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg md:text-[20px] font-bold text-[#1F2937]">Teachers Attendance Approval</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Approve teacher self-attendance marked from their login.
                    </p>
                  </div>
                  <Badge className="w-fit bg-orange-100 text-orange-700 border-none font-bold">
                    {pendingStaff.length} Pending
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F9FAFB] border-y border-gray-100">
                        <TableHead className="pl-6 md:pl-8 text-[10px] font-black uppercase tracking-wider text-gray-400">Teacher</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-wider text-gray-400">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-wider text-gray-400">Marked</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-wider text-gray-400">Approval</TableHead>
                        <TableHead className="text-right pr-6 md:pr-8 text-[10px] font-black uppercase tracking-wider text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16 text-gray-400 font-medium italic">
                            No teacher attendance records yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        staffRecords.map((att) => (
                          <TableRow key={att.id}>
                            <TableCell className="pl-6 md:pl-8 font-bold text-gray-700">{att.teacherName}</TableCell>
                            <TableCell className="text-gray-500 text-xs">{att.date}</TableCell>
                            <TableCell>
                              <Badge className={att.status === 'Present' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                                {att.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  att.approvalStatus === 'Approved'
                                    ? 'bg-green-50 text-green-700 border-none'
                                    : att.approvalStatus === 'Rejected'
                                      ? 'bg-red-50 text-red-700 border-none'
                                      : 'bg-orange-50 text-orange-700 border-none'
                                }
                              >
                                {att.approvalStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6 md:pr-8 space-x-1 md:space-x-2">
                              {att.approvalStatus === 'Pending' ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                    onClick={() => {
                                      updateStaffAttendanceStatus(att.id, 'Approved');
                                      toast({ title: "Approved", description: `${att.teacherName}'s attendance approved.` });
                                    }}
                                  >
                                    <Check className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Approve</span>
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      updateStaffAttendanceStatus(att.id, 'Rejected');
                                      toast({ title: "Rejected", description: `${att.teacherName}'s attendance rejected.`, variant: "destructive" });
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Reject</span>
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-gray-400 uppercase">Reviewed</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!canApproveStaff && (
            <TabsContent value="staff" className="mt-6">
              <Card className="border-none shadow-sm rounded-2xl bg-white p-12 md:p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Authorization Required</h3>
                  <p className="text-muted-foreground text-sm">Teacher attendance approval is restricted to Admin and Founder accounts.</p>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
