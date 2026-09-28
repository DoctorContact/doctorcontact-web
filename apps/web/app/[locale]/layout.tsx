import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/lib/auth-context";
import QueryProvider from "@/components/QueryProvider";
import SocketProvider from "@/components/SocketProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// 🌟 Best SEO Metadata Setup
export const metadata: Metadata = {
  title: {
    default: "Doctor Contact - Find Doctors, Book Appointments & Track Live Queues",
    template: "%s | Doctor Contact", // অন্য পেজে গেলে অটোমেটিক নাম বসবে (যেমন: About | Doctor Contact)
  },
  description: "Doctor Contact is a leading Doctor Appointment & Clinic Management System. Find trusted doctors, check live queues, and book appointments easily.",
  keywords: ["Doctor Contact", "Book Doctor Appointment", "Find Clinics", "Live Doctor Queue", "Healthcare", "India"],
  metadataBase: new URL("https://www.doctorcontact.in"),
  alternates: {
    canonical: "/",
  },
  
  openGraph: {
    title: "Doctor Contact - Find Doctors & Book Appointments",
    description: "Find trusted doctors, check live queues, and book appointments easily.",
    url: "https://www.doctorcontact.in",
    siteName: "Doctor Contact",
    images: [
      {
        url: "/logo-full.png",
        width: 1200,
        height: 630,
        alt: "Doctor Contact Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor Contact",
    description: "Find trusted doctors and book appointments easily.",
    images: ["/logo-full.png"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  // 🌟 Google-কে আপনার ব্র্যান্ড সম্পর্কে বোঝানোর জন্য Structured Data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization", // সাধারণ Organization এর বদলে MedicalOrganization দিলে গুগলে র‍্যাংক করতে সুবিধা হবে
    "name": "Doctor Contact",
    "url": "https://www.doctorcontact.in/",
    "logo": "https://www.doctorcontact.in/logo-full.png",
    "description": "Doctor Contact helps patients find doctors, book appointments and track live queues.",
    "sameAs": [
      "https://www.facebook.com/doctorcontact", 
      "https://www.linkedin.com/company/doctorcontact"
    ]
  };

  return (
    <html
      lang={locale}
      className="h-full antialiased"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Google Schema Inject করা হলো */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <AuthProvider>
                <SocketProvider>
                  <Header />
                  <div className="flex-1">{children}</div>
                  <Footer />
                </SocketProvider>

                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "var(--toast-bg)",
                      color: "var(--toast-fg)",
                    },
                  }}
                />
              </AuthProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}