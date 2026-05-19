import React from 'react'
import { formatMoney } from '../../utils/formatMoney'

export default function ResultCard({ 
  label, 
  amount, 
  variant = 'default',
  subtitle,
  className = '' 
}) {
  const isMain = variant === 'success'

  return (
    <div className={`${className}`}>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className={`font-bold tabular-nums ${isMain ? 'text-2xl text-accent-muted' : 'text-lg text-gray-700 dark:text-gray-300'}`}>
        {formatMoney(amount)}
      </p>
      {subtitle && (
        <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
