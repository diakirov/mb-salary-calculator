import React from 'react'

export default function Select({
  label,
  value,
  onChange,
  options = [],
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="
          w-full h-[38px] px-3 rounded-lg border text-sm
          bg-white dark:bg-[#0d1322]
          text-gray-900 dark:text-gray-100
          border-[rgba(15,23,42,0.1)] dark:border-[rgba(255,255,255,0.08)]
          hover:border-[rgba(34,197,94,0.3)] dark:hover:border-[rgba(34,197,94,0.35)]
          focus:border-accent focus:ring-1 focus:ring-accent/20
          transition-all duration-150
          cursor-pointer appearance-none
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:1rem_1rem] bg-[right_0.5rem_center] bg-no-repeat pr-8
        "
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
