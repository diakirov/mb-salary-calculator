import React from 'react'

export default function Toggle({ label, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="
          w-10 h-5 rounded-full
          bg-gray-300 dark:bg-gray-600
          peer-checked:bg-primary-500
          transition-colors duration-200
        " />
        <div className="
          absolute top-0.5 left-0.5
          w-4 h-4 rounded-full bg-white shadow-sm
          peer-checked:translate-x-5
          transition-transform duration-200
        " />
      </div>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </label>
  )
}
