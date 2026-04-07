[![License: GPL v3](https://img.shields.io/github/license/mikopbx/ModuleUsersGroups)](https://www.gnu.org/licenses/gpl-3.0)
[![Latest Release](https://img.shields.io/github/v/release/mikopbx/ModuleUsersGroups)](https://github.com/mikopbx/ModuleUsersGroups/releases)
[![MikoPBX](https://img.shields.io/badge/MikoPBX-2023.2.179%2B-blue)](https://www.mikopbx.com)
[![GitHub Issues](https://img.shields.io/github/issues/mikopbx/ModuleUsersGroups)](https://github.com/mikopbx/ModuleUsersGroups/issues)

[English](README.md) | [Русский](README.ru.md)

# ModuleUsersGroups

Модуль управления телефонными группами для MikoPBX. Позволяет организовывать сотрудников в группы с гибкими правами на звонки, контролем исходящих маршрутов и изоляцией групп.

## Возможности

- Организация сотрудников в телефонные группы
- Управление правами на исходящие звонки по группам
- Настройка Caller ID для каждой группы на каждом маршруте
- Изоляция групп: участники могут звонить только внутри группы и на разрешенные номера
- Изоляция перехвата вызовов внутри групп
- Автоматическое назначение новых сотрудников в группу по умолчанию
- REST API для интеграции с внешними системами

## Установка

### Из маркетплейса

1. Откройте веб-интерфейс MikoPBX
2. Перейдите в **Система** > **Модули расширений**
3. Найдите **ModuleUsersGroups** в маркетплейсе и установите

### Ручная установка

1. Скачайте последний релиз со страницы [GitHub Releases](https://github.com/mikopbx/ModuleUsersGroups/releases)
2. Перейдите в **Система** > **Модули расширений**
3. Нажмите **Загрузить модуль** и выберите скачанный файл
4. Включите модуль

## Настройка

1. Перейдите в **Маршрутизация** > **Управление телефонными группами**
2. Нажмите **Добавить группу** и введите название
3. При необходимости настройте изоляцию и разрешенные шаблоны номеров
4. Назначьте пользователей на вкладке **Пользователи**
5. Настройте исходящие маршруты и Caller ID на вкладке **Исходящие правила**
6. Сохраните группу
7. При желании задайте группу по умолчанию для автоматического назначения новых сотрудников

## REST API

Базовый URL: `http://<your-pbx>/pbxcore/api/modules/ModuleUsersGroups/`

| Действие           | Описание                          |
|--------------------|-----------------------------------|
| `getUserGroup`     | Получить группу пользователя      |
| `updateUserGroup`  | Изменить группу пользователя      |
| `getDefaultGroup`  | Получить группу по умолчанию      |
| `setDefaultGroup`  | Установить группу по умолчанию    |

## Требования

MikoPBX версии **2023.2.179** или выше.

## Поддержка

- Документация (RU): [docs.mikopbx.com](https://docs.mikopbx.com/mikopbx/modules/miko/module-users-groups)
- Документация (EN): [docs.mikopbx.com](https://docs.mikopbx.com/mikopbx/v/english/modules/miko/module-users-groups)
- Баг-трекер: [GitHub Issues](https://github.com/mikopbx/ModuleUsersGroups/issues)
- Email: help@miko.ru

## Лицензия

[GPL-3.0-or-later](LICENSE)
