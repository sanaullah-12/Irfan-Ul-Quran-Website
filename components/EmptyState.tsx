import React from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 text-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-5">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
