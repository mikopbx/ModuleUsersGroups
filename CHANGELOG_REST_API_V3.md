# ModuleUsersGroups - REST API v3 Support

## 🎯 Изменения

Добавлена поддержка нового **REST API v3** для перехвата сохранения employee с сохранением поддержки старого API.

## 📋 Что изменилось

### Файл: `Lib/UsersGroupsConf.php`

#### 1. Добавлен импорт
```php
use MikoPBX\Core\System\Util;
```

#### 2. Обновлен метод `onAfterExecuteRestAPIRoute()`

**Было:**
- Поддержка только старого API: `/api/extensions/saveRecord`

**Стало:**
- ✅ Поддержка старого API v2: `/api/extensions/saveRecord`
- ✅ Поддержка нового REST API v3: `/pbxcore/api/v3/employees`

## 🔄 Как работает

### Старый API v2 (без изменений)
```
POST /api/extensions/saveRecord
{
  "mod_usrgr_select_group": "1",
  "user_id": "42",
  "number": "201"
}
```

### Новый REST API v3 (добавлено)
```
POST /pbxcore/api/v3/employees
{
  "number": "201",
  "user_username": "John Doe",
  "sip_secret": "password",
  "mod_usrgr_select_group": "1"
}
```

или

```
PUT /pbxcore/api/v3/employees/42
{
  "number": "201",
  "user_username": "John Doe Updated",
  "mod_usrgr_select_group": "2"
}
```

## 📊 Архитектура перехвата

```
┌─────────────────────────────────────────┐
│      HTTP Request (POST/PUT)            │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴────────────┐
    │                        │
┌───▼──────────────┐  ┌─────▼──────────────────────┐
│  Old API v2      │  │  REST API v3               │
│  /api/extensions/│  │  /pbxcore/api/v3/employees │
│  saveRecord      │  │                            │
└───┬──────────────┘  └─────┬──────────────────────┘
    │                       │
    │ POST data            │ JSON body
    │                       │
    └───────────┬───────────┘
                │
    ┌───────────▼────────────┐
    │ onAfterExecuteRestAPI  │
    │ Route()                │
    └───────────┬────────────┘
                │
                │ Проверка успешности
                │
    ┌───────────▼────────────┐
    │ UsersGroups::          │
    │ updateUserGroup()      │
    └───────────┬────────────┘
                │
    ┌───────────▼────────────┐
    │ GroupMembers Model     │
    │ (m_ModuleUsersGroups_  │
    │  GroupMembers)         │
    └────────────────────────┘
```

## 🔍 Детали реализации

### Проверка маршрута (REST API v3)
```php
$pattern = $matchedRoute?->getPattern();
$isEmployeeRoute = preg_match('#^/pbxcore/api/v3/employees(/\d+)?$#', $pattern ?? '');
```

Перехватывает:
- `POST /pbxcore/api/v3/employees` - создание
- `PUT /pbxcore/api/v3/employees/42` - обновление

### Извлечение данных
```php
// Получаем JSON body из запроса
$requestData = $app->request->getJsonRawBody(true) ?? $app->request->getPost();

// Получаем результат из SaveRecordAction
$response = $app->getReturnedValue();

// Проверяем успешность
if ($response['success'] === true) {
    $groupId = $requestData['mod_usrgr_select_group'];
    $employeeId = $response['data']['id'];
}
```

### Сохранение группы
```php
$postData = [
    'mod_usrgr_select_group' => $groupId,
    'user_id' => $employeeId,
    'number' => $requestData['number'] ?? null
];

UsersGroups::updateUserGroup($postData);
```

### Логирование
```php
Util::sysLogMsg(
    'ModuleUsersGroups',
    "REST API v3: Updated group for employee #{$employeeId} to group #{$groupId}"
);
```

## ✅ Тестирование

### 1. Тест создания employee через REST API v3

```bash
curl -X POST http://192.168.1.100/pbxcore/api/v3/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "301",
    "user_username": "Test User",
    "user_email": "test@example.com",
    "sip_secret": "testpass123",
    "mod_usrgr_select_group": "1"
  }'
```

