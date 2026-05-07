const KEYS = {
  THEME: 'salary-calc-theme',
  ROLE: 'salary-calc-role',
  SV_FORM: 'salary-calc-sv-form',
  SV_HISTORY: 'salary-calc-sv-history',
  SV_QUAL: 'salary-calc-sv-qual',
  SV_ZONE: 'salary-calc-sv-zone',
  SV_SCHEDULE: 'salary-calc-sv-schedule',
}

const MAX_HISTORY = 10

// ============================
// ТЕМА
// ============================
export function getTheme() {
  try {
    return localStorage.getItem(KEYS.THEME)
  } catch {
    return null
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEYS.THEME, theme)
  } catch {}
}

// ============================
// РОЛЬ
// ============================
export function getRole() {
  try {
    return localStorage.getItem(KEYS.ROLE)
  } catch {
    return null
  }
}

export function setRole(role) {
  try {
    localStorage.setItem(KEYS.ROLE, role)
  } catch {}
}

// ============================
// SV ФОРМА
// ============================
export function getSVForm() {
  try {
    const data = localStorage.getItem(KEYS.SV_FORM)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setSVForm(formData) {
  try {
    localStorage.setItem(KEYS.SV_FORM, JSON.stringify(formData))
  } catch {}
}

// ============================
// SV ІСТОРІЯ
// ============================
export function getSVHistory() {
  try {
    const data = localStorage.getItem(KEYS.SV_HISTORY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addSVHistory(result) {
  try {
    const history = getSVHistory()
    history.unshift({
      ...result,
      timestamp: Date.now(),
    })
    // Зберігаємо лише останні MAX_HISTORY
    const trimmed = history.slice(0, MAX_HISTORY)
    localStorage.setItem(KEYS.SV_HISTORY, JSON.stringify(trimmed))
  } catch {}
}

export function clearSVHistory() {
  try {
    localStorage.removeItem(KEYS.SV_HISTORY)
  } catch {}
}

// ============================
// SV НАЛАШТУВАННЯ
// ============================
export function getSVQual() {
  try {
    const val = localStorage.getItem(KEYS.SV_QUAL)
    return val ? parseInt(val) : null
  } catch {
    return null
  }
}

export function setSVQual(level) {
  try {
    localStorage.setItem(KEYS.SV_QUAL, String(level))
  } catch {}
}

export function getSVZone() {
  try {
    const val = localStorage.getItem(KEYS.SV_ZONE)
    return val ? parseInt(val) : null
  } catch {
    return null
  }
}

export function setSVZone(zone) {
  try {
    localStorage.setItem(KEYS.SV_ZONE, String(zone))
  } catch {}
}

export function getSVSchedule() {
  try {
    return localStorage.getItem(KEYS.SV_SCHEDULE)
  } catch {
    return null
  }
}

export function setSVSchedule(schedule) {
  try {
    localStorage.setItem(KEYS.SV_SCHEDULE, schedule)
  } catch {}
}

// ============================
// СКИДАННЯ
// ============================
export function resetSVData() {
  try {
    localStorage.removeItem(KEYS.SV_FORM)
    localStorage.removeItem(KEYS.SV_HISTORY)
    // Зберігаємо: роль, тему, графік, зону, квал
  } catch {}
}
