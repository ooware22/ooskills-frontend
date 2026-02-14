"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import StudentSidebar, {
  SidebarProvider,
  useSidebar,
} from "@/components/student/StudentSidebar";
import AuthGuard from "@/components/auth/AuthGuard";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-oxford">
      <StudentSidebar />
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthGuard loginUrl="/auth/signin">
        <SidebarProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}
