import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function WishesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { id: Number(id) },
  });

  if (!invitation) notFound();

  const wishes = await prisma.wishMessage.findMany({
    where: { invitationId: Number(id) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Ucapan & Konfirmasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {invitation.groomName} & {invitation.brideName}
          </p>
        </div>
        <Link
          href={`/admin/invitations/${id}/edit`}
          className="text-sm text-rose-600 hover:text-rose-700"
        >
          ← Kembali ke Edit
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Total {wishes.length} ucapan
          </span>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              Hadir:{" "}
              {wishes.filter((w) => w.attendance === "hadir").length}
            </span>
            <span>
              Tidak Hadir:{" "}
              {wishes.filter((w) => w.attendance === "tidak_hadir").length}
            </span>
            <span>
              Ragu:{" "}
              {wishes.filter((w) => w.attendance === "ragu").length}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {wishes.map((wish) => (
            <div key={wish.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium text-gray-800">
                    {wish.name}
                  </span>
                  {wish.attendance && (
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        wish.attendance === "hadir"
                          ? "bg-green-100 text-green-700"
                          : wish.attendance === "tidak_hadir"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {wish.attendance === "hadir"
                        ? "Hadir"
                        : wish.attendance === "tidak_hadir"
                          ? "Tidak Hadir"
                          : "Ragu"}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(wish.createdAt).toLocaleDateString("id-ID", {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{wish.message}</p>
            </div>
          ))}
          {wishes.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              Belum ada ucapan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
