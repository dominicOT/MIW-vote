"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, UploadCloud, Ticket, Users, BarChart3, Settings2, ChevronRight, PanelLeft } from "lucide-react";

// { href: "/admin/payment-verification", label: "Payment Verification", icon: UploadCloud },
const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/otp-generation", label: "OTP Generation", icon: Ticket },
  { href: "/admin/manage-candidates", label: "Manage Candidates", icon: Users },
  { href: "/admin/results", label: "Vote Results", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
           <Link href="/admin" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <Settings2 className="h-7 w-7" />
            <span className="font-semibold text-xl group-data-[collapsible=icon]:hidden">Admin Panel</span>
          </Link>
        </SidebarHeader>
        <SidebarContent asChild>
          <ScrollArea className="h-full">
            <SidebarMenu className="p-2">
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{children: item.label, className: "bg-sidebar text-sidebar-foreground border-sidebar-border"}}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                       {pathname === item.href && (
                        <ChevronRight className="ml-auto h-5 w-5 group-data-[collapsible=icon]:hidden" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background p-0">
         <div className="flex items-center justify-start border-b p-2 md:hidden">
            <SidebarTrigger />
            <span className="font-semibold text-lg ml-2">Admin Menu</span>
          </div>
          <ScrollArea className="h-[calc(100vh-var(--header-height,60px)-40px)] md:h-[calc(100vh-var(--header-height,60px))]"> {/* Adjust height considering header */}
            <div className="p-6">
              {children}
            </div>
          </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
