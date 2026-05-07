import React, { useState, useEffect } from 'react'
import RoleSelector from './components/RoleSelector'
import SVCalculator from './calculators/SVCalculator'
import ComingSoonCalculator from './calculators/ComingSoonCalculator'
import salaryConfig from './config/salaryConfig'
import { getTheme, setTheme as saveTheme, getRole, setRole as saveRole } from './utils/localStorage'

export default function App() {
  // === ТЕМА ===
  const [theme, setThemeState] = useState(() => {
    const saved = getTheme()
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  function setTheme(newTheme) {
    setThemeState(newTheme)
    saveTheme(newTheme)
  }

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // === РОЛЬ ===
  const [role, setRoleState] = useState(() => {
    // Пріоритет 1: URL параметр
    const urlParams = new URLSearchParams(window.location.search)
    const urlRole = urlParams.get('role')
    if (urlRole && salaryConfig.roles[urlRole]) {
      return urlRole
    }
    // Пріоритет 2: localStorage
    const savedRole = getRole()
    if (savedRole && salaryConfig.roles[savedRole]) {
      return savedRole
    }
    // Пріоритет 3: показати вибір
    return null
  })

  function selectRole(roleId) {
    setRoleState(roleId)
    saveRole(roleId)
    // Оновити URL без перезавантаження
    const url = new URL(window.location)
    url.searchParams.set('role', roleId)
    window.history.replaceState({}, '', url)
  }

  function goToRoleSelector() {
    setRoleState(null)
    // Прибрати параметр з URL
    const url = new URL(window.location)
    url.searchParams.delete('role')
    window.history.replaceState({}, '', url)
  }

  // === РЕНДЕР ===
  if (!role) {
    return <RoleSelector onSelectRole={selectRole} theme={theme} setTheme={setTheme} />
  }

  const roleConfig = salaryConfig.roles[role]

  if (!roleConfig?.available) {
    return <ComingSoonCalculator roleId={role} onBack={goToRoleSelector} />
  }

  if (role === 'sv') {
    return <SVCalculator onBack={goToRoleSelector} theme={theme} setTheme={setTheme} />
  }

  return <ComingSoonCalculator roleId={role} onBack={goToRoleSelector} />
}
