"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Play, QrCode, Image as ImageIcon, Video, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function formatMonthYear(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function buildFloatingLayout(items) {
  const sparsePresets = [
    { x: "6%", y: "10%", w: 260, h: 190, rotate: -4 },
    { x: "26%", y: "7%", w: 290, h: 360, rotate: 3 },
    { x: "56%", y: "13%", w: 320, h: 220, rotate: -2 },
    { x: "78%", y: "10%", w: 230, h: 310, rotate: 5 },
    { x: "12%", y: "48%", w: 310, h: 210, rotate: 2 },
    { x: "40%", y: "50%", w: 255, h: 340, rotate: -5 },
    { x: "68%", y: "52%", w: 290, h: 205, rotate: 4 },
    { x: "84%", y: "44%", w: 230, h: 330, rotate: -3 },
    { x: "20%", y: "74%", w: 240, h: 180, rotate: 3 },
    { x: "52%", y: "76%", w: 270, h: 190, rotate: -2 },
    { x: "74%", y: "72%", w: 220, h: 280, rotate: 4 },
    { x: "4%", y: "74%", w: 220, h: 160, rotate: -3 },
  ];

  const denseColumns = [6, 19, 33, 47, 61, 75, 88];
  const denseRows = [8, 24, 40, 56, 72];

  return items.map((item, index) => {
    if (items.length <= 10) {
      const preset = sparsePresets[index % sparsePresets.length];
      return {
        ...item,
        x: preset.x,
        y: preset.y,
        w: preset.w,
        h: preset.h,
        rotate: preset.rotate,
        delay: Number((0.06 * index).toFixed(2)),
        duration: 7.8 + (index % 5) * 0.6,
      };
    }

    const col = denseColumns[index % denseColumns.length];
    const row = denseRows[Math.floor(index / denseColumns.length) % denseRows.length];
    const shapeCycle = index % 6;

    const sizes = [
      { w: 250, h: 180, rotate: -4 },
      { w: 220, h: 300, rotate: 3 },
      { w: 300, h: 210, rotate: -2 },
      { w: 235, h: 320, rotate: 5 },
      { w: 280, h: 200, rotate: 2 },
      { w: 245, h: 340, rotate: -5 },
    ];

    const chosen = sizes[shapeCycle];
    const xNudge = ((index * 17) % 14) - 7;
    const yNudge = ((index * 11) % 10) - 5;

    return {
      ...item,
      x: `calc(${col}% + ${xNudge}px)`,
      y: `calc(${row}% + ${yNudge}px)`,
      w: chosen.w,
      h: chosen.h,
      rotate: chosen.rotate,
      delay: Number((0.05 * (index % 12)).toFixed(2)),
      duration: 7.6 + (index % 6) * 0.55,
    };
  });
}

