/* VibeVault · Mood Board */
"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Camera, Eye, EyeOff, ImageOff, Pencil, Sparkles, Trash2, Download } from "lucide-react";
import { Caveat } from "next/font/google";
import html2canvas from "html2canvas";

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
  tags: string[];
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
  onOpenLightbox,
  onUpdateCaption,
  draggable = false,
  onDragEnd,
}: {
  memory: Memory;
  index: number;
  alwaysVisible: boolean;
  onRemove: (id: string) => void;
  onOpenLightbox: (memory: Memory) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onAddTag: (id: string, tags: string[]) => void;
  draggable?: boolean;
  onDragEnd?: (activeId: string, overId: string) => void;
}) {
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editValue, setEditValue] = useState(memory.caption);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const variants = alwaysVisible ? cardAlwaysVisibleVariants : cardBreatheVariants;

  useEffect(() => {
    if (!isEditingCaption) setEditValue(memory.caption);
  }, [memory.caption, isEditingCaption]);

  function saveCaption() {
    const trimmed = editValue.trim();
    onUpdateCaption(memory.id, trimmed);
    setIsEditingCaption(false);
  }

  function addTag() {
    if (!newTag.trim()) return;

    const trimmedTag = newTag.trim().toLowerCase();
    if (!memory.tags.includes(trimmedTag)) {
      onAddTag(memory.id, [...memory.tags, trimmedTag]);
    }
    setNewTag("");
    setIsAddingTag(false);
  }

  function removeTag(tagToRemove: string) {
    const updatedTags = memory.tags.filter(tag => tag !== tagToRemove);
    onAddTag(memory.id, updatedTags);
  }

  return (
    <motion.article
      onClick={() => !isEditingCaption && onOpenLightbox(memory)}
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
      whileDrag={{
        scale: 1.1,
        zIndex: 50,
        rotate: 0,
        boxShadow: "0 32px 80px rgba(15,23,42,0.65)",
      }}
      drag={draggable}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={onDragEnd ? (event, info) => onDragEnd(memory.id, '') : undefined}
      transition={{
        opacity: { duration: alwaysVisible ? 0 : 0.4, ease: "easeOut" },
        layout: { type: "spring", stiffness: 260, damping: 26 },
      }}
      className={`group pointer-events-auto mb-5 break-inside-avoid cursor-pointer select-none ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      style={{ rotate: `${memory.rotation}deg` }}
    >
      <div className="polaroid-grain relative flex h-full flex-col rounded-[1.25rem] bg-white/98 shadow-[0_12px_40px_rgba(15,23,42,0.2),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-zinc-200/60 transition-transform">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(memory.id);
          }}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-50 text-amber-700 shadow-md transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          title="Remove this memory"
          aria-label="Remove this memory"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
        </button>
        {/* Image area: classic Polaroid – small padding on sides/top */}
        <div className="relative shrink-0 px-2.5 pt-2.5">
          <div className="relative overflow-hidden rounded-md border border-zinc-100 bg-zinc-100/70">
            <div className="relative aspect-[4/5] w-full">
              {imageStatus === "loading" && (
                <div className="absolute inset-0 animate-pulse bg-zinc-200/80" aria-hidden />
              )}
              {imageStatus === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-100 text-zinc-500">
                  <ImageOff className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs font-medium">Couldn&apos;t load image</span>
                </div>
              )}
              <Image
                src={memory.imageUrl}
                alt={memory.caption || "Polaroid memory"}
                fill
                unoptimized
                className={`object-cover transition duration-500 group-hover:scale-105 ${imageStatus !== "loaded" ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setImageStatus("loaded")}
                onError={() => setImageStatus("error")}
              />
            </div>
          </div>
        </div>
        {/* Thick bottom “frame” – more white below image than on sides */}
        <div className="flex min-h-[4.5rem] flex-1 flex-col justify-end rounded-b-[1.1rem] px-3 pb-5 pt-4">
          {isEditingCaption ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveCaption}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCaption();
                  if (e.key === "Escape") {
                    setEditValue(memory.caption);
                    setIsEditingCaption(false);
                  }
                }}
                maxLength={80}
                autoFocus
                className={`w-full rounded border border-amber-200 bg-amber-50/80 px-2 py-1 text-lg text-zinc-900 outline-none focus:border-amber-400 ${handwritten.className}`}
              />
              <button
                type="button"
                onClick={saveCaption}
                className="shrink-0 rounded-full p-1.5 text-amber-600 hover:bg-amber-100"
                aria-label="Save caption"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditValue(memory.caption);
                setIsEditingCaption(true);
              }}
              className="group/caption flex w-full items-start gap-1.5 text-left"
            >
              <p
                className={`min-h-[1.5rem] flex-1 text-lg leading-snug text-zinc-900 ${handwritten.className}`}
              >
                {memory.caption || "Untitled moment"}
              </p>
              <span className="mt-0.5 rounded p-1 opacity-0 transition group-hover/caption:opacity-70" title="Edit caption">
                <Pencil className="h-3.5 w-3.5 text-zinc-400" />
              </span>
            </button>
          )}
          <time
            dateTime={new Date(memory.createdAt).toISOString()}
            className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400"
          >
            {new Date(memory.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>

          {/* Tags display */}
          <div className="mt-2 flex flex-wrap gap-1">
            {memory.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 relative group"
              >
                #{tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="ml-1 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            {!isAddingTag && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingTag(true);
                }}
                className="inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800 hover:bg-amber-300"
              >
                + Add tag
              </button>
            )}
            {isAddingTag && (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTag();
                    } else if (e.key === "Escape") {
                      setIsAddingTag(false);
                      setNewTag("");
                    }
                  }}
                  placeholder="Tag name"
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-900 outline-none focus:border-amber-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] text-white"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

