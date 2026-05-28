import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, FileText, MessageSquare } from "lucide-react";

export default async function DashboardPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { wishMessages: true } } },
  });

  interface InvWithCount {
    _count: { wishMessages: number };
  }
  const totalWishes = invitations.reduce(
    (acc: number, inv: InvWithCount) => acc + inv._count.wishMessages,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <Link
          href="/admin/invitations/create"
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition text-sm"
        >
          <Plus size={18} />
          Buat Undangan Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-lg">
              <FileText className="text-rose-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Undangan</p>
              <p className="text-2xl font-bold text-gray-800">
                {invitations.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <MessageSquare className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Ucapan</p>
              <p className="text-2xl font-bold text-gray-800">{totalWishes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Daftar Undangan
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div>
                <Link
                  href={`/${inv.slug}`}
                  target="_blank"
                  className="font-medium text-gray-800 hover:text-rose-600 transition"
                >
                  {inv.groomName} & {inv.brideName}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  Slug: /{inv.slug} | Ucapan: {inv._count.wishMessages}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${inv.slug}`}
                  target="_blank"
                  className="text-sm text-gray-500 hover:text-rose-600 transition"
                >
                  Lihat
                </Link>
                <Link
                  href={`/admin/invitations/${inv.id}/edit`}
                  className="text-sm text-rose-600 hover:text-rose-700 transition"
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/invitations/${inv.id}/wishes`}
                  className="text-sm text-amber-600 hover:text-amber-700 transition"
                >
                  Ucapan
                </Link>
              </div>
            </div>
          ))}
          {invitations.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              Belum ada undangan. Buat undangan pertama!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
