"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  SCHOOL_ADDRESS,
  SCHOOL_LOCATION,
  SCHOOL_LOGO,
  SCHOOL_PHONE,
  SCHOOL_SHORT_NAME,
  SCHOOL_WHATSAPP,
} from "@/lib/constants";
import type { FeePayment, Student } from "@/lib/types";
import { Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FeeReceiptProps = {
  payment: FeePayment | null;
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectedBy?: string;
  allPayments?: FeePayment[];
};

export function receiptNumber(payment: FeePayment | null) {
  if (!payment) return "JES-000000";
  return payment.receiptNumber || `JES-${payment.id.toUpperCase().slice(0, 6)}`;
}

export function academicYearFor(dateStr: string) {
  const parts = dateStr.split("/");
  const year = parts.length === 3 ? parseInt(parts[2], 10) : new Date().getFullYear();
  if (Number.isNaN(year)) {
    const now = new Date().getFullYear();
    return `${now}-${now + 1}`;
  }
  const month = parts.length === 3 ? parseInt(parts[1], 10) : 6;
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function installmentLabel(payment: FeePayment) {
  if (payment.remarks && /term|installment|instalment/i.test(payment.remarks)) {
    return payment.remarks;
  }
  return "Full Payment";
}

function parseDdMmYyyy(dateStr: string) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date(dateStr).getTime() || 0;
  const [d, m, y] = parts.map((p) => parseInt(p, 10));
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

export function ReceiptCard({ payment, student, collectedBy, allPayments }: { payment: FeePayment; student: Student | null; collectedBy?: string; allPayments?: FeePayment[] }) {
  const academicYear = academicYearFor(payment.date);
  const installment = installmentLabel(payment);
  const receiptId = receiptNumber(payment);
  const isCash = payment.mode === "Cash";

  const history = useMemo(() => {
    const list = (allPayments && allPayments.length ? allPayments : [payment]).filter(
      (p) => !student || p.studentId === student.id
    );
    return [...list].sort((a, b) => parseDdMmYyyy(a.date) - parseDdMmYyyy(b.date));
  }, [allPayments, payment, student]);

  const totalPaid = history.reduce((sum, p) => sum + p.amount, 0);
  const totalFees = student?.totalFees || 0;
  const remaining = Math.max(totalFees - totalPaid, 0);

  return (
    <div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-2xl bg-white p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.35)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.06]">
        <img src={SCHOOL_LOGO} alt="" className="h-64 w-64 object-contain" />
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <img src={SCHOOL_LOGO} alt="School Logo" className="h-12 w-12 flex-shrink-0 rounded-full object-cover sm:h-14 sm:w-14" />
            <div>
              <h2 className="text-[15px] font-extrabold leading-tight text-[#111827] sm:text-[17px]">{SCHOOL_SHORT_NAME}</h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">{SCHOOL_LOCATION}</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400">
                {SCHOOL_ADDRESS}
                <br />
                {SCHOOL_PHONE}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <span className="rounded-full bg-primary px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white">
              Fee Receipt
            </span>
            <strong className="text-xs font-extrabold text-[#111827] sm:text-sm">{receiptId}</strong>
            <span className="text-[10px] font-semibold text-gray-400">{payment.date}</span>
          </div>
        </div>

        <hr className="my-4 border-t-2 border-primary" />

        <div className="grid grid-cols-2 gap-2.5">
          <ReceiptField label="Student Name" value={student?.fullName || payment.studentName} />
          <ReceiptField label="Class" value={student?.class || "-"} />
          <ReceiptField label="Academic Year" value={academicYear} />
          <ReceiptField label="Installment" value={installment} />
          <ReceiptField label="Payment Mode" value={payment.mode.toUpperCase()} />
          {!isCash && <ReceiptField label="Txn No." value={payment.id ? payment.id.toUpperCase() : "-"} />}
        </div>

        <div className="mt-5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
          <span>Description</span>
          <span>Amount</span>
        </div>
        <div className="flex items-center justify-between border-t-2 border-primary py-2.5 text-[13px] font-semibold text-[#374151] sm:text-sm">
          <span>{installment === "Full Payment" ? "Tuition / Term Fee" : installment}</span>
          <span>₹{payment.amount.toLocaleString()}</span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-extrabold text-[#111827] sm:text-lg">Amount Received</span>
          <span className="text-xl font-extrabold text-primary sm:text-2xl">₹{payment.amount.toLocaleString()}</span>
        </div>

        {/* Fee Summary */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[#f7f8fa] p-3">
          <div className="text-center">
            <p className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400">Total Fees</p>
            <p className="mt-0.5 text-[13px] font-extrabold text-[#111827] sm:text-sm">₹{totalFees.toLocaleString()}</p>
          </div>
          <div className="border-x border-gray-200 text-center">
            <p className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400">Total Paid</p>
            <p className="mt-0.5 text-[13px] font-extrabold text-[#22C55E] sm:text-sm">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400">Remaining</p>
            <p className="mt-0.5 text-[13px] font-extrabold text-[#EF4444] sm:text-sm">₹{remaining.toLocaleString()}</p>
          </div>
        </div>

        {/* Fee Payment History */}
        {history.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Fee Payment History</p>
            <div className="mt-2 divide-y divide-dashed divide-gray-200 rounded-xl border border-gray-100">
              {history.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-[11px] sm:text-xs ${
                    p.id === payment.id ? "bg-orange-50/70 font-extrabold text-primary" : "font-semibold text-[#374151]"
                  }`}
                >
                  <span className="flex-shrink-0 text-gray-400">{p.date}</span>
                  <span className="flex-1 truncate px-2 text-left">{installmentLabel(p) === "Full Payment" ? "Tuition / Term Fee" : installmentLabel(p)}</span>
                  <span>₹{p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex items-end justify-between gap-3">
          <p className="max-w-[60%] text-[9px] leading-relaxed text-gray-400">
            This receipt confirms the payment recorded in the school management system.
          </p>
          <div className="text-right">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Authorised Signature</p>
            <p className="mt-0.5 text-[9px] text-gray-400">Collected by {collectedBy || "Admin"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeeReceiptDialog({ payment, student, open, onOpenChange, collectedBy, allPayments }: FeeReceiptProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  if (!payment) return null;

  const receiptId = receiptNumber(payment);

  const buildShareText = () => {
    return `${SCHOOL_SHORT_NAME}\nFee Receipt: ${receiptId}\nStudent: ${payment.studentName}\nAmount Paid: Rs. ${payment.amount.toLocaleString()}\nDate: ${payment.date}\n\nThank you for your payment.`;
  };

  const generateReceiptPdfBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    return pdf.output("blob");
  };

  const handleShareWhatsApp = async () => {
    setIsSharing(true);
    try {
      const blob = await generateReceiptPdfBlob();
      const text = buildShareText();

      if (blob) {
        const file = new File([blob], `${receiptId}.pdf`, { type: "application/pdf" });
        const canShareFiles = typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [file] });

        if (canShareFiles && navigator.share) {
          await navigator.share({ title: receiptId, text, files: [file] });
          setIsSharing(false);
          return;
        }

        // Fallback: download the PDF, then open WhatsApp with the message text
        // so it can be attached manually.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast({
          title: "Receipt downloaded",
          description: "Attach the downloaded PDF to the WhatsApp chat that just opened.",
        });
      }

      const waUrl = `https://wa.me/${SCHOOL_WHATSAPP}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Unable to share receipt", error);
      toast({ title: "Share failed", description: "Could not generate the receipt for sharing.", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[96svh] w-[96vw] max-w-lg flex-col overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Fee Receipt {receiptId}</DialogTitle>
        </DialogHeader>
        <div className="receipt-print flex-1 overflow-y-auto bg-[#f1f3f6] p-3 sm:p-6">
          <div ref={cardRef}>
            <ReceiptCard payment={payment} student={student} collectedBy={collectedBy} allPayments={allPayments} />
          </div>

          <div className="no-print mx-auto mt-4 max-w-[460px]">
            <Button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isSharing}
              className="h-12 w-full gap-2 bg-[#25D366] font-bold text-white hover:bg-[#1ebe57]"
            >
              {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              {isSharing ? "Preparing receipt..." : "Share via WhatsApp"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f8fa] px-3 py-2.5">
      <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-extrabold text-[#111827] sm:text-sm">{value}</p>
    </div>
  );
}
