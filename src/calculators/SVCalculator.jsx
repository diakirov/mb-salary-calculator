import React, { useState, useEffect } from 'react'
import salaryConfig from '../config/salaryConfig'
import { calculateSVSalary, getNormHours } from '../utils/calculateSVSalary'
import { formatMoney } from '../utils/formatMoney'
import {
  getSVForm, setSVForm,
  getSVQual, setSVQual,
  getSVZone, setSVZone,
  getSVSchedule, setSVSchedule,
  addSVHistory, resetSVData,
} from '../utils/localStorage'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import ButtonGroup from '../components/common/ButtonGroup'
import ResultCard from '../components/common/ResultCard'
import Toggle from '../components/common/Toggle'
import ThemeToggle from '../components/ThemeToggle'
import HistoryPanel from '../components/HistoryPanel'

const monthNames = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
]

const config = salaryConfig.sv

// Кольори зон для light/dark
const zoneColors = {
  1: { light: { bg: '#DCFCE7', border: '#22C55E', text: '#14532D' }, dark: { bg: 'rgba(34,197,94,.14)', border: '#22C55E', text: '#86EFAC' } },
  2: { light: { bg: '#ECFCCB', border: '#84CC16', text: '#365314' }, dark: { bg: 'rgba(132,204,22,.14)', border: '#84CC16', text: '#BEF264' } },
  3: { light: { bg: '#FEF9C3', border: '#EAB308', text: '#713F12' }, dark: { bg: 'rgba(234,179,8,.14)', border: '#EAB308', text: '#FDE047' } },
  4: { light: { bg: '#FCE7F3', border: '#EC4899', text: '#831843' }, dark: { bg: 'rgba(236,72,153,.14)', border: '#EC4899', text: '#F9A8D4' } },
  5: { light: { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D' }, dark: { bg: 'rgba(239,68,68,.14)', border: '#EF4444', text: '#FCA5A5' } },
}

export default function SVCalculator({ onBack, theme, setTheme }) {
  const now = new Date()
  const savedForm = getSVForm()

  // State
  const [workedHours, setWorkedHours] = useState(savedForm?.workedHours ?? '')
  const [nightHours, setNightHours] = useState(savedForm?.nightHours ?? '')
  const [x2Hours, setX2Hours] = useState(savedForm?.x2Hours ?? '')
  const [wowCases, setWowCases] = useState(savedForm?.wowCases ?? '')
  const [storms, setStorms] = useState(savedForm?.storms ?? '')
  const [tenure, setTenure] = useState(savedForm?.tenure ?? '')
  const [taxiExtra, setTaxiExtra] = useState(savedForm?.taxiExtra ?? '')
  const [advanceHours] = useState('')
  const [alarmHours] = useState('')

  const [qualLevel, setQualLevel] = useState(getSVQual() || 1)
  const [zoneId, setZoneId] = useState(getSVZone() || config.defaultZone)
  const [schedule, setSchedule] = useState(getSVSchedule() || config.defaultSchedule)
  const [knowledge, setKnowledge] = useState(savedForm?.knowledge !== undefined ? savedForm.knowledge : true)

  const [month, setMonth] = useState(savedForm?.month !== undefined ? savedForm.month : now.getMonth())
  const [year, setYear] = useState(savedForm?.year || now.getFullYear())

  // UI state
  const [showDetails, setShowDetails] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [softWarning, setSoftWarning] = useState(null)
  const [warningConfirmed, setWarningConfirmed] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [copied, setCopied] = useState('')

  const normHours = getNormHours(schedule, month, year)
  const isDark = theme === 'dark'

  // Save form
  useEffect(() => {
    setSVForm({ workedHours, nightHours, x2Hours, wowCases, storms, knowledge, month, year, tenure, taxiExtra })
  }, [workedHours, nightHours, x2Hours, wowCases, storms, knowledge, month, year, tenure, taxiExtra])

  useEffect(() => { setSVQual(qualLevel) }, [qualLevel])
  useEffect(() => { setSVZone(zoneId) }, [zoneId])
  useEffect(() => { setSVSchedule(schedule) }, [schedule])

  // Auto-calculate
  useEffect(() => {
    calculate()
  }, [workedHours, nightHours, x2Hours, qualLevel, zoneId, schedule, knowledge, month, year, wowCases, storms, warningConfirmed, tenure, taxiExtra])

  // === VALIDATION ===
  function parseHours(value) {
    if (value === '' || value === null || value === undefined) return null
    let cleaned = String(value).replace(/\s/g, '')
    cleaned = cleaned.replace(/[,\/]/g, '.')
    const num = parseFloat(cleaned)
    if (isNaN(num)) return null
    return num
  }

  function validateHalfStep(value) {
    const num = parseHours(value)
    if (num === null) return null
    const decimal = num % 1
    if (decimal !== 0 && decimal !== 0.5) {
      return 'Лише цілі або з половиною (.5)'
    }
    return null
  }

  function getWorkedHoursError(value) {
    if (value === '' || value === null) return null
    const num = parseHours(value)
    if (num === null) return 'Введіть число'
    if (num < 0) return 'Йойь, як таке можливо?🥹'
    const halfErr = validateHalfStep(value)
    if (halfErr) return halfErr
    if (num > 501) return 'Ну стільки точно не зможеш😁'
    return null
  }

  function getFieldError(value) {
    if (value === '' || value === null) return null
    const num = parseHours(value)
    if (num === null) return 'Введіть число'
    if (num < 0) return 'Йойь, як таке можливо?🥹'
    return validateHalfStep(value)
  }

  // === CALCULATE ===
  function calculate() {
    const newErrors = {}

    const whErr = getWorkedHoursError(workedHours)
    if (whErr) newErrors.workedHours = whErr

    const nhErr = getFieldError(nightHours)
    if (nhErr) newErrors.nightHours = nhErr

    const x2Err = getFieldError(x2Hours)
    if (x2Err) newErrors.x2Hours = x2Err

    setErrors(newErrors)

    const whNum = parseHours(workedHours)
    if (whNum && whNum > 301 && whNum <= 501 && !warningConfirmed) {
      setSoftWarning('Ого, точно стільки відпрацюєш?👀')
      setResult(null)
      return
    } else {
      setSoftWarning(null)
    }

    if (Object.keys(newErrors).length > 0) {
      setResult(null)
      return
    }

    const hours = parseHours(workedHours) ?? normHours ?? 165
    const night = parseHours(nightHours) ?? 0
    const x2 = parseHours(x2Hours) ?? 0
    const wow = Math.min(Math.max(parseInt(wowCases) || 0, 0), config.maxWowCases)
    const stormsVal = parseFloat(String(storms).replace(/\s/g, '').replace(/[,\/]/g, '.')) || 0
    const tenureVal = parseInt(tenure) || 0
    const taxiVal = parseFloat(String(taxiExtra).replace(/\s/g, '').replace(/[,\/]/g, '.')) || 0

    if (!normHours) {
      setResult(null)
      return
    }

    const calcResult = calculateSVSalary({
      workedHours: hours,
      nightHours: night,
      x2Hours: x2,
      qualLevel,
      zoneId,
      wowCases: wow,
      knowledge,
      schedule,
      month,
      year,
      storms: Math.max(0, stormsVal),
      tenure: tenureVal,
      taxiExtra: Math.max(0, taxiVal),
    })

    if (calcResult.error) {
      setResult(null)
      return
    }

    setResult(calcResult)
  }

  function saveToHistory() {
    if (result && !result.error) {
      addSVHistory(result)
      setHistoryKey(prev => prev + 1)
    }
  }

  function handleReset() {
    const resetNow = new Date()
    setWorkedHours('')
    setNightHours('')
    setX2Hours('')
    setWowCases('')
    setStorms('')
    setTenure('')
    setTaxiExtra('')
    setWarningConfirmed(false)
    setSoftWarning(null)
    setResult(null)
    setErrors({})
    setKnowledge(true)
    setMonth(resetNow.getMonth())
    setYear(resetNow.getFullYear())
    resetSVData()
    setHistoryKey(prev => prev + 1)
  }

  function handleRestore(input) {
    if (!input) return
    setWorkedHours(input.workedHours !== undefined ? String(input.workedHours) : '')
    setNightHours(input.nightHours !== undefined ? String(input.nightHours) : '')
    setX2Hours(input.x2Hours !== undefined ? String(input.x2Hours) : '')
    setWowCases(input.wowCases !== undefined ? String(input.wowCases) : '')
    setStorms(input.storms !== undefined ? String(input.storms) : '')
    setTenure(input.tenure !== undefined ? String(input.tenure) : '')
    setTaxiExtra(input.taxiExtra !== undefined ? String(input.taxiExtra) : '0')
    setQualLevel(input.qualLevel || 1)
    setZoneId(input.zoneId || config.defaultZone)
    setSchedule(input.schedule || config.defaultSchedule)
    setKnowledge(input.knowledge !== undefined ? input.knowledge : true)
    setMonth(input.month !== undefined ? input.month : new Date().getMonth())
    setYear(input.year || new Date().getFullYear())
    setWarningConfirmed(false)
  }

  // Copy
  async function copyToClipboard(text, type) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch {}
  }

  function getShortResult() {
    if (!result) return ''
    return `Усього на руки: ${formatMoney(result.net)}`
  }

  function getDetailedResult() {
    if (!result) return ''
    const d = result.details
    let text = `Брутто: ${formatMoney(result.gross)}\n`
    text += `Податок (${(salaryConfig.tax * 100).toFixed(0)}%): -${formatMoney(result.tax)}\n`
    text += `Оклад: ${formatMoney(d.salaryPart)}\n`
    text += `Премія за зону (${d.zoneName}): ${formatMoney(d.zonePremiumPart)}\n`
    if (d.nightAmount > 0) text += `Нічні: +${formatMoney(d.nightAmount)}\n`
    if (d.x2Amount > 0) text += `х2: +${formatMoney(d.x2Amount)}\n`
    if (d.qualAmount > 0) text += `Квал. надбавка: +${formatMoney(d.qualAmount)}\n`
    if (d.tenureAmount > 0) text += `Стаж (${Math.round(d.tenurePercent * 100)}%): +${formatMoney(d.tenureAmount)}\n`
    if (d.knowledgeAmount > 0) text += `Знання (+1 год): +${formatMoney(d.knowledgeAmount)} (до податків)\n`
    if (d.wowAmount > 0) text += `Вау-кейси: +${formatMoney(d.wowAmount)} (після податків)\n`
    if (d.taxiExtraAmount > 0) text += `Таксі / доплати: +${formatMoney(d.taxiExtraAmount)} (після податків)\n`
    if (d.stormsAmount > 0) text += `Бурі: -${formatMoney(d.stormsAmount)}\n`
    text += `\nУсього на руки: ${formatMoney(result.net)}`
    return text
  }

  function getDetailedWithFormulas() {
    if (!result) return ''
    const d = result.details
    let text = getDetailedResult()
    text += `\n\n--- Формули ---\n`
    text += `Норма годин: ${d.normHours}\n`
    text += `Ефективні години: ${d.effectiveHours}\n`
    text += `Ставка/год: ${formatMoney(d.baseRate)}\n`
    text += `Основна: (${config.salary} + ${d.zonePremium}) / ${d.normHours} × ${d.effectiveHours} = ${formatMoney(d.baseSalary)}\n`
    if (d.nightAmount > 0) {
      text += `Ніч: ${config.salary} / ${d.normHours} × ${parseHours(nightHours) || 0} × ${config.nightBonus} = ${formatMoney(d.nightAmount)}\n`
    }
    if (d.x2Amount > 0) {
      text += `х2: ${formatMoney(d.baseRate)} × ${parseHours(x2Hours) || 0} = ${formatMoney(d.x2Amount)}\n`
    }
    if (d.tenureAmount > 0) {
      text += `Стаж: ${config.tenureBaseIncome} / ${d.normHours} × ${d.effectiveHours} × ${d.tenurePercent} = ${formatMoney(d.tenureAmount)}\n`
    }
    return text
  }

  const showDisclaimer = config.disclaimerMonths.includes(month)
  const currentZone = config.zones.find(z => z.id === zoneId)
  const zoneColor = zoneColors[zoneId]
  const currentZoneStyle = isDark ? zoneColor?.dark : zoneColor?.light

  function confirmWarning() {
    setWarningConfirmed(true)
  }

  function handleWowChange(e) {
    let val = e.target.value.replace(/\D/g, '')
    if (val !== '' && parseInt(val) > config.maxWowCases) {
      val = String(config.maxWowCases)
    }
    setWowCases(val)
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-slate-900/10 dark:border-slate-400/[.18]">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">SV</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Скинути
            </Button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 mt-4 space-y-3">
        
        {/* Row 1: Schedule + Month/Year */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <ButtonGroup
              label="Графік"
              options={config.schedules.map(s => ({ value: s, label: s }))}
              value={schedule}
              onChange={setSchedule}
              className="sm:min-w-[160px]"
            />
            <div className="flex gap-2 flex-1">
              <Select
                label="Місяць"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                options={monthNames.map((name, idx) => ({ value: idx, label: name }))}
                className="flex-1"
              />
              <Select
                label="Рік"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                options={config.availableYears.map(y => ({ value: y, label: String(y) }))}
                className="w-24"
              />
            </div>
          </div>
          {showDisclaimer && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg mt-3">
              ⚠️ {config.disclaimerText}
            </p>
          )}
          {normHours && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Норма: {normHours} год
            </p>
          )}
        </Card>

        {/* Row 2: Hours – all in one row on desktop */}
        <Card>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Години</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Input
              label=""
              value={advanceHours}
              disabled={true}
              placeholder="Аванс"
              hint=""
            />
            <div>
              <Input
                value={workedHours}
                onChange={(e) => { setWorkedHours(e.target.value); setWarningConfirmed(false) }}
                placeholder={normHours ? String(normHours) : '165'}
                error={errors.workedHours}
              />
              <p className="text-[10px] text-gray-400 mt-0.5 ml-1">відпрацьовані</p>
            </div>
            <div>
              <Input
                value={nightHours}
                onChange={(e) => setNightHours(e.target.value)}
                placeholder="0"
                error={errors.nightHours}
              />
              <p className="text-[10px] text-gray-400 mt-0.5 ml-1">ніч</p>
            </div>
            <div>
              <Input
                value={x2Hours}
                onChange={(e) => setX2Hours(e.target.value)}
                placeholder="0"
                error={errors.x2Hours}
              />
              <p className="text-[10px] text-gray-400 mt-0.5 ml-1">х2</p>
            </div>
            <Input
              value={alarmHours}
              disabled={true}
              placeholder="Тривога"
            />
          </div>
          {softWarning && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg animate-fade-in mt-2">
              <span className="text-sm text-amber-700 dark:text-amber-400 flex-1">{softWarning}</span>
              <Button size="sm" variant="secondary" onClick={confirmWarning}>
                Підтверджую
              </Button>
            </div>
          )}
        </Card>

        {/* Row 3: Qual/Zone/Knowledge + Tenure/Wow/Storms/Taxi */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-3">
              <ButtonGroup
                label="Квал. рівень"
                options={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                ]}
                value={qualLevel}
                onChange={setQualLevel}
                compact={true}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Зона рейтингу
                </label>
                <div className="relative">
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer appearance-none pr-10"
                    style={{
                      backgroundColor: currentZoneStyle?.bg,
                      borderColor: currentZoneStyle?.border,
                      color: currentZoneStyle?.text,
                    }}
                  >
                    {config.zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.name.charAt(0).toUpperCase() + z.name.slice(1)} ({formatMoney(z.premium, false)})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: currentZoneStyle?.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <Toggle
                label="Знання (+1 година)"
                checked={knowledge}
                onChange={setKnowledge}
              />
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <Input
                label="Стаж (повних років)"
                value={tenure}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setTenure(val)
                }}
                placeholder="0"
                hint="Кожен рік = +5%"
              />
              <Input
                label="Вау-кейси"
                value={wowCases}
                onChange={handleWowChange}
                placeholder="0"
                hint={`Макс. ${config.maxWowCases}`}
              />
              <Input
                label="Бурі (грн)"
                value={storms}
                onChange={(e) => setStorms(e.target.value)}
                placeholder="0"
                hint="Утримання після податків"
              />
              <Input
                label="Таксі / доплати (грн)"
                value={taxiExtra}
                onChange={(e) => setTaxiExtra(e.target.value)}
                placeholder="0"
                hint="Додається після податків"
              />
            </div>
          </div>
        </Card>

        {/* RESULTS */}
        {result && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ResultCard
                label="Брутто (до податків)"
                amount={result.gross}
                variant="default"
              />
              <ResultCard
                label="Усього на руки"
                amount={result.net}
                variant="success"
                subtitle={`Податок ${(salaryConfig.tax * 100).toFixed(0)}%: -${formatMoney(result.tax)}`}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => copyToClipboard(getShortResult(), 'short')}>
                {copied === 'short' ? '✓ Скопійовано' : '📋 Копіювати'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Сховати деталі' : '📊 Детальніше'}
              </Button>
              <Button size="sm" variant="secondary" onClick={saveToHistory}>
                💾 Зберегти
              </Button>
            </div>

            {/* Details */}
            {showDetails && (
              <Card className="animate-slide-down">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Деталізація
                </h3>
                <div className="space-y-1.5 text-sm">
                  <DetailRow label="Оклад" value={result.details.salaryPart} />
                  <DetailRow label={`Премія за зону (${result.details.zoneName})`} value={result.details.zonePremiumPart} />
                  {result.details.nightAmount > 0 && (
                    <DetailRow label="Нічні" value={result.details.nightAmount} plus />
                  )}
                  {result.details.x2Amount > 0 && (
                    <DetailRow label="х2" value={result.details.x2Amount} plus />
                  )}
                  {result.details.qualAmount > 0 && (
                    <DetailRow label="Квал. надбавка" value={result.details.qualAmount} plus />
                  )}
                  {result.details.tenureAmount > 0 && (
                    <DetailRow label={`Стаж (${Math.round(result.details.tenurePercent * 100)}%)`} value={result.details.tenureAmount} plus />
                  )}
                  {knowledge && result.details.knowledgeAmount > 0 && (
                    <DetailRow label="Знання (+1 год)" value={result.details.knowledgeAmount} sub="(враховано в основній + квал)" />
                  )}

                  <div className="border-t border-slate-900/5 dark:border-slate-400/10 pt-1.5 mt-1.5">
                    <DetailRow label="Брутто" value={result.gross} bold />
                    <DetailRow label={`Податок (${(salaryConfig.tax * 100).toFixed(0)}%)`} value={-result.tax} minus />
                    <DetailRow label="Після податків" value={result.details.afterTax} />
                  </div>

                  {(result.details.wowAmount > 0 || result.details.taxiExtraAmount > 0 || result.details.stormsAmount > 0) && (
                    <div className="border-t border-slate-900/5 dark:border-slate-400/10 pt-1.5 mt-1.5">
                      {result.details.wowAmount > 0 && (
                        <DetailRow label="Вау-кейси" value={result.details.wowAmount} plus sub="(без податку)" />
                      )}
                      {result.details.taxiExtraAmount > 0 && (
                        <DetailRow label="Таксі / доплати" value={result.details.taxiExtraAmount} plus sub="(без податку)" />
                      )}
                      {result.details.stormsAmount > 0 && (
                        <DetailRow label="Бурі" value={-result.details.stormsAmount} minus sub="(утримання)" />
                      )}
                    </div>
                  )}

                  <div className="border-t border-slate-900/5 dark:border-slate-400/10 pt-1.5 mt-1.5">
                    <DetailRow label="Усього на руки" value={result.net} bold success />
                  </div>
                </div>

                {/* Copy details */}
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-900/5 dark:border-slate-400/10">
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(getDetailedResult(), 'detailed')}>
                    {copied === 'detailed' ? '✓' : '📋'} Деталі
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(getDetailedWithFormulas(), 'formulas')}>
                    {copied === 'formulas' ? '✓' : '📋'} Деталі + формули
                  </Button>
                </div>
              </Card>
            )}

            {/* Formulas */}
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              {showFormulas ? 'Сховати формули' : '🧮 Показати формули'}
            </button>

            {showFormulas && (
              <Card className="animate-slide-down">
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 font-mono">
                  <p>Норма: {result.details.normHours} год</p>
                  <p>Ефективні: {result.details.effectiveHours} год {knowledge && '(+1 знання)'}</p>
                  <p>Ставка/год: ({config.salary} + {result.details.zonePremium}) / {result.details.normHours} = {formatMoney(result.details.baseRate)}</p>
                  <p>Основна: {formatMoney(result.details.baseRate)} × {result.details.effectiveHours} = {formatMoney(result.details.baseSalary)}</p>
                  {result.details.nightAmount > 0 && (
                    <p>Ніч: {config.salary} / {result.details.normHours} × {parseHours(nightHours)} × {config.nightBonus} = {formatMoney(result.details.nightAmount)}</p>
                  )}
                  {result.details.x2Amount > 0 && (
                    <p>х2: {formatMoney(result.details.baseRate)} × {parseHours(x2Hours)} = {formatMoney(result.details.x2Amount)}</p>
                  )}
                  {result.details.tenureAmount > 0 && (
                    <p>Стаж: {config.tenureBaseIncome} / {result.details.normHours} × {result.details.effectiveHours} × {result.details.tenurePercent} = {formatMoney(result.details.tenureAmount)}</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* History */}
        <HistoryPanel key={historyKey} onRestore={handleRestore} />
      </div>

      {/* Mobile sticky bottom bar */}
      {result && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-slate-900/10 dark:border-slate-400/[.18] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">На руки</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(result.net)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Detail row helper
function DetailRow({ label, value, plus, minus, bold, success, sub }) {
  const color = success
    ? 'text-emerald-600 dark:text-emerald-400'
    : minus || value < 0
    ? 'text-red-500 dark:text-red-400'
    : plus
    ? 'text-green-600 dark:text-green-400'
    : 'text-gray-900 dark:text-gray-100'

  return (
    <div className="flex justify-between items-start">
      <div>
        <span className={`${bold ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300`}>
          {label}
        </span>
        {sub && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{sub}</span>}
      </div>
      <span className={`${bold ? 'font-bold' : 'font-medium'} ${color} tabular-nums`}>
        {value < 0 ? '-' : plus ? '+' : ''}{formatMoney(Math.abs(value))}
      </span>
    </div>
  )
}
