import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, FileText, Plus } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/admin/dashboard"
              className="text-xl font-great-vibes text-rose-700"
            >
              Undangan Online
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-rose-600 transition"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/admin/invitations"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-rose-600 transition"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Undangan</span>
              </Link>
              <Link
                href="/admin/invitations/create"
                className="flex items-center gap-1 text-sm bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Buat Baru</span>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
