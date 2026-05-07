import React from 'react'
import { formatMoney } from '../../utils/formatMoney'

export default function ResultCard({ 
  label, 
  amount, 
  variant = 'default',
  subtitle,
  className = '' 
}) {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700',
    primary: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  }

  const textVariants = {
    default: 'text-gray-900 dark:text-gray-100',
    primary: 'text-primary-700 dark:text-primary-300',
    success: 'text-emerald-700 dark:text-emerald-300',
  }

  return (
    <div className={`
      rounded-2xl border p-4 sm:p-5
      ${variants[variant]}
      ${className}
    `}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold ${textVariants[variant]}`}>
        {formatMoney(amount)}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
