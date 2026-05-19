import React from 'react'

export default function Card({ children, className = '', padding = true, active = false }) {
  return (
    <div className={`
      rounded-xl border transition-colors duration-150
      bg-white dark:bg-[#131b2e]
      ${active 
        ? 'border-[rgba(34,197,94,0.3)] dark:border-[rgba(34,197,94,0.35)]' 
        : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)]'
      }
      ${padding ? 'px-4 py-3' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
