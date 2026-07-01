import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SCHOOL_NAME } from '@/lib/constants';
import { SchoolProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: SCHOOL_NAME,
  description: `Complete School Management System for ${SCHOOL_NAME}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-secondary/30">
        <SchoolProvider>
          {children}
          <Toaster />
        </SchoolProvider>
      </body>
    </html>
  );
}
