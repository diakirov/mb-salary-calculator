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

const zoneTheme = {
  1: { light: { bg: '#DCFCE7', border: '#22C55E', text: '#14532D' }, dark: { bg: 'rgba(34,197,94,.12)', border: '#22C55E', text: '#86EFAC' } },
  2: { light: { bg: '#ECFCCB', border: '#84CC16', text: '#365314' }, dark: { bg: 'rgba(132,204,22,.12)', border: '#84CC16', text: '#BEF264' } },
  3: { light: { bg: '#FEF9C3', border: '#EAB308', text: '#713F12' }, dark: { bg: 'rgba(234,179,8,.12)', border: '#EAB308', text: '#FDE047' } },
  4: { light: { bg: '#FCE7F3', border: '#EC4899', text: '#831843' }, dark: { bg: 'rgba(236,72,153,.12)', border: '#EC4899', text: '#F9A8D4' } },
  5: { light: { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D' }, dark: { bg: 'rgba(239,68,68,.12)', border: '#EF4444', text: '#FCA5A5' } },
}

export default function SVCalculator({ onBack, theme, setTheme }) {
  const now = new Date()
  const savedForm = getSVForm()

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
  const currentZoneStyle = isDark ? zoneTheme[zoneId]?.dark : zoneTheme[zoneId]?.light

  // Save
  useEffect(() => {
    setSVForm({ workedHours, nightHours, x2Hours, wowCases, storms, knowledge, month, year, tenure, taxiExtra })
  }, [workedHours, nightHours, x2Hours, wowCases, storms, knowledge, month, year, tenure, taxiExtra])
  useEffect(() => { setSVQual(qualLevel) }, [qualLevel])
  useEffect(() => { setSVZone(zoneId) }, [zoneId])
  useEffect(() => { setSVSchedule(schedule) }, [schedule])

  // Auto calc
  useEffect(() => { calculate() }, [workedHours, nightHours, x2Hours, qualLevel, zoneId, schedule, knowledge, month, year, wowCases, storms, warningConfirmed, tenure, taxiExtra])

  // Validation
  function parseHours(value) {
    if (value === '' || value === null || value === undefined) return null
    let c = String(value).replace(/\s/g, '').replace(/[,\/]/g, '.')
    const n = parseFloat(c)
    return isNaN(n) ? null : n
  }
  function validateHalfStep(value) {
    const n = parseHours(value)
    if (n === null) return null
    const d = n % 1
    if (d !== 0 && d !== 0.5) return 'Лише цілі або .5'
    return null
  }
  function getWorkedHoursError(value) {
    if (value === '' || value === null) return null
    const n = parseHours(value)
    if (n === null) return 'Введіть число'
    if (n < 0) return 'Йойь, як таке можливо?🥹'
    const h = validateHalfStep(value)
    if (h) return h
    if (n > 501) return 'Ну стільки точно не зможеш😁'
    return null
  }
  function getFieldError(value) {
    if (value === '' || value === null) return null
    const n = parseHours(value)
    if (n === null) return 'Введіть число'
    if (n < 0) return 'Від\'ємне значення'
    return validateHalfStep(value)
  }

  // Calculate
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
    } else { setSoftWarning(null) }

    if (Object.keys(newErrors).length > 0) { setResult(null); return }

    const hours = parseHours(workedHours) ?? normHours ?? 165
    const night = parseHours(nightHours) ?? 0
    const x2 = parseHours(x2Hours) ?? 0
    const wow = Math.min(Math.max(parseInt(wowCases) || 0, 0), config.maxWowCases)
    const stormsVal = parseFloat(String(storms).replace(/\s/g, '').replace(/[,\/]/g, '.')) || 0
    const tenureVal = parseInt(tenure) || 0
    const taxiVal = parseFloat(String(taxiExtra).replace(/\s/g, '').replace(/[,\/]/g, '.')) || 0

    if (!normHours) { setResult(null); return }

    const calcResult = calculateSVSalary({
      workedHours: hours, nightHours: night, x2Hours: x2,
      qualLevel, zoneId, wowCases: wow, knowledge, schedule,
      month, year, storms: Math.max(0, stormsVal),
      tenure: tenureVal, taxiExtra: Math.max(0, taxiVal),
    })
    if (calcResult.error) { setResult(null); return }
    setResult(calcResult)
  }

  function saveToHistory() {
    if (result && !result.error) { addSVHistory(result); setHistoryKey(p => p + 1) }
  }
  function handleReset() {
    const n = new Date()
    setWorkedHours(''); setNightHours(''); setX2Hours('')
    setWowCases(''); setStorms(''); setTenure(''); setTaxiExtra('')
    setWarningConfirmed(false); setSoftWarning(null)
    setResult(null); setErrors({}); setKnowledge(true)
    setMonth(n.getMonth()); setYear(n.getFullYear())
    resetSVData(); setHistoryKey(p => p + 1)
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
    setQualLevel(input.qualLevel || 1); setZoneId(input.zoneId || config.defaultZone)
    setSchedule(input.schedule || config.defaultSchedule)
    setKnowledge(input.knowledge !== undefined ? input.knowledge : true)
    setMonth(input.month !== undefined ? input.month : new Date().getMonth())
    setYear(input.year || new Date().getFullYear())
    setWarningConfirmed(false)
  }

  async function copyToClipboard(text, type) {
    try { await navigator.clipboard.writeText(text); setCopied(type); setTimeout(() => setCopied(''), 2000) } catch {}
  }
  function getShortResult() {
    if (!result) return ''
    return `Усього на руки: ${formatMoney(result.net)}`
  }
  function getDetailedResult() {
    if (!result) return ''
    const d = result.details
    let t = `Брутто: ${formatMoney(result.gross)}\n`
    t += `Податок (${(salaryConfig.tax*100).toFixed(0)}%): -${formatMoney(result.tax)}\n`
    t += `Оклад: ${formatMoney(d.salaryPart)}\n`
    t += `Премія за зону (${d.zoneName}): ${formatMoney(d.zonePremiumPart)}\n`
    if (d.nightAmount > 0) t += `Нічні: +${formatMoney(d.nightAmount)}\n`
    if (d.x2Amount > 0) t += `х2: +${formatMoney(d.x2Amount)}\n`
    if (d.qualAmount > 0) t += `Квал. надбавка: +${formatMoney(d.qualAmount)}\n`
    if (d.tenureAmount > 0) t += `Стаж (${Math.round(d.tenurePercent*100)}%): +${formatMoney(d.tenureAmount)}\n`
    if (d.knowledgeAmount > 0) t += `Знання (+1 год): +${formatMoney(d.knowledgeAmount)}\n`
    if (d.wowAmount > 0) t += `Вау-кейси: +${formatMoney(d.wowAmount)}\n`
    if (d.taxiExtraAmount > 0) t += `Таксі / доплати: +${formatMoney(d.taxiExtraAmount)}\n`
    if (d.stormsAmount > 0) t += `Бурі: -${formatMoney(d.stormsAmount)}\n`
    t += `\nУсього на руки: ${formatMoney(result.net)}`
    return t
  }
  function getDetailedWithFormulas() {
    if (!result) return ''
    const d = result.details
    let t = getDetailedResult()
    t += `\n\n--- Формули ---\n`
    t += `Норма: ${d.normHours} · Ефективні: ${d.effectiveHours}\n`
    t += `Ставка/год: (${config.salary}+${d.zonePremium})/${d.normHours} = ${formatMoney(d.baseRate)}\n`
    if (d.nightAmount > 0) t += `Ніч: ${config.salary}/${d.normHours}×${parseHours(nightHours)||0}×${config.nightBonus} = ${formatMoney(d.nightAmount)}\n`
    if (d.x2Amount > 0) t += `х2: ${formatMoney(d.baseRate)}×${parseHours(x2Hours)||0} = ${formatMoney(d.x2Amount)}\n`
    if (d.tenureAmount > 0) t += `Стаж: ${config.tenureBaseIncome}/${d.normHours}×${d.effectiveHours}×${d.tenurePercent} = ${formatMoney(d.tenureAmount)}\n`
    return t
  }

  function confirmWarning() { setWarningConfirmed(true) }
  function handleWowChange(e) {
    let v = e.target.value.replace(/\D/g, '')
    if (v !== '' && parseInt(v) > config.maxWowCases) v = String(config.maxWowCases)
    setWowCases(v)
  }

  const showDisclaimer = config.disclaimerMonths.includes(month)

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] pb-20 sm:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0d1322]/80 backdrop-blur-md border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-app mx-auto px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a2340] text-gray-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">SV</span>
            {normHours && <span className="text-2xs text-gray-300 dark:text-gray-600 ml-2">норма {normHours}г</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleReset} className="text-2xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded">Скинути</button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-app mx-auto px-4 mt-4">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ══════ LEFT: INPUTS ══════ */}
          <div className="flex-1 lg:max-w-[65%] space-y-3">

            {/* Config row */}
            <Card>
              <div className="flex flex-wrap items-end gap-3">
                <ButtonGroup
                  label="Графік"
                  options={config.schedules.map(s => ({ value: s, label: s }))}
                  value={schedule}
                  onChange={setSchedule}
                />
                <Select
                  label="Місяць"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  options={monthNames.map((n, i) => ({ value: i, label: n }))}
                  className="w-[140px]"
                />
                <Select
                  label="Рік"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  options={config.availableYears.map(y => ({ value: y, label: String(y) }))}
                  className="w-[90px]"
                />
                <div className="space-y-0.5">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Зона</label>
                  <div className="relative">
                    <select
                      value={zoneId}
                      onChange={(e) => setZoneId(parseInt(e.target.value))}
                      className="h-[38px] pl-3 pr-7 rounded-lg border text-xs font-medium cursor-pointer appearance-none transition-colors"
                      style={{ backgroundColor: currentZoneStyle?.bg, borderColor: currentZoneStyle?.border, color: currentZoneStyle?.text }}
                    >
                      {config.zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name.charAt(0).toUpperCase() + z.name.slice(1)}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3 h-3" style={{ color: currentZoneStyle?.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
              {showDisclaimer && (
                <p className="text-2xs text-amber-600 dark:text-amber-400 mt-2">⚠️ {config.disclaimerText}</p>
              )}
            </Card>

            {/* Hours */}
            <Card>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Години</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div>
                  <Input value={advanceHours} disabled placeholder="—" />
                  <p className="text-2xs text-gray-300 dark:text-gray-600 mt-0.5 text-center">аванс</p>
                </div>
                <div>
                  <Input
                    value={workedHours}
                    onChange={(e) => { setWorkedHours(e.target.value); setWarningConfirmed(false) }}
                    placeholder={normHours ? String(normHours) : '165'}
                    error={errors.workedHours}
                  />
                  <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 text-center">відпрацьовані</p>
                </div>
                <div>
                  <Input value={nightHours} onChange={(e) => setNightHours(e.target.value)} placeholder="0" error={errors.nightHours} />
                  <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 text-center">🌙 ніч</p>
                </div>
                <div>
                  <Input value={x2Hours} onChange={(e) => setX2Hours(e.target.value)} placeholder="0" error={errors.x2Hours} />
                  <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 text-center">⚡ x2</p>
                </div>
                <div>
                  <Input value={alarmHours} disabled placeholder="—" />
                  <p className="text-2xs text-gray-300 dark:text-gray-600 mt-0.5 text-center">тривога</p>
                </div>
              </div>
              {softWarning && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-xs text-amber-700 dark:text-amber-400 animate-fade-in">
                  <span className="flex-1">{softWarning}</span>
                  <button onClick={confirmWarning} className="text-2xs font-medium px-2 py-1 rounded bg-amber-100 dark:bg-amber-800/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors">OK</button>
                </div>
              )}
            </Card>

            {/* Bonuses / Corrections */}
            <Card>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Бонуси / корекції</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                <ButtonGroup
                  label="Квал."
                  options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]}
                  value={qualLevel}
                  onChange={setQualLevel}
                  compact
                />
                <Input
                  label="Стаж (років)"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  hint="+5% / рік"
                />
                <Input
                  label="WOW"
                  value={wowCases}
                  onChange={handleWowChange}
                  placeholder="0"
                  hint={`макс. ${config.maxWowCases}`}
                />
                <div className="flex items-end pb-1">
                  <Toggle label="Знання" checked={knowledge} onChange={setKnowledge} />
                </div>
                <Input
                  label="Бурі (грн)"
                  value={storms}
                  onChange={(e) => setStorms(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="🚕 Таксі / доплати"
                  value={taxiExtra}
                  onChange={(e) => setTaxiExtra(e.target.value)}
                  placeholder="0"
                />
              </div>
            </Card>
          </div>

          {/* ══════ RIGHT: RESULTS ══════ */}
          <div className="w-full lg:w-[35%] lg:max-w-[480px]">
            <div className="lg:sticky lg:top-14 space-y-3">

              {/* Main result */}
              <Card active={!!result}>
                {result ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <ResultCard label="Усього на руки" amount={result.net} variant="success" />
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => copyToClipboard(getShortResult(), 'short')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a2340] text-gray-300 dark:text-gray-600 hover:text-accent text-xs transition-colors" title="Копіювати">
                          {copied === 'short' ? '✓' : '📋'}
                        </button>
                        <button onClick={saveToHistory} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a2340] text-gray-300 dark:text-gray-600 hover:text-accent text-xs transition-colors" title="Зберегти">
                          💾
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-[rgba(15,23,42,0.05)] dark:border-[rgba(255,255,255,0.04)] pt-2">
                      <ResultCard label="Брутто" amount={result.gross} variant="default" />
                      <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Податок {(salaryConfig.tax*100).toFixed(0)}%: -{formatMoney(result.tax)}
                      </p>
                    </div>

                    {/* Toggle details */}
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-2xs text-gray-400 dark:text-gray-500 hover:text-accent transition-colors"
                    >
                      {showDetails ? '▾ Сховати деталі' : '▸ Деталі'}
                    </button>

                    {showDetails && (
                      <div className="space-y-1 text-xs animate-fade-in border-t border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.03)] pt-2">
                        <DRow label="Оклад" value={result.details.salaryPart} />
                        <DRow label={`Премія (${result.details.zoneName})`} value={result.details.zonePremiumPart} />
                        {result.details.nightAmount > 0 && <DRow label="🌙 Нічні" value={result.details.nightAmount} plus />}
                        {result.details.x2Amount > 0 && <DRow label="⚡ х2" value={result.details.x2Amount} plus />}
                        {result.details.qualAmount > 0 && <DRow label="Квал." value={result.details.qualAmount} plus />}
                        {result.details.tenureAmount > 0 && <DRow label={`Стаж (${Math.round(result.details.tenurePercent*100)}%)`} value={result.details.tenureAmount} plus />}
                        {knowledge && result.details.knowledgeAmount > 0 && <DRow label="Знання (+1г)" value={result.details.knowledgeAmount} sub="до подат." />}

                        <div className="border-t border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.03)] my-1" />
                        <DRow label="Брутто" value={result.gross} bold />
                        <DRow label="Податок" value={-result.tax} minus />
                        <DRow label="Після податків" value={result.details.afterTax} />

                        {(result.details.wowAmount > 0 || result.details.taxiExtraAmount > 0 || result.details.stormsAmount > 0) && (
                          <>
                            <div className="border-t border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.03)] my-1" />
                            {result.details.wowAmount > 0 && <DRow label="WOW" value={result.details.wowAmount} plus />}
                            {result.details.taxiExtraAmount > 0 && <DRow label="🚕 Таксі" value={result.details.taxiExtraAmount} plus />}
                            {result.details.stormsAmount > 0 && <DRow label="Бурі" value={-result.details.stormsAmount} minus />}
                          </>
                        )}

                        <div className="border-t border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.03)] my-1" />
                        <DRow label="На руки" value={result.net} bold accent />

                        {/* Copy details */}
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => copyToClipboard(getDetailedResult(), 'det')} className="text-2xs text-gray-400 hover:text-accent transition-colors">
                            {copied === 'det' ? '✓ скопійовано' : '📋 деталі'}
                          </button>
                          <button onClick={() => copyToClipboard(getDetailedWithFormulas(), 'form')} className="text-2xs text-gray-400 hover:text-accent transition-colors">
                            {copied === 'form' ? '✓ скопійовано' : '📋 + формули'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Formulas toggle */}
                    <button
                      onClick={() => setShowFormulas(!showFormulas)}
                      className="text-2xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    >
                      {showFormulas ? '▾ формули' : '▸ формули'}
                    </button>
                    {showFormulas && (
                      <div className="text-2xs font-mono text-gray-400 dark:text-gray-500 space-y-0.5 animate-fade-in">
                        <p>({config.salary}+{result.details.zonePremium})/{result.details.normHours}×{result.details.effectiveHours} = {formatMoney(result.details.baseSalary)}</p>
                        {result.details.nightAmount > 0 && <p>ніч: {config.salary}/{result.details.normHours}×{parseHours(nightHours)}×{config.nightBonus} = {formatMoney(result.details.nightAmount)}</p>}
                        {result.details.x2Amount > 0 && <p>х2: {formatMoney(result.details.baseRate)}×{parseHours(x2Hours)} = {formatMoney(result.details.x2Amount)}</p>}
                        {result.details.tenureAmount > 0 && <p>стаж: {config.tenureBaseIncome}/{result.details.normHours}×{result.details.effectiveHours}×{result.details.tenurePercent} = {formatMoney(result.details.tenureAmount)}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-300 dark:text-gray-600">Введи години для розрахунку</p>
                  </div>
                )}
              </Card>

              {/* History */}
              <HistoryPanel key={historyKey} onRestore={handleRestore} />
            </div>
          </div>
        </div>
      </div>

            {/* Mobile sticky bottom */}
      {result && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-20 bg-white/90 dark:bg-[#0d1322]/90 backdrop-blur-md border-t border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.05)] px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-gray-400 dark:text-gray-500">На руки</span>
            <span className="text-base font-bold text-accent-muted tabular-nums">
              {formatMoney(result.net)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Detail row
function DRow({ label, value, plus, minus, bold, accent, sub }) {
  if (value === undefined || value === null) return null
  const color = accent
    ? 'text-accent-muted'
    : minus || value < 0
    ? 'text-red-400'
    : plus
    ? 'text-emerald-400'
    : 'text-gray-700 dark:text-gray-300'

  return (
    <div className="flex justify-between items-center py-0.5">
      <div className="flex items-center gap-1">
        <span className={`${bold ? 'font-semibold' : ''} text-gray-500 dark:text-gray-400`}>{label}</span>
        {sub && <span className="text-2xs text-gray-300 dark:text-gray-600">({sub})</span>}
      </div>
      <span className={`tabular-nums ${bold ? 'font-semibold' : 'font-medium'} ${color}`}>
        {value < 0 ? '-' : plus ? '+' : ''}{formatMoney(Math.abs(value))}
      </span>
    </div>
  )
}
