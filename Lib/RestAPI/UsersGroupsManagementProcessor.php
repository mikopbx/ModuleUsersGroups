<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2025 Alexey Portnov and Nikolay Beketov
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

namespace Modules\ModuleUsersGroups\Lib\RestAPI;

use Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups\GetUserGroupAction;
use Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups\GetDefaultGroupAction;
use Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups\SetDefaultGroupAction;
use Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups\GetGroupsStatsAction;
use Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups\CleanupOrphanedMembersAction;
use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use Phalcon\Di\Injectable;

/**
 * Class UsersGroupsManagementProcessor
 *
 * Processes users groups management requests
 *
 * API methods:
 * - getUserGroup             -> Get user's group by user_id
 * - getDefaultGroup          -> Get default group
 * - setDefaultGroup          -> Set default group
 * - getGroupsStats           -> Get member counts for all groups
 * - cleanupOrphanedMembers   -> Remove group members for deleted users
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI
 */
class UsersGroupsManagementProcessor extends Injectable
{
    // Available actions (PHP 7.4 compatible constants)
    public const ACTION_GET_USER_GROUP = 'getUserGroup';
    public const ACTION_GET_DEFAULT_GROUP = 'getDefaultGroup';
    public const ACTION_SET_DEFAULT_GROUP = 'setDefaultGroup';
    public const ACTION_GET_GROUPS_STATS = 'getGroupsStats';
    public const ACTION_CLEANUP_ORPHANED_MEMBERS = 'cleanupOrphanedMembers';

    /**
     * Main entry point for processing actions
     *
     * @param string $actionName Name of the action to execute
     * @param array $parameters Action parameters
     * @return PBXApiResult
     */
    public function callBack(string $actionName, array $parameters): PBXApiResult
    {
        // PHP 7.4 compatible switch instead of match
        switch ($actionName) {
            case self::ACTION_GET_USER_GROUP:
                return GetUserGroupAction::main($parameters);

            case self::ACTION_GET_DEFAULT_GROUP:
                return GetDefaultGroupAction::main($parameters);

            case self::ACTION_SET_DEFAULT_GROUP:
                return SetDefaultGroupAction::main($parameters);

            case self::ACTION_GET_GROUPS_STATS:
                return GetGroupsStatsAction::main($parameters);

            case self::ACTION_CLEANUP_ORPHANED_MEMBERS:
                return CleanupOrphanedMembersAction::main($parameters);

            default:
                $result = new PBXApiResult();
                $result->processor = __METHOD__;
                $result->success = false;
                $result->messages[] = "Unknown action: {$actionName}";
                return $result;
        }
    }
}
