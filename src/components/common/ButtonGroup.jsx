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
    <div className={`space-y-0.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className={`inline-flex ${compact ? 'gap-1' : 'gap-0.5 bg-gray-100 dark:bg-[#0d1322] rounded-lg p-0.5'}`}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              ${compact 
                ? `w-8 h-8 rounded-md text-xs font-semibold transition-all duration-150 border
                   ${value === opt.value
                     ? 'bg-accent text-white border-accent shadow-sm shadow-accent/20'
                     : 'bg-gray-50 dark:bg-[#1a2340] text-gray-400 dark:text-gray-500 border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] hover:border-accent/40'
                   }`
                : `px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                   ${value === opt.value
                     ? 'bg-white dark:bg-[#1a2340] text-gray-900 dark:text-gray-100 shadow-sm'
                     : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
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
