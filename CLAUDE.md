# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ModuleUsersGroups — модуль расширения для MikoPBX, реализующий управление группами сотрудников с контролем прав на звонки, изоляцией вызовов и управлением исходящими маршрутами. Модуль генерирует конфигурацию Asterisk dialplan и управляет данными через AstDB.

## Architecture

### Framework & Runtime
- **PHP 7.4+** с Phalcon (поддержка v4 и v5+ через `Lib/MikoPBXVersion.php`)
- Наследует базовые классы MikoPBX: `ConfigClass`, `PbxExtensionBase`, `ModulesModelsBase`, `BaseController`, `BaseForm`
- Namespace: `Modules\ModuleUsersGroups\` (PSR-4 от корня)
- Frontend: Semantic UI + DataTables, JS на ES6+

### Core Components

**`Lib/UsersGroupsConf.php`** — центральный класс, наследует `ConfigClass`. Реализует хуки MikoPBX для генерации dialplan:
- `extensionGenAllPeersContext()` — правила изоляции в контексте `[all_peers]`
- `extensionGenContexts()` — контексты `users-group-isolate`, `users-group-dst-*`, `users-group-forbidden`
- `generateOutRoutContext()` / `generateOutRoutAfterDialContext()` — ограничения исходящих маршрутов, подмена CallerID
- `overridePJSIPOptions()` — назначение `named_call_group`/`named_pickup_group` для изоляции pickup
- `moduleRestAPICallback()` — точка входа REST API
- `onAfterExecuteRestAPIRoute()` — перехват сохранения сотрудника (API v2 и v3) для привязки к группе

**`Lib/UsersGroups.php`** — сервисный класс, заполняет AstDB (`UsersGroups/{extension}`) переменными канала: `GR_PERM_ENABLE`, `GR_ID_{routeId}`, `GR_CID_{routeId}`.

**`Lib/RestAPI/`** — action-based REST API:
- `UsersGroupsManagementProcessor.php` — роутер действий
- Actions: `GetUserGroupAction`, `UpdateUserGroupAction`, `SetDefaultGroupAction`, `GetDefaultGroupAction`, `GetGroupsStatsAction`, `CleanupOrphanedMembersAction`

### Data Model (SQLite, ORM через аннотации Phalcon)
- `UsersGroups` — группа (name, description, patterns, isolate, isolatePickUp, defaultGroup)
- `GroupMembers` — связь группа↔пользователь (group_id, user_id). Один пользователь = одна группа
- `AllowedOutboundRules` — связь группа↔маршрут (group_id, rule_id, caller_id)

**Важно:** `group_id` в коде используется со сдвигом `+1` при маппинге на named_call_group Asterisk (см. `initUserList()` и `getSettings()`).

### Dialplan Logic
Изоляция работает через контексты Asterisk:
1. В `[all_peers]` проверяются флаги `srcIsolate` и `dstIsolate` через `DIALPLAN_EXISTS`
2. При запрете — `Goto(users-group-forbidden)` с воспроизведением звукового файла
3. Исходящие маршруты: переменные из AstDB (`GR_VARS`) определяют доступ к маршруту и подмену CallerID
4. Поддержка `FW_SOURCE_PEER` для переадресованных вызовов

### Frontend Structure
- `App/Controllers/ModuleUsersGroupsController.php` — единый контроллер (index/modify)
- `App/Views/ModuleUsersGroups/` — Volt-шаблоны с табами (groups, users, rules)
- `public/assets/js/src/` — исходники JS, `public/assets/js/` — собранные файлы

## Build & CI

Сборка и публикация через GitHub Actions (`.github/workflows/build.yml`), использует shared workflow `mikopbx/.github-workflows/.github/workflows/extension-publish.yml@master`.

Зависимости PHP: `composer install` (минимальные — только `mikopbx/core`).

Тесты и линтеры не настроены в репозитории.

## Localization

32 языковых файла в `Messages/`. Звуковые файлы `Sounds/{lang}/forbidden.mp3` для голосовых уведомлений при запрете вызова.

## Key Conventions

- PHP 7.4 совместимость обязательна (нет `str_starts_with`, `match`, union types и т.д.)
- Модуль-специфичные POST-поля имеют префикс `mod_usrgr_`
- Модуль встраивается в карточку сотрудника через `onVoltBlockCompile` и `onBeforeFormInitialize`
- При изменении моделей `AllowedOutboundRules`, `GroupMembers`, `UsersGroups` автоматически вызывается `reloadConfigs()` (SIP + dialplan reload)
