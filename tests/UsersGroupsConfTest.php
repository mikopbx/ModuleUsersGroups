<?php

declare(strict_types=1);

namespace MikoPBX\Modules\Config {
    class ConfigClass
    {
    }
}

namespace MikoPBX\Modules {
    class PbxExtensionBase
    {
    }
}

namespace MikoPBX\Core\System {
    class PBX
    {
        public static array $reloads = [];

        public static function sipReload(): void
        {
            self::$reloads[] = 'sip';
        }

        public static function dialplanReload(): void
        {
            self::$reloads[] = 'dialplan';
        }
    }
}

namespace MikoPBX\Common\Models {
    class Extensions
    {
        public static array $rows = [];

        public static function find($parameters = null): array
        {
            return static::$rows;
        }
    }
}

namespace Modules\ModuleUsersGroups\Models {
    class GroupMembers
    {
        public static array $rows = [];

        public static function find(): array
        {
            return static::$rows;
        }
    }

    class AllowedOutboundRules extends GroupMembers
    {
        public static array $rows = [];
    }

    class UsersGroups extends GroupMembers
    {
        public static array $rows = [];
        public $id;
        public $isolate;
        public $patterns;

        public function __construct(array $data)
        {
            foreach ($data as $key => $value) {
                $this->$key = $value;
            }
        }

        public function toArray(): array
        {
            return get_object_vars($this);
        }
    }
}

namespace {
    require_once dirname(__DIR__) . '/Lib/CallerId.php';
    require_once dirname(__DIR__) . '/Lib/UsersGroups.php';
    require_once dirname(__DIR__) . '/Lib/UsersGroupsConf.php';

    use MikoPBX\Common\Models\Extensions;
    use MikoPBX\Core\System\PBX;
    use Modules\ModuleUsersGroups\Lib\CallerId;
    use Modules\ModuleUsersGroups\Lib\UsersGroups;
    use Modules\ModuleUsersGroups\Lib\UsersGroupsConf;
    use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
    use Modules\ModuleUsersGroups\Models\GroupMembers;
    use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;

    function assertTrue(bool $condition, string $message): void
    {
        if (!$condition) {
            throw new \RuntimeException($message);
        }
    }

    function assertContains(string $needle, string $haystack, string $message): void
    {
        assertTrue(strpos($haystack, $needle) !== false, $message . "\nОтсутствует: " . $needle);
    }

    function assertOccursBefore(string $first, string $second, string $haystack, string $message): void
    {
        $firstPosition = strpos($haystack, $first);
        $secondPosition = strpos($haystack, $second);
        assertTrue(
            $firstPosition !== false && $secondPosition !== false && $firstPosition < $secondPosition,
            $message
        );
    }

    function group(int $id, string $isolate = '0'): ModelUsersGroups
    {
        return new ModelUsersGroups(['id' => $id, 'isolate' => $isolate, 'patterns' => '']);
    }

