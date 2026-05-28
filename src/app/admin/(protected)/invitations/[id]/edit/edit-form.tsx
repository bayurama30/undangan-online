"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Invitation, Photo, BankAccount } from "@/generated/prisma/client";

type InvitationWithRelations = Invitation & {
  photos: Photo[];
  bankAccounts: BankAccount[];
};

const tabs = [
  { id: "pasangan", label: "Pasangan" },
  { id: "acara", label: "Acara & Lokasi" },
  { id: "cerita", label: "Cerita" },
  { id: "galeri", label: "Galeri Foto" },
  { id: "amplop", label: "Amplop Digital" },
  { id: "tampilan", label: "Tampilan" },
  { id: "musik", label: "Musik" },
];

export function EditForm({
  invitation,
}: {
  invitation: InvitationWithRelations;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pasangan");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    slug: invitation.slug,
    title: invitation.title || "",
    groomName: invitation.groomName,
    groomFullName: invitation.groomFullName || "",
    groomParent: invitation.groomParent || "",
    groomChild: invitation.groomChild || "",
    groomPhoto: invitation.groomPhoto || "",
    brideName: invitation.brideName,
    brideFullName: invitation.brideFullName || "",
    brideParent: invitation.brideParent || "",
    brideChild: invitation.brideChild || "",
    bridePhoto: invitation.bridePhoto || "",
    eventDate: invitation.eventDate || "",
    eventTime: invitation.eventTime || "",
    eventTitle: invitation.eventTitle || "",
    address: invitation.address || "",
    mapsUrl: invitation.mapsUrl || "",
    mapsEmbedUrl: invitation.mapsEmbedUrl || "",
    story: invitation.story || "",
    quoteText: invitation.quoteText || "",
    quoteAuthor: invitation.quoteAuthor || "",
    colorPrimary: invitation.colorPrimary,
    colorSecondary: invitation.colorSecondary,
    colorAccent: invitation.colorAccent,
    bgMusicType: invitation.bgMusicType || "youtube",
    bgMusicUrl: invitation.bgMusicUrl || "",
    bgMusicFile: invitation.bgMusicFile || "",
    bgMusicAuto: invitation.bgMusicAuto,
    themeStyle: invitation.themeStyle,
    fontStyle: invitation.fontStyle,
    instagramUrl: invitation.instagramUrl || "",
    invitationType: (invitation as any).invitationType || "pernikahan",
    coverPhoto: (invitation as any).coverPhoto || "",
    dressCode1: (invitation as any).dressCode1 || "",
    dressCode2: (invitation as any).dressCode2 || "",
    dressCode3: (invitation as any).dressCode3 || "",
  });

  const [photos, setPhotos] = useState<Photo[]>(invitation.photos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(
    invitation.bankAccounts
  );

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const res = await fetch(`/api/invitations/${invitation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  async function handleUploadPhoto(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();

      const photoRes = await fetch(
        `/api/invitations/${invitation.id}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, order: photos.length }),
        }
      );

      if (photoRes.ok) {
        const newPhoto = await photoRes.json();
        setPhotos([...photos, newPhoto]);
      }
    }
  }

  async function handleDeletePhoto(photoId: number) {
    const res = await fetch(`/api/invitations/${invitation.id}/photos/${photoId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPhotos(photos.filter((p) => p.id !== photoId));
    }
  }

  async function handleReorder() {
    setSavingOrder(true);
    const orders = photos.map((p, i) => ({ id: p.id, order: i }));
    const res = await fetch(`/api/invitations/${invitation.id}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    });
    if (res.ok) {
      router.refresh();
    }
    setSavingOrder(false);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setPhotos(reordered);
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  async function handleAddBank() {
    const res = await fetch(`/api/invitations/${invitation.id}/bank-accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "bank",
        bankName: "",
        accountName: "",
        accountNumber: "",
      }),
    });

    if (res.ok) {
      const newAccount = await res.json();
      setBankAccounts([...bankAccounts, newAccount]);
    }
  }

  async function handleUpdateBank(
    accountId: number,
    data: Partial<BankAccount>
  ) {
    const res = await fetch(
      `/api/invitations/${invitation.id}/bank-accounts/${accountId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      const updated = await res.json();
      setBankAccounts(
        bankAccounts.map((b) => (b.id === accountId ? updated : b))
      );
    }
  }

  async function handleDeleteBank(accountId: number) {
    const res = await fetch(
      `/api/invitations/${invitation.id}/bank-accounts/${accountId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setBankAccounts(bankAccounts.filter((b) => b.id !== accountId));
    }
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "bgMusicType") {
        if (value === "youtube") {
          (next as any).bgMusicFile = "";
        } else if (value === "file") {
          (next as any).bgMusicUrl = "";
        }
      }
      return next;
    });
  }

  function TabButton({ tab }: { tab: (typeof tabs)[0] }) {
    const isActive = activeTab === tab.id;
    return (
      <button
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
          isActive
            ? "bg-rose-600 text-white"
            : "text-gray-600 hover:text-rose-600 hover:bg-rose-50"
        }`}
      >
        {tab.label}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Edit Undangan
        </h1>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600">Tersimpan!</span>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* TAB: Pasangan */}
        {activeTab === "pasangan" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Data Pasangan
            </h2>

            {/* Invitation Type Toggle */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm text-gray-500 mb-3">
                Tipe Undangan
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="invitationType"
                    value="pernikahan"
                    checked={form.invitationType === "pernikahan"}
                    onChange={() => updateField("invitationType", "pernikahan")}
                    className="accent-rose-600"
                  />
                  <span className={`text-sm font-medium ${form.invitationType === "pernikahan" ? "text-rose-600" : "text-gray-600"}`}>
                    💍 Pernikahan
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="invitationType"
                    value="tunangan"
                    checked={form.invitationType === "tunangan"}
                    onChange={() => updateField("invitationType", "tunangan")}
                    className="accent-rose-600"
                  />
                  <span className={`text-sm font-medium ${form.invitationType === "tunangan" ? "text-rose-600" : "text-gray-600"}`}>
                    💞 Tunangan
                  </span>
                </label>
              </div>
            </div>

            {/* Cover Photo */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm text-gray-500 mb-2">
                Foto Cover (tampil sebelum buka &amp; di cover section setelah buka)
              </label>
              <div className="flex gap-3 items-center">
                {form.coverPhoto && (
                  <div className="relative">
                    <img
                      src={form.coverPhoto}
                      alt="Cover"
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => updateField("coverPhoto", "")}
                      className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <ImageUpload
                  onUpload={(url) => updateField("coverPhoto", url)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Wanita</h3>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Nama Panggilan *
                  </label>
                  <input
                    value={form.brideName}
                    onChange={(e) =>
                      updateField("brideName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    value={form.brideFullName}
                    onChange={(e) =>
                      updateField("brideFullName", e.target.value)
                    }
                    placeholder="Siti Nurhaliza, S.Pd."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Anak Ke-
                  </label>
                  <input
                    value={form.brideChild}
                    onChange={(e) =>
                      updateField("brideChild", e.target.value)
                    }
                    placeholder="Putri kedua"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Orang Tua
                  </label>
                  <input
                    value={form.brideParent}
                    onChange={(e) =>
                      updateField("brideParent", e.target.value)
                    }
                    placeholder="Bpk. Budi & Ibu Dewi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Foto Wanita
                  </label>
                  <div className="flex gap-3 items-center">
                    {form.bridePhoto && (
                      <img
                        src={form.bridePhoto}
                        alt="Foto wanita"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <ImageUpload
                      onUpload={(url) => updateField("bridePhoto", url)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Pria</h3>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Nama Panggilan *
                  </label>
                  <input
                    value={form.groomName}
                    onChange={(e) =>
                      updateField("groomName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    value={form.groomFullName}
                    onChange={(e) =>
                      updateField("groomFullName", e.target.value)
                    }
                    placeholder="Ahmad Fauzi, S.Kom."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Anak Ke-
                  </label>
                  <input
                    value={form.groomChild}
                    onChange={(e) =>
                      updateField("groomChild", e.target.value)
                    }
                    placeholder="Putra pertama"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Orang Tua
                  </label>
                  <input
                    value={form.groomParent}
                    onChange={(e) =>
                      updateField("groomParent", e.target.value)
                    }
                    placeholder="Bpk. Ahmad & Ibu Siti"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Foto Pria
                  </label>
                  <div className="flex gap-3 items-center">
                    {form.groomPhoto && (
                      <img
                        src={form.groomPhoto}
                        alt="Foto pria"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <ImageUpload
                      onUpload={(url) => updateField("groomPhoto", url)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Acara & Lokasi */}
        {activeTab === "acara" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Acara & Lokasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => updateField("eventDate", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Waktu
                </label>
                <input
                  value={form.eventTime}
                  onChange={(e) => updateField("eventTime", e.target.value)}
                  placeholder="10:00 - 12:00 WIB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Judul Acara
                </label>
                <input
                  value={form.eventTitle}
                  onChange={(e) => updateField("eventTitle", e.target.value)}
                  placeholder="Akad Nikah / Resepsi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Alamat
              </label>
              <textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                rows={2}
                placeholder="Jl. Contoh No. 123, Kota"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Google Maps - URL (link)
              </label>
              <input
                value={form.mapsUrl}
                onChange={(e) => updateField("mapsUrl", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Google Maps - Embed URL (iframe)
              </label>
              <input
                value={form.mapsEmbedUrl}
                onChange={(e) => updateField("mapsEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Buka Google Maps, cari lokasi, klik Bagikan, Sematkan peta,
                copy URL src dari iframe.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dress Code (3 warna palet)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Warna 1</label>
                  <div className="flex items-center gap-2">
                      {form.dressCode1 ? (
                        <input
                          type="color"
                          value={form.dressCode1}
                          onChange={(e) => updateField("dressCode1", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                          -
                        </div>
                      )}
                      <input
                        value={form.dressCode1}
                        onChange={(e) => updateField("dressCode1", e.target.value)}
                        placeholder="#e8d5c4"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                      />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Warna 2</label>
                  <div className="flex items-center gap-2">
                    {form.dressCode2 ? (
                        <input
                          type="color"
                          value={form.dressCode2}
                          onChange={(e) => updateField("dressCode2", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                          -
                        </div>
                      )}
                      <input
                        value={form.dressCode2}
                        onChange={(e) => updateField("dressCode2", e.target.value)}
                        placeholder="#c9a96e"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                      />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Warna 3</label>
                  <div className="flex items-center gap-2">
                    {form.dressCode3 ? (
                        <input
                          type="color"
                          value={form.dressCode3}
                          onChange={(e) => updateField("dressCode3", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                          -
                        </div>
                      )}
                      <input
                        value={form.dressCode3}
                        onChange={(e) => updateField("dressCode3", e.target.value)}
                        placeholder="#8b7355"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Cerita */}
        {activeTab === "cerita" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Cerita & Kutipan
            </h2>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Cerita/Love Story
              </label>
              <textarea
                value={form.story}
                onChange={(e) => updateField("story", e.target.value)}
                rows={6}
                placeholder="Tuliskan cerita pertemuan hingga acara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Kutipan/Quote
                </label>
                <textarea
                  value={form.quoteText}
                  onChange={(e) => updateField("quoteText", e.target.value)}
                  rows={3}
                  placeholder="Dan kami ciptakan kamu berpasang-pasangan..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Penulis Quote
                </label>
                <input
                  value={form.quoteAuthor}
                  onChange={(e) => updateField("quoteAuthor", e.target.value)}
                  placeholder="QS. An-Naba: 8-9"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Instagram URL
              </label>
              <input
                value={form.instagramUrl}
                onChange={(e) => updateField("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB: Galeri Foto */}
        {activeTab === "galeri" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Galeri Foto
              </h2>
              {photos.length > 0 && (
                <button
                  onClick={handleReorder}
                  disabled={savingOrder}
                  className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {savingOrder ? "Menyimpan..." : "Simpan Urutan"}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Seret foto untuk mengubah urutan, lalu klik "Simpan Urutan".
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group cursor-grab active:cursor-grabbing transition-all duration-200 ${
                    dragIndex === index ? "opacity-50 scale-95 ring-2 ring-rose-400" : ""
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <img
                    src={photo.url}
                    alt={photo.caption || "Foto"}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <label className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400 transition">
                <div className="text-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mx-auto mb-1"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  <span className="text-xs">Tambah Foto</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadPhoto(file);
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB: Amplop Digital */}
        {activeTab === "amplop" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Amplop Digital
              </h2>
              <button
                onClick={handleAddBank}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                + Tambah Rekening
              </button>
            </div>

            {bankAccounts.map((account, index) => (
              <div
                key={account.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteBank(account.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Tipe
                    </label>
                    <select
                      value={account.type}
                      onChange={(e) =>
                        handleUpdateBank(account.id, { type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 outline-none"
                    >
                      <option value="bank">Bank</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>
                  </div>
                  {account.type === "bank" ? (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Nama Bank
                        </label>
                        <input
                          defaultValue={account.bankName || ""}
                          onBlur={(e) =>
                            handleUpdateBank(account.id, {
                              bankName: e.target.value,
                            })
                          }
                          placeholder="BCA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Provider
                      </label>
                      <input
                        defaultValue={account.provider || ""}
                        onBlur={(e) =>
                          handleUpdateBank(account.id, {
                            provider: e.target.value,
                          })
                        }
                        placeholder="GoPay / OVO / Dana"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Atas Nama
                    </label>
                    <input
                      defaultValue={account.accountName}
                      onBlur={(e) =>
                        handleUpdateBank(account.id, {
                          accountName: e.target.value,
                        })
                      }
                      placeholder="Ahmad Fauzi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      defaultValue={account.accountNumber}
                      onBlur={(e) =>
                        handleUpdateBank(account.id, {
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {bankAccounts.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">
                Belum ada rekening. Klik "Tambah Rekening" untuk menambahkan.
              </p>
            )}
          </div>
        )}

        {/* TAB: Tampilan */}
        {activeTab === "tampilan" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Tampilan & Tema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Warna Utama (Primary)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.colorPrimary}
                    onChange={(e) =>
                      updateField("colorPrimary", e.target.value)
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">
                    {form.colorPrimary}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Warna Latar (Secondary)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.colorSecondary}
                    onChange={(e) =>
                      updateField("colorSecondary", e.target.value)
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">
                    {form.colorSecondary}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Warna Aksen (Accent)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.colorAccent}
                    onChange={(e) =>
                      updateField("colorAccent", e.target.value)
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">
                    {form.colorAccent}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Model Tema
                </label>
                <select
                  value={form.themeStyle}
                  onChange={(e) => updateField("themeStyle", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                >
                  <option value="elegant">Elegant</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="glassmorphism">Glassmorphism</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Gaya Font
                </label>
                <select
                  value={form.fontStyle}
                  onChange={(e) => updateField("fontStyle", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="romantic">Romantic</option>
                  <option value="playful">Playful</option>
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Preview Warna
              </h3>
              <div
                className="rounded-lg p-6 text-center space-y-3"
                style={{ backgroundColor: form.colorSecondary }}
              >
                <h4
                  className="text-xl font-great-vibes"
                  style={{ color: form.colorPrimary }}
                >
                  {form.groomName} & {form.brideName}
                </h4>
                 <p
                   className="text-sm"
                   style={{ color: form.colorAccent }}
                 >
                   Undangan {form.invitationType === "tunangan" ? "Tunangan" : "Pernikahan"}
                 </p>
                <div className="flex justify-center gap-2">
                  <span
                    className="px-3 py-1 text-sm text-white rounded-full"
                    style={{ backgroundColor: form.colorPrimary }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-3 py-1 text-sm rounded-full"
                    style={{
                      backgroundColor: form.colorAccent,
                      color: "#fff",
                    }}
                  >
                    Accent
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Musik */}
        {activeTab === "musik" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Background Music
            </h2>
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Sumber Musik
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bgMusicType"
                    value="youtube"
                    checked={form.bgMusicType === "youtube"}
                    onChange={() => updateField("bgMusicType", "youtube")}
                  />
                  <span className="text-sm">Link YouTube</span>
                </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bgMusicType"
                      value="file"
                      checked={form.bgMusicType === "file"}
                      onChange={() => updateField("bgMusicType", "file")}
                    />
                    <span className="text-sm">Upload MP3</span>
                  </label>

              </div>
            </div>

            {form.bgMusicType === "youtube" ? (
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  URL YouTube
                </label>
                <input
                  value={form.bgMusicUrl}
                  onChange={(e) => updateField("bgMusicUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Upload File MP3
                </label>
                <div className="flex items-center gap-3">
                  {form.bgMusicFile && (
                    <span className="text-sm text-gray-500">
                      {form.bgMusicFile}
                    </span>
                  )}
                  <MusicUpload
                    onUpload={(url) => updateField("bgMusicFile", url)}
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.bgMusicAuto}
                onChange={(e) =>
                  updateField("bgMusicAuto", e.target.checked)
                }
              />
              <span className="text-sm text-gray-600">
                Putar otomatis saat halaman dibuka
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();
      onUpload(url);
    }
    setUploading(false);
  }

  return (
    <label className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 transition">
      {uploading ? "Uploading..." : "Upload"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </label>
  );
}

function MusicUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();
      onUpload(url);
    }
    setUploading(false);
  }

  return (
    <label className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 transition">
      {uploading ? "Uploading..." : "Pilih File"}
      <input
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUpload}
      />
    </label>
  );
}
