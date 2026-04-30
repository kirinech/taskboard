# Taskboard

Менеджер задач в виде SPA. Позволяет создавать и редактировать задачи с приоритетами, статусами, дедлайнами и тегами, фильтровать и сортировать список, а также переходить на страницу отдельной задачи.

## Технологии

- React 18 + TypeScript + Vite
- Chakra UI v2 — компонентная библиотека
- RTK Query — запросы к API и кэширование
- React Router v6 — роутинг
- react-hook-form + zod — формы и валидация
- json-server — mock REST API
- Vitest + React Testing Library — тесты

## Запуск

Установить зависимости:

```bash
npm install
```

Запустить mock-сервер и приложение в двух терминалах:

```bash
npm run server   # json-server на http://localhost:3001
npm run dev      # Vite dev server на http://localhost:5173
```

### Остальные команды

| Команда            | Описание                      |
| ------------------ | ----------------------------- |
| `npm test`         | Запустить тесты (watch-режим) |
| `npm run coverage` | Отчёт о покрытии              |
| `npm run lint`     | ESLint                        |
| `npm run lint:css` | Stylelint                     |
| `npm run build`    | Production-сборка             |

## Архитектура (Feature-Sliced Design)

Проект следует методологии [Feature-Sliced Design](https://feature-sliced.design/). Код разделён на слои с однонаправленными зависимостями: каждый слой может импортировать только из слоёв **ниже** себя.

```
src/
├── app/          # Инициализация: store, router, глобальные стили
├── pages/        # Страницы приложения и их локальные хуки
├── features/     # Пользовательские сценарии (формы, фильтры)
├── entities/     # Бизнес-сущности: task, tag — API и UI компоненты
└── shared/       # Переиспользуемые утилиты, типы, базовый API, UI
```

### Слои

**`app`** — точка входа. Конфигурирует Redux store, подключает роутер и провайдеры.

**`pages`** — полноценные страницы (`TaskListPage`, `TaskDetailPage`). Собирают фичи и сущности в единый экран. Могут содержать локальные хуки (например, `useTaskFilterParams` для синхронизации фильтров с URL).

**`features`** — изолированные сценарии взаимодействия:

- `task-form` — модальное окно создания и редактирования задачи
- `tag-form` — модальное окно создания тега
- `task-filters` — компонент фильтров, сортировки и поиска

**`entities`** — бизнес-сущности без привязки к конкретному сценарию:

- `task` — RTK Query эндпоинты (`getTasks`, `createTask`, `updateTask`, …) и компонент `TaskCard`
- `tag` — RTK Query эндпоинты (`getTags`, `createTag`)

**`shared`** — всё, что не принадлежит конкретному слою:

- `api/` — базовый `createApi` (baseApi)
- `types/` — общие TypeScript-типы (`Task`, `Tag`, …)
- `hooks/` — утилитарные хуки (`useDebounce`)
- `ui/` — переиспользуемые компоненты (`Pagination`)
