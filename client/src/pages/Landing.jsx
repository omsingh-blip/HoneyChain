import Navbar from "../components/layout/Navbar";
import Hero from "../components/layout/Hero";
import Features from "../components/sections/Features";
import HowItWorks from "../components/sections/HowItWorks";
import DashboardPreview from "../components/sections/DashboardPreview";
import Footer from "../components/layout/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardPreview />
      </main>

      <Footer />
    </div>
  );
}
