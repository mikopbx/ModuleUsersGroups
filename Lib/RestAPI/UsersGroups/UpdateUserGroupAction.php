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

namespace Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups;

use MikoPBX\Common\Models\Extensions;
use MikoPBX\Common\Models\Users;
use MikoPBX\Common\Providers\MikoPBXVersionProvider as MikoPBXVersion;
use MikoPBX\Core\System\Util;
use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use Modules\ModuleUsersGroups\Models\GroupMembers;

/**
 * Update user's group membership
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class UpdateUserGroupAction
{
    /**
     * Update user's group membership
     *
     * @param array $data Request data with user_id/number and mod_usrgr_select_group
     * @return PBXApiResult
     */
    public static function main(array $data): PBXApiResult
    {
        $result = new PBXApiResult();
        $result->processor = __METHOD__;

        // ============ PHASE 1: EXTRACT PARAMETERS ============
        $groupId = $data['mod_usrgr_select_group'] ?? '';
        $userId = $data['user_id'] ?? '';
        $number = $data['number'] ?? '';

        // ============ PHASE 2: VALIDATE GROUP ID ============
        if (empty($groupId)) {
            $result->success = false;
            $result->messages[] = 'Group ID is required';
            $result->httpCode = 400;
            return $result;
        }

        // ============ PHASE 3: GET USER ID ============
        if (empty($userId)) {
            $userId = self::getUserIdFromNumber($number);
        }

        if (empty($userId)) {
            $result->success = false;
            $result->messages[] = 'User ID could not be determined';
            $result->httpCode = 400;
            return $result;
        }

        // ============ PHASE 4: UPDATE GROUP MEMBERSHIP ============
        $updateResult = self::updateOrCreateGroupMembership($userId, $groupId);

        if ($updateResult) {
            $result->success = true;
            $result->data = [
                'user_id' => $userId,
                'group_id' => $groupId
            ];
            $result->httpCode = 200;
        } else {
            $result->success = false;
            $result->messages[] = 'Failed to update group membership';
            $result->httpCode = 500;
        }

        return $result;
    }

    /**
     * Retrieves a user ID based on a given phone number.
     *
     * Waits and attempts multiple times to retrieve the user ID for a newly created user
     * based on the provided phone number. This method performs a maximum of 10 attempts
     * with a 1-second pause between each attempt. It returns the user ID if found,
     * otherwise null after exhausting all attempts.
     *
     * @param string $number The phone number used to lookup the user ID.
     * @return string|null The user ID if found, otherwise null.
     */
    private static function getUserIdFromNumber(string $number): ?string
    {
        if (empty($number)) {
            return null;
        }

        $userId = null;
        // New user we have to wait until it will be created
        $di = MikoPBXVersion::getDefaultDi();
        $parameters = [
            'models' => [
                'Users' => Users::class,
            ],
            'conditions' => 'Extensions.number=:number:',
            'bind' => [
                'number' => $number
            ],
            'joins' => [
                'Extensions' => [
                    0 => Extensions::class,
                    1 => 'Extensions.userid = Users.id',
                    2 => 'Extensions',
                    3 => 'INNER',
                ],
            ],
            'columns' => [
                'id' => 'Users.id',
            ]
        ];

        // Wait for user to be created (max 10 attempts)
        for ($i = 0; $i < 10; $i++) {
            $query = $di->get('modelsManager')->createBuilder($parameters)->getQuery();
            $user = $query->getSingleResult();
            if ($user !== null) {
                $userId = $user->id;
                break;
            }
            sleep(1);
        }

        return $userId;
    }

    /**
     * Update or create group membership for a user
     *
     * @param string $userId User ID
     * @param string $groupId Group ID
     * @return bool True if successful, false otherwise
     */
    private static function updateOrCreateGroupMembership(string $userId, string $groupId): bool
    {
        $parameters = [
            'conditions' => 'user_id = :user_id:',
            'bind' => [
                'user_id' => $userId,
            ]
        ];

        // Find the existing group membership based on user ID
        $curUserGroup = GroupMembers::findFirst($parameters);

        // Update or create the group membership
        if ($curUserGroup === null) {
            // Create a new group membership
            $curUserGroup = new GroupMembers();
            $curUserGroup->user_id = $userId;
        }
        $curUserGroup->group_id = $groupId;

        // Save the changes to the database
        if (!$curUserGroup->save()) {
            Util::sysLogMsg(__METHOD__, implode($curUserGroup->getMessages()), LOG_ERR);
            return false;
        }

        return true;
    }
}
