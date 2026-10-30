"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Stethoscope, X } from "lucide-react";
import { api } from "@/lib/api";

interface Specialization {
  id: string;
  name: string;
  isActive?: boolean;
}

interface Props {
  /** Currently applied search query (shared with the main search box). */
  value: string;
  /** Called with the specialization name, or "" when cleared. */
  onChange: (name: string) => void;
}

/**
 * Specialization picker for the /doctors page.
 * - Loads the full list from the backend (GET /specializations) — nothing hardcoded.
 * - Click to see every specialization, or type to filter / auto-complete.
 * - Selecting one applies it as the doctor search query.
 */
export default function SpecializationCombobox({ value, onChange }: Props) {
  const [items, setItems] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/specializations")
      .then((res) => {
        const list = res.data?.data?.specializations;
        if (mounted) setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => mounted && setItems([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const activeItems = useMemo(
    () => items.filter((s) => s?.isActive !== false),
    [items]
  );

  // Which specialization (if any) matches the current applied query exactly
  const selected = useMemo(
    () =>
      activeItems.find(
        (s) => s.name.toLowerCase() === value.trim().toLowerCase()
      ) ?? null,
    [activeItems, value]
  );

  // Keep the input in sync when the query changes from elsewhere
  // (URL ?specialty=, "Try:" chips, main search box)
  useEffect(() => {
    if (!typing) setText(selected?.name ?? "");
  }, [selected, typing]);

  const filtered = useMemo(() => {
    const q = typing ? text.trim().toLowerCase() : "";
    if (!q) return activeItems;
    const starts = activeItems.filter((s) => s.name.toLowerCase().startsWith(q));
    const contains = activeItems.filter(
      (s) => !s.name.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q)
    );
    return [...starts, ...contains];
  }, [activeItems, text, typing]);

  useEffect(() => setActive(0), [text, open]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setTyping(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function pick(name: string) {
    onChange(name);
    setText(name);
    setTyping(false);
    setOpen(false);
  }

  function clear() {
    onChange("");
    setText("");
    setTyping(false);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[active]) pick(filtered[active].name);
    } else if (e.key === "Escape") {
      setOpen(false);
      setTyping(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-slate-200/90 bg-slate-50/75 px-3.5 py-3 transition-all duration-200 focus-within:border-[#14B8A6]/45 focus-within:bg-white focus-within:shadow-[0_5px_20px_-12px_rgba(20,184,166,0.3)] dark:border-slate-700 dark:bg-slate-800/70 dark:focus-within:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#252a67] to-[#14B8A6] text-white shadow-sm">
          <Stethoscope className="h-[17px] w-[17px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
            Specialization
          </p>
          <input
            type="text"
            value={text}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setText(e.target.value);
              setTyping(true);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder="Choose or type a specialization..."
            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
          />
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#14B8A6]" />
        ) : selected || text ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear specialization"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {open && !loading && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_-18px_rgba(15,27,51,0.28)] dark:border-slate-700 dark:bg-slate-900">
          <div className="max-h-64 overflow-y-auto" role="listbox">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                No specialization found
              </p>
            ) : (
              filtered.map((s, i) => {
                const isSelected = selected?.id === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(s.name)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      i === active
                        ? "bg-slate-50 dark:bg-slate-800"
                        : ""
                    } ${isSelected ? "bg-[#14B8A6]/8" : ""}`}
                  >
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        isSelected
                          ? "font-bold text-[#0f766e]"
                          : "font-semibold text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {s.name}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-[#14B8A6]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}