<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

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
use MikoPBX\Core\System\PBX;
use MikoPBX\Modules\PbxExtensionBase;
use MikoPBX\Modules\PbxExtensionUtils;
use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
use Modules\ModuleUsersGroups\Models\GroupMembers;

class UsersGroups extends PbxExtensionBase
{
    /**
     * Initializes the user list.
     *
     * @return array The user list with extension numbers and corresponding group IDs.
     */
    public static function initUserList():array {

        // Initialize an empty array to store the user list
        $userList   = [];

        $grMembers  = GroupMembers::find();
        $extensions = Extensions::find("type='SIP'");
        $groups     = [];

        /**
         * Process group members and store group IDs in the $groups array.
         *
         * @var GroupMembers $member
         */
        foreach ($grMembers as $member){
            $groups[$member->user_id] = $member->group_id+1;
        }

        // If no groups found, return the empty user list
        if(empty($groups)){
            return $userList;
        }

        /**
         * Process extensions and add extension numbers with their corresponding group IDs to the user list.
         *
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

    /**
     * Fills the Asterisk database with relevant data.
     */
    public function fillAsteriskDatabase(): void
    {
        $enabled = PbxExtensionUtils::isEnabled($this->moduleUniqueId);
        
        $db        = new AstDB();
        $extension = Extensions::find("type='SIP'")->toArray();
        if ($enabled === false) {
            $cmd = "ARRAY(GR_PERM_ENABLE)=0)";

            // Loop through each extension and disable group permissions
            foreach ($extension as $extensionData) {
                $db->databasePut('UsersGroups', $extensionData['number'], $cmd);
            }
        } else {
            $groupMembers = GroupMembers::find()->toArray();
            /** @var AllowedOutboundRules $rule */
            $allowedRules = AllowedOutboundRules::find()->toArray();

            // Loop through each extension and set group ID and channel variables
            foreach ($extension as $extensionData) {
                [$groupId, $number] = $this->initGroupID($extensionData, $groupMembers);
                $channelVars = $this->initChannelVariables($groupId, $allowedRules);

                // Store the channel variables in the UsersGroups database
                $db->databasePut('UsersGroups', $number, $channelVars);
            }
        }
    }

    /**
     * Initializes the channel variables for a given group ID.
     *
     * @param int $group_id The group ID
     * @param array $allowedRules The array of allowed outbound rules
     * @return string The channel variables in the format "ARRAY(varNames)=varValues"
     */
    private function initChannelVariables($group_id, array $allowedRules): string{
        if ($group_id) {
            $varNames  = 'GR_PERM_ENABLE';
            $varValues = '1';

            // Find all routes allowed in the group
            foreach ($allowedRules as $ruleData) {
                if ($ruleData['group_id'] !== $group_id) {
                    continue;
                }

                // Process the route rules
                $varNames .= sprintf(',GR_ID_%s', $ruleData['rule_id']);
                $varValues.= ',1';
                if (empty($ruleData['caller_id'])) {
                    continue;
                }
                $varNames .= sprintf(',GR_CID_%s', $ruleData['rule_id']);
                $varValues.= ','.$ruleData['caller_id'];
            }
        } else {
            $varNames  = 'GR_PERM_ENABLE';
            $varValues = '0';
        }

        // Return the channel variables in the specified format
        return "ARRAY({$varNames})={$varValues}";
    }

    /**
     * Initializes the group ID for a given extension data.
     *
     * @param array $extensionData The extension data
     * @param array $groupMembers The array of group members
     * @return array The group ID and extension number
     */
    private function initGroupID($extensionData, array $groupMembers): array{
        // Find the group to which the employee belongs
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

    /**
     * Reloads the Asterisk configurations.
     */
    public static function reloadConfigs():void{
        // Create a new instance of the current class
        $mod = new self();

        // Fill the Asterisk database with relevant data
        $mod->fillAsteriskDatabase();

        // Reload the SIP configurations in Asterisk
        PBX::sipReload();

        // Reload the dial plan configurations in Asterisk
        PBX::dialplanReload();
    }
}