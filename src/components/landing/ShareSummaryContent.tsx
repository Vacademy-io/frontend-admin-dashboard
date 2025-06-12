import { motion } from 'framer-motion';
import { Send, Link, CheckCircle, FileText } from 'lucide-react';

const summaryData = {
    title: 'Q2 All-Hands Recap',
    actionPoints: [
        'Launch new marketing campaign by July 15th.',
        'Finalize budget for Q3 projects.',
        'Onboard two new engineers to the platform team.',
    ],
    voltLink: 'volt.session/q2-recap',
};

export const ShareSummaryContent = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 overflow-hidden">
            <motion.div
                className="w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden scale-[0.85] md:scale-100"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Send size={16} className="text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-700">Auto-Share Summary</h3>
                    </div>
                    <motion.div
                        className="px-2 py-0.5 text-xs text-green-700 bg-green-100 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        Sent to 42 participants
                    </motion.div>
                </div>

                {/* Body */}
                <div className="p-4">
                    {/* Action Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <CheckCircle size={15} className="text-green-500" />
                            Action Items
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-xs text-slate-500 list-disc list-inside">
                            {summaryData.actionPoints.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Volt Link */}
                    <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Link size={15} className="text-orange-500" />
                            Volt Link
                        </h4>
                        <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded-md font-mono">
                            {summaryData.voltLink}
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    className="p-3 bg-slate-50 border-t border-slate-200 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <p className="text-xs text-slate-400">
                        Summary automatically sent via Volt AI.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}; 