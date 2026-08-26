<?php

declare(strict_types=1);

namespace MikoPBX\Modules\Config {
    class ConfigClass
    {
    }
}

namespace {
    require_once dirname(__DIR__) . '/Lib/UsersGroupsConf.php';

    use Modules\ModuleUsersGroups\Lib\UsersGroupsConf;

    function assertContains(string $needle, string $haystack, string $message): void
    {
        if (strpos($haystack, $needle) === false) {
            throw new RuntimeException($message . "\nMissing: " . $needle);
        }
    }

    function assertOccursBefore(string $first, string $second, string $haystack, string $message): void
    {
        $firstPosition = strpos($haystack, $first);
        $secondPosition = strpos($haystack, $second);

        if ($firstPosition === false || $secondPosition === false || $firstPosition >= $secondPosition) {
            throw new RuntimeException($message);
        }
    }

    $config = new UsersGroupsConf();
    $dialplan = $config->generateOutRoutContext(['id' => 27]);

    $permissionLookup = 'Set(GR_VARS=${DB(UsersGroups/${FROM_PEER})})';
    $permissionCheck = '"${GR_ID_27}" != "1"]?return)';
    $forwardingLookup = 'Set(GR_VARS=${DB(UsersGroups/${FW_SOURCE_PEER})})';
    $callerIdApplication = '"${GR_CID_27}x" != "x"]?MSet(';

    assertContains(
        'Set(GR_ID_27=${UNDEFINED})',
        $dialplan,
        'The current route permission must be cleared before loading the caller profile.'
    );
    assertContains(
        'Set(GR_CID_27=${UNDEFINED})',
        $dialplan,
        'The current route caller ID must be cleared before loading the forwarding profile.'
    );
    assertOccursBefore(
        $permissionLookup,
        $permissionCheck,
        $dialplan,
        'Outbound permission must be loaded from FROM_PEER before it is checked.'
    );
    assertOccursBefore(
        $permissionCheck,
        $forwardingLookup,
        $dialplan,
        'The forwarding profile must not be loaded until the caller permission is accepted.'
    );
    assertOccursBefore(
        $forwardingLookup,
        $callerIdApplication,
        $dialplan,
        'Forwarding employee Caller ID must be loaded before Caller ID is applied.'
    );

    echo "UsersGroupsConf tests passed\n";
}
