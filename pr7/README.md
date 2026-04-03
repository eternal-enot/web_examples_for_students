# Запуск `pr7`

```bash
# 1. Перейти в корінь репозиторію
cd "/шлях/до/Web"

# 2. Встановити залежності
npm install

# 3. Перевірити TypeScript-код для pr7
npm run check:pr7

# 4. Зібрати pr7
npm run build:pr7

# 5. Відкрити pr7/index.html через Live Server
```

## Що демонструє приклад

- `BehaviorSubject` для стану задач, фільтра і пошуку.
- `fromEvent` для реактивної обробки подій форми, пошуку і кнопок.
- `combineLatest` для об'єднання потоків у похідний стан відображення.
- `debounceTime` і `distinctUntilChanged` для поля пошуку.
