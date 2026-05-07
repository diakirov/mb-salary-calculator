/**
 * Форматування числа як грошової суми
 * @param {number} amount — сума
 * @param {boolean} showDecimals — показувати копійки
 * @returns {string}
 */
export function formatMoney(amount, showDecimals = true) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 грн'
  
  const options = {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }
  
  return amount.toLocaleString('uk-UA', options) + ' грн'
}

/**
 * Форматування числа з пробілами (без "грн")
 */
export function formatNumber(amount, showDecimals = true) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0'
  
  const options = {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }
  
  return amount.toLocaleString('uk-UA', options)
}
