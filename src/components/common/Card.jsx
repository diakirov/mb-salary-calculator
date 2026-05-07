import React from 'react'

export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-2xl 
      shadow-sm hover:shadow-md 
      border border-gray-100 dark:border-gray-700
      transition-shadow duration-200
      ${padding ? 'p-5 sm:p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
