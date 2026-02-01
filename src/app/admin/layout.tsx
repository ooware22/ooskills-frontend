"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdminSidebar, { SidebarProvider } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Login page has its own full-screen layout without sidebar
  if (isLoginPage) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-oxford">
          <AdminSidebar />
          <main className="lg:ms-64 transition-all duration-300">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