    Extensions::$rows = [
        (object)['number' => '101', 'userid' => 1],
        (object)['number' => '102', 'userid' => 2],
        (object)['number' => '103', 'userid' => 3],
        (object)['number' => '104', 'userid' => 4],
    ];
    GroupMembers::$rows = [
        (object)['user_id' => 1, 'group_id' => 3],
        (object)['user_id' => 2, 'group_id' => 5],
        (object)['user_id' => 4, 'group_id' => 99],
    ];
    ModelUsersGroups::$rows = [group(3, '1'), group(5)];
    AllowedOutboundRules::$rows = [
        (object)['group_id' => 3, 'rule_id' => 27, 'caller_id' => '+74951234567'],
        (object)['group_id' => 5, 'rule_id' => 28, 'caller_id' => ''],
        (object)['group_id' => 3, 'rule_id' => 29, 'caller_id' => "123\n[globals]\nINJECTED=1"],
        (object)['group_id' => 3, 'rule_id' => 30, 'caller_id' => '123-456'],
        (object)['group_id' => 5, 'rule_id' => 31, 'caller_id' => 'anonymous'],
        (object)['group_id' => 3, 'rule_id' => 32, 'caller_id' => '101 <101>'],
        (object)['group_id' => 3, 'rule_id' => 33, 'caller_id' => '"Sales Team" <+74951234568>'],
        (object)['group_id' => 3, 'rule_id' => 34, 'caller_id' => '  Office SPB < 102 >  '],
        (object)['group_id' => 3, 'rule_id' => 35, 'caller_id' => 'Name <123)g>'],
        (object)['group_id' => 3, 'rule_id' => 36, 'caller_id' => "Name\n<103>"],
        (object)['group_id' => 3, 'rule_id' => 37, 'caller_id' => 'Name <104> tail'],
        (object)['group_id' => 3, 'rule_id' => 38, 'caller_id' => 'Name <<105>>'],
        (object)['group_id' => 3, 'rule_id' => 39, 'caller_id' => 'Name <>'],
        (object)['group_id' => 3, 'rule_id' => 40, 'caller_id' => 'Name <${SHELL(id)}>'],
        (object)['group_id' => 3, 'rule_id' => 41, 'caller_id' => 'Name <106>,Set(INJECTED=1)'],
        (object)['group_id' => 3, 'rule_id' => 42, 'caller_id' => 'Name)g <107>'],
        (object)['group_id' => 3, 'rule_id' => 43, 'caller_id' => '${SHELL(id)} <108>'],
        (object)['group_id' => 3, 'rule_id' => 44, 'caller_id' => 'Name,tail <109>'],
        (object)['group_id' => 3, 'rule_id' => 45, 'caller_id' => '"  " <110>'],
        (object)['group_id' => 3, 'rule_id' => 46, 'caller_id' => 'Name <   >'],
    ];

    $callerIdCases = [
        ['AZaz09 +-*#_.', 'AZaz09 +-*#_.'],
        ['"Sales + - _ . * # 09" <+1-02_3.4*#>', 'Sales + - _ . * # 09 <+1-02_3.4*#>'],
        ['Café <101>', ''],
        ['Café <101>', ''],
        ['Имя <101>', ''],
        ['Name <١٠١>', ''],
        ["Name\u{00A0}<101>", ''],
        ["Name\t<101>", ''],
        ["Name <101>\r\n", ''],
        ["Name\0 <101>", ''],
        ["Name\x7F <101>", ''],
        ['Name;tail <101>', ''],
        ['Name\\tail <101>', ''],
        ['Name"tail <101>', ''],
        ['Name <10,1>', ''],
        ['Name <10;1>', ''],
        ['Name <10\\1>', ''],
    ];
    assertTrue(CallerId::isValid('') && CallerId::isValid('   '), 'Пустой CallerID должен разрешаться как отсутствие подмены.');
    foreach ($callerIdCases as $index => [$input, $expected]) {
        assertTrue(CallerId::isValid($input) === ($expected !== ''), 'Валидация сохранения должна совпадать с генерацией CallerID.');
        assertTrue(CallerId::normalize($input) === $expected, 'Общий разбор CallerID должен возвращать ожидаемое значение.');
        AllowedOutboundRules::$rows[] = (object)['group_id' => 3, 'rule_id' => 5000 + $index, 'caller_id' => $input];
    }

    $config = new UsersGroupsConf();
    $contexts = $config->extensionGenContexts();
    foreach ($callerIdCases as $index => [$input, $expected]) {
        $policy = 'exten => ' . (5000 + $index) . ',1,Set(UG_ROUTE_ALLOWED=1)' . PHP_EOL;
        if ($expected !== '') {
            $policy .= 'same => n,Set(UG_ROUTE_CID=' . $expected . ')' . PHP_EOL;
        }
        $policy .= 'same => n,Return()';
        assertContains($policy, $contexts, 'Нарушен допустимый набор символов CallerID: ' . var_export($input, true));
    }
    $dialplan = $config->generateOutRoutContext(['id' => 27]);
    $afterDial = $config->generateOutRoutAfterDialContext(['id' => 27]);

