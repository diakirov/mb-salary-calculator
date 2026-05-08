import salaryConfig from '../config/salaryConfig.js'

/**
 * Розрахунок зарплати для ролі SV.
 * 
 * @param {Object} params — параметри розрахунку
 * @param {number} params.workedHours — відпрацьовані години
 * @param {number} params.nightHours — нічні години
 * @param {number} params.x2Hours — години по х2
 * @param {number} params.qualLevel — кваліфікаційний рівень (1, 2, 3)
 * @param {number} params.zoneId — зона рейтингу (1-5)
 * @param {number} params.wowCases — кількість вау-кейсів
 * @param {boolean} params.knowledge — знання (true/false)
 * @param {string} params.schedule — графік ('2/2' або '5/2')
 * @param {number} params.month — місяць (0-11)
 * @param {number} params.year — рік
 * @param {number} params.storms — бури (грн, вирахування після податків)
 * @returns {Object} — результат розрахунку
 */
export function calculateSVSalary(params) {
  const {
    workedHours = 0,
    nightHours = 0,
    x2Hours = 0,
    qualLevel = 1,
    zoneId = 3,
    wowCases = 0,
    knowledge = true,
    schedule = '2/2',
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
    storms = 0,
    tenure = 0,
  } = params

  const config = salaryConfig.sv
  const tax = salaryConfig.tax

  // Норма годин
  const normHours = getNormHours(schedule, month, year)
  if (!normHours || normHours <= 0) {
    return { error: 'Норма годин не знайдена для обраного періоду' }
  }

  // Знання: +1 година до базових розрахунків
  const effectiveHours = knowledge ? workedHours + 1 : workedHours
  const knowledgeHour = knowledge ? 1 : 0

  // Премія за зону
  const zone = config.zones.find(z => z.id === zoneId)
  if (!zone) {
    return { error: 'Зону не знайдено' }
  }
  const zonePremium = zone.premium

  // Основна ЗП: (Оклад + Премія за зону) / Норма * Відпрацьовані
  const baseRate = (config.salary + zonePremium) / normHours
  const baseSalary = baseRate * effectiveHours

  // Окрема сума за знання (+1 год)
  const knowledgeAmount = baseRate * knowledgeHour

  // За ніч: Оклад / Норма * Нічні години * Нічна надбавка
  const nightAmount = (config.salary / normHours) * nightHours * config.nightBonus

  // За х2: (Оклад + Премія) / Норма * Години х2
  // x2 години вже включені у workedHours, тому це ДОДАТКОВА оплата (другий ікс)
  const x2Amount = baseRate * x2Hours

  // Стаж: цільовий дохід / норма * ефективні години * (стаж * 5%)
  const tenurePercent = Math.max(0, Math.floor(tenure)) * config.tenurePercentPerYear
  const tenureBase = (config.tenureBaseIncome / normHours) * effectiveHours
  const tenureAmount = tenurePercent > 0 ? tenureBase * tenurePercent : 0

  // Квал. надбавка
  const qualAmount = calculateQualBonus(qualLevel, zoneId, normHours, effectiveHours)

  // Окрема сума квал. надбавки за знання (+1 год)
  const qualKnowledgeAmount = knowledge ? calculateQualBonusPerHour(qualLevel, zoneId, normHours) : 0

  // Сума до податків (брутто)
  const grossSalary = baseSalary + nightAmount + x2Amount + qualAmount + tenureAmount

  // Податок
  const taxAmount = grossSalary * tax

  // Після податків
  const afterTax = grossSalary * (1 - tax)

  // Вау-кейси (після податків, не оподатковуються)
  const wowAmount = Math.min(wowCases, config.maxWowCases) * config.wowCasePayment

  // Бури (віднімаються від нетто)
  const stormsAmount = Math.max(0, storms)

  // Загальна виплата на руки
  const netSalary = afterTax + wowAmount - stormsAmount

  return {
    // Основні результати
    gross: roundMoney(grossSalary),
    net: roundMoney(netSalary),
    tax: roundMoney(taxAmount),
    taxRate: tax,

    // Деталізація
    details: {
      normHours,
      effectiveHours,
      baseRate: roundMoney(baseRate),
      baseSalary: roundMoney(baseSalary),
      knowledgeAmount: roundMoney(knowledgeAmount),
      nightAmount: roundMoney(nightAmount),
      x2Amount: roundMoney(x2Amount),
      qualAmount: roundMoney(qualAmount),
      qualKnowledgeAmount: roundMoney(qualKnowledgeAmount),
      zonePremium,
      zoneName: zone.name,
      wowAmount: roundMoney(wowAmount),
      stormsAmount: roundMoney(stormsAmount),
      afterTax: roundMoney(afterTax),
      enureAmount: roundMoney(tenureAmount),
      tenurePercent,
      tenureBase: roundMoney(tenureBase),
    },

    // Вхідні дані (для збереження в історії)
    input: { ...params, effectiveHours, normHours },
  }
}

/**
 * Розрахунок надбавки за кваліфікаційний рівень
 */
function calculateQualBonus(qualLevel, zoneId, normHours, effectiveHours) {
  const config = salaryConfig.sv
  const rules = config.qualificationRules
  const levels = config.qualificationLevels

  if (qualLevel === 1) return 0

  if (qualLevel === 2) {
    // 2-й рівень: зона не нижче 3-ї (зелена, салатова, жовта)
    if (zoneId <= rules[2].minZone) {
      return (levels[2].bonus / normHours) * effectiveHours
    }
    return 0
  }

  if (qualLevel === 3) {
    // 3-й рівень: зона не нижче 2-ї (зелена, салатова)
    if (zoneId <= rules[3].minZone) {
      return (levels[3].bonus / normHours) * effectiveHours
    }
    // Якщо жовта (3) — як за 2-й рівень
    if (zoneId === 3) {
      return (levels[2].bonus / normHours) * effectiveHours
    }
    // Рожева або червона — 0
    return 0
  }

  return 0
}

/**
 * Ставка квал. надбавки за 1 годину (для деталізації знань)
 */
function calculateQualBonusPerHour(qualLevel, zoneId, normHours) {
  const config = salaryConfig.sv
  const rules = config.qualificationRules
  const levels = config.qualificationLevels

  if (qualLevel === 1) return 0

  if (qualLevel === 2) {
    if (zoneId <= rules[2].minZone) {
      return levels[2].bonus / normHours
    }
    return 0
  }

  if (qualLevel === 3) {
    if (zoneId <= rules[3].minZone) {
      return levels[3].bonus / normHours
    }
    if (zoneId === 3) {
      return levels[2].bonus / normHours
    }
    return 0
  }

  return 0
}

/**
 * Отримати норму годин для заданого графіку, місяця та року
 */
export function getNormHours(schedule, month, year) {
  const config = salaryConfig.sv
  const yearData = config.normHours[year]
  if (!yearData) return null

  const scheduleData = yearData[schedule]
  if (!scheduleData) return null

  return scheduleData[month] || null
}

/**
 * Округлення до 2 знаків
 */
function roundMoney(value) {
  return Math.round(value * 100) / 100
}
