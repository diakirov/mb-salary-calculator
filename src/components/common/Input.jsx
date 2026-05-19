import React from 'react'

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  hint,
  icon,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full h-[38px] px-3 rounded-lg border text-sm
          transition-all duration-150
          input-placeholder-fade
          placeholder:text-gray-300 dark:placeholder:text-gray-600
          ${disabled 
            ? 'bg-gray-50 dark:bg-[#0d1322] text-gray-300 dark:text-gray-600 cursor-not-allowed border-gray-100 dark:border-[rgba(255,255,255,0.04)]' 
            : 'bg-white dark:bg-[#0d1322] text-gray-900 dark:text-gray-100 border-[rgba(15,23,42,0.1)] dark:border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,197,94,0.3)] dark:hover:border-[rgba(34,197,94,0.35)] focus:border-accent focus:ring-1 focus:ring-accent/20'
          }
          ${error ? 'border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-2xs text-red-500 dark:text-red-400 animate-fade-in">{error}</p>
      )}
      {hint && !error && (
        <p className="text-2xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
    </div>
  )
}
