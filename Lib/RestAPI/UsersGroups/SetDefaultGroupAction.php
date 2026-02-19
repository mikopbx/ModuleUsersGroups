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

use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use MikoPBX\Common\Models\Users;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;
use Modules\ModuleUsersGroups\Models\GroupMembers;

/**
 * Set default group
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class SetDefaultGroupAction
{
    /**
     * Set default group
     *
     * @param array $data Request data with group_id
     * @return PBXApiResult
     */
    public static function main(array $data): PBXApiResult
    {
        $result = new PBXApiResult();
        $result->processor = __METHOD__;

        // ============ PHASE 1: SANITIZATION ============
        // WHY: Security - never trust user input
        $sanitizationRules = DataStructure::getSanitizationRules();
        $sanitizedData = self::sanitizeInputData($data, $sanitizationRules);

        // ============ PHASE 2: REQUIRED VALIDATION ============
        // WHY: Fail fast - don't waste resources
        $groupId = $sanitizedData['group_id'] ?? null;

        if (empty($groupId)) {
            $result->success = false;
            $result->messages[] = 'group_id parameter is required';
            $result->httpCode = 400;
            return $result;
        }

        // ============ PHASE 3: FIND GROUP TO MAKE DEFAULT ============
        // WHY: Verify group exists before attempting to update
        $newDefaultGroup = ModelUsersGroups::findFirst((int)$groupId);
        if ($newDefaultGroup === null) {
            $result->success = false;
            $result->messages[] = 'Group not found';
            $result->httpCode = 404;
            return $result;
        }

        // ============ PHASE 4: CLEAR CURRENT DEFAULT GROUP ============
        // WHY: Only one group can be default at a time
        $currentDefaultGroup = ModelUsersGroups::getDefaultGroup();
        if ($currentDefaultGroup !== null && $currentDefaultGroup->id !== $newDefaultGroup->id) {
            $currentDefaultGroup->defaultGroup = '0';
            if (!$currentDefaultGroup->save()) {
                $result->success = false;
                $result->messages[] = 'Failed to clear current default group';
                $result->httpCode = 500;
                return $result;
            }
        }

        // ============ PHASE 5: SET NEW DEFAULT GROUP ============
        // WHY: Mark the new group as default
        $newDefaultGroup->defaultGroup = '1';
        if (!$newDefaultGroup->save()) {
            $result->success = false;
            $result->messages[] = 'Failed to set new default group';
            $result->httpCode = 500;
            return $result;
        }

        // ============ PHASE 6: AUTO-FILL USERS WITHOUT GROUP ============
        // WHY: When default group is set, automatically assign users without group
        $addedCount = self::fillUsersWithoutGroup($newDefaultGroup->id);

        $result->success = true;
        $result->data = [
            'group_id' => (int)$newDefaultGroup->id,
            'users_added' => $addedCount
        ];
        $result->httpCode = 200;

        return $result;
    }

    /**
     * Fill users without group into the default group
     *
     * @param int $groupId Default group ID
     * @return int Number of users added
     */
    private static function fillUsersWithoutGroup(int $groupId): int
    {
        try {
            // Get all users
            $allUsers = Users::find(['columns' => 'id']);
            if (count($allUsers) === 0) {
                return 0;
            }

            // Build list of all user IDs
            $allUserIds = [];
            foreach ($allUsers as $user) {
                $allUserIds[] = (int)$user->id;
            }

            // Get users who already have group membership
            $existingMembers = GroupMembers::find(['columns' => 'user_id']);
            $existingUserIds = [];
            foreach ($existingMembers as $member) {
                $existingUserIds[] = (int)$member->user_id;
            }

            // Find users without group (difference)
            $usersWithoutGroup = array_diff($allUserIds, $existingUserIds);

            // Add each user without group to default group
            $addedCount = 0;
            foreach ($usersWithoutGroup as $userId) {
                $member = new GroupMembers();
                $member->user_id = $userId;
                $member->group_id = $groupId;

                if ($member->save()) {
                    $addedCount++;
                }
            }

            return $addedCount;
        } catch (\Throwable $e) {
            // Log error but don't fail the whole operation
            return 0;
        }
    }

    /**
     * Sanitize input data
     *
     * @param array $data Raw input data
     * @param array $rules Sanitization rules
     * @return array Sanitized data
     */
    private static function sanitizeInputData(array $data, array $rules): array
    {
        $sanitized = [];

        foreach ($rules as $field => $rule) {
            if (!isset($data[$field])) {
                continue;
            }

            $value = $data[$field];

            // Apply int sanitization
            if (strpos($rule, 'sanitize:int') !== false) {
                $value = filter_var($value, FILTER_VALIDATE_INT);
            }

            $sanitized[$field] = $value;
        }

        return $sanitized;
    }
}
