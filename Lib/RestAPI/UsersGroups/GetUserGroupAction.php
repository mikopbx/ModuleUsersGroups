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
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;

/**
 * Get user's group by user_id
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class GetUserGroupAction
{
    /**
     * Get user's group by user_id
     *
     * @param array $data Request data with user_id or id
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
        // Accept both 'user_id' and 'id' for backwards compatibility
        $userId = $sanitizedData['user_id'] ?? null;

        // If user_id not found, try 'id' parameter (fallback for old API calls)
        if (empty($userId) && isset($data['id'])) {
            $userId = filter_var($data['id'], FILTER_VALIDATE_INT);
            if ($userId === false) {
                $result->success = false;
                $result->messages[] = 'Invalid id format';
                $result->httpCode = 400;
                return $result;
            }
        }

        if (empty($userId)) {
            $result->success = false;
            $result->messages[] = 'user_id or id parameter is required';
            $result->httpCode = 400;
            return $result;
        }

        // ============ PHASE 3: GET GROUP ID ============
        // WHY: Get group ID from model (will return default if user has no group)
        $groupId = ModelUsersGroups::getUserGroupId($userId);

        if ($groupId !== null) {
            $result->success = true;
            $result->data = [
                'group_id' => $groupId
            ];
            $result->httpCode = 200;
        } else {
            $result->success = false;
            $result->messages[] = 'No group found for user';
            $result->httpCode = 404;
        }

        return $result;
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
