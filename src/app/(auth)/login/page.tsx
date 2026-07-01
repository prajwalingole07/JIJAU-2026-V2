"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSchoolStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_CREDENTIALS, SCHOOL_NAME, SCHOOL_LOGO } from '@/lib/constants';
import Image from 'next/image';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, teachers } = useSchoolStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const inputUsername = username.trim();
    const normalizedUsername = inputUsername.toLowerCase();

    // Founder Check
    if (normalizedUsername === DEFAULT_CREDENTIALS.FOUNDER.username.toLowerCase() && password === DEFAULT_CREDENTIALS.FOUNDER.password) {
      login({ id: 'founder', username: inputUsername, fullName: 'Hon. Dnyaneshwar Ingole', role: 'FOUNDER' });
      toast({ title: "Welcome back, Hon. Dnyaneshwar Ingole!" });
      router.push('/admin');
      return;
    }

    // Admin Check
    if (normalizedUsername === DEFAULT_CREDENTIALS.ADMIN.username.toLowerCase() && password === DEFAULT_CREDENTIALS.ADMIN.password) {
      login({ id: 'admin', username: inputUsername, fullName: 'Prajwal (Admin)', role: 'ADMIN' });
      toast({ title: "Welcome back, Admin!" });
      router.push('/admin');
      return;
    }

    // Teacher Check
    const teacher = teachers.find(t => (t.username || "").trim().toLowerCase() === normalizedUsername);
    if (teacher && teacher.password === password) {
      login({ 
        id: teacher.id, 
        username: teacher.username, 
        fullName: teacher.fullName, 
        role: 'TEACHER', 
        photo: teacher.photo 
      });
      toast({ title: `Welcome, Prof. ${teacher.fullName.split(' ')[0]}!` });
      router.push('/teacher');
      return;
    }

    toast({ 
      title: "Login Failed", 
      description: "Invalid credentials. Please check your username and password.",
      variant: "destructive" 
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden app-glow-bg">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-24 w-24 rounded-full bg-amber-200/50 blur-2xl" />
        <div className="absolute right-[10%] top-[16%] h-32 w-32 rounded-full bg-sky-200/50 blur-2xl" />
        <div className="absolute bottom-[8%] left-[18%] h-28 w-28 rounded-full bg-rose-200/45 blur-2xl" />
      </div>

      <div className="mb-6 md:mb-8 flex flex-col items-center text-center relative z-10 px-4">
        <div className="bg-white/80 rounded-full p-2 shadow-2xl mb-4 ring-4 ring-white/50">
          <Image src={SCHOOL_LOGO} alt="School Logo" width={80} height={80} className="rounded-full w-[70px] h-[70px] md:w-[90px] md:h-[90px]" />
        </div>
        <h1 className="text-xl md:text-3xl font-black text-primary tracking-tighter drop-shadow-sm uppercase">
          {SCHOOL_NAME}
        </h1>
        <p className="text-[#1F2937] font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] mt-2 opacity-60">
          Digital Management System
        </p>
      </div>

      <Card className="w-full max-w-[400px] shadow-[0_28px_72px_-30px_rgba(194,65,12,0.52)] border border-white/70 ring-1 ring-white/60 rounded-[2rem] overflow-hidden bg-white/80 supports-[backdrop-filter]:backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-1 bg-white/40 pt-8 md:pt-10 pb-4 md:pb-6 border-b border-white/40">
          <CardTitle className="text-xl md:text-2xl text-center font-black uppercase tracking-tight text-[#1F2937]">Portal Access</CardTitle>
          <CardDescription className="text-center font-bold text-gray-400 uppercase text-[9px] md:text-[10px] tracking-widest">
            Enter credentials to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 md:space-y-8 pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-10">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm md:text-base font-black uppercase tracking-widest text-primary ml-1 block">Username / ID</Label>
              <Input 
                id="username" 
                placeholder="e.g. Maya123" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="h-14 md:h-16 bg-white/70 border border-white/70 rounded-2xl font-black text-[#1F2937] shadow-inner focus-visible:ring-primary/30 placeholder:text-gray-300 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm md:text-base font-black uppercase tracking-widest text-primary ml-1 block">Security Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="pr-14 h-14 md:h-16 bg-white/70 border border-white/70 rounded-2xl font-black text-[#1F2937] shadow-inner focus-visible:ring-primary/30 placeholder:text-gray-300 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-10 md:pb-12 px-6 md:px-10">
            <Button className="w-full brand-gradient hover:brightness-105 text-white font-black h-16 md:h-20 rounded-2xl shadow-xl shadow-orange-500/20 text-lg md:text-xl uppercase tracking-wider" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 flex items-center gap-3 text-primary/40 font-black text-[8px] md:text-[10px] uppercase tracking-[0.25em] relative z-10">
        <ShieldCheck className="h-4 w-4" />
        SECURE CLOUD ACCESS • 2026
      </div>
    </div>
  );
}
