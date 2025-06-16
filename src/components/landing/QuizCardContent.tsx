import { motion } from 'framer-motion';
import { Check, Send } from 'lucide-react';

const quiz = {
  question: "What is the primary benefit of using Volt for presentations?",
  options: [
    "It's free",
    "It supports offline mode",
    "It fosters active audience engagement",
    "It has the most slide templates",
  ],
  correctAnswer: 2,
};

export const QuizCardContent = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
            <div
                className="relative w-[280px] h-[500px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-slate-800"
            >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-lg"></div>

                <div className="p-6 pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Question 1 of 5</p>
                        <h2 className="mt-2 text-lg font-bold text-slate-800 leading-tight">
                            {quiz.question}
                        </h2>
                    </motion.div>
                    
                    <motion.div 
                        className="mt-6 space-y-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.2, delayChildren: 0.5 }
                            }
                        }}
                    >
                        {quiz.options.map((option, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                            >
                                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-slate-300 flex items-center justify-center mr-3">
                                    {index === quiz.correctAnswer && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                                </div>
                                <span className="text-sm text-slate-700">{option}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
                 {/* Bottom bar */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            placeholder="Ask a follow-up..."
                            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button className="bg-orange-500 text-white rounded-full p-2">
                            <Send size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 