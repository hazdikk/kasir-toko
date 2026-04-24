import type { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </AuthGuard>
  );
}
