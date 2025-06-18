import { motion } from 'framer-motion';
import { Crown, Trophy, TrendingUp, BarChart2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const leaderboardData = [
  { name: 'Alex Johnson', score: 2450 },
  { name: 'Maria Garcia', score: 2300 },
  { name: 'Chen Wei', score: 2280 },
  { name: 'Fatima Al-Fassi', score: 2100 },
  { name: 'David Smith', score: 1950 },
];

const initialChartData = [
    { label: 'A', value: 30 },
    { label: 'B', value: 85 },
    { label: 'C', value: 60 },
    { label: 'D', value: 45 },
];

export const LeaderboardCardContent = () => {
    const [chartData, setChartData] = useState(initialChartData);

    useEffect(() => {
        const interval = setInterval(() => {
            setChartData(
                initialChartData.map(bar => ({
                    ...bar,
                    value: Math.max(10, Math.floor(Math.random() * 100)),
                }))
            );
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4">
            <div className="relative w-full max-w-lg h-[360px]">
                {/* Laptop Screen */}
                <motion.div
                    className="w-full h-[340px] bg-white/70 backdrop-blur-sm rounded-t-xl shadow-2xl p-6 border-4 border-slate-300 border-b-0 flex flex-col"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800">Live Analytics</h3>
                        <TrendingUp className="text-blue-500" size={22} />
                    </div>

                    <div className="flex-1 overflow-hidden grid grid-cols-2 gap-6">
                        {/* Leaderboard Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-600">Top Performers</h4>
                                <Trophy className="text-yellow-400" size={18} />
                            </div>
                            <div className="space-y-2 mt-2">
                                {leaderboardData.slice(0, 5).map((player, index) => (
                                    <div key={player.name} className="flex items-center p-2 rounded-lg bg-slate-50 text-sm">
                                        <span className="font-bold text-slate-500 w-6 text-center">{index + 1}</span>
                                        <span className="flex-1 font-medium text-slate-700 ml-3">{player.name}</span>
                                        <div className="flex items-center gap-2 font-bold text-orange-500">
                                            {index === 0 && <Crown size={16} className="text-yellow-400" />}
                                            {player.score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Chart Section */}
                        <motion.div
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-600">Response Distribution</h4>
                                <BarChart2 className="text-blue-400" size={18} />
                            </div>
                             <div className="flex justify-around items-end h-48 mt-4">
                                {chartData.map((bar, index) => (
                                    <div key={bar.label} className="flex flex-col items-center w-1/5 h-full">
                                        <motion.div 
                                            className="w-4/5 bg-blue-400 rounded-t-md"
                                            style={{ originY: 1 }}
                                            animate={{ height: `${bar.value}%` }}
                                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                        <span className="mt-2 text-sm font-semibold text-slate-600">{bar.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                </motion.div>
                {/* Laptop Base */}
                <div className="w-[110%] h-5 bg-slate-200 rounded-b-lg absolute -bottom-1 -left-[5%]">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-300 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}; 