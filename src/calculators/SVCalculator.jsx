import React, { useState, useEffect, useCallback } from 'react'
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

export default function SVCalculator({ onBack, theme, setTheme }) {
  const now = new Date()
  const savedForm = getSVForm()

  // Стан полів
  const [workedHours, setWorkedHours] = useState(savedForm?.workedHours ?? '')
  const [nightHours, setNightHours] = useState(savedForm?.nightHours ?? '')
  const [x2Hours, setX2Hours] = useState(savedForm?.x2Hours ?? '')
  const [wowCases, setWowCases] = useState(savedForm?.wowCases ?? '')
  const [storms, setStorms] = useState(savedForm?.storms ?? '')

  const [qualLevel, setQualLevel] = useState(getSVQual() || 1)
  const [zoneId, setZoneId] = useState(getSVZone() || config.defaultZone)
  const [schedule, setSchedule] = useState(getSVSchedule() || config.defaultSchedule)
  const [knowledge, setKnowledge] = useState(savedForm?.knowledge !== undefined ? savedForm.knowledge : true)

  const [month, setMonth] = useState(savedForm?.month !== undefined ? savedForm.month : now.getMonth())
  const [year, setYear] = useState(savedForm?.year || now.getFullYear())

  const [tenure, setTenure] = useState(savedForm?.tenure ?? '')

  // UI стан
  const [showExtra, setShowExtra] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [softWarning, setSoftWarning] = useState(null)
  const [warningConfirmed, setWarningConfirmed] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [copied, setCopied] = useState('')
  const [advanceHours] = useState('')
  const [alarmHours] = useState('')

  // Норма годин
  const normHours = getNormHours(schedule, month, year)

  // Збереження форми
  useEffect(() => {
    setSVForm({ workedHours, nightHours, x2Hours, wowCases, storms, knowledge, month, year, tenure })
  }, [workedHours, nightHours, x2Hours, wowCases, storms, knowledge, month, year, tenure])

  useEffect(() => { setSVQual(qualLevel) }, [qualLevel])
  useEffect(() => { setSVZone(zoneId) }, [zoneId])
  useEffect(() => { setSVSchedule(schedule) }, [schedule])

  // Авторозрахунок
  useEffect(() => {
    calculate()
  }, [workedHours, nightHours, x2Hours, qualLevel, zoneId, schedule, knowledge, month, year, wowCases, storms, warningConfirmed, tenure])

  // === ВАЛІДАЦІЯ ===
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
    if (num > 301 && !warningConfirmed) return null // оброблюється softWarning
    return null
  }

  function getFieldError(value) {
    if (value === '' || value === null) return null
    const num = parseHours(value)
    if (num === null) return 'Введіть число'
    if (num < 0) return 'Йойь, як таке можливо?🥹'
    return validateHalfStep(value)
  }

  // === РОЗРАХУНОК ===
  function calculate() {
    const newErrors = {}

    // Валідація
    const whErr = getWorkedHoursError(workedHours)
    if (whErr) newErrors.workedHours = whErr

    const nhErr = getFieldError(nightHours)
    if (nhErr) newErrors.nightHours = nhErr

    const x2Err = getFieldError(x2Hours)
    if (x2Err) newErrors.x2Hours = x2Err

    setErrors(newErrors)

    // Soft warning для 301+
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

    // Парсимо значення
    const hours = parseHours(workedHours) ?? normHours ?? 165
    const night = parseHours(nightHours) ?? 0
    const x2 = parseHours(x2Hours) ?? 0
    const wow = Math.min(Math.max(parseInt(wowCases) || 0, 0), config.maxWowCases)
    const stormsVal = parseFloat(String(storms).replace(/\s/g, '').replace(/[,\/]/g, '.')) || 0
    const tenureVal = parseInt(tenure) || 0

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
    })

    if (calcResult.error) {
      setResult(null)
      return
    }

    setResult(calcResult)
  }

  // Зберегти в історію
  function saveToHistory() {
    if (result && !result.error) {
      addSVHistory(result)
      setHistoryKey(prev => prev + 1)
    }
  }

  // Скидання
  function handleReset() {
    setWorkedHours('')
    setNightHours('')
    setX2Hours('')
    setWowCases('')
    setStorms('')
    setWarningConfirmed(false)
    setSoftWarning(null)
    setResult(null)
    setErrors({})
    resetSVData()
    setHistoryKey(prev => prev + 1)
  }

  // Копіювання
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
    text += `Основна ЗП: ${formatMoney(d.baseSalary)}\n`
    if (d.nightAmount > 0) text += `Нічні: +${formatMoney(d.nightAmount)}\n`
    if (d.x2Amount > 0) text += `х2: +${formatMoney(d.x2Amount)}\n`
    if (d.qualAmount > 0) text += `Квал. надбавка: +${formatMoney(d.qualAmount)}\n`
    if (d.tenureAmount > 0) text += `Стаж (${Math.round(d.tenurePercent * 100)}%): +${formatMoney(d.tenureAmount)}\n`
    if (d.knowledgeAmount > 0) text += `Знання (+1 год): +${formatMoney(d.knowledgeAmount)} (до податків)\n`
    if (d.wowAmount > 0) text += `Вау-кейси: +${formatMoney(d.wowAmount)} (після податків)\n`
    if (d.stormsAmount > 0) text += `Бури: -${formatMoney(d.stormsAmount)}\n`
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

  // Чи є примітка для місяця
  const showDisclaimer = config.disclaimerMonths.includes(month)

  // Підтвердження soft warning
  function confirmWarning() {
    setWarningConfirmed(true)
  }

  // Обробка wowCases
  function handleWowChange(e) {
    let val = e.target.value.replace(/\D/g, '')
    if (val !== '' && parseInt(val) > config.maxWowCases) {
      val = String(config.maxWowCases)
    }
    setWowCases(val)
  }

  // Зона з кольором
  const zoneOptions = config.zones.map(z => ({
    value: z.id,
    label: z.name.charAt(0).toUpperCase() + z.name.slice(1),
  }))

  const currentZone = config.zones.find(z => z.id === zoneId)

  return (
    <div className="min-h-screen pb-8">
      {/* Хедер */}
      <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">SV Калькулятор</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Скинути
            </Button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-4 mt-5 space-y-4">
        {/* Графік, Місяць, Рік */}
        <Card>
          <div className="space-y-4">
            <ButtonGroup
              label="Графік"
              options={config.schedules.map(s => ({ value: s, label: s }))}
              value={schedule}
              onChange={setSchedule}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Місяць"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                options={monthNames.map((name, idx) => ({ value: idx, label: name }))}
              />
              <Select
                label="Рік"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                options={config.availableYears.map(y => ({ value: y, label: String(y) }))}
              />
            </div>
            {showDisclaimer && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg">
                ⚠️ {config.disclaimerText}
              </p>
            )}
            {normHours && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Норма годин: {normHours}
              </p>
            )}
          </div>
        </Card>

        {/* Основні поля */}
        <Card>
          <div className="space-y-4">
            <Input
              label="Години"
              value={workedHours}
              onChange={(e) => { setWorkedHours(e.target.value); setWarningConfirmed(false) }}
              placeholder={normHours ? String(normHours) : '165'}
              error={errors.workedHours}
            />

            {softWarning && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg animate-fade-in">
                <span className="text-sm text-amber-700 dark:text-amber-400 flex-1">{softWarning}</span>
                <Button size="sm" variant="secondary" onClick={confirmWarning}>
                  Так, підтверджую
                </Button>
              </div>
            )}

            <Input
              label="Ніч"
              value={nightHours}
              onChange={(e) => setNightHours(e.target.value)}
              placeholder="0"
              error={errors.nightHours}
            />

            <Input
              label="х2"
              value={x2Hours}
              onChange={(e) => setX2Hours(e.target.value)}
              placeholder="0"
              error={errors.x2Hours}
            />
          </div>
        </Card>

        {/* Кваліфікація та зона */}
        <Card>
          <div className="space-y-4">
            <ButtonGroup
              label="Квал. рівень"
              options={[
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
              ]}
              value={qualLevel}
              onChange={setQualLevel}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Зона рейтингу
              </label>
              <div className="relative">
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer appearance-none pr-10"
                  style={{
                    backgroundColor: currentZone?.color + '22',
                    borderColor: currentZone?.color,
                    color: 'inherit',
                  }}
                >
                  {config.zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name.charAt(0).toUpperCase() + z.name.slice(1)} ({formatMoney(z.premium, false)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </Card>

        {/* Додаткові поля */}
        <div>
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-2"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showExtra ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Додаткові поля
          </button>

          {showExtra && (
            <Card className="animate-slide-down">
              <div className="space-y-4">
                <Input
                  label="Аванс (години)"
                  value={advanceHours}
                  disabled={true}
                  placeholder="Скоро..."
                  hint="Тимчасово недоступне"
                />
                <Input
                  label="Тривога (години)"
                  value={alarmHours}
                  disabled={true}
                  placeholder="Скоро..."
                  hint="Тимчасово недоступне"
                />
                <Input
                  label="Вау-кейси"
                  value={wowCases}
                  onChange={handleWowChange}
                  placeholder="0"
                  hint={`Максимум ${config.maxWowCases}`}
                />
                <Input
                  label="Бури (грн)"
                  value={storms}
                  onChange={(e) => setStorms(e.target.value)}
                  placeholder="0"
                  hint="Сума утримання після податків"
                />
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
              </div>
            </Card>
          )}
        </div>

        {/* РЕЗУЛЬТАТИ */}
        {result && (
          <div className="space-y-4 animate-fade-in">
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

            {/* Кнопки дій */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => { copyToClipboard(getShortResult(), 'short') }}
              >
                {copied === 'short' ? '✓ Скопійовано' : '📋 Копіювати'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Сховати деталі' : '📊 Детальніше'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={saveToHistory}
              >
                💾 Зберегти
              </Button>
            </div>

            {/* Деталізація */}
            {showDetails && (
              <Card className="animate-slide-down">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Деталізація
                </h3>
                <div className="space-y-2 text-sm">
                  <DetailRow label="Основна ЗП" value={result.details.baseSalary} />
                  <DetailRow label={`Премія за зону (${result.details.zoneName})`} value={result.details.zonePremium} sub="(враховано в основній)" />
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
                  {knowledge && (
                    <DetailRow label="Знання (+1 год)" value={result.details.knowledgeAmount} sub="(враховано в основній + квал)" />
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <DetailRow label="Брутто" value={result.gross} bold />
                    <DetailRow label={`Податок (${(salaryConfig.tax * 100).toFixed(0)}%)`} value={-result.tax} minus />
                    <DetailRow label="Після податків" value={result.details.afterTax} />
                  </div>

                  {(result.details.wowAmount > 0 || result.details.stormsAmount > 0) && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      {result.details.wowAmount > 0 && (
                        <DetailRow label="Вау-кейси" value={result.details.wowAmount} plus sub="(без податку)" />
                      )}
                      {result.details.stormsAmount > 0 && (
                        <DetailRow label="Бури" value={-result.details.stormsAmount} minus sub="(утримання)" />
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <DetailRow label="Усього на руки" value={result.net} bold success />
                  </div>
                </div>

                {/* Кнопки копіювання деталей */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(getDetailedResult(), 'detailed')}>
                    {copied === 'detailed' ? '✓' : '📋'} Деталі
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(getDetailedWithFormulas(), 'formulas')}>
                    {copied === 'formulas' ? '✓' : '📋'} Деталі + формули
                  </Button>
                </div>
              </Card>
            )}

            {/* Формули */}
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              {showFormulas ? 'Сховати формули' : '🧮 Показати формули розрахунку'}
            </button>

            {showFormulas && (
              <Card className="animate-slide-down">
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 font-mono">
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
                  {result.details.qualAmount > 0 && (
                    <p>Квал: надбавка / {result.details.normHours} × {result.details.effectiveHours} = {formatMoney(result.details.qualAmount)}</p>
                  )}
                  {result.details.tenureAmount > 0 && (
                    <p>Стаж: {config.tenureBaseIncome} / {result.details.normHours} × {result.details.effectiveHours} × {result.details.tenurePercent} = {formatMoney(result.details.tenureAmount)}</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Історія */}
        <HistoryPanel key={historyKey} />
      </div>
    </div>
  )
}

// Допоміжний компонент рядка деталізації
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
