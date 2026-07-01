
"use client";

import { useRef, useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { SCHOOL_NAME, SCHOOL_LOGO } from "@/lib/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Phone, Award, User, ShieldCheck, Briefcase } from "lucide-react";
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { currentUser, teachers, updateTeacher, login, isLoaded } = useSchoolStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const isFounder = currentUser?.role === 'FOUNDER';
  const isAdmin = currentUser?.role === 'ADMIN';
  const myTeacherProfile = teachers.find(t => t.id === currentUser?.id);

  const bioContent = useMemo(() => {
    if (!currentUser) return "";

    const name = isFounder ? "Dnyaneshwar Ingole" : capitalize(currentUser.fullName);
    const subject = capitalize(myTeacherProfile?.subject || "General Education");
    const exp = myTeacherProfile?.experience || 0;

    if (isFounder) {
      return `Myself, ${name}, the visionary Founder Chairman of ${SCHOOL_NAME}, am a distinguished leader whose life-long commitment to education has transformed the landscape of rural learning in Tungi (BK). With a deep-rooted belief that every child deserves access to world-class facilities regardless of their geographic location, I established this institution as a beacon of hope and excellence. 

My journey began with a simple yet powerful conviction: that education is the most potent weapon to break the cycle of poverty and empower the rural youth of Maharashtra. Over the decades, I have worked tirelessly to build a legacy of academic rigor and moral integrity that serves as a cornerstone for every student's future success. Under my astute guidance, the school has evolved from a humble visionary idea into a premier educational hub that balances traditional values with modern technological advancements.

I remain a hands-on leader, often personally interacting with students, faculty, and parents to understand their unique needs and aspirations. My personal journey is a true inspiration to many, proving that with determination and a clear, selfless vision, one can indeed change the world. Through my persistent efforts and the collective hard work of our faculty, ${SCHOOL_NAME} stands today as a testament to an enduring legacy of service, excellence, and the transformative power of a focused vision for the next generation of leaders.`;
    }

    if (isAdmin) {
      return `Myself, ${name}, serving as the Lead Administrator of ${SCHOOL_NAME}, am the strategic architect behind the school's digital transformation. My role is pivotal in ensuring that the intricate gears of our institution turn with precision and efficiency. With a robust background in school operations and information management, I have been instrumental in streamlining the complex systems of attendance, payroll, and academic tracking that power our daily excellence.

I believe that a school's success is built upon a foundation of organized data and transparent communication. By leveraging cutting-edge technology, I work to bridge the gap between administrative requirements and educational goals. My leadership ensures that our faculty can focus on what they do best—teaching—while I maintain a seamless operational environment that supports the entire academic community of ${SCHOOL_NAME}.

Dedicated to continuous improvement, I am constantly exploring new ways to enhance our institutional efficiency. My commitment to ${SCHOOL_NAME} is reflected in the reliability of our digital infrastructure and the professionalism of our administrative services, ensuring that we remain a leader in modern education in Tungi (BK).`;
    }
    
    return `Myself, ${name}, a seasoned and passionate educator at ${SCHOOL_NAME}, specialize in ${subject} with over ${exp} years of dedicated experience in the field. Throughout my career, I have been a driving force in creating vibrant and effective learning environments that challenge students to reach their full potential. My pedagogical approach combines traditional rigor with innovative, inquiry-based learning methods that make complex concepts accessible and engaging for young minds.

I am deeply committed to the holistic development of every student, believing that education extends far beyond the textbook. In my classroom, I strive to foster critical thinking, curiosity, and a lifelong love for learning. By integrating modern digital tools with time-tested teaching strategies, I ensure that my students are well-prepared for the challenges of the 21st century while remaining rooted in the values that define our community.

My role at ${SCHOOL_NAME} is not just to teach, but to mentor and inspire the next generation of leaders. I take great pride in seeing my students grow into confident, capable, and compassionate individuals who are ready to make a positive impact on the world. My dedication to the ${subject} department and the broader school community is a testament to my belief in the transformative power of education.`;
  }, [currentUser, isFounder, isAdmin, myTeacherProfile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        login({ ...currentUser, photo: photoUrl });
        if (currentUser.role === 'TEACHER') {
          updateTeacher(currentUser.id, { photo: photoUrl });
        }
        toast({ title: "Profile Photo Updated" });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoaded || !currentUser) return null;

  const displayName = isFounder ? "Hon. Dnyaneshwar Ingole" : capitalize(currentUser.fullName);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
          
          <div className="relative h-64 bg-primary">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-50"></div>
            <div className="absolute -bottom-1 h-32 w-full bg-[#FCF8E8] rounded-t-[3rem]"></div>
          </div>

          <div className="px-12 relative z-10 -mt-32 bg-[#FCF8E8] pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="relative group">
                <div className="h-48 w-48 rounded-full border-[8px] border-white shadow-2xl overflow-hidden bg-white">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={currentUser.photo} className="object-cover" />
                    <AvatarFallback className="bg-primary text-white text-5xl font-black uppercase">
                      {displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full shadow-xl hover:scale-110 transition-transform z-20"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>

              <div className="flex-1 text-center md:text-left pb-4 space-y-2">
                <h1 className="text-5xl font-black text-[#1F2937] tracking-tight uppercase leading-tight">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Badge className="bg-primary text-white border-none font-black text-xs uppercase tracking-widest px-4 py-1.5 h-auto">
                    {isFounder ? 'CHAIRMAN' : isAdmin ? 'ADMINISTRATOR' : myTeacherProfile?.academicRole || 'TEACHER'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-primary border-b-2 border-primary/20 pb-2">
                    <User className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Biography</span>
                  </div>
                  <div className="text-[#4B5563] text-lg leading-[1.8] font-medium text-justify space-y-6">
                    {bioContent.split('\n\n').map((para, i) => {
                      if (i === 0 && para.startsWith("Myself")) {
                        const rest = para.substring(6);
                        return (
                          <p key={i}>
                            <span className="text-2xl font-black text-black mr-1">Myself</span>
                            {rest}
                          </p>
                        );
                      }
                      return <p key={i}>{para}</p>;
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white shadow-inner space-y-6">
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-4">
                    Official Information
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Designation</p>
                        <p className="font-bold text-gray-700">{isFounder ? 'Founder Chairman' : isAdmin ? 'Admin Head' : myTeacherProfile?.academicRole}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                        <Award className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Experience</p>
                        <p className="font-bold text-gray-700">{isFounder ? '30+' : isAdmin ? '10+' : myTeacherProfile?.experience} Years</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-50 rounded-lg shrink-0">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Contact</p>
                        <p className="font-bold text-gray-700">{myTeacherProfile?.mobile || 'Confidential'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                        <MapPin className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Location</p>
                        <p className="font-bold text-gray-700">{myTeacherProfile?.address || 'Tungi, BK'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary p-8 rounded-3xl text-white space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Portal Status</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black">ACTIVE</p>
                    <p className="text-xs font-bold opacity-80">Verified School ID: {currentUser.username}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center text-gray-400">
              <div className="flex items-center gap-4">
                <Image src={SCHOOL_LOGO} alt="School Logo" width={40} height={40} className="grayscale opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-widest">{SCHOOL_NAME}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Est. 2026</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
