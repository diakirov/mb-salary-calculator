# mb-salary-calculator
# 💰 Калькулятор зарплати
Внутрішній веб-калькулятор для розрахунку зарплати. Працює повністю в браузері, без бекенду.

## 🚀 Запуск
npm install
npm run dev

## 📦 Збірка для GitHub Pages
npm run build 
npm run deploy

## ⚙️ Оновлення ставок та конфігурації
Усі числові дані зберігаються в одному файлі:
src/config/salaryConfig.js

### Що можна змінити без правки коду:
| Параметр | Де знайти | Приклад |
|----------|-----------|---------|
| Податкова ставка | `salaryConfig.tax` | `0.23` |
| Оклад SV | `salaryConfig.sv.salary` | `46560` |
| Нічна надбавка | `salaryConfig.sv.nightBonus` | `0.2` |
| Виплата за вау-кейс | `salaryConfig.sv.wowCasePayment` | `400` |
| Квал. надбавки | `salaryConfig.sv.qualificationLevels` | `{ 2: { bonus: 3620 }, ... }` |
| Премії за зони | `salaryConfig.sv.zones` | `[{ premium: 19160 }, ...]` |
| Норма годин | `salaryConfig.sv.normHours` | По місяцях та графіках |
| Доступні роки | `salaryConfig.sv.availableYears` | `[2026]` |

### Як додати новий рік:
1. Відкрий `src/config/salaryConfig.js`
2. В `salaryConfig.sv.normHours` додай новий рік:
js normHours: { 2026: { ... }, 2027: { '2/2': [165, 165, 165, 165, 165, 165, 165, 165, 165, 165, 165, 165], '5/2': [176, 160, 176, 176, 168, 176, 184, 168, 176, 176, 168, 184], }, }
3. Додай рік в `availableYears`:
js availableYears: [2026, 2027],
4. Зроби `npm run build` і задеплой.

### Як додати нову роль:
1. Додай роль в `salaryConfig.roles`
2. Встанови `available: true`
3. Створи конфіг (аналогічно `salaryConfig.sv`)
4. Створи файл розрахунку в `src/utils/`
5. Створи компонент в `src/calculators/`
6. Підключи в `App.jsx`

## 🏗 Архітектура
src/ config/salaryConfig.js ← Усі ставки та конфігурація utils/calculateSVSalary.js ← Логіка розрахунку (без UI) utils/formatMoney.js ← Форматування сум utils/localStorage.js ← Робота зі збереженням calculators/ ← Калькулятори по ролях components/common/ ← Переиспользуемі UI-компоненти App.jsx ← Роутинг між ролями

## 📱 Особливості
- Адаптивний дизайн (телефон + ПК)
- Темна та світла теми
- Автозбереження введених даних
- Історія останніх 10 розрахунків
- Підтримка URL-параметрів (?role=sv)

## 🛠 Технології, які аішка використовувала
- React
- Vite
- Tailwind CSS
- localStorage
- GitHub Pages