import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== TABS INTERFACES =====
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  variant?: 'default' | 'glass' | 'neon' | 'gradient' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  animated?: boolean;
  className?: string;
  onChange?: (tabId: string) => void;
}

export interface TabContentProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

// ===== ANIMATION VARIANTS =====
const tabVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

const indicatorVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

// ===== MAIN TABS COMPONENT =====
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  animated = true,
  className,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // ===== HANDLE TAB CHANGE =====
  const handleTabChange = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;

    setActiveTab(tabId);
    onChange?.(tabId);
  };

  // ===== UPDATE INDICATOR POSITION =====
  const updateIndicator = (element: HTMLElement) => {
    if (orientation === 'horizontal') {
      setIndicatorStyle({
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: '2px',
      });
    } else {
      setIndicatorStyle({
        top: element.offsetTop,
        height: element.offsetHeight,
        width: '2px',
      });
    }
  };

  // ===== SIZE CLASSES =====
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
  };

  // ===== VARIANT STYLES =====
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          container:
            'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1',
          tab: 'text-gray-300 hover:text-white hover:bg-white/10 rounded-lg',
          active: 'text-white bg-white/20',
          indicator: 'bg-gradient-to-r from-cyan-400 to-blue-500',
        };
      case 'glass':
        return {
          container:
            'backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-1',
          tab: 'text-gray-300 hover:text-white hover:bg-white/15 rounded-lg',
          active: 'text-white bg-white/20',
          indicator: 'bg-gradient-to-r from-cyan-400 to-blue-500',
        };
      case 'neon':
        return {
          container: 'bg-black/80 border border-cyan-400/50 rounded-xl p-1',
          tab: 'text-gray-300 hover:text-white hover:bg-cyan-400/20 rounded-lg',
          active: 'text-white bg-cyan-400/20 border border-cyan-400/50',
          indicator: 'bg-cyan-400 shadow-cyan-400/50',
        };
      case 'gradient':
        return {
          container:
            'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30 rounded-xl p-1',
          tab: 'text-gray-300 hover:text-white hover:bg-white/10 rounded-lg',
          active: 'text-white bg-white/20',
          indicator: 'bg-gradient-to-r from-cyan-400 to-purple-500',
        };
      case 'pills':
        return {
          container: 'space-x-2',
          tab: 'text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-4 py-2',
          active: 'text-white bg-gradient-to-r from-cyan-500 to-blue-600',
          indicator: 'hidden',
        };
      case 'underline':
        return {
          container: 'border-b border-white/10',
          tab: 'text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white/20',
          active: 'text-white border-cyan-400',
          indicator: 'bg-cyan-400',
        };
      default:
        return {
          container:
            'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1',
          tab: 'text-gray-300 hover:text-white hover:bg-white/10 rounded-lg',
          active: 'text-white bg-white/20',
          indicator: 'bg-gradient-to-r from-cyan-400 to-blue-500',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // ===== RENDER TAB BUTTON =====
  const renderTabButton = (tab: TabItem) => {
    const isActive = activeTab === tab.id;
    const isDisabled = tab.disabled;

    return (
      <button
        key={tab.id}
        onClick={() => handleTabChange(tab.id)}
        disabled={isDisabled}
        ref={el => {
          if (
            el &&
            isActive &&
            variant !== 'pills' &&
            variant !== 'underline'
          ) {
            updateIndicator(el);
          }
        }}
        className={cn(
          'flex items-center space-x-2 transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          fullWidth && 'flex-1 justify-center',
          sizeClasses[size],
          variantStyles.tab,
          isActive && variantStyles.active,
          orientation === 'vertical' && 'w-full justify-start'
        )}
      >
        {tab.icon && <div className='flex-shrink-0'>{tab.icon}</div>}
        <span className='font-medium'>{tab.label}</span>
        {tab.badge && (
          <span
            className={cn(
              'inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full',
              isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'
            )}
          >
            {tab.badge}
          </span>
        )}
      </button>
    );
  };

  // ===== RENDER TAB CONTENT =====
  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);

    if (!activeTabData) return null;

    if (animated) {
      return (
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial='initial'
            animate='animate'
            exit='exit'
            className='w-full'
          >
            {activeTabData.content}
          </motion.div>
        </AnimatePresence>
      );
    }

    return <div className='w-full'>{activeTabData.content}</div>;
  };

  return (
    <div
      className={cn(
        'w-full',
        orientation === 'vertical' ? 'flex space-x-6' : 'space-y-4',
        className
      )}
    >
      {/* Tabs Navigation */}
      <div
        className={cn(
          'flex',
          orientation === 'vertical'
            ? 'flex-col space-y-2 w-48 flex-shrink-0'
            : 'space-x-1',
          variantStyles.container,
          variant === 'pills' && variantStyles.container
        )}
      >
        {tabs.map(tab => renderTabButton(tab))}

        {/* Animated Indicator */}
        {variant !== 'pills' && variant !== 'underline' && (
          <motion.div
            className={cn(
              'absolute transition-all duration-300 rounded-full',
              variantStyles.indicator
            )}
            style={indicatorStyle}
            variants={indicatorVariants}
            initial='initial'
            animate='animate'
          />
        )}
      </div>

      {/* Tab Content */}
      <div
        className={cn('flex-1', orientation === 'vertical' ? 'min-w-0' : '')}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

// ===== TAB CONTENT COMPONENT =====
export const TabContent: React.FC<TabContentProps> = ({
  children,
  isActive,
  className,
}) => {
  if (!isActive) return null;

  return <div className={cn('w-full', className)}>{children}</div>;
};

// ===== TAB PANEL COMPONENT =====
export const TabPanel: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  return <div className={cn('w-full', className)}>{children}</div>;
};

// ===== VERTICAL TABS COMPONENT =====
export const VerticalTabs: React.FC<TabsProps> = props => {
  return <Tabs {...props} orientation='vertical' />;
};

// ===== PILL TABS COMPONENT =====
export const PillTabs: React.FC<TabsProps> = props => {
  return <Tabs {...props} variant='pills' />;
};

// ===== UNDERLINE TABS COMPONENT =====
export const UnderlineTabs: React.FC<TabsProps> = props => {
  return <Tabs {...props} variant='underline' />;
};

export default Tabs;
