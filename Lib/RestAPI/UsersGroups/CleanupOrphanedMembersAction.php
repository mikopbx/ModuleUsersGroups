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
use Modules\ModuleUsersGroups\Models\GroupMembers;

/**
 * Cleanup orphaned group member records
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class CleanupOrphanedMembersAction
{
    /**
     * Remove group member records for deleted users
     *
     * @param array $data Request data (empty)
     * @return PBXApiResult
     */
    public static function main(array $data): PBXApiResult
    {
        $result = new PBXApiResult();
        $result->processor = __METHOD__;

        try {
            // Get valid user IDs using simple find
            $validUsers = Users::find(['columns' => 'id']);

            if (count($validUsers) === 0) {
                $result->success = true;
                $result->data = [
                    'deleted' => 0,
                    'message' => 'No users in system'
                ];
                $result->httpCode = 200;
                return $result;
            }

            // Build list of valid user IDs
            $validIds = [];
            foreach ($validUsers as $user) {
                $validIds[] = (int)$user->id;
            }

            // Get module database connection through model instance
            $groupMember = new GroupMembers();
            $connection = $groupMember->getReadConnection();
            $validIdsList = implode(',', $validIds);

            // Use direct SQL DELETE for performance
            $sql = "DELETE FROM m_ModuleUsersGroups_GroupMembers WHERE user_id NOT IN ({$validIdsList})";
            $success = $connection->execute($sql);
            $deletedCount = $success ? $connection->affectedRows() : 0;

            $result->success = true;
            $result->data = [
                'deleted' => $deletedCount,
                'valid_users' => count($validIds)
            ];
            $result->httpCode = 200;

        } catch (\Throwable $e) {
            $result->success = false;
            $result->messages[] = 'Failed to cleanup orphaned members: ' . $e->getMessage();
            $result->httpCode = 500;
        }

        return $result;
    }
}
