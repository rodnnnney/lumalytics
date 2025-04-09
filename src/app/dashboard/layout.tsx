import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gray-100">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-12">{children}</div>
      </main>
    </div>
  );
}
