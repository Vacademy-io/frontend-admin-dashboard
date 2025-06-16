import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      transition={{
        staggerChildren: 0.2,
      }}
      className={cn(
        'grid w-full auto-rows-[22rem] grid-cols-1 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

const BentoCard = ({
  children,
  className,
  name,
  description,
  Icon,
  background,
  href,
}: {
  children?: ReactNode;
  className?: string;
  name: string;
  description: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  background?: ReactNode;
  href: string;
}) => {
  const variants = {
    initial: {
      scale: 0.95,
      opacity: 0,
      y: 20,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      className={cn(
        'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl',
        // light styles
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu-framer-motion',
        className
      )}
    >
      {background}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-full bg-gradient-to-b from-transparent to-black/70" />
      <div className="relative z-20 flex h-full flex-col justify-end gap-1 p-6 text-white transition-all duration-300">
        <Icon className="h-12 w-12 origin-left transform-gpu text-white transition-all duration-300 ease-in-out" />
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="max-w-lg text-neutral-200">{description}</p>
      </div>
    </motion.div>
  );
};

export { BentoCard, BentoGrid }; 