    assertContains('exten => 101,1,Return(3)', $contexts, 'Справочник должен возвращать ID модели без сдвига.');
    assertContains('exten => 102,1,Return(5)', $contexts, 'Участники разных групп должны различаться.');
    assertContains('exten => 104,1,Return(99)', $contexts, 'Потерянная группа не должна превращаться в отсутствие ограничений.');
    assertTrue(strpos($contexts, 'exten => 103,') === false, 'Сотрудник без группы не должен получать чужую группу.');
    assertContains('[users-group-isolate-4]', $contexts, 'Сдвиг +1 для существующей изоляции должен сохраняться.');
    assertContains('[users-group-policy-3]', $contexts, 'Политика должна использовать ID модели.');
    assertContains('exten => 27,1,Set(UG_ROUTE_ALLOWED=1)', $contexts, 'Разрешённый маршрут должен присутствовать.');
    assertContains('Set(UG_ROUTE_CID=+74951234567)', $contexts, 'CallerID должен храниться в политике группы.');
    assertContains('Set(UG_ROUTE_CID=123-456)', $contexts, 'Сохранённый CallerID с дефисом должен поддерживаться.');
    assertContains('Set(UG_ROUTE_CID=anonymous)', $contexts, 'Текстовый CallerID должен поддерживаться.');
    foreach ([32 => '101 <101>', 33 => 'Sales Team <+74951234568>', 34 => 'Office SPB <102>'] as $route => $number) {
        assertContains(
            'exten => ' . $route . ',1,Set(UG_ROUTE_ALLOWED=1)' . PHP_EOL . 'same => n,Set(UG_ROUTE_CID=' . $number . ')' . PHP_EOL . 'same => n,Return()',
            $contexts,
            'CallerID должен сохранять имя и номер в безопасном нормализованном формате.'
        );
    }
    foreach (range(35, 46) as $route) {
        assertContains(
            'exten => ' . $route . ',1,Set(UG_ROUTE_ALLOWED=1)' . PHP_EOL . 'same => n,Return()',
            $contexts,
            'Некорректный CallerID должен пропускаться без запрета разрешённого маршрута.'
        );
    }
    assertTrue(strpos($contexts, 'SHELL(') === false && strpos($contexts, ')g') === false, 'Имя не должно позволять инъекцию dialplan или опций Dial.');
    assertTrue(strpos($contexts, 'INJECTED') === false, 'CallerID не должен позволять инъекцию конфигурации.');
    assertTrue(strpos($contexts, '-WS,1,') === false && strpos($contexts, '-TLS,1,') === false, 'Aliases не должны раздувать справочник.');

    assertContains('Set(UG_MEMBER_KEY=${ARG1})', $contexts, 'Lookup должен работать с временной копией номера.');
    assertContains('ExecIf(${REGEX("-WS$" ${ARG1})}?Set(UG_MEMBER_KEY=${ARG1:0:-3}))', $contexts, 'Нужно удалять только завершающий -WS.');
    assertContains('ExecIf(${REGEX("-TLS$" ${ARG1})}?Set(UG_MEMBER_KEY=${ARG1:0:-4}))', $contexts, 'Нужно удалять только завершающий -TLS.');
    foreach (['Set(UG_GROUP_ID=)', 'Set(UG_ROUTE_ALLOWED=0)', 'Set(UG_ROUTE_CID=)'] as $reset) {
        assertOccursBefore($reset, 'Gosub(users-group-members,', $contexts, 'Каждый lookup должен сбрасывать предыдущий результат.');
    }
    assertContains('GotoIf($["${UG_MEMBER_KEY}" = ""]?done)', $contexts, 'Пустой источник не должен использовать extension s.');
    assertContains('GosubIf(${DIALPLAN_EXISTS(users-group-policy-${UG_GROUP_ID},${ARG2},1)}?', $contexts, 'Нельзя вызывать отсутствующий маршрут.');

