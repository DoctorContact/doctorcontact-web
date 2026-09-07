"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Phone, Mail, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navbar");
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/1HCYWu5cD6/",
      hover:
        "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-[#1877F2]/20",
      icon: (
        <svg
          className="h-[17px] w-[17px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      ),
    },
  {
  name: "Instagram",
  href: "https://www.instagram.com/doctorcontact",
  hover:
    "hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] hover:shadow-[0_8px_20px_rgba(225,48,108,0.25)]",
  icon: (
    <svg
      className="h-[17px] w-[17px]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1.2"
        fill="currentColor"
      />
    </svg>
  ),
},
    {
      name: "X (Twitter)",
      href: "https://x.com/doctorcontact",
      hover:
        "hover:bg-black hover:text-white hover:border-black hover:shadow-black/20",
      icon: (
        <svg
          className="h-[16px] w-[16px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp Channel",
      href: "https://whatsapp.com/channel/0029VbD9j5D6RGJNznPtrY0m",
      hover:
        "hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:shadow-[#25D366]/20",
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@doctorcontact",
      hover:
        "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] hover:shadow-[#FF0000]/20",
      icon: (
        <svg
          className="h-[17px] w-[17px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/doctorcontact",
      hover:
        "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] hover:shadow-[#0A66C2]/20",
      icon: (
        <svg
          className="h-[17px] w-[17px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-surface">
      {/* Premium background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl dark:bg-blue-900/10" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-indigo-100/20 blur-3xl dark:bg-indigo-900/10" />
      </div>

      {/* Main Footer */}
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1.2fr] lg:gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src="/logo-icon.png"
                  alt="Doctor Contact"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Healthcare Platform
                </p>

                <p className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Doctor Contact
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
              {t("tagline")}
            </p>

            {/* Social */}
            <div className="pt-1">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Connect with us
              </p>

              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className={`group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 ${social.hover}`}
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Platform */}
          <FooterCol
            title={t("platformHeading")}
            links={[
              { label: nav("findDoctor"), href: "/doctors" },
              { label: nav("forClinics"), href: "/clinics" },
              { label: nav("howItWorks"), href: "/#how" },
            ]}
          />

          {/* Company */}
          <FooterCol
            title={t("companyHeading")}
            links={[
              { label: t("aboutUs"), href: "/about" },
              { label: t("privacyPolicy"), href: "/privacy" },
              { label: t("termsConditions"), href: "/terms" },
            ]}
          />

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-sm font-bold text-slate-900 dark:text-white">
              {t("helpHeading")}
            </h4>

            <div className="space-y-2">
              {/* Email */}
              <a
                href="mailto:doctorcontact620@gmail.com"
                className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 -ml-2.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Mail className="h-4 w-4" />
                </span>

                <span className="min-w-0">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Email
                  </span>

                  <span className="block truncate text-sm font-medium text-slate-600 transition-colors group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                    doctorcontact620@gmail.com
                  </span>
                </span>
              </a>

              {/* Phone */}
              <a
                href="tel:+91861707063697"
                className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 -ml-2.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Phone className="h-4 w-4" />
                </span>

                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Phone
                  </span>

                  <span className="block text-sm font-medium text-slate-600 transition-colors group-hover:text-emerald-600 dark:text-slate-300 dark:group-hover:text-emerald-400">
                    +91 86170 70636 97
                  </span>
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/+919883961687"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 -ml-2.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#20b958]">
                  <svg
                    className="h-[17px] w-[17px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </span>

                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    WhatsApp
                  </span>

                  <span className="block text-sm font-medium text-slate-600 transition-colors group-hover:text-[#20b958] dark:text-slate-300">
                    WhatsApp us
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dewasi Group Partnership */}
      <div className="relative border-y border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            {/* Dewasi Group */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src="/main.png"
                  alt="Dewasi Group"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="leading-tight">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  An initiative by
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-white">
                  Dewasi Group
                </p>
              </div>
            </div>

            {/* Elegant connector */}
            <div className="flex items-center gap-3">
              <span className="hidden h-px w-10 bg-slate-200 sm:block dark:bg-slate-700" />

              <div className="flex h-7 items-center rounded-full border border-slate-200 bg-white px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                Healthcare
              </div>

              <span className="hidden h-px w-10 bg-slate-200 sm:block dark:bg-slate-700" />
            </div>

            {/* Doctor Contact */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src="/logo-icon.png"
                  alt="Doctor Contact"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="leading-tight">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Powered platform
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-white">
                  Doctor Contact
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative bg-white dark:bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

              <p>
                © {year} Dewasi Group. {t("copyright")}
              </p>
            </div>

            {/* Legal + Developer */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
              <Link
                href="/privacy"
                className="font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                {t("privacyPolicy")}
              </Link>

              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />

              <Link
                href="/terms"
                className="font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                {t("termsConditions")}
              </Link>

              <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />

              <span className="text-slate-400 dark:text-slate-500">
                {t("developedBy")}{" "}
                <a
                  href="https://soumyachatterjee.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                >
                  Soumya Chatterjee
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h4>

      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group flex items-center justify-between rounded-lg py-2 text-sm text-slate-500 transition-all duration-200 hover:pl-1 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <span>{link.label}</span>

              <ArrowUpRight className="h-3.5 w-3.5 translate-x-[-5px] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}