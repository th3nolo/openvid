import Footer from "@/app/components/common/Footer";
import Header from "@/app/components/common/Header";
import { AuthProvider } from "@/hooks/useAuth";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-[#09090B]">
                <Header />
                <div className="grow pt-24 pb-16">
                    {children}
                </div>
                <Footer />
            </div>
        </AuthProvider>
    );
}
