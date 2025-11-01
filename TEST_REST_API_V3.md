# 🧪 Тестирование REST API v3 для ModuleUsersGroups

## ✅ Что изменилось

Метод `onAfterExecuteRestAPIRoute()` теперь поддерживает:
- ✅ Старый API v2: `/api/extensions/saveRecord`
- ✅ Новый REST API v3: `/pbxcore/api/v3/employees`

## 🚀 Быстрое тестирование

### 1. Получить токен авторизации

```bash
# Вход в систему и получение access token
curl -X POST http://192.168.1.100/pbxcore/api/v3/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'

# Ответ:
# {
#   "success": true,
#   "data": {
#     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#     "refresh_token": "..."
#   }
# }
```

Сохраните `access_token` для дальнейшего использования.

### 2. Тест создания employee с группой

```bash
TOKEN="YOUR_ACCESS_TOKEN"

curl -X POST http://192.168.1.100/pbxcore/api/v3/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "301",
    "user_username": "Test User API v3",
    "user_email": "test@example.com",
    "sip_secret": "SecurePass123!",
    "mod_usrgr_select_group": "1"
  }'
```

**Ожидаемый результат:**
```json
{
  "success": true,
  "data": {
    "id": "50",
    "number": "301",
    "user_username": "Test User API v3",
    ...
  },
  "httpCode": 201
}
```

### 3. Проверка в логах

```bash
# В Docker контейнере
docker exec -it mikopbx_php83 bash

# Мониторинг логов в реальном времени
tail -f /var/log/messages | grep -i "usersgroups\|employee"

# Ожидаем увидеть:
# ModuleUsersGroups: REST API v3: Updated group for employee #50 to group #1
```

### 4. Проверка в базе данных

```bash
# В контейнере
sqlite3 /cf/conf/mikopbx.db \
  "SELECT gm.id, gm.user_id, gm.group_id, ug.name AS group_name, u.username
   FROM m_ModuleUsersGroups_GroupMembers gm
   JOIN m_ModuleUsersGroups_UsersGroups ug ON gm.group_id = ug.id
   JOIN m_Users u ON gm.user_id = u.id
   WHERE u.username = 'Test User API v3'"
```

**Ожидаемый результат:**
```
id  user_id  group_id  group_name        username
--  -------  --------  ----------------  ------------------
5   50       1         Sales Department  Test User API v3
```

### 5. Тест обновления employee (смена группы)

```bash
curl -X PUT http://192.168.1.100/pbxcore/api/v3/employees/50 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "301",
    "user_username": "Test User API v3 Updated",
    "sip_secret": "SecurePass123!",
    "mod_usrgr_select_group": "2"
  }'
```

**Ожидаемый результат:**
- HTTP 200 OK
- В логах: `REST API v3: Updated group for employee #50 to group #2`
- В базе: `group_id` изменился на `2`

### 6. Тест без указания группы (не должно ничего происходить)

```bash
curl -X POST http://192.168.1.100/pbxcore/api/v3/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "302",
    "user_username": "User Without Group",
    "sip_secret": "SecurePass123!"
  }'
```

**Ожидаемый результат:**
- Employee создан
- Группа НЕ назначена (записи в `m_ModuleUsersGroups_GroupMembers` нет)
- В логах НЕТ сообщения о назначении группы

## 📊 Сценарии тестирования

### ✅ Сценарий 1: Создание с группой

```bash
# 1. Создать employee
curl -X POST .../employees \
  -d '{"number":"401", "user_username":"User1", "sip_secret":"pass", "mod_usrgr_select_group":"1"}'

# 2. Проверить в БД
sqlite3 /cf/conf/mikopbx.db \
  "SELECT * FROM m_ModuleUsersGroups_GroupMembers WHERE user_id=(SELECT id FROM m_Users WHERE username='User1')"

# Ожидаем: одна запись с group_id=1
```

### ✅ Сценарий 2: Смена группы

```bash
# 1. Создать employee с группой 1
curl -X POST .../employees \
  -d '{"number":"402", "user_username":"User2", "sip_secret":"pass", "mod_usrgr_select_group":"1"}'

# 2. Получить ID employee
ID=$(sqlite3 /cf/conf/mikopbx.db "SELECT id FROM m_Users WHERE username='User2'")

# 3. Обновить с группой 2
curl -X PUT .../employees/$ID \
  -d '{"number":"402", "user_username":"User2", "sip_secret":"pass", "mod_usrgr_select_group":"2"}'

# 4. Проверить в БД
sqlite3 /cf/conf/mikopbx.db \
  "SELECT group_id FROM m_ModuleUsersGroups_GroupMembers WHERE user_id=$ID"

# Ожидаем: group_id=2
```

### ✅ Сценарий 3: Удаление из группы

```bash
# 1. Создать employee с группой
curl -X POST .../employees \
  -d '{"number":"403", "user_username":"User3", "sip_secret":"pass", "mod_usrgr_select_group":"1"}'

# 2. Получить ID
ID=$(sqlite3 /cf/conf/mikopbx.db "SELECT id FROM m_Users WHERE username='User3'")

# 3. Обновить БЕЗ группы (пустое значение)
curl -X PUT .../employees/$ID \
  -d '{"number":"403", "user_username":"User3", "sip_secret":"pass", "mod_usrgr_select_group":""}'

# 4. Проверить в БД
sqlite3 /cf/conf/mikopbx.db \
  "SELECT COUNT(*) FROM m_ModuleUsersGroups_GroupMembers WHERE user_id=$ID"

# Ожидаем: 0 (запись удалена, если логика UsersGroups::updateUserGroup это поддерживает)
```

