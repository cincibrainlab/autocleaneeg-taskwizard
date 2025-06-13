import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AnimatedSectionProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  color?: string;
}

export function AnimatedSection({
  title,
  description,
  enabled,
  onToggle,
  children,
  className = '',
  contentClassName = 'pl-8 pt-3 pb-1 space-y-4 border-l-2 border-lime-200 ml-2.5',
  color = 'lime'
}: AnimatedSectionProps) {
  // Define color classes to ensure Tailwind includes them
  const colorClasses = {
    lime: {
      hover: 'hover:border-lime-200 hover:bg-lime-50/30',
      enabled: 'bg-lime-500 border-lime-600'
    },
    pink: {
      hover: 'hover:border-pink-200 hover:bg-pink-50/30',
      enabled: 'bg-pink-500 border-pink-600'
    },
    rose: {
      hover: 'hover:border-rose-200 hover:bg-rose-50/30',
      enabled: 'bg-rose-500 border-rose-600'
    },
    orange: {
      hover: 'hover:border-orange-200 hover:bg-orange-50/30',
      enabled: 'bg-orange-500 border-orange-600'
    },
    yellow: {
      hover: 'hover:border-yellow-200 hover:bg-yellow-50/30',
      enabled: 'bg-yellow-500 border-yellow-600'
    },
    blue: {
      hover: 'hover:border-blue-200 hover:bg-blue-50/30',
      enabled: 'bg-blue-500 border-blue-600'
    },
    purple: {
      hover: 'hover:border-purple-200 hover:bg-purple-50/30',
      enabled: 'bg-purple-500 border-purple-600'
    }
  };

  const currentColors = colorClasses[color as keyof typeof colorClasses] || colorClasses.lime;

  return (
    <div className={`space-y-4 ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center justify-between w-full p-3 border rounded-md ${currentColors.hover} transition-colors`}
      >
        <div className="flex-1 flex items-center space-x-3">
          <div className={`
            flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
            ${enabled ? currentColors.enabled : 'border-input'}
          `}>
            {enabled && <Check className="h-4 w-4 text-white" />}
          </div>
          <div className="space-y-1 text-left">
            <Label className="font-medium">{title}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {enabled && (
          <motion.div
            key={`${title}-content`}
            className={`${contentClassName} overflow-hidden`}
            initial={{ opacity: 0, scaleY: 0, originY: 0 }}
            animate={{ 
              opacity: 1, 
              scaleY: 1,
              transition: { 
                duration: 0.25, 
                ease: [0.25, 0.46, 0.45, 0.94],
                scaleY: { duration: 0.25 },
                opacity: { duration: 0.15, delay: 0.1 }
              }
            }}
            exit={{ 
              opacity: 0, 
              scaleY: 0,
              transition: { 
                duration: 0.15,
                ease: [0.55, 0.06, 0.68, 0.19],
                opacity: { duration: 0.08 },
                scaleY: { duration: 0.12, delay: 0.03 }
              }
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}