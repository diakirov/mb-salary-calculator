import React from 'react'
import salaryConfig from '../config/salaryConfig'
import Card from './common/Card'
import ThemeToggle from './ThemeToggle'

export default function RoleSelector({ onSelectRole, theme, setTheme }) {
  const roles = Object.values(salaryConfig.roles)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Хедер */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Калькулятор ЗП
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Обери свою роль
            </p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        {/* Список ролей */}
        <div className="space-y-3">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="w-full text-left"
            >
              <Card className={`
                ${role.available 
                  ? 'hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md cursor-pointer' 
                  : 'opacity-70'
                }
                transition-all duration-200
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {role.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {role.description}
                    </p>
                  </div>
                  {role.available ? (
                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
                      Скоро
                    </span>
                  )}
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
