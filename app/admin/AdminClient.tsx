"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Item, Claim } from "@/lib/db";
import { parseImages } from "@/lib/db";

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "0", "2", "4", "6", "8", "10", "12", "14", "One size"];

type ClaimWithItem = Claim & { item_name: string };

export default function AdminClient({
  initialItems,
  initialClaims,
}: {
  initialItems: Item[];
  initialClaims: ClaimWithItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [claims] = useState(initialClaims);
  const [tab, setTab] = useState<"items" | "claims">("items");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    size: "",
    category: "",
    images: [] as string[],      // uploaded paths
    uploading: [] as string[],   // filenames currently uploading
  });

  async function uploadFile(file: File): Promise<string | null> {
    const tempId = `${file.name}-${Date.now()}`;
    setForm((p) => ({ ...p, uploading: [...p.uploading, tempId] }));
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setForm((p) => ({ ...p, uploading: p.uploading.filter((id) => id !== tempId) }));
    if (!res.ok) return null;
    const data = await res.json();
    return data.path as string;
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    const paths = await Promise.all(arr.map(uploadFile));
    const good = paths.filter(Boolean) as string[];
    if (good.length) setForm((p) => ({ ...p, images: [...p.images, ...good] }));
    else setFormError("One or more uploads failed.");
  }

  function handleRemoveImage(path: string) {
    setForm((p) => ({ ...p, images: p.images.filter((img) => img !== path) }));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const res = await fetch("/api/admin/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        size: form.size,
        category: form.category,
        image_path: form.images.length ? JSON.stringify(form.images) : null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setFormError(data.error || "Failed to add item.");
      return;
    }

    setItems((prev) => [data, ...prev]);
    setForm({ name: "", description: "", size: "", category: "", images: [], uploading: [] });
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleToggleStatus(item: Item) {
    const newStatus = item.status === "available" ? "reserved" : "available";
    const res = await fetch(`/api/admin/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const isUploading = form.uploading.length > 0;

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-beige bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl text-warm-brown">Admin · Shop My Closet</h1>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm text-terra underline">
              View site
            </a>
            <button onClick={handleLogout} className="text-sm text-muted-brown hover:text-warm-brown transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-warm-beige rounded-xl p-1 w-fit">
          {(["items", "claims"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? "bg-white text-warm-brown shadow-sm" : "text-muted-brown hover:text-warm-brown"
              }`}
            >
              {t}
              {t === "claims" && claims.length > 0 && (
                <span className="ml-1.5 bg-terra text-cream text-xs rounded-full px-1.5 py-0.5">
                  {claims.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "items" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-brown">
                {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                {items.filter((i) => i.status === "available").length} available
              </p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-terra hover:bg-terra-dark text-cream text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                {showForm ? "Cancel" : "+ Add item"}
              </button>
            </div>

            {/* Add form */}
            {showForm && (
              <form
                onSubmit={handleAdd}
                className="bg-white border border-warm-beige rounded-2xl p-6 mb-8 grid sm:grid-cols-2 gap-5"
              >
                <h2 className="font-serif text-lg text-warm-brown sm:col-span-2">New item</h2>

                {/* Drag-and-drop image upload */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-2">
                    Photos
                  </label>

                  {/* Drop zone */}
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl px-6 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                      dragOver
                        ? "border-terra bg-terra/5"
                        : "border-warm-beige bg-warm-beige/30 hover:border-terra/60"
                    }`}
                  >
                    {isUploading ? (
                      <p className="text-sm text-muted-brown">
                        Uploading {form.uploading.length} {form.uploading.length === 1 ? "photo" : "photos"}...
                      </p>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-muted-brown/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <p className="text-sm text-muted-brown">
                          Drop photos here or <span className="text-terra underline">click to browse</span>
                        </p>
                        <p className="text-xs text-muted-brown/60">JPG, PNG, WEBP · multiple at once is fine</p>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />

                  {/* Thumbnails */}
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {form.images.map((path, i) => (
                        <div key={path} className="relative group">
                          <div className="w-20 h-24 rounded-xl overflow-hidden border border-warm-beige bg-warm-beige relative">
                            <Image src={path} alt={`Photo ${i + 1}`} fill className="object-cover" />
                            {i === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-warm-brown/70 text-cream py-0.5">
                                cover
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(path)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-warm-brown text-cream rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
                    Item name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Black blazer"
                    required
                    className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-cream text-warm-brown focus:outline-none focus:border-terra"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brand, condition, notes..."
                    rows={3}
                    className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-cream text-warm-brown focus:outline-none focus:border-terra resize-none"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
                    Size
                  </label>
                  <select
                    value={form.size}
                    onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                    className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-cream text-warm-brown focus:outline-none focus:border-terra"
                  >
                    <option value="">— select —</option>
                    {SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-cream text-warm-brown focus:outline-none focus:border-terra"
                  >
                    <option value="">— select —</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {formError && <p className="sm:col-span-2 text-red-500 text-sm">{formError}</p>}

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || isUploading}
                    className="bg-terra hover:bg-terra-dark text-cream text-sm font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving..." : isUploading ? "Uploading..." : "Add to closet"}
                  </button>
                </div>
              </form>
            )}

            {/* Items list */}
            {items.length === 0 ? (
              <p className="text-center text-muted-brown py-16 font-serif text-lg">
                No items yet — add your first!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const images = parseImages(item.image_path);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-warm-beige rounded-2xl overflow-hidden"
                    >
                      <div className="relative aspect-[3/4] bg-warm-beige">
                        {images[0] ? (
                          <Image src={images[0]} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-3xl text-muted-brown">
                            🧥
                          </div>
                        )}
                        {images.length > 1 && (
                          <span className="absolute top-2 right-2 bg-warm-brown/70 text-cream text-[10px] px-1.5 py-0.5 rounded-full">
                            {images.length} photos
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-warm-brown truncate">{item.name}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {item.size && (
                            <span className="text-xs text-muted-brown bg-warm-beige px-2 py-0.5 rounded-full">
                              {item.size}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === "available"
                                ? "bg-green-100 text-green-700"
                                : "bg-warm-beige text-muted-brown"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="flex-1 text-xs border border-warm-beige rounded-lg py-1.5 text-muted-brown hover:border-terra hover:text-terra transition-colors"
                          >
                            {item.status === "available" ? "Mark reserved" : "Mark available"}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs border border-warm-beige rounded-lg px-2.5 py-1.5 text-muted-brown hover:border-red-300 hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "claims" && (
          <div>
            <p className="text-sm text-muted-brown mb-6">
              {claims.length} {claims.length === 1 ? "claim" : "claims"} total
            </p>
            {claims.length === 0 ? (
              <p className="text-center text-muted-brown py-16 font-serif text-lg">
                No claims yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white border border-warm-beige rounded-2xl px-5 py-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-warm-brown text-sm">{claim.claimer_name}</p>
                      <p className="text-sm text-muted-brown mt-0.5">
                        claimed <span className="text-warm-brown">{claim.item_name}</span>
                      </p>
                      <p className="text-xs text-terra mt-1">{claim.contact_info}</p>
                    </div>
                    <p className="text-xs text-muted-brown whitespace-nowrap mt-0.5">
                      {new Date(claim.claimed_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
