"use client";

import Footer from "@/app/components/common/Footer";
import Header from "@/app/components/common/Header";
import RecordingOverlay from "@/app/components/ui/RecordingOverlay";
import { RecordingProvider } from "@/hooks/RecordingContext";
import "../../globals.css";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <RecordingProvider>
            <div className="flex min-h-screen flex-col text-neutral-300 bg-neutral-950">
                <Header />
                <main className="flex-1 w-full">
                    {children}
                </main>
                <Footer />
            </div>
            <RecordingOverlay />
        </RecordingProvider>
    );
}
