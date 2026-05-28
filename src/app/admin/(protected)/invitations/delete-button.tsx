"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id }: { id: number; slug: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus undangan ini?")) return;

    const res = await fetch(`/api/invitations/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-gray-400 hover:text-red-600 transition"
      title="Hapus"
    >
      <Trash2 size={16} />
    </button>
  );
}
