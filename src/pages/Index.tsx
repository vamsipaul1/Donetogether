import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

import HowItWorksSection from '@/components/HowItWorksSection';

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900 overflow-x-hidden">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
