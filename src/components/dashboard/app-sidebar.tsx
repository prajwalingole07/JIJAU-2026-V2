"use client";

import { 
  LayoutGrid, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  Wallet, 
  LogOut,
  HardHat,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Receipt
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { useSchoolStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { SCHOOL_LOGO } from "@/lib/constants";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { currentUser, logout } = useSchoolStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'FOUNDER';

  const menuItems = isAdmin ? [
    { title: "Dashboard", icon: LayoutGrid, path: "/admin" },
    { title: "Academic Faculty", icon: Users, path: "/teachers" },
    { title: "Staff Faculty", icon: HardHat, path: "/staff" },
    { title: "Students", icon: GraduationCap, path: "/students" },
    { title: "Attendance", icon: CalendarCheck, path: "/attendance" },
    { title: "Homework Tracker", icon: BookOpen, path: "/homework-status" },
    { title: "Fees & Salary", icon: Wallet, path: "/payments" },
    { title: "Fee Receipts", icon: Receipt, path: "/fee-receipts" },
    { title: "Portal Access", icon: ShieldCheck, path: "/portal-access" },
    { title: "AI Tools", icon: Sparkles, path: "/ai-tools" },
  ] : [
    { title: "My Dashboard", icon: LayoutGrid, path: "/teacher" },
    { title: "AI Communications", icon: Sparkles, path: "/ai-tools" },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="soft-sidebar overflow-hidden border-none text-sidebar-foreground">
      <SidebarHeader className="relative z-10 shrink-0 px-5 pb-4 pt-6 flex flex-col items-center gap-2">
        <div className="bg-white/80 rounded-full p-1 h-14 w-14 md:h-16 md:w-16 flex items-center justify-center overflow-hidden shrink-0 shadow-lg mb-1 ring-2 ring-white/80">
          <Image src={SCHOOL_LOGO} alt="Logo" width={64} height={64} className="object-cover" />
        </div>
        <div className="flex flex-col text-center group-data-[collapsible=icon]:hidden">
          <span className="font-bold text-base md:text-lg text-sidebar-foreground leading-tight tracking-wide uppercase">JIJAU ENGLISH SCHOOL</span>
          <span className="text-[10px] text-orange-700/70 font-medium uppercase tracking-widest mt-0.5">TUNGI [B.K]</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="relative z-10 min-h-0 flex-1 px-3 pb-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => router.push(item.path)}
                      tooltip={item.title}
                      className={cn(
                        "h-11 rounded-xl transition-[background-color,color,box-shadow,transform] duration-150 hover:bg-white/70 hover:text-orange-900 active:translate-y-px",
                        isActive
                          ? "bg-white/75 text-orange-900 font-semibold shadow-[inset_4px_0_0_hsl(25_95%_53%),0_12px_30px_-24px_rgba(194,65,12,0.8)]"
                          : "text-orange-900/70"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-orange-700/70")} />
                      <span className="text-[15px]">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative z-10 shrink-0 p-4 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => { logout(); router.push('/login'); }}
              className="text-orange-900/70 hover:bg-white/70 hover:text-orange-900 transition-colors gap-3 px-4 h-12 rounded-xl group"
            >
              <LogOut className="h-5 w-5 text-primary" />
              <span className="font-bold text-[15px]">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
