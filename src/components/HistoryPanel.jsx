import React, { useState } from 'react'
import { getSVHistory } from '../utils/localStorage'
import { formatMoney } from '../utils/formatMoney'
import salaryConfig from '../config/salaryConfig'

const monthNames = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
]

export default function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const history = getSVHistory()

  if (history.length === 0) return null

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400
          hover:text-gray-700 dark:hover:text-gray-300
          transition-colors duration-200
        "
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Останні розрахунки ({history.length})
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 animate-slide-down">
          {history.map((item, idx) => {
            const zone = salaryConfig.sv.zones.find(z => z.id === item.input?.zoneId)
            return (
              <div
                key={idx}
                className="
                  p-3 rounded-xl border border-gray-100 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800/50
                  text-sm
                "
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatMoney(item.net)}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 ml-2">
                      на руки
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {item.input?.schedule} · {monthNames[item.input?.month]} · {item.input?.effectiveHours}г
                    {zone && ` · ${zone.name}`}
                  </span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(item.timestamp).toLocaleString('uk-UA')}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
