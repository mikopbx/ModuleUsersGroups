<?php

namespace Modules\ModuleUsersGroups\Lib;

/**
 * Общие правила CallerID для сохранения настроек и генерации dialplan.
 */
final class CallerId
{
    public static function isValid(string $value): bool
    {
        return trim($value, ' ') === '' || self::normalize($value) !== '';
    }

    /**
     * Нормализует CallerID, сохраняя имя и номер для опции Dial f().
     */
    public static function normalize(string $value): string
    {
        if (preg_match('/[\x00-\x1F\x7F]/', $value) === 1) {
            return '';
        }
        $value = trim($value, ' ');
        // Только ASCII: латиница, цифры, обычный пробел и безопасные символы.
        $safePart = '[A-Za-z0-9+*#_. -]+';
        if (preg_match('/^(?:"(' . $safePart . ')"|(' . $safePart . ')) *<(' . $safePart . ')>$/D', $value, $matches) === 1) {
            $name = trim($matches[1] !== '' ? $matches[1] : $matches[2], ' ');
            $number = trim($matches[3], ' ');
            return $name !== '' && $number !== '' ? $name . ' <' . $number . '>' : '';
        }

        return preg_match('/^' . $safePart . '$/D', $value) === 1 ? $value : '';
    }
}
