/* VibeVault · Mood Board */
"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Camera, Eye, EyeOff, Sparkles, Trash2 } from "lucide-react";
import { Caveat } from "next/font/google";

const handwritten = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type Memory = {
  id: string;
  imageUrl: string;
  caption: string;
  rotation: number;
  createdAt: number;
};

const STORAGE_KEY = "vibevault.memories.v1";
const ALWAYS_VISIBLE_KEY = "vibevault.cardsAlwaysVisible";

function AddMemoryBar({
  onAdd,
}: {
  onAdd: (payload: { imageUrl: string; caption: string }) => void;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  function submitMemory() {
    const trimmedUrl = imageUrl.trim();
    const trimmedCaption = caption.trim();
    if (!trimmedUrl) return;
    onAdd({ imageUrl: trimmedUrl, caption: trimmedCaption });
    setImageUrl("");
    setCaption("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitMemory();
  }

  const isDisabled = !imageUrl.trim();

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3 shadow-[0_16px_50px_rgba(148,81,15,0.18)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute -top-4 left-6 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm">
        <Sparkles className="h-3 w-3" />
        Capture a vibe
      </div>
      <div className="flex-1 space-y-2">
        <label className="block text-xs font-medium uppercase tracking-[0.22em] text-amber-800/90">
          Image URL
        </label>
        <input
          type="text"
          inputMode="url"
          placeholder="Paste an image URL (e.g. https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full rounded-xl border border-amber-200/80 bg-white/90 px-3 py-2.5 text-sm text-amber-950 placeholder:text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200/80"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:max-w-xs">
        <label className="block text-xs font-medium uppercase tracking-[0.22em] text-amber-800/90">
          Caption
        </label>
        <input
          type="text"
          placeholder='Write a tiny note like "Golden hour on the balcony"...'
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={80}
          className="w-full rounded-xl border border-amber-200/80 bg-white/90 px-3 py-2.5 text-sm text-amber-950 placeholder:text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200/80"
        />
      </div>
      <div className="flex items-end pt-2 sm:pt-7">
        <motion.button
          type="button"
          disabled={isDisabled}
          onClick={submitMemory}
          whileTap={!isDisabled ? { scale: 0.96, y: 1 } : undefined}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-700/80 bg-amber-600 px-4 py-2.5 text-sm font-semibold text-amber-50 shadow-[0_14px_32px_rgba(146,64,14,0.6)] transition disabled:cursor-not-allowed disabled:border-amber-200 disabled:bg-amber-200/80 disabled:text-amber-500 hover:bg-amber-700 hover:border-amber-800"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/90 text-amber-50">
            <Camera className="h-4 w-4" />
          </span>
          <span className="text-sm tracking-tight">Snap</span>
        </motion.button>
      </div>
    </motion.form>
  );
}

const cardAlwaysVisibleVariants: Variants = {
  idle: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.05 },
  }),
};

const cardBreatheVariants: Variants = {
  idle: (index: number) => ({
    opacity: [1, 0.82, 1],
    y: [0, -6, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay: index * 0.35,
    },
  }),
};

function PolaroidCard({
  memory,
  index,
  alwaysVisible,
  onRemove,
}: {
  memory: Memory;
  index: number;
  alwaysVisible: boolean;
  onRemove: (id: string) => void;
}) {
  const variants = alwaysVisible ? cardAlwaysVisibleVariants : cardBreatheVariants;
  return (
    <motion.article
      layout
      custom={index}
      variants={variants}
      initial={{ opacity: alwaysVisible ? 1 : 0, y: alwaysVisible ? 0 : 18, rotate: memory.rotation }}
      animate="idle"
      whileHover={{
        scale: 1.06,
        y: alwaysVisible ? 0 : -12,
        rotate: 0,
        boxShadow: "0 26px 80px rgba(15,23,42,0.55)",
      }}
      transition={{
        opacity: { duration: alwaysVisible ? 0 : 0.4, ease: "easeOut" },
        layout: { type: "spring", stiffness: 260, damping: 26 },
      }}
      className="group pointer-events-auto cursor-pointer select-none"
      style={{ rotate: `${memory.rotation}deg` }}
    >
      <div className="relative flex h-full flex-col rounded-[1.75rem] bg-white/98 p-3 pb-6 shadow-[0_18px_44px_rgba(15,23,42,0.32)] ring-1 ring-zinc-100/80 transition-transform">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(memory.id);
          }}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-50 text-amber-700 shadow-md transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          title="Remove this memory"
          aria-label="Remove this memory"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <div className="relative overflow-hidden rounded-[1.25rem] border border-zinc-100 bg-zinc-100/70">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={memory.imageUrl}
              alt={memory.caption || "Polaroid memory"}
              fill
              unoptimized
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        </div>
        <p
          className={`mt-3 text-lg leading-snug text-zinc-900 ${handwritten.className}`}
        >
          {memory.caption || "Untitled moment"}
        </p>
      </div>
    </motion.article>
  );
}

