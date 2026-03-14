"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Play, QrCode, Image as ImageIcon, Video, X, Volume2, VolumeX } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const backgroundMusicUrl = process.env.NEXT_PUBLIC_BG_MUSIC_URL || "";

function formatMonthYear(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function getOrientation(meta) {
  if (!meta?.width || !meta?.height) return "landscape";
  const ratio = meta.width / meta.height;
  if (ratio > 1.18) return "landscape";
  if (ratio < 0.85) return "portrait";
  return "square";
}

function buildWallLayout(items, mediaMeta) {
  const sparseAnchors = [
    { x: 6, y: 10 },
    { x: 24, y: 7 },
    { x: 49, y: 12 },
    { x: 74, y: 9 },
    { x: 13, y: 44 },
    { x: 36, y: 50 },
    { x: 63, y: 48 },
    { x: 82, y: 42 },
    { x: 8, y: 72 },
    { x: 28, y: 76 },
    { x: 52, y: 73 },
    { x: 77, y: 70 },
  ];

  const denseAnchors = [
    { x: 4, y: 8 },
    { x: 18, y: 5 },
    { x: 31, y: 10 },
    { x: 46, y: 6 },
    { x: 60, y: 11 },
    { x: 75, y: 7 },
    { x: 86, y: 14 },
    { x: 8, y: 30 },
    { x: 22, y: 25 },
    { x: 37, y: 33 },
    { x: 53, y: 27 },
    { x: 68, y: 31 },
    { x: 82, y: 26 },
    { x: 12, y: 52 },
    { x: 28, y: 56 },
    { x: 43, y: 49 },
    { x: 58, y: 54 },
    { x: 73, y: 50 },
    { x: 87, y: 57 },
    { x: 7, y: 74 },
    { x: 21, y: 78 },
    { x: 36, y: 72 },
    { x: 51, y: 77 },
    { x: 66, y: 73 },
    { x: 81, y: 79 },
  ];

  const anchors = items.length <= 14 ? sparseAnchors : denseAnchors;

  return items.map((item, index) => {
    const orientation = getOrientation(mediaMeta[item.id]);
    const anchor = anchors[index % anchors.length];
    const featured = index % 9 === 0 || index % 13 === 0;

    let width = 250;
    let height = 180;

    if (orientation === "portrait") {
      width = featured ? 240 : 200;
      height = featured ? 340 : 285;
    } else if (orientation === "square") {
      width = featured ? 250 : 200;
      height = width;
    } else {
      width = featured ? 340 : 260;
      height = featured ? 220 : 175;
    }

    const xNudge = ((index * 19) % 22) - 11;
    const yNudge = ((index * 13) % 18) - 9;
    const rotate = ((index * 7) % 12) - 6;
    const zIndex = featured ? 25 : 10 + (index % 7);
    const driftSeed = (index % 5) + 1;

    return {
      ...item,
      orientation,
      width,
      height,
      rotate,
      zIndex,
      left: `calc(${anchor.x}% + ${xNudge}px)`,
      top: `calc(${anchor.y}% + ${yNudge}px)`,
      featured,
      driftX: 5 + driftSeed * 1.5,
      driftY: 4 + driftSeed,
      driftRotate: 0.6 + driftSeed * 0.15,
      driftDuration: 9 + driftSeed * 1.4,
    };
  });
}

function MediaTile({ item, onClick, isNew = false }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      initial={
        isNew
          ? {
              opacity: 0,
              scale: 0.72,
              filter: "blur(10px)",
              boxShadow: "0 0 0 rgba(255,255,255,0)",
            }
          : false
      }
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        x: [0, item.driftX, -item.driftX * 0.7, 0],
        y: [0, -item.driftY, item.driftY * 0.6, 0],
        rotate: [item.rotate, item.rotate + item.driftRotate, item.rotate - item.driftRotate * 0.8, item.rotate],
        boxShadow: isNew
          ? [
              "0 0 0 rgba(255,255,255,0)",
              "0 0 40px rgba(255,255,255,0.35)",
              "0 0 72px rgba(255,190,230,0.28)",
              "0 18px 50px rgba(0,0,0,0.34)",
            ]
          : "0 18px 50px rgba(0,0,0,0.34)",
      }}
      transition={{
        layout: { duration: 0.8, ease: "easeInOut" },
        opacity: { duration: isNew ? 0.55 : 0.35 },
        scale: { duration: isNew ? 0.65 : 0.35 },
        filter: { duration: 0.65 },
        x: { repeat: Infinity, duration: item.driftDuration, ease: "easeInOut" },
        y: { repeat: Infinity, duration: item.driftDuration + 1.8, ease: "easeInOut" },
        rotate: { repeat: Infinity, duration: item.driftDuration + 2.6, ease: "easeInOut" },
        boxShadow: { duration: 2.2, ease: "easeOut" },
      }}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 90 }}
      className="group absolute overflow-hidden rounded-[28px] border border-white/10 bg-white/5 text-left transition hover:border-white/25"
      style={{
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
        rotate: `${item.rotate}deg`,
        zIndex: item.zIndex,
        transformOrigin: "center center",
      }}
    >
      {item.type === "video" ? (
        <video
          src={item.media_url}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={item.media_url}
          alt={`${item.credit || "Anonymous"} from ${item.place || "Unknown"}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/12 to-transparent opacity-70 transition group-hover:opacity-100" />

      {item.type === "video" && (
        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 backdrop-blur-sm">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/48">Credits</div>
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
    </motion.button>
  );
}

function SpotlightView({ item, onClose, index, total }) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={item.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[120] bg-black"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6 }}
          className="relative flex h-full w-full items-center justify-center px-6 py-6 md:px-10 md:py-10"
        >
          <motion.div
            animate={{ scale: [1, 1.012, 1], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut" }}
            className="flex h-full w-full items-center justify-center"
          >
            {item.type === "video" ? (
              <video
                src={item.media_url}
                className="max-h-[78vh] max-w-[72vw] rounded-[30px] object-contain shadow-[0_30px_100px_rgba(0,0,0,0.55)] md:max-h-[82vh]"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              />
            ) : (
              <img
                src={item.media_url}
                alt={`${item.credit || "Anonymous"} from ${item.place || "Unknown"}`}
                className="max-h-[78vh] max-w-[72vw] rounded-[30px] object-contain shadow-[0_30px_100px_rgba(0,0,0,0.55)] md:max-h-[82vh]"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="absolute bottom-6 left-6 max-w-[26rem] rounded-[24px] border border-white/12 bg-black/42 px-5 py-4 backdrop-blur-md md:bottom-8 md:left-8 md:max-w-[30rem]"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Credits</div>
            <div className="mt-1 text-lg text-white">{item.credit || "Anonymous"}</div>
            <div className="mt-3 flex gap-8 text-sm text-white/78">
              <div>
                <div className="uppercase tracking-[0.2em] text-white/38">Time</div>
                <div className="mt-1">{formatMonthYear(item.hug_time || item.created_at)}</div>
              </div>
              <div>
                <div className="uppercase tracking-[0.2em] text-white/38">Place</div>
                <div className="mt-1">{item.place || "Unknown"}</div>
              </div>
            </div>
            {item.story && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Story</div>
                <div className="mt-2 max-h-[22vh] overflow-auto whitespace-pre-wrap pr-1 text-sm leading-6 text-white/85 md:max-h-[26vh]">
                  {item.story}
                </div>
              </div>
            )}
          </motion.div>

          <div className="absolute right-6 top-6 rounded-full border border-white/12 bg-black/42 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/55 backdrop-blur-md md:right-8 md:top-8">
            {index + 1} / {total}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute left-6 top-6 rounded-full border border-white/12 bg-black/42 p-3 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white md:left-8 md:top-8"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function WallView({
  submissions,
  mediaMeta,
  mounted,
  submitUrl,
  openSubmit,
  openSpotlight,
  isCyclePaused,
  newIds,
  musicEnabled,
  toggleMusic,
}) {
  const wallItems = useMemo(() => buildWallLayout(submissions, mediaMeta), [submissions, mediaMeta]);

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
          className="absolute right-6 top-5 z-[110] flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/72 backdrop-blur-md transition hover:bg-white/14 md:right-8 md:top-7"
        >
          <Upload className="h-3.5 w-3.5" />
          Submit
        </button>

        <div className="absolute bottom-6 right-6 z-[110] rounded-[24px] border border-white/12 bg-black/45 p-3 shadow-2xl backdrop-blur-md md:bottom-8 md:right-8">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
            <QrCode className="h-3 w-3" />
            Scan to submit
          </div>
          <div className="rounded-xl bg-white p-2.5">
            {mounted ? <QRCodeSVG value={submitUrl} size={92} /> : <div className="h-[92px] w-[92px] bg-white" />}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMusic}
          className="absolute bottom-6 left-6 z-[110] flex items-center gap-2 rounded-full border border-white/10 bg-black/32 px-4 py-2 text-xs text-white/42 backdrop-blur transition hover:bg-white/10 hover:text-white md:bottom-8 md:left-8"
        >
          {musicEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {musicEnabled ? "Music on" : "Music off"}
        </button>

        <div className="absolute left-6 top-20 z-[110] rounded-full border border-white/10 bg-black/32 px-4 py-2 text-xs text-white/42 backdrop-blur md:left-8 md:top-24">
          {submissions.length} hugs
        </div>

        <div className="absolute inset-0 hidden overflow-hidden md:block">
          {wallItems.map((item, index) => (
            <MediaTile
              key={item.id}
              item={item}
              onClick={() => openSpotlight(index)}
              isNew={newIds.includes(item.id)}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 block h-full overflow-y-auto px-4 pb-32 pt-28 md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {submissions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openSpotlight(index)}
                className={`group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 text-left ${index % 5 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"}`}
              >
                {item.type === "video" ? (
                  <video src={item.media_url} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={item.media_url} alt={`${item.credit || "Anonymous"}`} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="rounded-xl border border-white/10 bg-black/45 p-2.5 backdrop-blur-md">
                    <div className="text-xs text-white">{item.credit || "Anonymous"}</div>
                    <div className="mt-1 text-[11px] text-white/65">{item.place || "Unknown"} · {formatMonthYear(item.hug_time || item.created_at)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full border border-white/10 bg-black/28 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/32 backdrop-blur md:bottom-8">
          {isCyclePaused ? "Spotlight paused" : "Floating wall → spotlight loop"}
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
    if (file.size > 50 * 1024 * 1024) {
      setStatus("Please keep uploads under 50MB.");
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
              {file?.type?.startsWith("video") ? (
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
            {file?.type?.startsWith("video") ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
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
  const [submissions, setSubmissions] = useState([]);
  const [mediaMeta, setMediaMeta] = useState({});
  const [displayMode, setDisplayMode] = useState("wall");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isCyclePaused, setIsCyclePaused] = useState(false);
  const [newIds, setNewIds] = useState([]);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [spotlightOrder, setSpotlightOrder] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setSubmitUrl(`${window.location.origin}${window.location.pathname}?mode=submit`);
  }, []);

  useEffect(() => {
    function syncModeFromUrl() {
      const params = new URLSearchParams(window.location.search);
      setMode(params.get("mode") === "submit" ? "submit" : "wall");
    }

    syncModeFromUrl();
    window.addEventListener("popstate", syncModeFromUrl);
    return () => window.removeEventListener("popstate", syncModeFromUrl);
  }, []);

  useEffect(() => {
    if (!submissions.length) return;

    submissions.forEach((item) => {
      if (mediaMeta[item.id]) return;

      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.media_url;
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          setMediaMeta((current) => ({
            ...current,
            [item.id]: { width: video.videoWidth, height: video.videoHeight },
          }));
        };
      } else {
        const img = new window.Image();
        img.src = item.media_url;
        img.onload = () => {
          setMediaMeta((current) => ({
            ...current,
            [item.id]: { width: img.naturalWidth, height: img.naturalHeight },
          }));
        };
      }
    });
  }, [submissions, mediaMeta]);

  useEffect(() => {
    if (!supabase) return;

    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("hug_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);

      if (!error && data) {
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
            return [payload.new, ...current].slice(0, 60);
          });
          markAsNew(payload.new.id);
          setDisplayMode("spotlight");
          setSpotlightIndex(0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!submissions.length) {
      setSpotlightOrder([]);
      return;
    }
    setSpotlightOrder((current) => {
      const ids = submissions.map((item) => item.id);
      const currentValid = current.filter((id) => ids.includes(id));
      const missing = ids.filter((id) => !currentValid.includes(id));
      return [...currentValid, ...missing];
    });
  }, [submissions]);

  useEffect(() => {
    if (mode !== "wall" || isCyclePaused || !submissions.length || !spotlightOrder.length) return;

    if (displayMode === "wall") {
      const timer = window.setTimeout(() => {
        const shuffled = [...submissions.map((item) => item.id)].sort(() => Math.random() - 0.5);
        setSpotlightOrder(shuffled);
        setDisplayMode("spotlight");
        setSpotlightIndex(0);
      }, 15000);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setSpotlightIndex((current) => {
        if (current >= spotlightOrder.length - 1) {
          setDisplayMode("wall");
          return 0;
        }
        return current + 1;
      });
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [displayMode, mode, submissions, spotlightIndex, isCyclePaused, spotlightOrder]);

  useEffect(() => {
    if (!audioRef.current || !backgroundMusicUrl) return;
    if (musicEnabled) {
      audioRef.current.volume = 0.55;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled]);

  function toggleMusic() {
    setMusicEnabled((current) => !current);
  }

  function openSubmit() {
    window.history.pushState({}, "", `${window.location.pathname}?mode=submit`);
    setMode("submit");
  }

  function handleBack() {
    window.history.pushState({}, "", window.location.pathname);
    setMode("wall");
  }

  function markAsNew(id) {
    setNewIds((current) => Array.from(new Set([id, ...current])));
    window.setTimeout(() => {
      setNewIds((current) => current.filter((entryId) => entryId !== id));
    }, 3200);
  }

  function handleOptimisticAdd(item) {
    setSubmissions((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      if (exists) return current;
      return [item, ...current].slice(0, 60);
    });
    markAsNew(item.id);
    setSpotlightOrder((current) => [item.id, ...current.filter((id) => id !== item.id)]);
    setDisplayMode("spotlight");
    setSpotlightIndex(0);
  }

  function openSpotlight(index) {
    setIsCyclePaused(true);
    const id = submissions[index]?.id;
    if (id) {
      setSpotlightOrder((current) => [id, ...current.filter((entryId) => entryId !== id)]);
    }
    setSpotlightIndex(0);
    setDisplayMode("spotlight");
  }

  function closeSpotlight() {
    setIsCyclePaused(false);
    setDisplayMode("wall");
  }

  if (mode === "submit") {
    return <SubmitView onBack={handleBack} onOptimisticAdd={handleOptimisticAdd} />;
  }

  const spotlightItem = spotlightOrder.length
    ? submissions.find((item) => item.id === spotlightOrder[spotlightIndex]) || submissions[spotlightIndex] || null
    : submissions[spotlightIndex] || null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      {backgroundMusicUrl ? <audio ref={audioRef} src={backgroundMusicUrl} loop playsInline /> : null}
      <WallView
        submissions={submissions}
        mediaMeta={mediaMeta}
        mounted={mounted}
        submitUrl={submitUrl}
        openSubmit={openSubmit}
        openSpotlight={openSpotlight}
        isCyclePaused={isCyclePaused}
        newIds={newIds}
        musicEnabled={musicEnabled}
        toggleMusic={toggleMusic}
      />

      {displayMode === "spotlight" && submissions.length > 0 && spotlightItem && (
        <SpotlightView
          item={spotlightItem}
          index={spotlightIndex}
          total={spotlightOrder.length || submissions.length}
          onClose={closeSpotlight}
        />
      )}
    </div>
  );
}