### ✅ Сценарий 4: Совместимость старого API

```bash
# 1. Создать через веб-форму Extensions
# Открыть: http://192.168.1.100/admin-cabinet/extensions/modify/new
# Заполнить поля:
# - Number: 404
# - Username: User4
# - Password: SecurePass123!
# - User Group: выбрать из списка
# Сохранить

# 2. Проверить в БД
sqlite3 /cf/conf/mikopbx.db \
  "SELECT gm.group_id, u.username
   FROM m_ModuleUsersGroups_GroupMembers gm
   JOIN m_Users u ON gm.user_id = u.id
   WHERE u.username='User4'"

# Ожидаем: запись с выбранной группой
```

## 🔍 Отладка

### Включить детальное логирование

Добавьте в начало метода `onAfterExecuteRestAPIRoute()`:

```php
SystemMessages::sysLogMsg(
    __METHOD__,
    "Request: " . json_encode([
        'url' => $calledUrl,
        'pattern' => $pattern,
        'method' => $httpMethod
    ]),
    LOG_DEBUG
);
```

### Мониторинг логов

```bash
# Все логи модуля
tail -f /var/log/messages | grep ModuleUsersGroups

# Только REST API v3
tail -f /var/log/messages | grep "REST API v3"

# С контекстом (3 строки до и после)
tail -f /var/log/messages | grep -B3 -A3 ModuleUsersGroups
```

### Проверка переменных

Добавьте в код перед вызовом `updateUserGroup()`:

```php
SystemMessages::sysLogMsg(
    __METHOD__,
    "Debug data: " . json_encode([
        'requestData' => $requestData,
        'response' => $response,
        'groupId' => $groupId,
        'employeeId' => $employeeId,
        'postData' => $postData
    ]),
    LOG_DEBUG
);
```

## 🐛 Частые проблемы

### Проблема 1: Группа не назначается

**Причины:**
- Поле `mod_usrgr_select_group` не передано
- Поле имеет пустое значение
- Employee не создался (ошибка в SaveRecordAction)

**Решение:**
```bash
# Проверить request
curl ... -v 2>&1 | grep mod_usrgr

# Проверить response
curl ... | jq '.success, .data.id'

# Проверить логи
tail -20 /var/log/messages | grep -i "employee\|group"
```

### Проблема 2: Ошибка 401 Unauthorized

**Причина:** Невалидный или истекший токен

**Решение:**
```bash
# Получить новый токен
curl -X POST .../auth/login -d '{"username":"admin","password":"..."}'
```

### Проблема 3: Логи не появляются

**Причина:** Уровень логирования

**Решение:**
```bash
# Проверить уровень логирования
grep -i "loglevel\|syslog" /etc/rsyslog.conf

# Временно включить все логи
echo "*.* /var/log/messages" >> /etc/rsyslog.conf
killall -HUP rsyslogd
```

## ✨ Пример полного цикла

```bash
#!/bin/bash

# 1. Авторизация
TOKEN=$(curl -s -X POST http://192.168.1.100/pbxcore/api/v3/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' | jq -r '.data.access_token')

echo "Token: $TOKEN"

# 2. Создание employee с группой
EMPLOYEE=$(curl -s -X POST http://192.168.1.100/pbxcore/api/v3/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "501",
    "user_username": "Auto Test User",
    "sip_secret": "TestPass123!",
    "mod_usrgr_select_group": "1"
  }')

echo "Created: $EMPLOYEE"

EMPLOYEE_ID=$(echo $EMPLOYEE | jq -r '.data.id')
echo "Employee ID: $EMPLOYEE_ID"

# 3. Проверка в логах
echo "Checking logs..."
docker exec mikopbx_php83 tail -10 /var/log/messages | grep ModuleUsersGroups

# 4. Проверка в БД
echo "Checking database..."
docker exec mikopbx_php83 sqlite3 /cf/conf/mikopbx.db \
  "SELECT gm.*, ug.name FROM m_ModuleUsersGroups_GroupMembers gm \
   JOIN m_ModuleUsersGroups_UsersGroups ug ON gm.group_id = ug.id \
   WHERE gm.user_id = '$EMPLOYEE_ID'"

# 5. Обновление группы
echo "Updating group..."
curl -s -X PUT http://192.168.1.100/pbxcore/api/v3/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "501",
    "user_username": "Auto Test User Updated",
    "sip_secret": "TestPass123!",
    "mod_usrgr_select_group": "2"
  }' | jq '.'

# 6. Финальная проверка
echo "Final check..."
docker exec mikopbx_php83 sqlite3 /cf/conf/mikopbx.db \
  "SELECT gm.group_id, ug.name FROM m_ModuleUsersGroups_GroupMembers gm \
   JOIN m_ModuleUsersGroups_UsersGroups ug ON gm.group_id = ug.id \
   WHERE gm.user_id = '$EMPLOYEE_ID'"

echo "Test completed!"
```

## 📝 Чеклист тестирования

- [ ] Создание employee с группой через POST
- [ ] Обновление employee с группой через PUT
- [ ] Создание employee без группы
- [ ] Обновление группы employee
- [ ] Проверка логов (REST API v3 сообщения)
- [ ] Проверка записей в БД
- [ ] Тест старого API (веб-форма Extensions)
- [ ] Тест с невалидными данными
- [ ] Тест с несуществующей группой
- [ ] Тест производительности (массовое создание)
