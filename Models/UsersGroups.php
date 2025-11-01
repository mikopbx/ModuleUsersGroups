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

namespace Modules\ModuleUsersGroups\Models;

use MikoPBX\Modules\Models\ModulesModelsBase;
use Phalcon\Mvc\Model\Relation;

class UsersGroups extends ModulesModelsBase
{

    /**
     * @Primary
     * @Identity
     * @Column(type="integer", nullable=false)
     */
    public $id;

    /**
     * Group name
     *
     * @Column(type="string", nullable=true)
     */
    public $name;

    /**
     * Group description
     *
     * @Column(type="string", nullable=true)
     */
    public $description;

    /**
     * Group patterns
     *
     * @Column(type="string", nullable=true)
     */
    public $patterns;

    /**
     * Group isolate
     *
     * @Column(type="string", nullable=true)
     */
    public $isolate;

    /**
     * Group isolatePickUp
     *
     * @Column(type="string", nullable=true)
     */
    public $isolatePickUp;

    /**
     * There is default group
     *
     * @Column(type="string", nullable=true)
     */
    public $defaultGroup;

    public function initialize(): void
    {
        $this->setSource('m_ModuleUsersGroups_UsersGroups');
        parent::initialize();
        $this->hasMany(
            'id',
            GroupMembers::class,
            'group_id',
            [
                'alias'      => 'GroupMembers',
                'foreignKey' => [
                    'allowNulls' => true,
                    'action'     => Relation::ACTION_CASCADE,
                    // When a group is deleted, delete the associated user-group mappings
                ],
            ]
        );

        $this->hasMany(
            'id',
            AllowedOutboundRules::class,
            'group_id',
            [
                'alias'      => 'AllowedOutboundRules',
                'foreignKey' => [
                    'allowNulls' => true,
                    'action'     => Relation::ACTION_CASCADE,
                    // When a group is deleted, delete all references to the outbound rules
                ],
            ]
        );
    }

    /**
     * Get user's group by user_id
     *
     * @param int|string $userId User ID from Users table
     * @return int|null Group ID or null if not found
     */
    public static function getUserGroupId($userId): ?int
    {
        if (empty($userId)) {
            return null;
        }

        // Find user's group membership
        $groupMember = GroupMembers::findFirst([
            'conditions' => 'user_id = :user_id:',
            'bind' => ['user_id' => $userId]
        ]);

        if ($groupMember !== null) {
            return (int)$groupMember->group_id;
        }

        // Return default group if user has no group assigned
        $defaultGroup = self::findFirst('defaultGroup=1');
        if ($defaultGroup) {
            return (int)$defaultGroup->id;
        }

        return null;
    }

    /**
     * Get default group
     *
     * @return UsersGroups|null
     */
    public static function getDefaultGroup(): ?UsersGroups
    {
        return self::findFirst('defaultGroup=1');
    }

}