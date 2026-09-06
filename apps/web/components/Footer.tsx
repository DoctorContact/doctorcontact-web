"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Stethoscope, Phone, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

const CONTACT_PHONE_DISPLAY = "861707063697";
const CONTACT_PHONE_TEL = "+91861707063697";
const CONTACT_WHATSAPP_CHAT = "https://wa.me/91861707063697";
const CONTACT_EMAIL = "doctorcontact620@gmail.com";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1HCYWu5cD6/",
    hoverClass: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    icon: FacebookIcon,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/doctorcontact?igsh=bnN1eHltanRlY2J6",
    hoverClass: "hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:border-transparent",
    icon: InstagramIcon,
  },
  {
    name: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029VbD9j5D6RGJNznPtrY0m",
    hoverClass: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    icon: WhatsAppIcon,
  },
  {
    // TODO: no X (Twitter) profile link provided yet — swap this "#" for the real handle URL.
    name: "X",
    href: "#",
    hoverClass: "hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black",
    icon: XIcon,
  },
];

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navbar");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white dark:border-soft-300 dark:bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
                <Stethoscope className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-[var(--color-primary-dark-text)]">Doctor Contact</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-ink-500">{t("tagline")}</p>

            {/* Social row */}
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ name, href, hoverClass, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target={href === "#" ? undefined : "_blank"}
                  rel={href === "#" ? undefined : "noopener noreferrer"}
                  aria-label={name}
                  title={name}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors dark:border-soft-300 dark:text-ink-500 ${hoverClass}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title={t("platformHeading")}
            links={[
              { label: nav("findDoctor"), href: "/doctors" },
              { label: nav("forClinics"), href: "/clinics" },
              { label: nav("howItWorks"), href: "/#how" },
            ]}
          />

          <FooterCol
            title={t("companyHeading")}
            links={[
              { label: t("aboutUs"), href: "/about" },
              { label: t("privacyPolicy"), href: "/privacy" },
              { label: t("termsConditions"), href: "/terms" },
            ]}
          />

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-ink-800">{t("helpHeading")}</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-ink-500">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-1.5 hover:text-[var(--color-primary-text)]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="flex items-center gap-1.5 hover:text-[var(--color-primary-text)]">
                  <Phone className="h-3.5 w-3.5" />
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_WHATSAPP_CHAT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-green-600 dark:hover:text-green-400"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Group brand strip */}
      <div className="border-t border-gray-100 bg-[var(--color-bg-soft)] dark:border-soft-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/dewasi-group-logo.png"
              alt="Dewasi Group"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md object-contain"
            />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-ink-400">{t("groupLine")}</p>
              <p className="text-sm font-semibold text-[var(--color-primary-dark-text)]">Dewasi Group</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300 dark:text-ink-300" aria-hidden="true">
            <span className="h-px w-6 bg-gray-200 dark:bg-soft-300" />
            <span className="text-xs">×</span>
            <span className="h-px w-6 bg-gray-200 dark:bg-soft-300" />
          </div>

          <Image src="/logo-icon.png" alt="Doctor Contact" width={36} height={36} className="h-9 w-9 rounded-md object-contain" />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-soft-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-6 text-xs text-gray-400 sm:flex-row sm:justify-between dark:text-ink-400">
          <span>
            &copy; {year} Dewasi Group. {t("copyright")}
          </span>

          <span className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
            <span>
              {t("developedBy")}{" "}
              <a
                href="https://soumyachatterjee.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-500 underline decoration-dotted underline-offset-2 hover:text-[var(--color-primary-text)] dark:text-ink-500 dark:hover:text-[var(--color-primary-text)]"
              >
                Soumya Chatterjee
              </a>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-ink-800">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-500 dark:text-ink-500">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-[var(--color-primary-text)] dark:hover:text-[var(--color-primary-text)]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Brand glyphs — kept as inline SVG (not lucide-react) since recent lucide
   versions no longer ship trademarked brand/social icons. */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.4.5.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.5.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.4-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.5.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.4-.5-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.5-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.4.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .5-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.2.7-.3.3-.6.7-.7 1.2-.1.3-.3.9-.4 1.9-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.4 1.9.2.5.4.8.7 1.2.3.3.7.6 1.2.7.3.1.9.3 1.9.4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.2-.7.3-.3.6-.7.7-1.2.1-.3.3-.9.4-1.9.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.7-1.2a2.9 2.9 0 0 0-1.2-.7c-.3-.1-.9-.3-1.9-.4-1.3-.1-1.7-.1-4.8-.1Zm0 3.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 1.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm4.6-2a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.2 22H2l7.7-8.9L1.5 2h6.7l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.2A9.8 9.8 0 0 0 3.4 17l-1.2 4.8 4.9-1.3a9.8 9.8 0 1 0 4.9-18.3Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .2-1.1-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
