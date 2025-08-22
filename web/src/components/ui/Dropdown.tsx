import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== DROPDOWN INTERFACES =====
export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'glass' | 'neon' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  clearable?: boolean;
  className?: string;
  label?: string;
  error?: string;
  success?: string;
}

export interface DropdownGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

// ===== ANIMATION VARIANTS =====
const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const optionVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: { opacity: 0, x: -20 },
};

// ===== MAIN DROPDOWN COMPONENT =====
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opción',
  variant = 'default',
  size = 'md',
  disabled = false,
  searchable = false,
  multiSelect = false,
  clearable = false,
  className,
  label,
  error,
  success,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    value ? [value] : []
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ===== CLOSE DROPDOWN ON OUTSIDE CLICK =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== FILTER OPTIONS BASED ON SEARCH =====
  const filteredOptions =
    searchable && searchQuery
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  // ===== GROUP OPTIONS =====
  const groupedOptions = filteredOptions.reduce(
    (groups, option) => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    },
    {} as Record<string, DropdownOption[]>
  );

  // ===== HANDLE OPTION SELECTION =====
  const handleOptionSelect = (optionValue: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];

      setSelectedValues(newValues);
      onChange(newValues.join(','));
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // ===== CLEAR SELECTION =====
  const handleClear = () => {
    if (multiSelect) {
      setSelectedValues([]);
      onChange('');
    } else {
      onChange('');
    }
  };

  // ===== GET SELECTED LABELS =====
  const getSelectedLabels = () => {
    if (multiSelect) {
      return selectedValues
        .map(v => options.find(o => o.value === v)?.label)
        .filter(Boolean)
        .join(', ');
    }
    return options.find(o => o.value === value)?.label || '';
  };

  // ===== SIZE CLASSES =====
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
  };

  // ===== VARIANT STYLES =====
  const variantClasses = {
    default:
      'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20',
    glass:
      'backdrop-blur-xl bg-white/10 border border-white/20 hover:border-white/30',
    neon: 'bg-black/80 border border-cyan-400/50 hover:border-cyan-400',
    gradient:
      'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30',
    outline: 'bg-transparent border-2 border-cyan-400/50 hover:border-cyan-400',
  };

  // ===== RENDER OPTION =====
  const renderOption = (option: DropdownOption, index: number) => {
    const isSelected = multiSelect
      ? selectedValues.includes(option.value)
      : value === option.value;

    return (
      <motion.div
        key={option.value}
        variants={optionVariants}
        initial='initial'
        animate='animate'
        exit='exit'
        custom={index}
      >
        <button
          onClick={() => !option.disabled && handleOptionSelect(option.value)}
          disabled={option.disabled}
          className={cn(
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            'hover:bg-white/10 focus:bg-white/10 focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isSelected && 'bg-cyan-500/20 border border-cyan-400/50'
          )}
        >
          <div className='flex items-center space-x-3'>
            {option.icon && (
              <div className='flex-shrink-0 w-5 h-5 text-cyan-400'>
                {option.icon}
              </div>
            )}
            <span className='flex-1 text-white'>{option.label}</span>
            {isSelected && (
              <Check className='w-4 h-4 text-cyan-400 flex-shrink-0' />
            )}
          </div>
        </button>
      </motion.div>
    );
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          {label}
        </label>
      )}

      {/* Dropdown Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between rounded-xl transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          error && 'border-red-400 focus:ring-red-500/50',
          success && 'border-green-400 focus:ring-green-500/50'
        )}
      >
        <div className='flex items-center space-x-2 min-w-0'>
          <span
            className={cn(
              'truncate',
              getSelectedLabels() ? 'text-white' : 'text-gray-400'
            )}
          >
            {getSelectedLabels() || placeholder}
          </span>
        </div>

        <div className='flex items-center space-x-2 flex-shrink-0'>
          {clearable && (value || selectedValues.length > 0) && (
            <button
              onClick={e => {
                e.stopPropagation();
                handleClear();
              }}
              className='w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center'
            >
              <X className='w-3 h-3 text-white' />
            </button>
          )}

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className='w-4 h-4 text-gray-400' />
          </motion.div>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='absolute z-50 w-full mt-2'
            variants={dropdownVariants}
            initial='initial'
            animate='animate'
            exit='exit'
          >
            <div className='bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden'>
              {/* Search Input */}
              {searchable && (
                <div className='p-3 border-b border-white/10'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Buscar opciones...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300'
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className='max-h-60 overflow-y-auto'>
                {Object.entries(groupedOptions).map(
                  ([groupName, groupOptions]) => (
                    <div key={groupName}>
                      {groupName !== 'default' && (
                        <div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white/5'>
                          {groupName}
                        </div>
                      )}
                      {groupOptions.map((option, index) =>
                        renderOption(option, index)
                      )}
                    </div>
                  )
                )}

                {filteredOptions.length === 0 && (
                  <div className='px-4 py-8 text-center text-gray-400'>
                    {searchQuery
                      ? 'No se encontraron opciones'
                      : 'No hay opciones disponibles'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Success Messages */}
      {error && (
        <p className='mt-2 text-sm text-red-400 flex items-center'>
          <AlertCircle className='w-4 h-4 mr-1' />
          {error}
        </p>
      )}

      {success && (
        <p className='mt-2 text-sm text-green-400 flex items-center'>
          <Check className='w-4 h-4 mr-1' />
          {success}
        </p>
      )}
    </div>
  );
};

// ===== DROPDOWN GROUP COMPONENT =====
export const DropdownGroup: React.FC<DropdownGroupProps> = ({
  label,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
        {label}
      </div>
      <div className='space-y-1'>{children}</div>
    </div>
  );
};

// ===== MULTI-SELECT DROPDOWN COMPONENT =====
export const MultiSelectDropdown: React.FC<
  Omit<DropdownProps, 'multiSelect'> & {
    values?: string[];
    onChange: (values: string[]) => void;
  }
> = ({ values = [], onChange, ...props }) => {
  return (
    <Dropdown
      {...props}
      multiSelect={true}
      value={values.join(',')}
      onChange={value => onChange(value ? value.split(',') : [])}
    />
  );
};

export default Dropdown;
