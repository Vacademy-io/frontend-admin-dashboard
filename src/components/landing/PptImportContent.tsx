import { motion } from 'framer-motion';
import { File, ArrowRight, Layers } from 'lucide-react';

export const PptImportContent = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.4,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-4 overflow-hidden">
            <motion.div
                className="flex items-center justify-center gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* PPT Icon */}
                <motion.div
                    className="flex flex-col items-center gap-2"
                    variants={itemVariants}
                >
                    <File className="w-16 h-16 md:w-20 md:h-20 text-orange-500" />
                    <span className="text-xs font-bold text-slate-600">My Deck.pptx</span>
                </motion.div>

                {/* Arrow */}
                <motion.div variants={itemVariants}>
                    <ArrowRight className="w-10 h-10 md:w-12 md:h-12 text-slate-400 shrink-0" />
                </motion.div>

                {/* Volt Slides */}
                <motion.div
                    className="relative w-20 h-20 md:w-24 md:h-24"
                    variants={itemVariants}
                >
                    <motion.div
                        className="absolute top-0 left-0 w-14 h-14 md:w-16 md:h-16 bg-white rounded-lg shadow-md flex items-center justify-center border border-slate-200"
                        animate={{ y: [0, -4, 0], x: [0, -2, 0], rotate: -3 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Layers className="w-7 h-7 md:w-8 md:h-8 text-blue-500" />
                    </motion.div>
                    <motion.div
                        className="absolute top-2 left-2 md:top-4 md:left-4 w-14 h-14 md:w-16 md:h-16 bg-white rounded-lg shadow-lg flex items-center justify-center border border-slate-200"
                        animate={{ y: [0, 5, 0], x: [0, 3, 0], rotate: 5 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Layers className="w-7 h-7 md:w-8 md:h-8 text-purple-500" />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}; 