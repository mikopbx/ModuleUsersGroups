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

/**
 * Data structure for Users Groups API
 *
 * @package Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups
 */
class DataStructure
{
    /**
     * Get parameter definitions for Users Groups API
     *
     * @return array<string, array<string, array<string, mixed>>>
     */
    public static function getParameterDefinitions(): array
    {
        return [
            'request' => [
                'user_id' => [
                    'type' => 'integer',
                    'description' => 'User ID from Users table',
                    'sanitize' => 'int',
                    'minimum' => 1,
                    'example' => 1
                ],
                'group_id' => [
                    'type' => 'integer',
                    'description' => 'Group ID from UsersGroups table',
                    'sanitize' => 'int',
                    'minimum' => 1,
                    'required' => true,
                    'example' => 1
                ]
            ],
            'response' => [
                'group_id' => [
                    'type' => 'integer',
                    'description' => 'Group ID',
                    'example' => 1
                ]
            ]
        ];
    }

    /**
     * Get sanitization rules auto-generated from definitions
     *
     * @return array<string, string>
     */
    public static function getSanitizationRules(): array
    {
        $definitions = static::getParameterDefinitions();
        $rules = [];

        foreach ($definitions['request'] as $field => $def) {
            $rule = [$def['type'] ?? 'string'];

            if (isset($def['sanitize'])) {
                $rule[] = 'sanitize:' . $def['sanitize'];
            }
            if (isset($def['maxLength'])) {
                $rule[] = 'max:' . $def['maxLength'];
            }
            if (!isset($def['required'])) {
                $rule[] = 'empty_to_null';
            }

            $rules[$field] = implode('|', $rule);
        }

        return $rules;
    }
}
