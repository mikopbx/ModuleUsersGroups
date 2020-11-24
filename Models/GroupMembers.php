<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 2 2019
 */

/*
 * https://docs.phalconphp.com/3.4/ru-ru/db-models-metadata
 *
 */

namespace Modules\ModuleUsersGroups\Models;

use MikoPBX\Common\Models\Users;
use MikoPBX\Modules\Models\ModulesModelsBase;
use Phalcon\Mvc\Model\Relation;

class GroupMembers extends ModulesModelsBase
{

    /**
     * @Primary
     * @Identity
     * @Column(type="integer", nullable=false)
     */
    public $id;

    /**
     * Link to the groups table
     *
     * @Column(type="integer", nullable=false)
     */
    public $group_id;

    /**
     * Link to the users table
     *
     * @Column(type="integer", nullable=false)
     */
    public $user_id;

    /**
     * Returns dynamic relations between module models and common models
     * MikoPBX check it in ModelsBase after every call to keep data consistent
     *
     * There is example to describe the relation between Providers and ModuleTemplate models
     *
     * It is important to duplicate the relation alias on message field after Models\ word
     *
     * @param $calledModelObject
     *
     * @return void
     */
    public static function getDynamicRelations(&$calledModelObject): void
    {
        if (is_a($calledModelObject, Users::class)) {
            $calledModelObject->belongsTo(
                'id',
                __CLASS__,
                'user_id',
                [
                    'alias'      => 'ModuleUsersGroupsGroupMembers',
                    'foreignKey' => [
                        'allowNulls' => 0,
                        'message'    => 'Models\ModuleUsersGroupsGroupMembers',
                        'action'     => Relation::ACTION_CASCADE
                        // when deleting a user, we will delete the link to him in the group
                    ],
                ]
            );
        }
    }

    public function initialize(): void
    {
        $this->setSource('m_ModuleUsersGroups_GroupMembers');
        parent::initialize();
        $this->hasOne(
            'group_id',
            UsersGroups::class,
            'id',
            [
                'alias'      => 'UsersGroups',
                'foreignKey' => [
                    'allowNulls' => false,
                    'action'     => Relation::NO_ACTION,
                ],
            ]
        );
        $this->hasOne(
            'user_id',
            Users::class,
            'id',
            [
                'alias'      => 'Users',
                'foreignKey' => [
                    'allowNulls' => false,
                    'action'     => Relation::NO_ACTION,
                ],
            ]
        );
    }
}