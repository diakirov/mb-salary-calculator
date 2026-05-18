import React, { useState } from 'react'
import { getSVHistory } from '../utils/localStorage'
import { formatMoney } from '../utils/formatMoney'
import salaryConfig from '../config/salaryConfig'

const monthNames = [
  'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
  'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'
]

export default function HistoryPanel({ onRestore }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState(null)
  const history = getSVHistory()

  if (history.length === 0) return null

  function handleRestore(item) {
    if (onRestore) onRestore(item.input)
  }

  function toggleExpand(idx) {
    setExpandedIdx(expandedIdx === idx ? null : idx)
  }

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
            const isExpanded = expandedIdx === idx

            return (
              <div
                key={idx}
                className="
                  rounded-xl border border-slate-900/10 dark:border-slate-400/[.18]
                  bg-gray-50 dark:bg-gray-800/50
                  overflow-hidden
                "
              >
                {/* Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {formatMoney(item.net)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        на руки
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {item.input?.schedule} · {monthNames[item.input?.month]} {item.input?.year} · {item.input?.effectiveHours}г
                      {zone && ` · ${zone.name}`}
                    </div>
                    <div className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                      {new Date(item.timestamp).toLocaleString('uk-UA', { 
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleRestore(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-primary-500 transition-colors"
                      title="Відновити"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleExpand(idx)}
                      className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all ${isExpanded ? 'rotate-180' : ''}`}
                      title="Деталі"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && item.details && (
                  <div className="px-3 pb-3 border-t border-slate-900/5 dark:border-slate-400/10 pt-2 animate-fade-in">
                    <div className="space-y-1 text-xs">
                      <HistoryDetailRow label="Оклад" value={item.details.salaryPart} />
                      <HistoryDetailRow label={`Премія (${item.details.zoneName})`} value={item.details.zonePremiumPart} />
                      {item.details.nightAmount > 0 && <HistoryDetailRow label="Нічні" value={item.details.nightAmount} plus />}
                      {item.details.x2Amount > 0 && <HistoryDetailRow label="х2" value={item.details.x2Amount} plus />}
                      {item.details.qualAmount > 0 && <HistoryDetailRow label="Квал. надбавка" value={item.details.qualAmount} plus />}
                      {item.details.tenureAmount > 0 && <HistoryDetailRow label={`Стаж (${Math.round((item.details.tenurePercent || 0) * 100)}%)`} value={item.details.tenureAmount} plus />}
                      {item.details.knowledgeAmount > 0 && <HistoryDetailRow label="Знання (+1г)" value={item.details.knowledgeAmount} sub />}
                      
                      <div className="border-t border-slate-900/5 dark:border-slate-400/10 pt-1 mt-1">
                        <HistoryDetailRow label="Брутто" value={item.gross} bold />
                        <HistoryDetailRow label="Податок" value={-item.tax} minus />
                        <HistoryDetailRow label="Після податків" value={item.details.afterTax} />
                      </div>

                      {(item.details.wowAmount > 0 || item.details.taxiExtraAmount > 0 || item.details.stormsAmount > 0) && (
                        <div className="border-t border-slate-900/5 dark:border-slate-400/10 pt-1 mt-1">
                          {item.details.wowAmount > 0 && <HistoryDetailRow label="Вау-кейси" value={item.details.wowAmount} plus />}
                          {item.details.taxiExtraAmount > 0 && <HistoryDetailRow label="Таксі / доплати" value={item.details.taxiExtraAmount} plus />}
                          {item.details.stormsAmount > 0 && <HistoryDetailRow label="Бурі" value={-item.details.stormsAmount} minus />}
                        </div>
                      )}

                      <div className="border-t border-slate-900/5 dark:border-slate-400/10 pt-1 mt-1">
                        <HistoryDetailRow label="На руки" value={item.net} bold success />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function HistoryDetailRow({ label, value, plus, minus, bold, success, sub }) {
  if (value === undefined || value === null) return null
  
  const color = success
    ? 'text-emerald-600 dark:text-emerald-400'
    : minus || value < 0
    ? 'text-red-500 dark:text-red-400'
    : plus
    ? 'text-green-600 dark:text-green-400'
    : 'text-gray-700 dark:text-gray-300'

  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={`${bold ? 'font-semibold' : ''} text-gray-600 dark:text-gray-400`}>
        {label}
      </span>
      <span className={`${bold ? 'font-bold' : 'font-medium'} ${color} tabular-nums`}>
        {value < 0 ? '-' : plus ? '+' : ''}{formatMoney(Math.abs(value))}
      </span>
    </div>
  )
}
