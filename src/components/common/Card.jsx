import React from 'react'

export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-2xl 
      shadow-sm hover:shadow-md 
      border border-slate-900/10 dark:border-slate-400/[.18]
      transition-shadow duration-200
      ${padding ? 'p-4 sm:p-5' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
