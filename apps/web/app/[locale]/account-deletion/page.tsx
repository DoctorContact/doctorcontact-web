import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Account and Data Deletion · Doctor Contact",
};

export default async function AccountDeletionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-white dark:bg-[var(--color-bg)]">
      <div className="mx-auto max-w-4xl px-5 py-14 sm:py-16">
        <p className="text-sm font-medium text-[var(--color-secondary-dark-text)]">Doctor Contact</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-primary-dark-text)] sm:text-4xl">
          Account and Data Deletion Request
        </h1>
        
        <div className="mt-8 space-y-10 text-[15px] leading-relaxed text-gray-600 dark:text-ink-600">
          <p className="text-base">
            At <strong>Doctor Contact</strong>, we respect your privacy and give you full control over your personal data.
          </p>
          
          <section>
            <h3 className="text-xl font-bold text-gray-900 dark:text-ink-900 mb-4">How to Request Account Deletion</h3>
            <p className="mb-3">To request the deletion of your account and all associated personal data, please follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Send an email to <strong>doctorcontact620@gmail.com</strong> with the subject line: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Account Deletion Request</code>.</li>
              <li>Provide your registered <strong>phone number</strong> or <strong>email address</strong> associated with your Doctor Contact account.</li>
              <li>Our support team will verify your identity and process your deletion request within <strong>30 days</strong>.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 dark:text-ink-900 mb-4">What Data Will Be Deleted</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal details (Full Name, Phone Number, Email, Gender, Date of Birth, Address).</li>
              <li>Authentication credentials and login tokens.</li>
              <li>App preferences and search history.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 dark:text-ink-900 mb-4">What Data May Be Retained</h3>
            <p>Completed appointment transaction logs and healthcare service records may be retained for up to <strong>90 days</strong> (or as strictly required by applicable healthcare and taxation regulations) before permanent removal.</p>
          </section>

          <section className="border-t border-gray-100 pt-8 dark:border-soft-200">
            <p>If you have any questions, contact us at <a href="mailto:doctorcontact620@gmail.com" className="text-[var(--color-primary-text)] hover:underline font-medium">doctorcontact620@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}