    $permissionLookup = 'Gosub(users-group-profile,s,1(${FROM_PEER},27))';
    $permissionCheck = 'ExecIf($["${UG_GROUP_ID}" != "" && "${UG_ROUTE_ALLOWED}" != "1"]?Return())';
    $forwardingLookup = 'GosubIf($["${FW_SOURCE_PEER}" != ""]?users-group-profile,s,1(${FW_SOURCE_PEER},27))';
    assertOccursBefore($permissionLookup, $permissionCheck, $dialplan, 'Сначала нужно получить права инициатора.');
    assertOccursBefore($permissionCheck, $forwardingLookup, $dialplan, 'Переадресатор не должен разрешать запрещённый инициатору маршрут.');
    $customCallerId = 'Set(UG_EFFECTIVE_CID=${OUTGOING_CID})';
    $groupCallerId = 'ExecIf($["${UG_ROUTE_CID}" != ""]?Set(UG_EFFECTIVE_CID=${UG_ROUTE_CID}))';
    $overrideGuard = 'GotoIf($[${LEN(${UG_EFFECTIVE_CID})} = 0]?ug-cid-ready)';
    $overrideActive = 'Set(UG_CID_OVERRIDE_ACTIVE=1)';
    $applyCallerId = 'Set(OUTGOING_CID=${UG_EFFECTIVE_CID})';
    $applyOptions = 'Set(DOPTIONS=${DOPTIONS}f(${UG_EFFECTIVE_CID}))';
    assertOccursBefore($forwardingLookup, $customCallerId, $dialplan, 'Оба lookup должны завершиться до выбора эффективного CallerID.');
    assertOccursBefore($customCallerId, $groupCallerId, $dialplan, 'Непустой групповой CallerID должен заменять значение из custom dialplan.');
    assertOccursBefore($groupCallerId, $overrideGuard, $dialplan, 'Пропуск подмены должен проверяться после выбора обоих источников.');
    $customHook = 'same => n(ug-cid-ready),GosubIf(';
    assertOccursBefore($permissionCheck, $overrideGuard, $dialplan, 'Запрещённый маршрут должен возвращаться до создания снимка.');
    assertOccursBefore($forwardingLookup, $overrideGuard, $dialplan, 'Выбор CallerID переадресатора должен предшествовать снимку.');
    foreach ([
        'Set(UG_OLD_CALLERID=${CALLERID(num)})',
        'Set(UG_OLD_CALLERID_NAME=${CALLERID(name)})',
        'Set(UG_OLD_OUTGOING_CID=${OUTGOING_CID})',
        'Set(UG_OLD_DOPTIONS=${DOPTIONS})',
    ] as $snapshot) {
        assertOccursBefore($overrideGuard, $snapshot, $dialplan, 'Без группового и custom CallerID снимок не должен создаваться.');
        assertOccursBefore($snapshot, $overrideActive, $dialplan, 'Все исходные значения должны сохраняться до установки флага.');
    }
    assertOccursBefore($overrideActive, $applyCallerId, $dialplan, 'Флаг должен устанавливаться до подмены.');
    assertOccursBefore($applyCallerId, $applyOptions, $dialplan, 'Опции должны использовать выбранный групповой или custom CallerID.');
    assertOccursBefore($applyOptions, $customHook, $dialplan, 'Custom-hook должен вызываться после подмены либо пропуска всей ветки.');
    assertTrue(substr_count($dialplan, 'f(${UG_EFFECTIVE_CID})') === 1, 'Модуль должен добавлять ровно одну опцию f() для выбранного источника.');
    assertOccursBefore('Set(UG_OLD_OUTGOING_CID=${OUTGOING_CID})', $applyCallerId, $dialplan, 'Исходный custom CallerID должен сохраняться до групповой подмены.');
    assertOccursBefore('Set(UG_OLD_DOPTIONS=${DOPTIONS})', $applyOptions, $dialplan, 'Опции custom dialplan должны сохраняться до добавления f().');

