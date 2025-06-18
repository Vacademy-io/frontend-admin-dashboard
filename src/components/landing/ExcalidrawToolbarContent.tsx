import { motion } from 'framer-motion';
import { SelectionIcon, RectangleIcon, DiamondIcon, ArrowIcon, PencilIcon } from './ExcalidrawIcons';
import { Type, Image, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const tools = [
    { id: 'select', icon: SelectionIcon },
    { id: 'rectangle', icon: RectangleIcon },
    { id: 'diamond', icon: DiamondIcon },
    { id: 'arrow', icon: ArrowIcon },
    { id: 'pencil', icon: PencilIcon },
    { id: 'text', icon: Type },
    { id: 'image', icon: Image },
    { id: 'trash', icon: Trash2 },
];

export const ExcalidrawToolbarContent = () => {
    const [selectedTool, setSelectedTool] = useState('rectangle');

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-4 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center scale-[0.85] md:scale-100">
                <motion.div 
                    className="relative w-full max-w-xl h-[300px] bg-white rounded-lg shadow-xl border border-slate-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {/* Toolbar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white h-14 p-2 rounded-lg shadow-md border border-slate-100 flex items-center gap-1 z-10">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setSelectedTool(tool.id)}
                                className={cn(
                                    'w-10 h-10 flex items-center justify-center rounded-md transition-colors',
                                    selectedTool === tool.id
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'hover:bg-slate-100 text-slate-500'
                                )}
                            >
                                <tool.icon className="w-5 h-5" />
                            </button>
                        ))}
                    </div>

                    {/* Canvas Content */}
                    <div className="w-full h-full p-4 pt-20">
                        <motion.div
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <svg width="100%" height="100%" className="overflow-visible">
                                <motion.rect 
                                    x="10%" y="15%" width="120" height="80" rx="4" 
                                    className="fill-orange-100 stroke-orange-400" strokeWidth="2"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.5, ease: 'backOut' }}
                                />
                                <motion.path
                                    d="M 200,80 Q 250,40 300,80"
                                    className="fill-none stroke-blue-400" strokeWidth="2" strokeDasharray="4 4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                />
                                 <motion.foreignObject 
                                    x="320" y="50" width="150" height="50"
                                     initial={{ scale: 0.5, opacity: 0 }}
                                     animate={{ scale: 1, opacity: 1 }}
                                     transition={{ delay: 1.2, duration: 0.5, ease: 'backOut' }}
                                >
                                    <p className="text-blue-600 font-semibold text-lg">Add your idea!</p>
                                </motion.foreignObject>
                            </svg>
                        </motion.div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}; 