"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useSchoolStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded, isLiveSync, logout } = useSchoolStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoaded && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoaded, router]);

  if (!mounted || !isLoaded || !currentUser) return null;

  const displayName = currentUser.role === 'FOUNDER' ? "Hon. Dnyaneshwar Ingole" : currentUser.fullName;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="app-glow-bg min-h-svh">
        <header className="live-color-strip sticky top-0 z-30 flex h-16 md:h-20 min-w-0 items-center justify-between bg-white/80 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:backdrop-blur-md px-4 md:px-8 border-b border-white/70 shadow-[0_10px_32px_-28px_rgba(146,64,14,0.55)]">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-10 w-10 text-primary hover:bg-primary/10" />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-black text-primary uppercase leading-tight tracking-widest">Jijau School</span>
              <span className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest hidden sm:inline">Connect Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[13px] font-bold text-[#1F2937] leading-none">
                {displayName}
              </p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{currentUser.role}</p>
            </div>
            <Link href="/profile">
              <Avatar className="h-9 w-9 md:h-11 md:w-11 border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-primary transition-shadow">
                <AvatarImage src={currentUser.photo} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 md:h-11 md:w-11 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        {!isLiveSync && (
          <div className="sticky top-16 md:top-20 z-20 flex items-center justify-center gap-2 bg-amber-50 px-4 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-amber-700 border-b border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Local mode &mdash; connect Firebase to sync changes live across devices
          </div>
        )}
        <main className="relative min-w-0 px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
