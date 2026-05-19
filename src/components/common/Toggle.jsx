import React from 'react'

export default function Toggle({ label, checked, onChange, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="
          w-8 h-[18px] rounded-full
          bg-gray-200 dark:bg-[#1a2340]
          peer-checked:bg-accent
          transition-colors duration-150
        " />
        <div className="
          absolute top-[2px] left-[2px]
          w-[14px] h-[14px] rounded-full bg-white shadow-sm
          peer-checked:translate-x-[14px]
          transition-transform duration-150
        " />
      </div>
      {label && (
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      )}
    </label>
  )
}
