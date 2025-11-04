# Голосовое оповещение при запрете направления

## Описание

Модуль ModuleUsersGroups теперь поддерживает голосовое оповещение, когда пользователь пытается позвонить на номер, запрещенный настройками его группы.

**Особенность:** Модуль использует новую архитектуру мультиязычной поддержки звуков, где Asterisk автоматически выбирает язык на основе системных настроек.

## Как это работает

### Стандартное поведение

При попытке звонка на запрещенное направление:
1. Звонок автоматически отвечается (Answer)
2. Пауза 1 секунда
3. Воспроизведение звука `moduleusersgroups-forbidden` (если файл существует для текущего языка)
4. Если кастомный звук не найден - воспроизводится стандартный Asterisk звук `ss-noservice`
5. Возможность дополнительной обработки через custom dialplan
6. Завершение звонка (Hangup)

### Автоматический выбор языка

Asterisk автоматически выбирает звуковой файл на основе языка канала:
- Система определяет язык из настроек PBX
- Ищет файл в: `ModuleUsersGroups/sounds/{язык}/forbidden.mp3`
- Если кастомный файл не найден - автоматически воспроизводится стандартный звук `ss-noservice` ("The number you have dialed is not in service")
- Звук `ss-noservice` доступен на всех языках в стандартной установке Asterisk

## Настройка кастомного голосового сообщения

### Шаг 1: Подготовка аудио файла

1. Запишите голосовое сообщение (например: "Данное направление запрещено для вашей группы")
2. Сохраните в формате **MP3** с параметрами:
   - Sample Rate: 8000 Hz
   - Channels: Mono
   - Bit Rate: 64-128 kbps

```bash
# Пример конвертации через ffmpeg
ffmpeg -i input.wav -ar 8000 -ac 1 -ab 64k forbidden.mp3
```

**Поддерживаемые форматы:** Asterisk автоматически выбирает лучший доступный формат:
- **MP3** - рекомендуемый (компактный, хорошее качество)
- WAV - несжатый (больший размер)
- GSM - сжатый (маленький размер, среднее качество)

### Шаг 2: Размещение файла на сервере

Звуковые файлы размещаются в директории модуля по языкам:

```
ModuleUsersGroups/sounds/{ЯЗЫК_КОД}/forbidden.mp3
```

Где **{ЯЗЫК_КОД}** - двухбуквенный код языка (например: `ru`, `en`, `de`, `fr`)

**Структура директорий модуля:**

```
/var/www/mikopbx/ModuleUsersGroups/
├── sounds/
│   ├── ru/              # Русский
│   │   └── forbidden.mp3
│   ├── en/              # Английский
│   │   └── forbidden.mp3
│   ├── de/              # Немецкий
│   │   └── forbidden.mp3
│   └── fr/              # Французский
│       └── forbidden.mp3
└── Lib/
    └── UsersGroupsConf.php
```

**Примеры размещения файлов:**

```bash
# Для русского языка (ru)
mkdir -p /var/www/mikopbx/ModuleUsersGroups/sounds/ru/
cp forbidden_ru.mp3 /var/www/mikopbx/ModuleUsersGroups/sounds/ru/forbidden.mp3
chmod 644 /var/www/mikopbx/ModuleUsersGroups/sounds/ru/forbidden.mp3

# Для английского языка (en)
mkdir -p /var/www/mikopbx/ModuleUsersGroups/sounds/en/
cp forbidden_en.mp3 /var/www/mikopbx/ModuleUsersGroups/sounds/en/forbidden.mp3
chmod 644 /var/www/mikopbx/ModuleUsersGroups/sounds/en/forbidden.mp3

# Для немецкого языка (de)
mkdir -p /var/www/mikopbx/ModuleUsersGroups/sounds/de/
cp forbidden_de.mp3 /var/www/mikopbx/ModuleUsersGroups/sounds/de/forbidden.mp3
chmod 644 /var/www/mikopbx/ModuleUsersGroups/sounds/de/forbidden.mp3
```

**Примечание:** Система автоматически преобразует язык из формата `ru-ru` в `ru` для поиска файлов.

### Шаг 3: Применение настроек

После размещения файла выполните одно из действий:
- Перезагрузите Asterisk: `asterisk -rx "core reload"`
- Или перезагрузите MikoPBX полностью

## Расширенная настройка (для продвинутых)

### Кастомный dialplan

Вы можете добавить дополнительную обработку после воспроизведения сообщения, создав контекст:

```
[users-group-forbidden-custom]
exten => _X.,1,NoOp(--- Custom processing for ${EXTEN} ---)
same => n,Set(CDR(userfield)=Forbidden by group)
same => n,System(echo "${CALLERID(num)} tried to call ${EXTEN}" >> /var/log/forbidden_calls.log)
same => n,Return()
```

Добавьте этот контекст в файл:
```
/storage/usbdisk1/mikopbx/custom_modules/conf.d/extensions_custom.conf
```

