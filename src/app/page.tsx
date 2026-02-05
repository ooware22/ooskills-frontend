"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import Courses from "@/components/Courses";
import HowItWorks from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLandingPage } from "@/hooks/useLandingPage";

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
