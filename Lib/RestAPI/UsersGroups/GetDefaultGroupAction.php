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
 * Get default group
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class GetDefaultGroupAction
{
    /**
     * Get default group
     *
     * @param array $data Request data (not used)
     * @return PBXApiResult
     */
    public static function main(array $data): PBXApiResult
    {
        $result = new PBXApiResult();
        $result->processor = __METHOD__;

        // Get default group from model
        $defaultGroup = ModelUsersGroups::getDefaultGroup();

        if ($defaultGroup !== null) {
            $result->success = true;
            $result->data = [
                'group_id' => (int)$defaultGroup->id
            ];
            $result->httpCode = 200;
        } else {
            $result->success = false;
            $result->messages[] = 'No default group configured';
            $result->httpCode = 404;
        }

        return $result;
    }
}
