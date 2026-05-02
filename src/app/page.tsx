"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { useLandingPage } from "@/hooks/useLandingPage";

// Lazy load below-fold components to reduce initial JS bundle (~60% reduction)
const Countdown = dynamic(() => import("@/components/Countdown"));
const Features = dynamic(() => import("@/components/Features"));
const Categories = dynamic(() => import("@/components/Categories"));
const Courses = dynamic(() => import("@/components/Courses"));
const HowItWorks = dynamic(() => import("@/components/Testimonials"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const Contact = dynamic(() => import("@/components/Contact"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  const { data, isLoading, error } = useLandingPage();

  return (
    <>
      <Header />
      <main>
        <Hero data={data?.hero} />
        <Countdown />
        <Features data={data?.features} />
        <Categories />
        <Courses />
        <HowItWorks />
        <FAQ data={data?.faq} />
        <Contact settings={data?.settings} />
      </main>
      <Footer />
    </>
  );
}
