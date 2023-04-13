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
     * Group description
     *
     * @Column(type="string", nullable=true)
     */
    public $patterns;

    /**
     * Group isolate
     *
     * @Column(type="integer", nullable=true)
     */
    public $isolate ;

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
                    // при удалении группы, удалим привязки пользователей к группам
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
                    'action'     => Relation::ACTION_CASCADE, // при удалении группы, удалим все ссылки на маршруты
                ],
            ]
        );
    }

}