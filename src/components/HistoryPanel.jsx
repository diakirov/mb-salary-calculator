import React, { useState } from 'react'
import { getSVHistory } from '../utils/localStorage'
import { formatMoney } from '../utils/formatMoney'
import salaryConfig from '../config/salaryConfig'

const monthShort = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру']

export default function HistoryPanel({ onRestore }) {
  const [expandedIdx, setExpandedIdx] = useState(null)
  const history = getSVHistory()

  if (history.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="text-2xs font-medium text-gray-300 dark:text-gray-600 mb-1">
        Останні ({history.length})
      </p>
      {history.map((item, idx) => {
        const zone = salaryConfig.sv.zones.find(z => z.id === item.input?.zoneId)
        const isExpanded = expandedIdx === idx

        return (
          <div
            key={idx}
            className="rounded-lg border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] bg-gray-50/30 dark:bg-[#0d1322]/30 overflow-hidden"
          >
            <div className="px-2.5 py-1.5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                  {formatMoney(item.net)}
                </span>
                <div className="text-2xs text-gray-300 dark:text-gray-600 mt-0.5 leading-tight">
                  {monthShort[item.input?.month]} · {item.input?.schedule} · {item.input?.effectiveHours}г
                  {zone && ` · ${zone.name}`}
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onRestore && onRestore(item.input)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a2340] text-gray-200 dark:text-gray-700 hover:text-accent/70 transition-colors"
                  title="Відновити"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a2340] text-gray-200 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-400 transition-all ${isExpanded ? 'rotate-180' : ''}`}
                  title="Деталі"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {isExpanded && item.details && (
              <div className="px-2.5 pb-1.5 border-t border-[rgba(15,23,42,0.03)] dark:border-[rgba(255,255,255,0.03)] pt-1.5 animate-fade-in">
                <div className="space-y-0.5 text-2xs">
                  <HRow label="Оклад" value={item.details.salaryPart} />
                  <HRow label={`Премія (${item.details.zoneName})`} value={item.details.zonePremiumPart} />
                  {item.details.nightAmount > 0 && <HRow label="Нічні" value={item.details.nightAmount} plus />}
                  {item.details.x2Amount > 0 && <HRow label="х2" value={item.details.x2Amount} plus />}
                  {item.details.qualAmount > 0 && <HRow label="Квал." value={item.details.qualAmount} plus />}
                  {item.details.tenureAmount > 0 && <HRow label="Стаж" value={item.details.tenureAmount} plus />}
                  <div className="border-t border-[rgba(15,23,42,0.03)] dark:border-[rgba(255,255,255,0.02)] my-0.5" />
                  <HRow label="Податок" value={-item.tax} minus />
                  {item.details.wowAmount > 0 && <HRow label="Wow" value={item.details.wowAmount} plus />}
                  {item.details.taxiExtraAmount > 0 && <HRow label="Таксі" value={item.details.taxiExtraAmount} plus />}
                  {item.details.stormsAmount > 0 && <HRow label="Бури" value={-item.details.stormsAmount} minus />}
                  <div className="border-t border-[rgba(15,23,42,0.03)] dark:border-[rgba(255,255,255,0.02)] my-0.5" />
                  <HRow label="На руки" value={item.net} bold accent />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function HRow({ label, value, plus, minus, bold, accent }) {
  if (value === undefined || value === null) return null
  const color = accent
    ? 'text-accent-muted'
    : minus || value < 0
    ? 'text-red-400'
    : plus
    ? 'text-emerald-400'
    : 'text-gray-500 dark:text-gray-400'

  return (
    <div className="flex justify-between py-px">
      <span className="text-gray-400 dark:text-gray-500">{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold' : 'font-medium'} ${color}`}>
        {value < 0 ? '-' : plus ? '+' : ''}{formatMoney(Math.abs(value))}
      </span>
    </div>
  )
}