export default function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [cardsAlwaysVisible, setCardsAlwaysVisible] = useState(false);

  // Hydrate from localStorage on mount (run first, then mark hydrated)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Memory[];
        if (Array.isArray(parsed)) {
          setMemories(
            parsed.map((m, index) => ({
              ...m,
              rotation:
                typeof m.rotation === "number"
                  ? m.rotation
                  : (Math.random() - 0.5) * 14,
              createdAt: m.createdAt ?? Date.now() - index * 1000,
            })),
          );
        }
      }
      const stored = window.localStorage.getItem(ALWAYS_VISIBLE_KEY);
      if (stored === "true") setCardsAlwaysVisible(true);
    } catch {
      // ignore invalid localStorage contents
    }
    setHasHydrated(true);
  }, []);

  // Persist to localStorage only after hydration (avoids wiping with [] on refresh)
  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch {
      // ignore quota issues
    }
  }, [hasHydrated, memories]);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ALWAYS_VISIBLE_KEY, String(cardsAlwaysVisible));
    } catch {
      // ignore
    }
  }, [hasHydrated, cardsAlwaysVisible]);

  function handleAddMemory(payload: { imageUrl: string; caption: string }) {
    const rotation = (Math.random() - 0.5) * 16; // -8deg to 8deg
    const createdAt = Date.now();

    const newMemory: Memory = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${createdAt}-${Math.random().toString(36).slice(2)}`,
      imageUrl: payload.imageUrl,
      caption: payload.caption,
      rotation,
      createdAt,
    };

    setMemories((prev) => [newMemory, ...prev]);
  }

  function handleRemoveMemory(id: string) {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="flex min-h-screen items-stretch justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <main className="relative flex w-full max-w-6xl flex-col gap-6 rounded-[2.5rem] border border-amber-100/80 bg-[radial-gradient(circle_at_0_0,rgba(251,248,231,0.9),transparent_55%),radial-gradient(circle_at_100%_0,rgba(255,237,213,0.9),transparent_52%),radial-gradient(circle_at_0_100%,rgba(219,234,254,0.9),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(254,243,199,0.85),transparent_55%)] p-5 shadow-[0_40px_150px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute left-7 top-6 h-8 w-32 -rotate-6 rounded-full border border-dashed border-amber-400/70 bg-amber-200/40 shadow-sm" />
        <div className="pointer-events-none absolute right-10 top-10 h-6 w-24 rotate-6 rounded-full border border-dashed border-sky-300/70 bg-sky-200/40 shadow-sm" />

        <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 shadow-sm ring-1 ring-amber-200/70">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/90 text-[9px] text-amber-50">
                ✶
              </span>
              VibeVault
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-amber-950 sm:text-4xl lg:text-[2.7rem]">
              Pin your favorite{" "}
              <span className="underline decoration-wavy decoration-amber-500 underline-offset-[10px]">
                little moments
              </span>{" "}
              like digital Polaroids.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-amber-900/80 sm:text-[15px]">
              Paste any image URL, scribble a tiny caption, and{" "}
              <span className="font-semibold">VibeVault</span> will scatter your
              memories onto a messy, floating mood board that lives in your
              browser.
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-amber-900/70 sm:flex-col sm:items-end sm:text-right">
            <button
              type="button"
              onClick={() => setCardsAlwaysVisible((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-white/80 px-3 py-2 shadow transition hover:border-amber-300 hover:bg-amber-50/90"
              title={cardsAlwaysVisible ? "Cards always visible (click to use fade)" : "Cards fade in/out (click to keep always visible)"}
            >
              {cardsAlwaysVisible ? (
                <>
                  <Eye className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">Cards always visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Cards breathe</span>
                </>
              )}
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 shadow">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="font-medium">
                Saved locally · private to you
              </span>
            </div>
          </div>
        </header>

        <AddMemoryBar onAdd={handleAddMemory} />

        <section className="mt-4 flex-1">
          {memories.length === 0 ? (
            <div className="mt-8 flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-amber-200/80 bg-amber-50/70 px-6 py-14 text-center text-sm text-amber-900/80">
              <p className="max-w-sm">
                Your board is still blank. Paste an image URL above and hit{" "}
                <span className="font-semibold">Snap 📸</span> to pin your very
                first memory.
              </p>
            </div>
          ) : (
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {memories.map((memory, index) => (
                <PolaroidCard
                  key={memory.id}
                  memory={memory}
                  index={index}
                  alwaysVisible={cardsAlwaysVisible}
                  onRemove={handleRemoveMemory}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
