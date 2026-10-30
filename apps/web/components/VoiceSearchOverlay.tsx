"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Mic, X } from "lucide-react";

type Status =
  | "idle"
  | "listening"
  | "done"
  | "nospeech"
  | "denied"
  | "nomic"
  | "network"
  | "unsupported";

type Locale = "en" | "bn" | "hi";

interface Props {
  /** Show / hide the full-screen listening layout. Recognition starts when it opens. */
  open: boolean;
  onClose: () => void;
  /** Called once with the final spoken text. */
  onResult: (text: string) => void;
  /** App locale, used for the on-screen text. */
  locale?: string;
}

const TEXT: Record<
  Locale,
  {
    listening: string;
    speakNow: string;
    tapToStop: string;
    tapToRetry: string;
    nospeech: string;
    denied: string;
    nomic: string;
    network: string;
    unsupported: string;
    close: string;
  }
> = {
  en: {
    listening: "Listening…",
    speakNow: "Speak now",
    tapToStop: "Tap the mic when you’re done",
    tapToRetry: "Tap the mic to try again",
    nospeech: "Didn’t catch that. Please try again.",
    denied: "Microphone access is blocked. Allow it in your browser settings.",
    nomic: "No microphone found on this device.",
    network: "Network error. Check your connection and try again.",
    unsupported: "Voice search isn’t supported in this browser. Try Chrome.",
    close: "Close",
  },
  bn: {
    listening: "শুনছি…",
    speakNow: "এখন বলুন",
    tapToStop: "বলা শেষ হলে মাইকে ট্যাপ করুন",
    tapToRetry: "আবার চেষ্টা করতে মাইকে ট্যাপ করুন",
    nospeech: "কিছু শুনতে পাইনি। আবার চেষ্টা করুন।",
    denied: "মাইক্রোফোনের অনুমতি বন্ধ আছে। ব্রাউজার সেটিংসে অনুমতি দিন।",
    nomic: "এই ডিভাইসে মাইক্রোফোন পাওয়া যায়নি।",
    network: "নেটওয়ার্ক সমস্যা। ইন্টারনেট দেখে আবার চেষ্টা করুন।",
    unsupported: "এই ব্রাউজারে ভয়েস সার্চ চলে না। Chrome ব্যবহার করুন।",
    close: "বন্ধ করুন",
  },
  hi: {
    listening: "सुन रहा हूँ…",
    speakNow: "अब बोलिए",
    tapToStop: "बोलना खत्म होने पर माइक दबाएँ",
    tapToRetry: "दोबारा कोशिश के लिए माइक दबाएँ",
    nospeech: "कुछ सुनाई नहीं दिया। फिर से कोशिश करें।",
    denied: "माइक्रोफ़ोन की अनुमति बंद है। ब्राउज़र सेटिंग में अनुमति दें।",
    nomic: "इस डिवाइस में माइक्रोफ़ोन नहीं मिला।",
    network: "नेटवर्क त्रुटि। कनेक्शन जाँचकर फिर कोशिश करें।",
    unsupported: "इस ब्राउज़र में वॉइस सर्च नहीं चलता। Chrome इस्तेमाल करें।",
    close: "बंद करें",
  },
};

const LANG_CODE: Record<Locale, string> = {
  en: "en-IN",
  bn: "bn-IN",
  hi: "hi-IN",
};

// Brand colours taken from the Doctor Contact logo (blue + green)
const BRAND_BLUE = "#1C63E7";
const BRAND_GREEN = "#16A34A";
const BAR_COLORS = [BRAND_BLUE, BRAND_GREEN, BRAND_BLUE, BRAND_GREEN, BRAND_BLUE];

/**
 * "Listening…" card for voice search, branded with the Doctor Contact logo.
 * - Bottom sheet on phones, centred card on desktop (not full screen)
 * - Live transcript while the user speaks
 * - Logo with pulsing rings + brand-colour bars while listening
 * - Tap the mic to stop (or to retry after an error)
 * - Handles: no speech, mic blocked, no mic, network error, unsupported browser
 *
 * Reusable anywhere:
 *   <VoiceSearchOverlay open={open} onClose={() => setOpen(false)}
 *     locale={locale} onResult={(text) => { ...search... }} />
 */
