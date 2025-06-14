'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from '@tanstack/react-router';
import { Zap, Mic, Bot, BarChart } from 'lucide-react';

export function Hero() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative bg-slate-50 overflow-hidden">
      <div className="pt-32 pb-20 px-4 sm:px-0">
        <div className="container mx-auto sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div
              variants={itemVariants}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-sm font-medium text-orange-600"
            >
              <Zap className="h-4 w-4" />
              <span>Presentations, Reimagined</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
            >
              Turn Passive Lectures into
              <br />
              <span className="relative inline-block px-2">
                <span className="absolute inset-0 -skew-x-12 bg-orange-500" />
                <span className="relative text-white">Active Experiences</span>
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 px-4 sm:px-0"
            >
              Volt is the AI-powered live presentation platform that makes learning active and engaging. Create interactive content in seconds and get real-time feedback from your audience.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0"
            >
              <Button
                size="lg"
                onClick={() => router.navigate({ to: '/signup/onboarding', search: { assess: true, lms: true } })}
                className="w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 shadow-lg transition-transform hover:scale-105"
              >
                Get Started for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
              >
                See Features
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Animated background icons */}
          <motion.div
              className="absolute inset-0 z-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
          >
              <motion.div variants={itemVariants} className="absolute top-1/4 left-1/4 text-orange-100 -translate-x-1/2 -translate-y-1/2">
                  <Bot size={64} />
              </motion.div>
              <motion.div variants={itemVariants} className="absolute top-1/2 right-1/4 text-blue-100">
                  <Mic size={48} />
              </motion.div>
               <motion.div variants={itemVariants} className="absolute bottom-1/4 right-1/3 text-green-100">
                  <BarChart size={56} />
              </motion.div>
               <motion.div variants={itemVariants} className="absolute bottom-1/3 left-1/3 text-purple-100">
                  <Zap size={40} />
              </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 