### Примеры использования custom dialplan

**Пример 1: Логирование в базу данных**
```
[users-group-forbidden-custom]
exten => _X.,1,NoOp(--- Logging forbidden call ---)
same => n,Set(DB(forbidden_calls/${EPOCH})=${CALLERID(num)}:${EXTEN})
same => n,Return()
```

**Пример 2: Email уведомление администратору**
```
[users-group-forbidden-custom]
exten => _X.,1,NoOp(--- Email notification ---)
same => n,System(/usr/bin/send_notification.sh "${CALLERID(num)}" "${EXTEN}")
same => n,Return()
```

**Пример 3: Подсчет попыток**
```
[users-group-forbidden-custom]
exten => _X.,1,NoOp(--- Count attempts ---)
same => n,Set(COUNT=${DB(forbidden_count/${CALLERID(num)})})
same => n,Set(COUNT=$[${COUNT} + 1])
same => n,Set(DB(forbidden_count/${CALLERID(num)})=${COUNT})
same => n,GotoIf($[${COUNT} > 5]?notify:end)
same => n(notify),System(/usr/bin/notify_admin.sh "${CALLERID(num)}" "${COUNT}")
same => n(end),Return()
```

## Проверка работы

### Просмотр сгенерированного dialplan

```bash
# Войдите в CLI Asterisk
asterisk -rvvv

# Просмотрите контекст
dialplan show users-group-forbidden
```

Должны увидеть примерно следующее:
```
[ Context 'users-group-forbidden' created by 'pbx_config' ]
  '_X.' =>          1. NoOp(--- Call to ${EXTEN} forbidden by UsersGroups module ---)
                    2. Answer()
                    3. Wait(1)
                    4. Set(SOUND_FILE=${IF($[${STAT(e,/storage/usbdisk1/mikopbx/custom_modules/sounds/ModuleUsersGroups/forbidden.wav)}]?custom/ModuleUsersGroups/forbidden:silence/1)})
                    5. Playback(${SOUND_FILE})
                    6. ExecIf($["${SOUND_FILE}" = "silence/1"]?Playback(invalid))
                    7. GosubIf(${DIALPLAN_EXISTS(users-group-forbidden-custom,${EXTEN},1)}?users-group-forbidden-custom,${EXTEN},1)
                    8. Hangup()
```

### Тестовый звонок

1. Настройте изоляцию группы в веб-интерфейсе модуля
2. Попробуйте позвонить на запрещенный номер с телефона пользователя из изолированной группы
3. Должны услышать голосовое сообщение

## Технические детали

### Путь к контексту в коде

Переход на контекст `users-group-forbidden` происходит в `/Users/nb/PhpstormProjects/mikopbx/Extensions/ModuleUsersGroups/Lib/UsersGroupsConf.php:90-91`:

```php
$conf .= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} == 0 ]?Goto(users-group-forbidden,${EXTEN},1))' . PHP_EOL;
$conf .= 'same => n,ExecIf($[ ${srcIsolate} == 0 && ${dstIsolate} ]?Goto(users-group-forbidden,${EXTEN},1))' . PHP_EOL;
```

### Генерация контекста

Контекст генерируется в методе `generateForbiddenCallContext()` в том же файле `/Users/nb/PhpstormProjects/mikopbx/Extensions/ModuleUsersGroups/Lib/UsersGroupsConf.php:173-194`.

## Отладка

### Логи Asterisk

```bash
# Включите подробное логирование
asterisk -rvvv

# Или просмотрите файл логов
tail -f /storage/usbdisk1/mikopbx/log/asterisk/messages
```

### Проверка наличия файла

```bash
# Проверьте существование звукового файла
ls -la /storage/usbdisk1/mikopbx/custom_modules/sounds/ModuleUsersGroups/forbidden.wav

# Проверьте как Asterisk видит файл
asterisk -rx "file convert forbidden.wav"
```

## Часто задаваемые вопросы

**Q: Можно ли использовать разные сообщения для разных групп?**
A: В текущей реализации используется один файл для всех групп. Для разных сообщений нужно будет доработать код и использовать custom dialplan с проверкой группы.

**Q: Поддерживаются ли форматы MP3, OGG?**
A: Да, рекомендуется MP3. Asterisk автоматически выбирает лучший доступный формат (mp3, wav, gsm).

**Q: Что будет если не создавать кастомный звуковой файл?**
A: Модуль автоматически воспроизведет стандартный Asterisk звук `ss-noservice` ("The number you have dialed is not in service") на языке системы. Вызов не оборвется и будет корректно обработан.

## Поддержка

При возникновении проблем проверьте:
1. Наличие и права доступа к файлу `forbidden.wav`
2. Логи Asterisk на предмет ошибок воспроизведения
3. Корректность формата аудио файла (8000 Hz, Mono)
4. Перезагрузку Asterisk после добавления файла
