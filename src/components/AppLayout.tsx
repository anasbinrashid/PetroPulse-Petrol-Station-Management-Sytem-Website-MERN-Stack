
import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { SidebarNav } from "@/components/SidebarNav";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="hidden w-64 border-r bg-card md:block">
        <SidebarNav />
      </aside>
      <main className="flex w-full flex-col">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
