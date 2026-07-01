"use client";

import { useSchoolStore } from "@/lib/store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, XCircle, Search, CalendarDays, Calendar as CalendarIcon, MessageCircle, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SCHOOL_SHORT_NAME, SCHOOL_WHATSAPP } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Homework } from "@/lib/types";

export default function HomeworkStatusPage() {
  const { homeworks, teachers, currentUser } = useSchoolStore();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateDisplay, setDateDisplay] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Handling date formatting on client to avoid hydration mismatch
    setDateDisplay(selectedDate.toLocaleDateString());
  }, [selectedDate]);

  const canShare = currentUser?.role === 'ADMIN' || currentUser?.role === 'FOUNDER';

  const academicTeachers = teachers.filter(t => t.category === 'Academic');
  
  const filteredStatus = academicTeachers.filter(t => 
    t.fullName.toLowerCase().includes(search.toLowerCase()) || 
    t.classDetails.toLowerCase().includes(search.toLowerCase())
  );

  const dataUrlToFile = async (dataUrl: string, filename: string) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShareHomework = async (homework: Homework, className: string) => {
    if (!canShare) return;
    setSharingId(homework.id);
    try {
      const text = `${SCHOOL_SHORT_NAME}\nHomework Update\nClass: ${className === 'None' ? 'N/A' : className}\nDate: ${homework.date}\n\n${homework.content}`;

      if (homework.imageUrl) {
        const file = await dataUrlToFile(homework.imageUrl, `homework-${homework.id}.jpg`);
        const canShareFiles = typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [file] });

        if (canShareFiles && navigator.share) {
          await navigator.share({ title: "Homework Update", text, files: [file] });
          setSharingId(null);
          return;
        }

        // Fallback: image can't be auto-attached to WhatsApp from the browser.
        // Save it locally so it can be attached manually, then open WhatsApp with the text.
        downloadImage(homework.imageUrl, `homework-${homework.id}.jpg`);
        toast({
          title: "Image saved",
          description: "Attach the downloaded image to the WhatsApp chat that just opened.",
        });
      }

      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Unable to share homework", error);
      toast({ title: "Share failed", description: "Could not share this homework.", variant: "destructive" });
    } finally {
      setSharingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">Homework Tracker</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base">Daily compliance monitor for all classes</p>
          </div>
          
          <div className="flex w-full items-center gap-3 md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-black h-12 rounded-xl border-none shadow-sm bg-white text-primary",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="rounded-2xl"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-12 h-12 bg-gray-50 border-none shadow-inner rounded-xl" 
                placeholder="Search teacher or class..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
              <CalendarDays className="h-4 w-4 flex-shrink-0" />
              Showing records for: <span className="text-primary">{dateDisplay}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="pl-8 py-5 text-[11px] font-black uppercase tracking-widest">Faculty Member</TableHead>
                  <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest">Allotted Class</TableHead>
                  <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest">Details</TableHead>
                  {canShare && <TableHead className="pr-8 py-5 text-[11px] font-black uppercase tracking-widest text-right">Share</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canShare ? 5 : 4} className="text-center py-20 text-gray-300 font-black uppercase">No records found</TableCell>
                  </TableRow>
                ) : (
                  filteredStatus.map((t) => {
                    const selectedHW = homeworks.find(h => h.teacherId === t.id && h.date === selectedDate.toLocaleDateString());
                    return (
                      <TableRow key={t.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0">
                        <TableCell className="pl-8 py-5">
                          <span className="font-black text-gray-700">{t.fullName}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold border-primary/20 text-primary">
                            {t.classDetails === 'None' ? 'N/A' : t.classDetails}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {selectedHW ? (
                            <div className="flex items-center justify-center gap-2 text-green-600 font-black text-xs uppercase">
                              <CheckCircle2 className="h-4 w-4" /> Completed
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-red-400 font-black text-xs uppercase">
                              <XCircle className="h-4 w-4" /> Not Posted
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-gray-400 truncate italic">
                              {selectedHW ? selectedHW.content : '---'}
                            </p>
                            {selectedHW?.imageUrl && (
                              <ImageIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                            )}
                          </div>
                        </TableCell>
                        {canShare && (
                          <TableCell className="pr-8 text-right">
                            {selectedHW && (
                              <Button
                                size="sm"
                                disabled={sharingId === selectedHW.id}
                                className="h-9 gap-1.5 bg-[#25D366] font-bold text-white hover:bg-[#1ebe57]"
                                onClick={() => handleShareHomework(selectedHW, t.classDetails)}
                              >
                                {sharingId === selectedHW.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <MessageCircle className="h-3.5 w-3.5" />
                                )}
                                Share
                              </Button>
                            )}
                          </TableCell>
                        )}
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
