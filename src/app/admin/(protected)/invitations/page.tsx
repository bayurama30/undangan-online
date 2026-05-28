import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { DeleteButton } from "./delete-button";

export default async function InvitationsPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { wishMessages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Semua Undangan
        </h1>
        <Link
          href="/admin/invitations/create"
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition text-sm"
        >
          <Plus size={18} />
          Buat Baru
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Pasangan
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Slug
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Ucapan
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Tanggal
              </th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invitations.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <span className="font-medium text-gray-800">
                    {inv.groomName} & {inv.brideName}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">/{inv.slug}</td>
                <td className="p-4 text-sm text-gray-500">
                  {inv._count.wishMessages}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {inv.eventDate || "-"}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/${inv.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-rose-600 transition"
                      title="Lihat undangan"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <Link
                      href={`/admin/invitations/${inv.id}/edit`}
                      className="p-2 text-gray-400 hover:text-rose-600 transition"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </Link>
                    <DeleteButton id={inv.id} slug={inv.slug} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invitations.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Belum ada undangan
          </div>
        )}
      </div>
    </div>
  );
}
