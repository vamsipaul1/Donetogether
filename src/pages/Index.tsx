import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

import HowItWorksSection from '@/components/HowItWorksSection';
import UnifiedWorkspaceSection from '@/components/UnifiedWorkspaceSection';
import FAQSection from '@/components/FAQSection';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Don't try to query select Supabase auth tokens as they cause SyntaxErrors
      if (location.hash.includes('access_token=') || location.hash.includes('error=')) {
        return;
      }
      try {
        const element = document.querySelector(location.hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (e) {
        // Ignore invalid selector errors
        console.warn("Invalid hash selector:", location.hash);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 overflow-x-hidden dotted-pattern">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <UnifiedWorkspaceSection />
        <HowItWorksSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};


export default Index;
