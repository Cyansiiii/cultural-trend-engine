import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Navigation } from "@/components/ui/navigation";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Cultural Resonance Engine",
  description: "AI-powered trend insights and content ideation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}