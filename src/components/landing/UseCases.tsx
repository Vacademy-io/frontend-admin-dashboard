'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const useCases = {
  educators: {
    title: 'For Educators',
    icon: GraduationCap,
    points: [
      'Boost classroom participation with live polls.',
      'Create formative assessments in seconds.',
      'Get real-time feedback on student understanding.',
      'Flip your classroom with engaging pre-recorded sessions.',
    ],
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  corporate: {
    title: 'For Corporate Trainers',
    icon: Briefcase,
    points: [
      'Energize your workshops and training sessions.',
      'Onboard new hires effectively and measure comprehension.',
      'Gather instant feedback during all-hands meetings.',
      'Create a library of interactive training materials.',
    ],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
};

type UseCaseCategory = 'educators' | 'corporate';

export function UseCases() {
  const [activeTab, setActiveTab] = useState<UseCaseCategory>('educators');
  const activeData = useCases[activeTab];

  return (
    <section className="bg-white">
      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-orange-600">Use Cases</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Designed for Your Environment
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    Whether in a classroom or a boardroom, Volt adapts to your needs, fostering interaction and enhancing learning everywhere.
                </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex space-x-1 rounded-full bg-slate-100 p-1">
                {Object.keys(useCases).map((key) => {
                  const category = key as UseCaseCategory;
                  const { icon: Icon, title } = useCases[category];
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveTab(category)}
                      className={cn(
                        'relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                        activeTab === category
                          ? 'text-slate-800'
                          : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {activeTab === category && (
                        <motion.div
                          layoutId="active-use-case-pill"
                          className="absolute inset-0 rounded-full bg-white shadow-md"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="pr-0 lg:pr-8">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">{activeData.title}</h3>
                            <ul className="space-y-4">
                                {activeData.points.map((point, i) => (
                                    <motion.li 
                                        key={i} 
                                        className="flex items-start gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                    >
                                        <CheckCircle className="h-6 w-6 text-orange-500 mt-1 shrink-0" />
                                        <span className="text-slate-600 text-lg">{point}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        <div className="h-80 lg:h-96 w-full overflow-hidden rounded-2xl shadow-xl">
                            <img 
                                src={activeData.image} 
                                alt={activeData.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </section>
  );
} 