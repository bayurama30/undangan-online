"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.get("slug"),
        title: form.get("title"),
        groomName: form.get("groomName"),
        groomFullName: form.get("groomFullName"),
        groomParent: form.get("groomParent"),
        brideName: form.get("brideName"),
        brideFullName: form.get("brideFullName"),
        brideParent: form.get("brideParent"),
        eventDate: form.get("eventDate"),
        eventTime: form.get("eventTime"),
        eventTitle: form.get("eventTitle"),
        address: form.get("address"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal membuat undangan");
      setLoading(false);
      return;
    }

    const inv = await res.json();
    router.push(`/admin/invitations/${inv.id}/edit`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Buat Undangan Baru
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL undangan) *
          </label>
          <input
            name="slug"
            type="text"
            required
            placeholder="contoh: nama-pasangan"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            URL: /nama-pasangan. Gunakan huruf kecil, tanpa spasi.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul Undangan
          </label>
          <input
            name="title"
            type="text"
            placeholder="The Wedding of..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Panggilan Pria *
            </label>
            <input
              name="groomName"
              type="text"
              required
              placeholder="Ahmad"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap Pria
            </label>
            <input
              name="groomFullName"
              type="text"
              placeholder="Ahmad Fauzi, S.Kom"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Panggilan Wanita *
            </label>
            <input
              name="brideName"
              type="text"
              required
              placeholder="Siti"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap Wanita
            </label>
            <input
              name="brideFullName"
              type="text"
              placeholder="Siti Nurhaliza, S.Pd"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orang Tua Pria
            </label>
            <input
              name="groomParent"
              type="text"
              placeholder="Putra Bpk. Ahmad & Ibu Siti"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orang Tua Wanita
            </label>
            <input
              name="brideParent"
              type="text"
              placeholder="Putri Bpk. Budi & Ibu Dewi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Acara
            </label>
            <input
              name="eventDate"
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jam
            </label>
            <input
              name="eventTime"
              type="text"
              placeholder="10:00 - 12:00 WIB"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Acara
            </label>
            <input
              name="eventTitle"
              type="text"
              placeholder="Akad Nikah / Resepsi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alamat
          </label>
          <textarea
            name="address"
            rows={2}
            placeholder="Jl. Contoh No. 123, Kota"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Buat Undangan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
