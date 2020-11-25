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
        $extension = Extensions::find("type='SIP'");
        if ($enabled === false) {
            foreach ($extension as $exten_data) {
                $db->databasePut('UsersGroups', $exten_data->number, 'GR_PERM_ENABLE=0');
            }
        } else {
            $group_members = GroupMembers::find();
            /** @var AllowedOutboundRules $rule */
            $allowed_rules = AllowedOutboundRules::find();
            foreach ($extension as $exten_data) {
                /** @var GroupMembers $member_data */
                /** @var Extensions $exten_data */
                // Найдем группу, к которой принадлежит сотрудник.
                $group_id = null;
                $number   = $exten_data->number;
                foreach ($group_members as $member_data) {
                    if ($member_data->user_id === $exten_data->userid) {
                        $group_id = $member_data->group_id;
                        break;
                    }
                }
                if ($group_id !== null) {
                    // Найдем все маршруты, разрешенные в группе.
                    $set_var_data = 'GR_PERM_ENABLE=1';
                    /** @var AllowedOutboundRules $rule_data */
                    foreach ($allowed_rules as $rule_data) {
                        if ($rule_data->group_id === $group_id) {
                            // Обработка правил маршрута.
                            $set_var_data .= ",GR_ID_{$rule_data->rule_id}=1";
                            if ( ! empty($rule_data->caller_id)) {
                                $set_var_data .= ",GR_CID_{$rule_data->rule_id}={$rule_data->caller_id}";
                            }
                        }
                    }
                } else {
                    $set_var_data = 'GR_PERM_ENABLE=0';
                }
                $db->databasePut('UsersGroups', $number, $set_var_data);
            }
        }
    }
}