    $restoreGuard = 'GotoIf($["${UG_CID_OVERRIDE_ACTIVE}" != "1"]?ug-cid-restored)';
    $clearFlag = 'same => n(ug-cid-restored),Set(UG_CID_OVERRIDE_ACTIVE=)';
    assertOccursBefore($clearFlag, 'Set(UG_EFFECTIVE_CID=)', $afterDial, 'Временный выбранный CallerID должен очищаться после восстановления.');
    foreach ([
        'CALLERID(num)' => 'UG_OLD_CALLERID',
        'CALLERID(name)' => 'UG_OLD_CALLERID_NAME',
        'OUTGOING_CID' => 'UG_OLD_OUTGOING_CID',
        'DOPTIONS' => 'UG_OLD_DOPTIONS',
    ] as $variable => $backup) {
        $restore = 'Set(' . $variable . '=${' . $backup . '})';
        $clear = 'Set(' . $backup . '=)';
        assertOccursBefore($restoreGuard, $restore, $afterDial, 'Восстановление должно зависеть только от отдельного флага.');
        assertOccursBefore($restore, $clear, $afterDial, 'Снимок должен очищаться после восстановления, включая пустые значения.');
        assertOccursBefore($clear, $clearFlag, $afterDial, 'Флаг должен очищаться после снимка.');
    }
    assertTrue(substr_count($afterDial, 'GotoIf(') === 1 && strpos($afterDial, 'ExecIf(') === false, 'Пустое исходное значение не должно блокировать восстановление.');
    assertTrue(strpos($dialplan . $afterDial, 'GR_OLD_CALLERID') === false, 'Старый механизм восстановления должен быть заменён.');
    assertTrue(strpos($dialplan, 'Set(CALLERID(num)=') === false, 'До Dial CallerID не должен подменяться прямым присваиванием.');
    foreach (['DB(', 'Exec(Set(', 'set_var', 'Set(FROM_PEER=', 'Set(__FROM_PEER='] as $forbidden) {
        assertTrue(strpos($contexts . $dialplan, $forbidden) === false, 'Обнаружена запрещённая конструкция: ' . $forbidden);
    }

    // Изменения должны отражаться даже при повторной генерации тем же объектом.
    ModelUsersGroups::$rows = [group(5)];
    AllowedOutboundRules::$rows = [];
    GroupMembers::$rows = [];
    $updated = $config->extensionGenContexts();
    assertTrue(strpos($updated, '[users-group-policy-3]') === false, 'Удалённая группа не должна сохраняться в кэше.');
    assertTrue(strpos($updated, 'Set(UG_ROUTE_ALLOWED=1)') === false, 'Удалённые разрешения не должны сохраняться.');
    assertTrue(strpos($updated, 'exten => 101,') === false, 'Удалённый участник не должен сохраняться.');

    ModelUsersGroups::$rows = [group(3)];
    Extensions::$rows = [];
    GroupMembers::$rows = [];
    for ($i = 1000; $i < 3000; $i++) {
        Extensions::$rows[] = (object)['number' => (string)$i, 'userid' => $i];
        GroupMembers::$rows[] = (object)['user_id' => $i, 'group_id' => 3];
    }
    $large = $config->extensionGenContexts();
    assertTrue(substr_count($large, ',1,Return(3)') === 2000, 'На 2000 сотрудников должно быть ровно 2000 записей, без aliases.');
    ModelUsersGroups::$rows = [group(0)];
    Extensions::$rows = [(object)['number' => '101', 'userid' => 1]];
    GroupMembers::$rows = [(object)['user_id' => 1, 'group_id' => 0]];
    $zeroGroup = $config->extensionGenContexts();
    assertContains('exten => 101,1,Return(0)', $zeroGroup, 'ID группы 0 не должен означать отсутствие группы.');
    assertContains('[users-group-policy-0]', $zeroGroup, 'Для ID 0 должна генерироваться политика.');
    assertTrue(strpos($afterDial, 'GR_PERM_ENABLE') === false, 'Восстановление CallerID не должно зависеть от удалённого профиля AstDB.');

    UsersGroups::reloadConfigs();
    assertTrue(PBX::$reloads === ['sip', 'dialplan'], 'Reload должен обходиться без AstDB и сохранять обновление SIP/dialplan.');
    assertTrue(!method_exists(UsersGroups::class, 'fillAsteriskDatabase'), 'Старый путь записи AstDB должен быть удалён.');
    assertTrue($config->generatePeersPj() === '', 'Генерация PJSIP не должна писать во внешнее хранилище.');

    echo "UsersGroupsConf tests passed\n";
}
