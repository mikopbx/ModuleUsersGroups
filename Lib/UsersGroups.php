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


namespace Modules\ModuleUsersGroups\Lib;

use MikoPBX\Common\Models\Extensions;
use MikoPBX\Core\System\PBX;
use MikoPBX\Modules\PbxExtensionBase;
use Modules\ModuleUsersGroups\Models\GroupMembers;

class UsersGroups extends PbxExtensionBase
{
    /**
     * Initializes the user list.
     *
     * @return array The user list with extension numbers and corresponding group IDs.
     */
    public static function initUserList(): array
    {

        // Initialize an empty array to store the user list
        $userList = [];

        $grMembers = GroupMembers::find();
        $extensions = Extensions::find("type='SIP'");
        $groups = [];

        /**
         * Process group members and store group IDs in the $groups array.
         *
         * @var GroupMembers $member
         */
        foreach ($grMembers as $member) {
            $groups[$member->user_id] = $member->group_id + 1;
        }

        // If no groups found, return the empty user list
        if (empty($groups)) {
            return $userList;
        }

        /**
         * Process extensions and add extension numbers with their corresponding group IDs to the user list.
         *
         * @var Extensions $extension
         */
        foreach ($extensions as $extension) {
            $grId = $groups[$extension->userid] ?? '';
            if (empty($grId)) {
                continue;
            }
            $userList[$extension->number] = $grId;
        }
        return $userList;
    }

    /**
     * Reloads the Asterisk configurations.
     */
    public static function reloadConfigs(): void
    {
        PBX::sipReload();
        PBX::dialplanReload();
    }
}
