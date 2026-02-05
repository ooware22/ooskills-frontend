"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdminSidebar, {
  SidebarProvider,
  useSidebar,
} from "@/components/admin/AdminSidebar";
import { AdminLanguageProvider } from "@/contexts/AdminLanguageContext";
import AuthGuard from "@/components/auth/AuthGuard";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-oxford">
      <AdminSidebar />
      <main
        className={`transition-all duration-300 ${
          collapsed ? "lg:ms-16" : "lg:ms-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

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
      <AuthGuard requireAdmin>
        <AdminLanguageProvider>
          <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SidebarProvider>
        </AdminLanguageProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}

