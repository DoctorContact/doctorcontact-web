import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import HomeQuickLinks from "@/components/HomeQuickLinks";
import FeaturedDoctors from "@/components/FeaturedDoctors";
import AllDoctors from "@/components/AllDoctors";
import Treatments from "@/components/Treatments";
import FeaturedClinics from "@/components/FeaturedClinics";
import AllClinics from "@/components/AllClinics";
import OnlinePharmacyClinics from "@/components/OnlinePharmacyClinics";
import LazySection from "@/components/LazySection";
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
      <LazySection><FeaturedDoctors /></LazySection>
      <LazySection loadAfter={1500}><AllDoctors /></LazySection>
      <Treatments />
      <LazySection loadAfter={3000}><FeaturedClinics /></LazySection>
      <LazySection loadAfter={4500}><AllClinics /></LazySection>
      <LazySection loadAfter={6000}><OnlinePharmacyClinics /></LazySection>
      <LabsAmbulance />
      <TrustBar />
    </main>
  );
}
