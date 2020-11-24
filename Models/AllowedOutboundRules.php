<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 1 2020
 */

/*
 * https://docs.phalconphp.com/3.4/ru-ru/db-models-metadata
 *
 */


namespace Modules\ModuleUsersGroups\Models;

use MikoPBX\Common\Models\OutgoingRoutingTable;
use MikoPBX\Common\Models\Providers;
use MikoPBX\Modules\Models\ModulesModelsBase;
use Phalcon\Mvc\Model\Relation;

class AllowedOutboundRules extends ModulesModelsBase
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
    public $rule_id;

    /**
     * Outbound caller id
     *
     * @Column(type="string", nullable=true)
     */
    public $caller_id;

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
        if (is_a($calledModelObject, OutgoingRoutingTable::class)) {
            $calledModelObject->belongsTo(
                'id',
                __CLASS__,
                'rule_id',
                [
                    'alias'      => 'ModuleUsersGroupsAllowedOutboundRules',
                    'foreignKey' => [
                        'allowNulls' => 0,
                        'message'    => 'Models\ModuleUsersGroupsAllowedOutboundRules',
                        'action'     => Relation::ACTION_CASCADE
                        // при удалении правила удалим и ссылку на него в группе
                    ],
                ]
            );
        }
    }

    public function initialize(): void
    {
        $this->setSource('m_ModuleUsersGroups_AllowedOutboundRules');
        parent::initialize();
        $this->hasOne(
            'group_id',
            UsersGroups::class,
            'id',
            [
                'alias'      => 'ModuleUsersGroups',
                'foreignKey' => [
                    'allowNulls' => false,
                    'action'     => Relation::NO_ACTION,
                ],
            ]
        );
        $this->hasOne(
            'rule_id',
            OutgoingRoutingTable::class,
            'id',
            [
                'alias'      => 'OutgoingRoutingTable',
                'foreignKey' => [
                    'allowNulls' => false,
                    'action'     => Relation::NO_ACTION,
                ],
            ]
        );
    }


}