function FloatingTile({ item, isNew = false }) {
  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, scale: 0.35, y: 120, filter: "blur(10px)" } : { opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        y: [0, -10, 8, 0],
        x: [0, 6, -4, 0],
        rotate: [item.rotate, item.rotate + 1.5, item.rotate - 1, item.rotate],
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        layout: { duration: 0.9, ease: "easeInOut" },
        opacity: { duration: isNew ? 0.45 : 0.7, delay: item.delay },
        scale: { duration: isNew ? 0.55 : 0.7, delay: item.delay },
        filter: { duration: 0.55, delay: item.delay },
        y: { repeat: Infinity, duration: item.duration, ease: "easeInOut", delay: item.delay },
        x: { repeat: Infinity, duration: item.duration + 1.3, ease: "easeInOut", delay: item.delay },
        rotate: { repeat: Infinity, duration: item.duration + 2, ease: "easeInOut", delay: item.delay },
      }}
      whileHover={{ scale: 1.14, rotate: 0, zIndex: 50 }}
      className="group absolute cursor-pointer pointer-events-auto"
      style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: isNew ? 60 : 10, transformOrigin: "center center" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm transition duration-300 group-hover:border-white/25">
        {item.type === "video" ? (
          <video
            src={item.media_url}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-75"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={item.media_url}
            alt={`${item.type} submitted from ${item.place || "unknown place"}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-75"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent opacity-45 transition duration-300 group-hover:opacity-100" />

        {item.type === "video" && (
          <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 backdrop-blur-sm">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-5 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/50">Credits</div>
            <div className="mt-1 text-sm text-white">{item.credit || "Anonymous"}</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/78">
              <div>
                <div className="uppercase tracking-[0.2em] text-white/40">Time</div>
                <div className="mt-1">{formatMonthYear(item.hug_time || item.created_at)}</div>
              </div>
              <div>
                <div className="uppercase tracking-[0.2em] text-white/40">Place</div>
                <div className="mt-1">{item.place || "Unknown"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WallView({ submissions, mounted, submitUrl, openSubmit, newIds }) {
  const floating = useMemo(() => buildFloatingLayout(submissions), [submissions]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.07),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.06),transparent_24%),radial-gradient(circle_at_72%_72%,rgba(255,255,255,0.04),transparent_26%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="relative z-10 h-full w-full">
        <div className="pointer-events-none absolute left-6 top-5 text-[11px] uppercase tracking-[0.45em] text-white/48 md:left-8 md:top-7">
          Hug Wall
        </div>

        <button
          type="button"
          onClick={openSubmit}
          className="absolute right-6 top-5 z-[80] flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/72 backdrop-blur-md transition hover:bg-white/14 md:right-8 md:top-7"
        >
          <Upload className="h-3.5 w-3.5" />
          Submit
        </button>

        <div className="absolute bottom-6 right-6 z-[80] rounded-[28px] border border-white/12 bg-black/45 p-4 shadow-2xl backdrop-blur-md md:bottom-8 md:right-8">
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/55">
            <QrCode className="h-3.5 w-3.5" />
            Scan to submit
          </div>
          <div className="rounded-2xl bg-white p-3">
            {mounted ? <QRCodeSVG value={submitUrl} size={120} /> : <div className="h-[120px] w-[120px] bg-white" />}
          </div>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {floating.map((item) => (
              <FloatingTile key={item.id} item={item} isNew={newIds.includes(item.id)} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function SubmitView({ onBack, onOptimisticAdd }) {
  const [credit, setCredit] = useState("");
  const [place, setPlace] = useState("");
  const [hugTime, setHugTime] = useState("");
  const [story, setStory] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) {
      setStatus("Add your Supabase keys first.");
      return;
    }
    if (!file) {
      setStatus("Please choose a photo or video.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("Uploading...");

      const extension = file.name.split(".").pop();
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const filePath = `hug-submissions/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("hug-media")
        .upload(filePath, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("hug-media").getPublicUrl(filePath);
      const mediaUrl = publicUrlData.publicUrl;
      const type = file.type.startsWith("video") ? "video" : "photo";

      const payload = {
        media_url: mediaUrl,
        type,
        credit: credit || "Anonymous",
        place: place || "Unknown",
        hug_time: hugTime ? `${hugTime}-01` : null,
        story: story || null,
      };

      const { data, error: insertError } = await supabase
        .from("hug_submissions")
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      onOptimisticAdd(data);
      setStatus("Uploaded. It should appear on the wall right away.");
      setCredit("");
      setPlace("");
      setHugTime("");
      setStory("");
      setFile(null);
      setPreviewUrl("");
      } catch (error) {
  setStatus(error?.message || "Upload failed.");
}
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.45em] text-white/48">Submit a hug</div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/12 bg-white/8 p-2 text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <label className="block">
            <span className="mb-2 block text-sm text-white/72">Photo or video</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const nextFile = e.target.files?.[0] || null;
                setFile(nextFile);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : "");
              }}
              className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />
          </label>

          {previewUrl && (
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
              {file?.type.startsWith("video") ? (
                <video src={previewUrl} controls className="max-h-[320px] w-full object-cover" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-h-[320px] w-full object-cover" />
              )}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm text-white/72">Credits / photographer</span>
            <input
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm text-white/72">Time</span>
              <input
                type="month"
                value={hugTime}
                onChange={(e) => setHugTime(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/72">Place</span>
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-white/72">Story behind the hug</span>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
              placeholder="Optional"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
          >
            {file?.type.startsWith("video") ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            {isSubmitting ? "Uploading..." : "Upload to hug wall"}
          </button>

          {status && <div className="text-sm text-white/70">{status}</div>}
        </form>
      </div>
    </main>
  );
}

export default function HugMuseumWebsite() {
  const [mode, setMode] = useState("wall");
  const [mounted, setMounted] = useState(false);
  const [submitUrl, setSubmitUrl] = useState("https://your-site.com/?mode=submit");
  const [newIds, setNewIds] = useState([]);
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      type: "photo",
      media_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
      credit: "A. Chen",
      hug_time: "2026-03-01",
      place: "Cambridge",
      created_at: "2026-03-01T12:00:00Z",
    },
    {
      id: 2,
      type: "video",
      media_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      credit: "J. Liu",
      hug_time: "2026-02-01",
      place: "London",
      created_at: "2026-02-01T12:00:00Z",
    },
    {
      id: 3,
      type: "photo",
      media_url: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
      credit: "M. Wong",
      hug_time: "2026-01-01",
      place: "Manchester",
      created_at: "2026-01-01T12:00:00Z",
    },
    {
      id: 4,
      type: "photo",
      media_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
      credit: "R. Patel",
      hug_time: "2025-12-01",
      place: "Oxford",
      created_at: "2025-12-01T12:00:00Z",
    },
  ]);

  function markAsNew(id) {
    setNewIds((current) => Array.from(new Set([id, ...current])));
    window.setTimeout(() => {
      setNewIds((current) => current.filter((entryId) => entryId !== id));
    }, 3500);
  }

  useEffect(() => {
    setMounted(true);
    setSubmitUrl(`${window.location.origin}${window.location.pathname}?mode=submit`);
  }, []);

  useEffect(() => {
    function syncModeFromUrl() {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const nextMode = params.get("mode") === "submit" ? "submit" : "wall";
      setMode(nextMode);
    }

    syncModeFromUrl();
    window.addEventListener("popstate", syncModeFromUrl);
    return () => window.removeEventListener("popstate", syncModeFromUrl);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("hug_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(24);

      if (!error && data?.length) {
        setSubmissions(data);
      }
    }

    loadSubmissions();

    const channel = supabase
      .channel("hug-wall-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hug_submissions" },
        (payload) => {
          setSubmissions((current) => {
            const exists = current.some((item) => item.id === payload.new.id);
            if (exists) return current;
            return [payload.new, ...current].slice(0, 24);
          });
          markAsNew(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function openSubmit() {
    window.history.pushState({}, "", `${window.location.pathname}?mode=submit`);
    setMode("submit");
  }

  function handleBack() {
    window.history.pushState({}, "", window.location.pathname);
    setMode("wall");
  }

  function handleOptimisticAdd(item) {
    setSubmissions((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      if (exists) return current;
      return [item, ...current].slice(0, 24);
    });
    markAsNew(item.id);
  }

  return mode === "submit" ? (
    <SubmitView onBack={handleBack} onOptimisticAdd={handleOptimisticAdd} />
  ) : (
    <WallView submissions={submissions} mounted={mounted} submitUrl={submitUrl} openSubmit={openSubmit} newIds={newIds} />
  );
}
