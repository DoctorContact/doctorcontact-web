import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import HomeQuickLinks from "@/components/HomeQuickLinks";
import FeaturedDoctors from "@/components/FeaturedDoctors";
import AllDoctors from "@/components/AllDoctors";
import Treatments from "@/components/Treatments";
import FeaturedClinics from "@/components/FeaturedClinics";
import AllClinics from "@/components/AllClinics";
import LabsAmbulance from "@/components/LabsAmbulance";
import TrustBar from "@/components/TrustBar";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-white dark:bg-[var(--color-bg)]">
      <Hero />
      <HomeQuickLinks />
      <FeaturedDoctors />
      <AllDoctors />
      <Treatments />
      <FeaturedClinics />
      <AllClinics />
      <LabsAmbulance />
      <TrustBar />
    </main>
  );
}
