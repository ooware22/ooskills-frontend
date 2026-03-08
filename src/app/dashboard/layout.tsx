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
    <div className="h-screen bg-gray-50 dark:bg-oxford overflow-x-hidden flex">
      <StudentSidebar />
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
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
