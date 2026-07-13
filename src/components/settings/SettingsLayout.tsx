import React from 'react';

interface SettingCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SettingCard: React.FC<SettingCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface SettingItemProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between p-4 gap-6 hover:bg-gray-50/50 dark:hover:bg-dark-element/20 transition-colors ${className}`}>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {title}
        </h4>
        {description && (
          <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center">
        {children}
      </div>
    </div>
  );
};
