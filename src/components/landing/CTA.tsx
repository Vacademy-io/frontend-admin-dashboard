'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from '@tanstack/react-router';
import { Zap } from 'lucide-react';

export function CTA() {
  const router = useRouter();

  return (
    <section className="bg-slate-800">
        <div className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <Zap className="mx-auto h-12 w-12 text-orange-400" />
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Ready to Supercharge Your Presentations?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                        Join thousands of educators and professionals who are transforming their sessions with Volt.
                    </p>
                    <div className="mt-8">
                        <Button
                            size="lg"
                            onClick={() => router.navigate({ to: '/signup' })}
                            className="bg-orange-500 text-white hover:bg-orange-400 shadow-lg transition-transform hover:scale-105 px-8 py-3 text-base"
                        >
                            Sign Up for Free
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>
  );
} 