"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSchoolStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeeReceiptDialog, receiptNumber } from "@/components/payments/fee-receipt";
import { SCHOOL_NAME } from "@/lib/constants";
import { FeePayment } from "@/lib/types";
import { Receipt, Search, Eye, Wallet, GraduationCap, CalendarDays, IndianRupee } from "lucide-react";

export default function FeeReceiptsPage() {
  const { students, feePayments, currentUser } = useSchoolStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  const sortedPayments = useMemo(() => {
    return [...feePayments].sort(
      (a, b) =>
        new Date(b.date.split("/").reverse().join("-")).getTime() -
        new Date(a.date.split("/").reverse().join("-")).getTime()
    );
  }, [feePayments]);

  const filteredPayments = useMemo(() => {
    return sortedPayments.filter((p) => {
      const matchesSearch =
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receiptNumber(p).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = modeFilter === "all" || p.mode === modeFilter;
      return matchesSearch && matchesMode;
    });
  }, [sortedPayments, searchQuery, modeFilter]);

  const receiptStudent = selectedReceipt
    ? students.find((s) => s.id === selectedReceipt.studentId) || null
    : null;

  const totalCollected = feePayments.reduce((sum, p) => sum + p.amount, 0);
  const cashCount = feePayments.filter((p) => p.mode === "Cash").length;
  const onlineCount = feePayments.filter((p) => p.mode === "Online").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold tracking-tight text-primary uppercase">Fee Receipts</h2>
          <p className="text-[15px] font-medium text-muted-foreground">
            Every issued fee receipt for {SCHOOL_NAME.toUpperCase()}, ready to preview, print or share.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-md">
            <CardContent className="flex items-center justify-between p-8">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Receipts Issued</p>
                <p className="text-3xl font-black text-[#1F2937]">{feePayments.length}</p>
              </div>
              <div className="rounded-full bg-orange-50 p-4">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-md">
            <CardContent className="flex items-center justify-between p-8">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Amount Collected</p>
                <p className="text-3xl font-black text-[#22C55E]">₹{totalCollected.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-green-50 p-4">
                <Wallet className="h-8 w-8 text-[#22C55E]" />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-md">
            <CardContent className="flex items-center justify-between p-8">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Cash / Online Split</p>
                <p className="text-3xl font-black text-[#1F2937]">
                  {cashCount} <span className="text-base font-bold text-gray-300">/</span> {onlineCount}
                </p>
              </div>
              <div className="rounded-full bg-blue-50 p-4">
                <IndianRupee className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-[24px] border-none bg-white shadow-xl">
          <div className="flex flex-col items-center justify-between gap-4 bg-primary px-8 py-6 md:flex-row">
            <h3 className="text-xl font-black uppercase tracking-wide text-white">All Fee Receipts</h3>
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  placeholder="Search by student or receipt no..."
                  className="h-10 rounded-xl border-none bg-white/10 pl-10 font-bold text-white placeholder:text-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="h-10 w-full rounded-xl border-none bg-white/10 font-bold text-white sm:w-40">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CardContent className="p-5 sm:p-8">
            {filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-24 text-gray-300">
                <Receipt className="h-12 w-12 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">No receipts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPayments.map((payment) => {
                  const student = students.find((s) => s.id === payment.studentId);
                  return (
                    <div
                      key={payment.id}
                      className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-lg font-black leading-tight text-[#1F2937]">{payment.studentName}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                              <GraduationCap className="h-3.5 w-3.5" /> {student?.class ? `Class ${student.class}` : "—"}
                            </p>
                          </div>
                          <Badge className={payment.mode === "Online" ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"}>
                            {payment.mode}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {receiptNumber(payment)}
                          </span>
                          <span className="text-lg font-black text-primary">₹{payment.amount.toLocaleString()}</span>
                        </div>

                        <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-400">
                          <CalendarDays className="h-3.5 w-3.5" /> {payment.date}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-5 h-10 w-full rounded-xl border-gray-200 font-bold text-gray-600 transition-all hover:bg-primary hover:text-white"
                        onClick={() => setSelectedReceipt(payment)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View Receipt
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <FeeReceiptDialog
          payment={selectedReceipt}
          student={receiptStudent}
          open={!!selectedReceipt}
          onOpenChange={(open) => {
            if (!open) setSelectedReceipt(null);
          }}
          collectedBy={currentUser?.fullName}
          allPayments={selectedReceipt ? feePayments.filter((p) => p.studentId === selectedReceipt.studentId) : []}
        />
      </div>
    </DashboardLayout>
  );
}