export default function VoiceSearchOverlay({ open, onClose, onResult, locale = "en" }: Props) {
  const loc: Locale = locale === "bn" || locale === "hi" ? locale : "en";
  const t = TEXT[loc];

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");

  const recRef = useRef<any>(null);
  const sessionRef = useRef(0);
  const lastTextRef = useRef("");
  const errorRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => setMounted(true), []);

  const stopRecognition = useCallback(() => {
    sessionRef.current += 1; // invalidate callbacks of the old session
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      recRef.current?.abort();
    } catch {}
    recRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      setStatus("unsupported");
      return;
    }

    stopRecognition();
    const session = sessionRef.current;

    lastTextRef.current = "";
    errorRef.current = "";
    setTranscript("");
    setStatus("listening");

    const rec = new SR();
    rec.lang = LANG_CODE[loc];
    rec.interimResults = true; // live text while speaking
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      if (session !== sessionRef.current) return;
      let finalText = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      const full = `${finalText} ${interim}`.trim();
      lastTextRef.current = full;
      setTranscript(full);
    };

    rec.onerror = (event: any) => {
      if (session !== sessionRef.current) return;
      errorRef.current = event?.error || "";
    };

    rec.onend = () => {
      if (session !== sessionRef.current) return;
      recRef.current = null;

      const text = lastTextRef.current.trim();
      const err = errorRef.current;

      if (err === "not-allowed" || err === "service-not-allowed") {
        setStatus("denied");
      } else if (err === "audio-capture") {
        setStatus("nomic");
      } else if (err === "network") {
        setStatus("network");
      } else if (text) {
        setStatus("done");
        // short pause so the user sees what was understood
        timerRef.current = setTimeout(() => {
          if (session === sessionRef.current) onResultRef.current(text);
        }, 450);
      } else {
        setStatus("nospeech");
      }
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      setStatus("nospeech");
    }
  }, [loc, stopRecognition]);

  // Start when opened, clean up when closed
  useEffect(() => {
    if (open) {
      start();
    } else {
      stopRecognition();
      setStatus("idle");
      setTranscript("");
    }
    return () => stopRecognition();
  }, [open, start, stopRecognition]);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  function onMicClick() {
    if (status === "listening") {
      // stop -> recognition returns what it heard so far
      try {
        recRef.current?.stop();
      } catch {}
    } else if (status !== "done") {
      start();
    }
  }

  if (!open || !mounted) return null;

  const isListening = status === "listening";
  const isError =
    status === "nospeech" ||
    status === "denied" ||
    status === "nomic" ||
    status === "network" ||
    status === "unsupported";

  const heading = isListening
    ? transcript
      ? ""
      : t.listening
    : status === "done"
    ? ""
    : t[status as "nospeech" | "denied" | "nomic" | "network" | "unsupported"] ?? "";

  const hint = isListening
    ? transcript
      ? t.tapToStop
      : t.speakNow
    : isError && status !== "unsupported"
    ? t.tapToRetry
    : "";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice search"
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
    >
      <style>{`
        @keyframes vs-bounce {
          0%, 100% { height: 8px; }
          50% { height: 34px; }
        }
        @keyframes vs-ring {
          0% { transform: scale(1); opacity: .5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes vs-sheet {
          from { transform: translateY(32px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vs-anim { animation: none !important; }
        }
      `}</style>

      {/* dim backdrop — tap to close */}
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/45 backdrop-blur-[2px]"
      />

      {/* card */}
      <div
        className="vs-anim relative w-full overflow-hidden rounded-t-3xl border border-slate-100 bg-white shadow-[0_-12px_50px_-12px_rgba(15,27,51,0.35)] sm:max-w-md sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900"
        style={{ animation: "vs-sheet .28s ease-out" }}
      >
        {/* brand accent line */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GREEN})` }}
        />

        {/* header: logo + close */}
        <div className="flex items-center justify-between px-5 pt-4">
          <Image
            src="/LOGO.png"
            alt="Doctor Contact"
            width={130}
            height={36}
            className="h-7 w-auto max-w-[120px] object-contain dark:rounded-md dark:bg-white dark:px-1.5 dark:py-0.5"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 text-center">
          {/* logo with pulsing rings */}
          <div className="relative flex h-24 w-24 items-center justify-center">
            {isListening && (
              <>
                <span
                  className="vs-anim absolute inset-0 rounded-full"
                  style={{ backgroundColor: BRAND_BLUE, animation: "vs-ring 1.8s ease-out infinite" }}
                />
                <span
                  className="vs-anim absolute inset-0 rounded-full"
                  style={{ backgroundColor: BRAND_GREEN, animation: "vs-ring 1.8s ease-out .9s infinite" }}
                />
              </>
            )}
            <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700">
              <Image
                src="/logo-icon.png"
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* status / live text */}
          <div className="mt-5 flex min-h-[64px] max-h-32 w-full items-center justify-center overflow-y-auto" aria-live="polite">
            {transcript ? (
              <p className="text-xl font-semibold leading-snug text-slate-800 sm:text-2xl dark:text-white">
                {transcript}
              </p>
            ) : (
              <p
                className={`text-lg font-semibold sm:text-xl ${
                  isError
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-[#1C63E7] dark:text-blue-400"
                }`}
              >
                {heading}
              </p>
            )}
          </div>

          {/* brand-colour bars */}
          <div className="mt-2 flex h-9 items-center justify-center gap-1.5" aria-hidden="true">
            {BAR_COLORS.map((color, i) => (
              <span
                key={i}
                className="vs-anim w-1.5 rounded-full"
                style={{
                  backgroundColor: color,
                  height: 8,
                  animation: isListening
                    ? `vs-bounce 1s ease-in-out ${i * 0.12}s infinite`
                    : "none",
                }}
              />
            ))}
          </div>

          {/* mic button */}
          <button
            type="button"
            onClick={onMicClick}
            disabled={status === "done"}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            className="mt-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: isListening ? BRAND_GREEN : BRAND_BLUE }}
          >
            <Mic className="h-6 w-6" />
          </button>

          <p className="mt-2.5 min-h-[20px] text-xs font-medium text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}