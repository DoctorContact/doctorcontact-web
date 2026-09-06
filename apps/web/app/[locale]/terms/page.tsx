import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TermsPage" });
  return { title: `${t("title")} · Doctor Contact` };
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("TermsPage");

  const sections = t.raw("sections") as { title: string; body: string[] }[];

  return (
    <main className="bg-white dark:bg-[var(--color-bg)]">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:py-16">
        <p className="text-sm font-medium text-[var(--color-secondary-dark-text)]">Doctor Contact</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-primary-dark-text)] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-ink-500">{t("lastUpdated")}</p>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-ink-600">{t("intro")}</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Table of contents */}
          <nav className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-ink-400">
              {t("onThisPage")}
            </p>
            <ul className="mt-3 space-y-2 border-l border-gray-200 pl-4 text-sm dark:border-soft-300">
              {sections.map((s, i) => (
                <li key={s.title}>
                  <a
                    href={`#${slugify(s.title)}`}
                    className="text-gray-500 hover:text-[var(--color-primary-text)] dark:text-ink-500"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <div className="max-w-2xl space-y-10">
            {sections.map((s, i) => (
              <section key={s.title} id={slugify(s.title)} className="scroll-mt-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-ink-900">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-[15px] leading-relaxed text-gray-600 dark:text-ink-600">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="scroll-mt-24 border-t border-gray-100 pt-8 dark:border-soft-200">
              <h2 className="text-lg font-bold text-gray-900 dark:text-ink-900">{t("contactHeading")}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600 dark:text-ink-600">
                {t("contactBody")}{" "}
                <a href="mailto:doctorcontact620@gmail.com" className="text-[var(--color-primary-text)] hover:underline">
                  doctorcontact620@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
