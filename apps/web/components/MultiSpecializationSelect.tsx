"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface SpecializationOption {
  id: string;
  name: string;
  nameEn?: string;
  isActive?: boolean;
}

interface Props {
  /** Full list of specializations (from GET /specializations). */
  options: SpecializationOption[];
  /** Selected specialization IDs. */
  value: string[];
  /** Called with the new list of selected IDs. */
  onChange: (ids: string[]) => void;
  placeholder?: string;
  /** Extra classes for the trigger box (to match surrounding inputs). */
  className?: string;
}

const labelOf = (s: SpecializationOption) => s.nameEn || s.name;

/**
 * Pick MANY specializations for one doctor (e.g. Gynecologist + General Physician).
 * - Selected ones show as removable chips.
 * - Click the box to open the list, type to filter, click to toggle.
 */
export default function MultiSpecializationSelect({
  options,
  value,
  onChange,
  placeholder = "Select one or more specializations",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const activeOptions = useMemo(
    () => (options || []).filter((o) => o?.isActive !== false),
    [options]
  );

  const selected = useMemo(
    () =>
      value
        .map((id) => (options || []).find((o) => o.id === id))
        .filter(Boolean) as SpecializationOption[],
    [value, options]
  );

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return activeOptions;
    return activeOptions.filter((o) => labelOf(o).toLowerCase().includes(q));
  }, [activeOptions, text]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setText("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`flex min-h-[46px] w-full cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 ${
          open ? "border-[#252a67] ring-[3px] ring-[#252a67]/15" : ""
        } ${className}`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-sm font-medium text-gray-400 dark:text-slate-500">
              {placeholder}
            </span>
          ) : (
            selected.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-lg bg-[#14B8A6]/10 px-2 py-1 text-xs font-bold text-[#0f766e] dark:bg-[#14B8A6]/20 dark:text-teal-300"
              >
                {labelOf(s)}
                <button
                  type="button"
                  aria-label={`Remove ${labelOf(s)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(s.id);
                  }}
                  className="rounded-full p-0.5 hover:bg-[#14B8A6]/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_-18px_rgba(15,27,51,0.28)] dark:border-slate-700 dark:bg-slate-900">
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search specialization..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-[#252a67] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="max-h-56 overflow-y-auto" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                No specialization found
              </p>
            ) : (
              filtered.map((o) => {
                const isSelected = value.includes(o.id);
                return (
                  <button
                    type="button"
                    key={o.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(o.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isSelected ? "bg-[#14B8A6]/10" : ""
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? "border-[#14B8A6] bg-[#14B8A6] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        isSelected
                          ? "font-bold text-[#0f766e] dark:text-teal-300"
                          : "font-semibold text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {labelOf(o)}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selected.length > 0 && (
            <div className="mt-1.5 flex items-center justify-between border-t border-slate-100 px-2 pt-2 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] font-bold text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}