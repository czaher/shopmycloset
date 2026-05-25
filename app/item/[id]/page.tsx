"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/lib/types";
import { parseImages } from "@/lib/types";

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: Number(id), claimerName: name, contactInfo: contact }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      if (res.status === 409) {
        setItem((prev) => prev ? { ...prev, status: "reserved" } : prev);
      }
      return;
    }

    setSuccess(true);
    setItem((prev) => prev ? { ...prev, status: "reserved" } : prev);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted-brown text-lg">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-warm-brown">Item not found.</p>
        <Link href="/" className="text-terra underline text-sm">Back to closet</Link>
      </div>
    );
  }

  const images = parseImages(item.image_path);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-beige bg-cream">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-sm text-muted-brown hover:text-terra transition-colors">
            ← Back to closet
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Images */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-warm-beige">
              {images.length > 0 ? (
                <Image
                  key={images[activeImg]}
                  src={images[activeImg]}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-6xl text-muted-brown">
                  🧥
                </div>
              )}
              {item.status === "reserved" && (
                <div className="absolute inset-0 bg-warm-brown/30 flex items-center justify-center">
                  <span className="bg-warm-brown text-cream text-sm font-medium px-4 py-2 rounded-full tracking-widest uppercase">
                    Reserved
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveImg(i)}
                    className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === activeImg ? "border-terra" : "border-transparent hover:border-warm-beige"
                    }`}
                  >
                    <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details + Form */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-serif text-3xl text-warm-brown">{item.name}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {item.size && (
                  <span className="text-sm text-muted-brown bg-warm-beige px-3 py-1 rounded-full">
                    Size {item.size}
                  </span>
                )}
                {item.category && (
                  <span className="text-sm text-muted-brown bg-warm-beige px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-4 text-warm-brown/80 leading-relaxed text-sm">{item.description}</p>
              )}
            </div>

            {/* Claim form */}
            {item.status === "available" && !success && (
              <form onSubmit={handleClaim} className="flex flex-col gap-4">
                <div className="border-t border-warm-beige pt-5">
                  <h2 className="font-serif text-lg text-warm-brown mb-4">Claim this item</h2>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
                        Your name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First name is fine"
                        required
                        className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-white text-warm-brown placeholder-muted-brown/60 focus:outline-none focus:border-terra transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
                        How to reach you
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Phone, email, Instagram — whatever works"
                        required
                        className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-white text-warm-brown placeholder-muted-brown/60 focus:outline-none focus:border-terra transition-colors"
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-1 bg-terra hover:bg-terra-dark text-cream font-medium rounded-xl py-3 text-sm tracking-wide transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Claiming..." : "Claim this item"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {success && (
              <div className="border border-terra/30 bg-terra/10 rounded-2xl p-5 text-center">
                <p className="font-serif text-xl text-warm-brown">It&apos;s yours!</p>
                <p className="text-sm text-muted-brown mt-2">
                  I&apos;ll be in touch to sort out pickup. Thanks!
                </p>
                <Link href="/" className="mt-4 inline-block text-sm text-terra underline">
                  Browse more items
                </Link>
              </div>
            )}

            {item.status === "reserved" && !success && (
              <div className="border border-warm-beige rounded-2xl p-5 text-center bg-white">
                <p className="font-serif text-lg text-muted-brown">This item has been claimed.</p>
                <Link href="/" className="mt-3 inline-block text-sm text-terra underline">
                  See what&apos;s still available
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
