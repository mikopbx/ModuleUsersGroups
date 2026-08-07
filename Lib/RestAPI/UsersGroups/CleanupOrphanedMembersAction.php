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
use Modules\ModuleUsersGroups\Models\UsersGroups;

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
            // Build the set of valid user IDs, ignoring empty/zero identifiers.
            $validUserIds = [];
            foreach (Users::find(['columns' => 'id']) as $user) {
                $id = (int)$user->id;
                if ($id > 0) {
                    $validUserIds[] = $id;
                }
            }

            // Safety guard: if we could not resolve any valid user (e.g. the core
            // database connection is not ready right after module enable), abort
            // instead of deleting every membership. See issue #34.
            if (count($validUserIds) === 0) {
                $result->success = true;
                $result->data = [
                    'deleted' => 0,
                    'message' => 'No valid users resolved, cleanup skipped'
                ];
                $result->httpCode = 200;
                return $result;
            }

            $connection   = (new GroupMembers())->getWriteConnection();
            $deletedCount = 0;

            // 1. Members whose user no longer exists. Set-based DELETE guarded by the
            //    non-empty valid-user list above (so it can never become "NOT IN ()").
            $userIdsList = implode(',', $validUserIds);
            $success = $connection->execute(
                "DELETE FROM m_ModuleUsersGroups_GroupMembers WHERE user_id NOT IN ({$userIdsList})"
            );
            if ($success) {
                $deletedCount += $connection->affectedRows();
            }

            // 2. Defence in depth: members and outbound-rule links pointing at a group
            //    that no longer exists. These are normally cleaned up in
            //    ModuleUsersGroupsController::deleteAction; this sweeps any that slipped
            //    through (e.g. a future/alternate group-delete path). Skipped when no
            //    group resolves, to avoid wiping everything on a transient empty read.
            $validGroupIds = [];
            foreach (UsersGroups::find(['columns' => 'id']) as $group) {
                $gid = (int)$group->id;
                if ($gid > 0) {
                    $validGroupIds[] = $gid;
                }
            }
            if ($success && count($validGroupIds) > 0) {
                $groupIdsList = implode(',', $validGroupIds);
                $success = $connection->execute(
                    "DELETE FROM m_ModuleUsersGroups_GroupMembers WHERE group_id NOT IN ({$groupIdsList})"
                );
                if ($success) {
                    $deletedCount += $connection->affectedRows();
                    $success = $connection->execute(
                        "DELETE FROM m_ModuleUsersGroups_AllowedOutboundRules WHERE group_id NOT IN ({$groupIdsList})"
                    );
                    if ($success) {
                        $deletedCount += $connection->affectedRows();
                    }
                }
            }

            // A failed DELETE must be reported as a failure, not a silent success.
            if ($success === false) {
                $result->success = false;
                $result->messages[] = 'Failed to cleanup orphaned records: DELETE returned false';
                $result->httpCode = 500;
                return $result;
            }

            $result->success = true;
            $result->data = [
                'deleted' => $deletedCount,
                'valid_users' => count($validUserIds)
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
