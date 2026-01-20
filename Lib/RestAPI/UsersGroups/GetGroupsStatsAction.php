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
use Modules\ModuleUsersGroups\Models\GroupMembers;
use Modules\ModuleUsersGroups\Models\UsersGroups;

/**
 * Get statistics for all groups (member counts)
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class GetGroupsStatsAction
{
    /**
     * Get member counts for all groups
     *
     * @param array $data Request data (optional group_id for single group)
     * @return PBXApiResult
     */
    public static function main(array $data): PBXApiResult
    {
        $result = new PBXApiResult();
        $result->processor = __METHOD__;

        // Optional: filter by specific group_id
        $groupId = isset($data['group_id']) ? filter_var($data['group_id'], FILTER_VALIDATE_INT) : null;

        try {
            $stats = [];

            if ($groupId !== null && $groupId !== false) {
                // Get count for specific group
                $count = GroupMembers::count([
                    'conditions' => 'group_id = :groupId:',
                    'bind' => ['groupId' => $groupId]
                ]);

                $stats[$groupId] = (int)$count;
            } else {
                // Get counts for all groups
                $groups = UsersGroups::find();

                foreach ($groups as $group) {
                    $count = GroupMembers::count([
                        'conditions' => 'group_id = :groupId:',
                        'bind' => ['groupId' => $group->id]
                    ]);

                    $stats[$group->id] = (int)$count;
                }
            }

            $result->success = true;
            $result->data = [
                'stats' => $stats
            ];
            $result->httpCode = 200;
        } catch (\Throwable $e) {
            $result->success = false;
            $result->messages[] = 'Failed to get group statistics: ' . $e->getMessage();
            $result->httpCode = 500;
        }

        return $result;
    }
}
