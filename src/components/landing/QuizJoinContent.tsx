import { motion } from 'framer-motion';
import { QrCode, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

const quiz = {
  question: "What is the primary benefit of using Volt?",
  options: [
    "It fosters active audience engagement",
    "It's free",
    "It supports offline mode",
  ],
  correctAnswer: 0,
};

const MockQrCode = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="30" height="30" fill="black"/>
        <rect x="70" width="30" height="30" fill="black"/>
        <rect y="70" width="30" height="30" fill="black"/>
        <rect x="10" y="10" width="10" height="10" fill="white"/>
        <rect x="80" y="10" width="10" height="10" fill="white"/>
        <rect x="10" y="80" width="10" height="10" fill="white"/>
        <rect x="40" y="0" width="10" height="10" fill="black"/>
        <rect x="60" y="20" width="10" height="10" fill="black"/>
        <rect x="0" y="40" width="10" height="10" fill="black"/>
        <rect x="20" y="60" width="10" height="10" fill="black"/>
        <rect x="40" y="40" width="20" height="20" fill="black"/>
        <rect x="70" y="40" width="10" height="10" fill="black"/>
        <rect x="40" y="70" width="10" height="10" fill="black"/>
        <rect x="90" y="60" width="10" height="10" fill="black"/>
        <rect x="70" y="90" width="10" height="10" fill="black"/>
        <rect x="90" y="90" width="10" height="10" fill="black"/>
    </svg>
);

export const QuizJoinContent = () => {
    const [animationState, setAnimationState] = useState('laptop');

    useEffect(() => {
        const sequence = ['laptop', 'mobile', 'hidden'];
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % sequence.length;
            const nextState = sequence[currentIndex];
            if (nextState) {
                setAnimationState(nextState);
            }
        }, 2500); // Tweak duration for the right feel (2.5s per state)

        return () => clearInterval(interval);
    }, []);

    const laptopVariants = {
        hidden: { opacity: 0, x: -50, scale: 0.9 },
        laptop: { opacity: 1, x: 0, scale: 1 },
        mobile: { opacity: 1, x: 0, scale: 1 }, // Keep laptop visible when mobile appears
    };

    const mobileVariants = {
        hidden: { opacity: 0, x: 50, scale: 0.9 },
        laptop: { opacity: 0, x: 50, scale: 0.9 }, // Mobile is hidden when laptop is shown
        mobile: { opacity: 1, x: 0, scale: 1 },
    };

    const transition = { duration: 0.8, ease: 'easeInOut' };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 overflow-hidden">
            <div className="relative w-full h-full flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-8 scale-[0.7] md:scale-[0.8] lg:scale-100">
                {/* Laptop */}
                <motion.div
                    className="relative w-[320px] lg:w-[400px] h-auto shrink-0"
                    variants={laptopVariants}
                    animate={animationState}
                    transition={transition}
                >
                    <div className="h-auto bg-white rounded-t-lg shadow-lg p-4 border-4 border-slate-300 border-b-0 flex flex-col items-center justify-center">
                        <QrCode className="text-orange-500" size={24} />
                        <h3 className="text-md font-bold text-slate-800 mt-1">Join the Session</h3>
                        <p className="text-xs text-slate-500">Scan to participate</p>
                        <div className="w-20 h-20 mt-2">
                            <MockQrCode />
                        </div>
                    </div>
                    <div className="w-[110%] h-3 bg-slate-200 rounded-b-md absolute bottom-0 -left-[5%]"></div>
                </motion.div>

                {/* Mobile */}
                <motion.div
                    className="relative w-[150px] lg:w-[180px] h-auto bg-white rounded-[20px] shadow-lg overflow-hidden border-2 border-slate-300 shrink-0"
                    variants={mobileVariants}
                    animate={animationState}
                    transition={transition}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-300 rounded-b-md"></div>
                    <div className="p-2 pt-5">
                        <p className="text-[9px] font-semibold text-orange-500 uppercase">Question 1/5</p>
                        <h2 className="mt-1 text-xs font-bold text-slate-800 leading-tight">
                            {quiz.question}
                        </h2>
                        <div className="mt-2 space-y-1.5">
                            {quiz.options.map((option, index) => (
                                <div key={index} className="flex items-center p-1.5 rounded-md border border-slate-200 bg-slate-50">
                                    <div className="w-3 h-3 flex-shrink-0 rounded-full border border-slate-300 flex items-center justify-center mr-1.5">
                                        {index === quiz.correctAnswer && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                                    </div>
                                    <span className="text-[10px] text-slate-700 leading-tight">{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}; 