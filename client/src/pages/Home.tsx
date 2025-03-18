import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Faq from "@/components/landing/Faq";
import WaitlistForm from "@/components/landing/WaitlistForm";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased bg-light text-dark">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Faq />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
}
