import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="w-full bg-[#f7f8f9] dark:bg-zinc-950 py-32 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 text-center">

        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-black dark:text-white mb-6">
          Ready to build your next project together?
        </h2>

        <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-12 font-light">
          Join thousands of students turning ideas into reality.
        </p>

        {/* Button */}
        <div>
          <Link to="/signup">
            <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-sm font-medium rounded-md hover:opacity-90 transition-all shadow-lg active:scale-95">
              ▪ Get Started Now
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
