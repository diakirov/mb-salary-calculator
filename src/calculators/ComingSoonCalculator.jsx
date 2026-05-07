import React from 'react'
import Button from '../components/common/Button'
import salaryConfig from '../config/salaryConfig'

export default function ComingSoonCalculator({ roleId, onBack }) {
  const role = salaryConfig.roles[roleId]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {role?.name || 'Роль'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Калькулятор для цієї ролі ще в розробці 🚧
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Скоро тут з'явиться повноцінний калькулятор
          </p>
        </div>

        <Button onClick={onBack} variant="secondary" size="lg">
          ← Повернутись до вибору ролі
        </Button>
      </div>
    </div>
  )
}