**Ожидаемый результат:**
- Employee создан
- Группа назначена
- В логах: `REST API v3: Updated group for employee #X to group #1`

### 2. Тест обновления employee через REST API v3

```bash
curl -X PUT http://192.168.1.100/pbxcore/api/v3/employees/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "301",
    "user_username": "Test User Updated",
    "sip_secret": "testpass123",
    "mod_usrgr_select_group": "2"
  }'
```

**Ожидаемый результат:**
- Employee обновлен
- Группа изменена на #2
- В логах: `REST API v3: Updated group for employee #42 to group #2`

### 3. Проверка в базе данных

```bash
# Подключаемся к контейнеру
docker exec -it mikopbx_php83 bash

# Проверяем группу пользователя
sqlite3 /cf/conf/mikopbx.db \
  "SELECT gm.*, ug.name
   FROM m_ModuleUsersGroups_GroupMembers gm
   JOIN m_ModuleUsersGroups_UsersGroups ug ON gm.group_id = ug.id
   WHERE gm.user_id = '42'"
```

### 4. Проверка логов

```bash
# В контейнере
tail -f /var/log/messages | grep ModuleUsersGroups

# Ожидаем:
# REST API v3: Updated group for employee #42 to group #2
```

### 5. Тест старого API (проверка совместимости)

```bash
# Через веб-форму Extensions
# 1. Откройте http://192.168.1.100/admin-cabinet/extensions/modify/42
# 2. Измените группу в поле "User Group"
# 3. Сохраните форму
# 4. Проверьте, что группа обновилась
```

## 🔧 Отладка

### Включить детальное логирование

В методе `onAfterExecuteRestAPIRoute()` добавьте:

```php
// После строки 430
Util::sysLogMsg('ModuleUsersGroups', "Called URL: {$calledUrl}");
Util::sysLogMsg('ModuleUsersGroups', "Pattern: {$pattern}, Method: {$httpMethod}");

// После строки 468
Util::sysLogMsg('ModuleUsersGroups', "Request data: " . json_encode($requestData));

// После строки 471
Util::sysLogMsg('ModuleUsersGroups', "Response: " . json_encode($response));
```

### Проверка перехвата

```bash
# Мониторинг логов в реальном времени
tail -f /var/log/messages | grep -E "ModuleUsersGroups|employees"
```

## 📌 Важные моменты

### 1. Обратная совместимость
✅ Старый API работает без изменений
✅ Существующие формы и интеграции не затронуты

### 2. Безопасность
- Перехват происходит **ПОСЛЕ** успешного сохранения
- Проверяется `success === true` в ответе
- Валидация данных выполняется в `SaveRecordAction`

### 3. Производительность
- Минимальные накладные расходы
- Перехват только для POST/PUT запросов
- Выполнение только при наличии поля `mod_usrgr_select_group`

### 4. Логирование
- Все операции логируются через `Util::sysLogMsg()`
- Логи содержат employee ID и group ID
- Легко отслеживать в `/var/log/messages`

## 🚀 Внедрение в продакшен

### 1. Бэкап
```bash
# Создайте резервную копию модуля
cp -r /var/www/mikopbx/ModuleUsersGroups /var/www/mikopbx/ModuleUsersGroups.backup
```

### 2. Обновление файла
```bash
# Замените файл UsersGroupsConf.php
```

### 3. Перезапуск
```bash
# Перезапустите PHP-FPM
pkill -USR2 php-fpm
```

### 4. Проверка
```bash
# Проверьте логи
tail -20 /var/log/messages | grep ModuleUsersGroups
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `/var/log/messages`
2. Проверьте версию MikoPBX: `cat /offload/version`
3. Проверьте версию модуля в веб-интерфейсе
4. Создайте issue на GitHub с логами

## 📜 История изменений

### v1.x.x (текущая)
- ✅ Добавлена поддержка REST API v3
- ✅ Сохранена поддержка старого API v2
- ✅ Добавлено логирование операций
- ✅ Добавлена документация
