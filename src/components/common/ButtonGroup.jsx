import React from 'react'

export default function ButtonGroup({ 
  label, 
  options = [], 
  value, 
  onChange,
  compact = false,
  className = '' 
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className={`flex ${compact ? 'gap-1.5' : 'gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1'}`}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              ${compact 
                ? `w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 border
                   ${value === opt.value
                     ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                     : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary-400'
                   }`
                : `flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                   ${value === opt.value
                     ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                   }`
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
