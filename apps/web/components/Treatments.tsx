"use client";

import { ArrowRight, Leaf, Pill, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import SectionHeader from "@/components/SectionHeader";

const TREATMENTS = [
  {
    name: "Homeopathy",
    desc: "Natural healing for a healthier you",
    icon: Leaf,
    image: "/assets/home/treatment-homeopathy.jpg",
    bg: "bg-[#F0FDF4]/90",
    border: "border-[#DCFCE7]",
    hoverBorder: "hover:border-[#16A34A]/50",
    textColor: "text-[#166534]",
    btnColor: "bg-[#16A34A]",
  },
  {
    name: "Allopathy",
    desc: "Evidence-based modern treatment",
    icon: Pill,
    image: "/assets/home/treatment-allopathy.jpg",
    bg: "bg-[#EFF6FF]/90",
    border: "border-[#DBEAFE]",
    hoverBorder: "hover:border-[#1C63E7]/50",
    textColor: "text-[#1E40AF]",
    btnColor: "bg-[#1C63E7]",
  },
  {
    name: "Ayurveda",
    desc: "Traditional care for lasting wellness",
    icon: Sparkles,
    image: "/assets/home/treatment-ayurveda.jpg",
    bg: "bg-[#FFFBEB]/90",
    border: "border-[#FEF3C7]",
    hoverBorder: "hover:border-[#D97706]/50",
    textColor: "text-[#92400E]",
    btnColor: "bg-[#D97706]",
  },
];

export default function Treatments() {
  return (
    <section id="treatments" className="mx-auto max-w-7xl px-5 py-3.5 sm:py-4.5 lg:px-8">
      <SectionHeader
        title="Treatments"
        subtitle="Choose the right approach for your health"
      />

      <div className="grid gap-5 md:grid-cols-3">
        {TREATMENTS.map(
          ({
            name,
            desc,
            icon: Icon,
            image,
            bg,
            border,
            hoverBorder,
            textColor,
            btnColor,
          }) => (
            <Link
              key={name}
              href={`/doctors?treatment=${encodeURIComponent(name)}`}
              className={`group flex items-center gap-3.5 rounded-2xl border ${border} ${bg} p-4 shadow-sm transition-all duration-300 ${hoverBorder} hover:shadow-md dark:border-soft-300 dark:bg-surface`}
            >
              {/* Image thumbnail */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm">
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Title & Description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${textColor}`} />
                  <h3 className={`text-base font-bold ${textColor} dark:text-ink-900`}>
                    {name}
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-ink-600">
                  {desc}
                </p>
              </div>

              {/* Action Button */}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5 ${btnColor}`}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
