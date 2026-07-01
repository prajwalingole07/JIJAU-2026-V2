"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { generateAnnouncementDraft } from "@/ai/flows/generate-announcement-draft";
import { generateWelcomeMessage } from "@/ai/flows/generate-welcome-message-flow";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, UserPlus, Copy, RotateCcw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function AIToolsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Announcement state
  const [announceData, setAnnounceData] = useState({
    eventName: "", date: "", purpose: "", targetAudience: "Parents, Students, and Staff"
  });

  // Welcome state
  const [welcomeData, setWelcomeData] = useState({
    name: "", role: "student" as "student" | "teacher", admissionDate: "", subject: ""
  });

  const handleAnnounce = async () => {
    setLoading(true);
    try {
      const { announcementText } = await generateAnnouncementDraft(announceData);
      setResult(announcementText);
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate AI content.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleWelcome = async () => {
    setLoading(true);
    try {
      const { message, subjectLine } = await generateWelcomeMessage(welcomeData);
      setResult(`Subject: ${subjectLine}\n\n${message}`);
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate AI content.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-secondary" /> AI Communications Hub
          </h2>
          <p className="text-muted-foreground font-medium">Draft professional messages instantly with Jijau AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Generator Tool</CardTitle>
              <CardDescription>Choose a template to start drafting</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="announcement">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="announcement" className="gap-2">
                    <FileText className="h-4 w-4" /> Announcement
                  </TabsTrigger>
                  <TabsTrigger value="welcome" className="gap-2">
                    <UserPlus className="h-4 w-4" /> Welcome Msg
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="announcement" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Event/Topic Name</Label>
                    <Input 
                      placeholder="e.g. Sports Day 2026" 
                      value={announceData.eventName} 
                      onChange={e => setAnnounceData({...announceData, eventName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date/Time</Label>
                    <Input 
                      placeholder="e.g. Next Monday at 8:00 AM" 
                      value={announceData.date} 
                      onChange={e => setAnnounceData({...announceData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={announceData.targetAudience} onValueChange={val => setAnnounceData({...announceData, targetAudience: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parents, Students, and Staff">Parents, Students & Staff</SelectItem>
                        <SelectItem value="Teachers only">Teachers Only</SelectItem>
                        <SelectItem value="10th Standard Students">10th Standard Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose/Details</Label>
                    <Textarea 
                      placeholder="e.g. Discussing the upcoming exams and distribution of hall tickets." 
                      value={announceData.purpose} 
                      onChange={e => setAnnounceData({...announceData, purpose: e.target.value})}
                    />
                  </div>
                  <Button className="w-full bg-primary" onClick={handleAnnounce} disabled={loading || !announceData.eventName}>
                    {loading ? "Drafting..." : "Generate Announcement"}
                  </Button>
                </TabsContent>

                <TabsContent value="welcome" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="e.g. Rahul Sharma" 
                      value={welcomeData.name} 
                      onChange={e => setWelcomeData({...welcomeData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={welcomeData.role} onValueChange={(val: any) => setWelcomeData({...welcomeData, role: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">New Student</SelectItem>
                        <SelectItem value="teacher">New Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {welcomeData.role === 'student' ? (
                    <div className="space-y-2">
                      <Label>Admission Date</Label>
                      <Input type="date" value={welcomeData.admissionDate} onChange={e => setWelcomeData({...welcomeData, admissionDate: e.target.value})} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input placeholder="e.g. Science" value={welcomeData.subject} onChange={e => setWelcomeData({...welcomeData, subject: e.target.value})} />
                    </div>
                  )}
                  <Button className="w-full bg-primary" onClick={handleWelcome} disabled={loading || !welcomeData.name}>
                    {loading ? "Drafting..." : "Generate Welcome Message"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>AI Output</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setResult("")}><RotateCcw className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={!result}><Copy className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full min-h-[400px] w-full bg-muted/30 rounded-lg p-6 font-medium text-sm leading-relaxed border border-dashed border-primary/20 whitespace-pre-wrap">
                {result || (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                    <Sparkles className="h-12 w-12" />
                    <p>AI generated content will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
            {result && (
              <CardFooter>
                <p className="text-[10px] text-muted-foreground italic">
                  *AI content may need final review by school administration.
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}