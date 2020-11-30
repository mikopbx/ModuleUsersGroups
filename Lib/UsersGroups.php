<?php
/**
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 5 2020
 *
 */

namespace Modules\ModuleUsersGroups\Lib;

use MikoPBX\Common\Models\Extensions;
use MikoPBX\Core\Asterisk\AstDB;
use MikoPBX\Modules\PbxExtensionBase;
use MikoPBX\Modules\PbxExtensionUtils;
use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
use Modules\ModuleUsersGroups\Models\GroupMembers;

class UsersGroups extends PbxExtensionBase
{
    /**
     * Возвращает соответствие ID учетки и ID группы.
     * @return array
     */
    public static function initUserList():array {
        $userList   = [];

        $grMembers  = GroupMembers::find();
        $extensions = Extensions::find("type='SIP'");
        $groups     = [];

        /**
         * @var GroupMembers $member
         */
        foreach ($grMembers as $member){
            $groups[$member->user_id] = $member->group_id+1;
        }
        if(empty($groups)){
            return $userList;
        }

        /**
         * @var Extensions $extension
         */
        foreach ($extensions as $extension){
            $grId = $groups[$extension->userid]??'';
            if(empty($grId)){
                continue;
            }
            $userList[$extension->number] = $grId;
        }
        return $userList;
    }

    public function fillAsteriskDatabase(): void
    {
        $enabled = PbxExtensionUtils::isEnabled($this->moduleUniqueId);
        
        $db        = new AstDB();
        $extension = Extensions::find("type='SIP'")->toArray();
        if ($enabled === false) {
            foreach ($extension as $extensionData) {
                $db->databasePut('UsersGroups', $extensionData['number'], 'GR_PERM_ENABLE=0');
            }
        } else {
            $groupMembers = GroupMembers::find()->toArray();
            /** @var AllowedOutboundRules $rule */
            $allowedRules = AllowedOutboundRules::find()->toArray();
            foreach ($extension as $extensionData) {
                [$groupId, $number] = $this->initGroupID($extensionData, $groupMembers);
                $channelVars = $this->initChannelVariables($groupId, $allowedRules);
                // Поместим значение в ast DB
                $db->databasePut('UsersGroups', $number, $channelVars);
            }
        }
    }

    /**
     * @param       $group_id
     * @param array $allowedRules
     * @return string
     */
    private function initChannelVariables($group_id, array $allowedRules): string{
        if ($group_id) {
            // Найдем все маршруты, разрешенные в группе.
            $channelVars = 'GR_PERM_ENABLE=1';
            foreach ($allowedRules as $ruleData) {
                if ($ruleData['group_id'] !== $group_id) {
                    continue;
                }
                // Обработка правил маршрута.
                $channelVars .= sprintf(',GR_ID_%s=1', $ruleData['rule_id']);
                if (empty($ruleData['caller_id'])) {
                    continue;
                }
                $channelVars .= sprintf(',GR_CID_%s=%s', $ruleData['rule_id'], $ruleData['caller_id']);
            }
        } else {
            $channelVars = 'GR_PERM_ENABLE=0';
        }
        return $channelVars;
    }

    /**
     * @param       $extensionData
     * @param array $groupMembers
     * @return array
     */
    private function initGroupID($extensionData, array $groupMembers): array{
        // Найдем группу, к которой принадлежит сотрудник.
        $groupId = null;
        $number = $extensionData['number'];
        foreach ($groupMembers as $memberData) {
            if ($memberData['user_id'] === $extensionData['userid']) {
                $groupId = $memberData['group_id'];
                break;
            }
        }
        return array($groupId, $number);
    }
}