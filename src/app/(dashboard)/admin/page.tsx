"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  Clock,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { students, teachers, currentUser } = useSchoolStore();
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    setCurrentTime(new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }));
  }, []);

  const totalFeesExpected = students.reduce((sum, s) => sum + (s.totalFees || 0), 0);
  const totalFeesCollected = students.reduce((sum, s) => sum + (s.feesPaid || 0), 0);
  const outstandingDues = totalFeesExpected - totalFeesCollected;

  const stats = [
    { 
      title: "Total Students", 
      value: students.length, 
      icon: GraduationCap, 
      color: "text-orange-600", 
      bg: "bg-gradient-to-br from-orange-100 to-amber-50",
      path: "/students"
    },
    { 
      title: "Total Staff", 
      value: teachers.length, 
      icon: Users, 
      color: "text-rose-600", 
      bg: "bg-gradient-to-br from-rose-100 to-pink-50",
      path: "/teachers"
    },
    { 
      title: "Fees Collected", 
      value: `₹${(totalFeesCollected / 1000).toFixed(1)}K`, 
      icon: Wallet, 
      color: "text-emerald-600", 
      bg: "bg-gradient-to-br from-emerald-100 to-teal-50",
      path: "/payments"
    },
    { 
      title: "Outstanding Dues", 
      value: `₹${(outstandingDues / 1000).toFixed(1)}K`, 
      icon: Clock, 
      color: "text-sky-600", 
      bg: "bg-gradient-to-br from-sky-100 to-cyan-50",
      path: "/payments"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[32px] font-bold tracking-tight text-[#1F2937]">Dashboard Overview</h2>
            <p className="text-muted-foreground font-medium text-[16px]">
              Welcome back, {currentUser?.fullName || 'Admin'}. Here is what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-xl font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="color-pop-card h-[160px] flex items-center rounded-2xl group hover:shadow-[0_20px_50px_-32px_rgba(194,65,12,0.7)] transition-shadow cursor-pointer"
              onClick={() => router.push(stat.path)}
            >
              <CardContent className="relative z-10 p-8 w-full flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[14px] font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-[32px] font-black text-[#1F2937] leading-none">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="color-pop-card rounded-3xl lg:col-span-2">
            <div className="relative z-10 p-8 pb-0">
              <h3 className="text-[20px] font-bold text-[#1F2937] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Student Attendance Trends
              </h3>
            </div>
            <CardContent className="relative z-10 p-8 flex items-center justify-center min-h-[350px]">
              <div className="w-full h-64 bg-white/60 rounded-2xl border border-dashed border-orange-200/70 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-gray-400">
                    <div className="w-48 h-48 rounded-full border-[16px] border-orange-100 relative">
                      <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-r-transparent animate-spin-slow"></div>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black text-primary">94%</span>
                        <span className="text-[10px] font-bold uppercase">Average</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium">Tracking daily presence across all standards</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="color-pop-card rounded-3xl">
            <div className="relative z-10 p-8 pb-4">
              <h3 className="text-[20px] font-bold text-[#1F2937]">
                Recent Registrations
              </h3>
            </div>
            <CardContent className="relative z-10 px-8 pb-8">
              <div className="space-y-6">
                {students.slice(-4).reverse().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <GraduationCap className="h-12 w-12 opacity-10 mb-2" />
                    <p className="text-sm font-medium">No recent enrollments</p>
                  </div>
                ) : (
                  students.slice(-4).reverse().map((student) => (
                    <div key={student.id} className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-700 truncate group-hover:text-primary transition-colors">{student.fullName}</p>
                        <p className="text-[11px] text-gray-400 font-medium">Class {student.class}-{student.division}</p>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {student.admissionDate.split('-').reverse().join('/')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
