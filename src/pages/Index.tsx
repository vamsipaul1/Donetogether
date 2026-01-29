import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Moon, Sun, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Background Overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/20 dark:bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main className="relative z-10">
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
