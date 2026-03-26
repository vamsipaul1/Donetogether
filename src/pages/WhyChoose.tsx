import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const features = [
  {
    title: "Impact-Driven Solutions",
    description: "Every product we build is custom-crafted to create real business impact.",
  },
  {
    title: "Fast & Reliable Delivery",
    description: "Get high-quality results in days or weeks, not months.",
  },
  {
    title: "Transparent & Fair Pricing",
    description: "Honest, customized pricing with no hidden fees or surprises.",
  },
  {
    title: "Expert Problem Solvers",
    description: "We tackle technical and creative challenges with innovative solutions.",
  },
  {
    title: "Seamless Collaboration",
    description: "Clear communication and feedback at every stage of the project.",
  },
  {
    title: "Direct Access to Top Talent",
    description: "Work directly with senior experts—no long-term hiring needed.",
  },
];

export default function WhyChoose() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="pt-28">
        <section className="relative isolate py-20 sm:py-24">
          <div className="mx-auto w-full max-w-section px-6 sm:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={fadeUp}
              className="mx-auto max-w-hero text-center"
            >
              <h1 className="font-satoshi text-2xl sm:text-[30px] leading-[1.2] font-black tracking-[-0.02em] text-slate-900">
                Why Choose DoneTogether?
              </h1>
              <p className="mt-4 text-body text-slate-600 leading-[1.7]">
                Discover the advantages of partnering with a team that’s built for results and client success.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={{
                    ...fadeUp,
                    visible: {
                      ...fadeUp.visible,
                      transition: { duration: 0.55, delay: index * 0.06, ease: "easeOut" },
                    },
                  }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]" />

                  <h3 className="mt-6 font-satoshi text-h3 font-bold tracking-[-0.01em] text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[360px] text-body text-slate-600 leading-[1.7]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