type Theme = "default" | "warm" | "cool" | "cork" | "minimal";

type Layout = "masonry" | "grid";

export default function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [cardsAlwaysVisible, setCardsAlwaysVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>("default");
  const [layout, setLayout] = useState<Layout>("masonry");
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);

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
                  : (Math.random() - 0.5) * 24,
              createdAt: m.createdAt ?? Date.now() - index * 1000,
              tags: m.tags ?? [],
            })),
          );
        }
      }
      const stored = window.localStorage.getItem(ALWAYS_VISIBLE_KEY);
      if (stored === "true") setCardsAlwaysVisible(true);

      // Load theme preference
      const savedTheme = window.localStorage.getItem("vibevault.theme");
      if (savedTheme && ["default", "warm", "cool", "cork", "minimal"].includes(savedTheme)) {
        setTheme(savedTheme as Theme);
      }

      // Load layout preference
      const savedLayout = window.localStorage.getItem("vibevault.layout");
      if (savedLayout && ["masonry", "grid"].includes(savedLayout)) {
        setLayout(savedLayout as Layout);
      }
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

  // Apply theme to body element and persist to localStorage
  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;

    // Remove all theme classes
    document.body.classList.remove("theme-default", "theme-warm", "theme-cool", "theme-cork", "theme-minimal");

    // Add current theme class
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    // Save theme to localStorage
    try {
      window.localStorage.setItem("vibevault.theme", theme);
    } catch {
      // ignore
    }
  }, [hasHydrated, theme]);

  // Persist layout preference to localStorage
  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem("vibevault.layout", layout);
    } catch {
      // ignore
    }
  }, [hasHydrated, layout]);

  useEffect(() => () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (pinnedToastRef.current) clearTimeout(pinnedToastRef.current);
  }, []);

  function handleAddMemory(payload: { imageUrl: string; caption: string }) {
    const rotation = (Math.random() - 0.5) * 24; // -12deg to 12deg
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
      tags: [],
    };

    setMemories((prev) => [newMemory, ...prev]);
    setShowPinnedToast(true);
    if (pinnedToastRef.current) clearTimeout(pinnedToastRef.current);
    pinnedToastRef.current = setTimeout(() => setShowPinnedToast(false), 2200);
  }

  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [removedForUndo, setRemovedForUndo] = useState<{ memory: Memory; index: number } | null>(null);
  const [showPinnedToast, setShowPinnedToast] = useState(false);
  const pinnedToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lightboxMemory, setLightboxMemory] = useState<Memory | null>(null);

  useEffect(() => {
    if (!lightboxMemory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxMemory(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxMemory]);

  function handleUpdateCaption(id: string, caption: string) {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, caption } : m))
    );
  }

  function handleRemoveMemory(id: string) {
    const index = memories.findIndex((m) => m.id === id);
    if (index === -1) return;
    const memory = memories[index];
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setRemovedForUndo({ memory, index });
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => setRemovedForUndo(null), 5000);
  }

  const handleUndoRemove = useCallback(() => {
    if (!removedForUndo) return;
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    setMemories((prev) => {
      const next = [...prev];
      next.splice(removedForUndo.index, 0, removedForUndo.memory);
      return next;
    });
    setRemovedForUndo(null);
  }, [removedForUndo]);

  const handleDragEnd = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    setMemories((prev) => {
      const activeIndex = prev.findIndex(item => item.id === activeId);
      const overIndex = prev.findIndex(item => item.id === overId);

      if (activeIndex === -1 || overIndex === -1) return prev;

      const newMemories = [...prev];
      const [movedItem] = newMemories.splice(activeIndex, 1);
      newMemories.splice(overIndex, 0, movedItem);

      return newMemories;
    });
  }, []);

  const handleAddTag = useCallback((id: string, tags: string[]) => {
    setMemories(prev =>
      prev.map(memory =>
        memory.id === id ? { ...memory, tags } : memory
      )
    );
  }, []);

  const handleExportBoard = async () => {
    try {
      // Find the main content area to capture
      const mainElement = document.querySelector('main');
      if (!mainElement) {
        throw new Error('Main element not found');
      }

      // Temporarily adjust styles for better export
      const originalStyles = {
        overflow: mainElement.style.overflow,
        transform: mainElement.style.transform,
      };

      // Apply temporary styles for export
      mainElement.style.overflow = 'visible';
      mainElement.style.transform = 'none';

      // Generate the canvas
      const canvas = await html2canvas(mainElement as HTMLElement, {
        backgroundColor: null, // Transparent background
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Restore original styles
      mainElement.style.overflow = originalStyles.overflow;
      mainElement.style.transform = originalStyles.transform;

      // Create download link
      const link = document.createElement('a');
      link.download = `vibevault-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting board:', error);
      alert('Failed to export board. Please try again.');
    }
  };

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
            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-white/80 px-3 py-2 shadow">
              <span className="font-medium">Layout:</span>
              <div className="flex rounded-lg bg-amber-100 p-1">
                <button
                  type="button"
                  onClick={() => setLayout("masonry")}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    layout === "masonry"
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-amber-600 hover:text-amber-800"
                  }`}
                >
                  Masonry
                </button>
                <button
                  type="button"
                  onClick={() => setLayout("grid")}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    layout === "grid"
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-amber-600 hover:text-amber-800"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDraggingEnabled(!isDraggingEnabled)}
              className={`inline-flex items-center gap-2 rounded-2xl border bg-white/80 px-3 py-2 shadow transition ${
                isDraggingEnabled
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-amber-200/80 hover:border-amber-300 hover:bg-amber-50/90"
              }`}
              title={isDraggingEnabled ? "Disable drag to reorder" : "Enable drag to reorder"}
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
                className={isDraggingEnabled ? "text-blue-600" : "text-amber-600"}
              >
                <path d="M16 3h5v5"/><path d="M4 21h5v-5"/><path d="M16 21h5v-5"/><path d="M4 3h5v5"/>
                <circle cx="12" cy="12" r="1"/>
              </svg>
              <span className="font-medium">{isDraggingEnabled ? "Reordering" : "Reorder"}</span>
            </button>
            <button
              type="button"
              onClick={handleExportBoard}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-white/80 px-3 py-2 shadow transition hover:border-amber-300 hover:bg-amber-50/90"
              title="Export mood board as image"
            >
              <Download className="h-4 w-4 text-amber-600" />
              <span className="font-medium">Export</span>
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-white/80 px-3 py-2 shadow">
              <span className="font-medium">Theme:</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="bg-transparent text-amber-700 focus:outline-none"
              >
                <option value="default">Default</option>
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
                <option value="cork">Corkboard</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
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
          ) : layout === "masonry" ? (
            <div className="polaroid-masonry mt-3 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
              {memories.map((memory, index) => (
                <PolaroidCard
                  key={memory.id}
                  memory={memory}
                  index={index}
                  alwaysVisible={cardsAlwaysVisible}
                  onRemove={handleRemoveMemory}
                  onOpenLightbox={setLightboxMemory}
                  onUpdateCaption={handleUpdateCaption}
                  onAddTag={handleAddTag}
                  draggable={isDraggingEnabled}
                  onDragEnd={isDraggingEnabled ? handleDragEnd : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="polaroid-grid mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {memories.map((memory, index) => (
                <PolaroidCard
                  key={memory.id}
                  memory={memory}
                  index={index}
                  alwaysVisible={cardsAlwaysVisible}
                  onRemove={handleRemoveMemory}
                  onOpenLightbox={setLightboxMemory}
                  onUpdateCaption={handleUpdateCaption}
                  onAddTag={handleAddTag}
                  draggable={isDraggingEnabled}
                  onDragEnd={isDraggingEnabled ? handleDragEnd : undefined}
                />
              ))}
            </div>
          )}
        </section>

        <AnimatePresence>
          {lightboxMemory && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
              onClick={() => setLightboxMemory(null)}
              role="dialog"
              aria-modal="true"
              aria-label="View memory"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Image
                    src={lightboxMemory.imageUrl}
                    alt={lightboxMemory.caption || "Polaroid memory"}
                    width={1200}
                    height={1200}
                    className="h-auto w-auto max-h-[80vh] max-w-[90vw] object-contain"
                  />
                </div>
                <p
                  className={`shrink-0 border-t border-zinc-100 p-4 text-center text-xl text-zinc-900 ${handwritten.className}`}
                >
                  {lightboxMemory.caption || "Untitled moment"}
                </p>
              </motion.div>
            </motion.div>
          )}
          {showPinnedToast && (
            <motion.div
              key="pinned-toast"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 shadow-lg ring-1 ring-amber-200/60"
            >
              Pinned!
            </motion.div>
          )}
          {removedForUndo && (
            <motion.div
              key="undo-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-200/80 bg-white px-4 py-3 shadow-lg ring-1 ring-black/5"
            >
              <span className="text-sm font-medium text-zinc-700">Memory removed</span>
              <button
                type="button"
                onClick={handleUndoRemove}
                className="rounded-xl bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
