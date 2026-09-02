import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteSidebar } from "@/components/shop/SiteSidebar";
import { TopBar } from "@/components/home/TopBar";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { CartSheet } from "@/components/shop/CartSheet";
import { WhatsAppFab } from "@/components/shop/WhatsAppFab";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <SiteSidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <TopBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
        <CartSheet />
        <WhatsAppFab />
      </SidebarProvider>
  );
}
