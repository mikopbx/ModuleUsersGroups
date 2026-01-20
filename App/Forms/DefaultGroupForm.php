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

namespace Modules\ModuleUsersGroups\App\Forms;

use MikoPBX\AdminCabinet\Forms\BaseForm;
use Modules\ModuleUsersGroups\Models\UsersGroups;
use Phalcon\Forms\Element\Select;

class DefaultGroupForm extends BaseForm
{

    public function initialize($entity = null, $options = null): void
    {
        $usersGroups = UsersGroups::find();
        $defaultGroupValue = '';

        // Find default group value
        foreach ($usersGroups as $usersGroup) {
            if ($usersGroup->defaultGroup === '1') {
                $defaultGroupValue = (string)$usersGroup->id;
                break;
            }
        }

        // Create select with groups as options
        $defaultGroupSelect = new Select(
            'defaultGroup',
            $usersGroups,
            [
                'using' => [
                    'id',
                    'name',
                ],
                'useEmpty' => true,
                'emptyText' => 'Choose...',
                'emptyValue' => '',
                'value' => $defaultGroupValue,
                'class' => 'ui selection dropdown search select-default-group',
            ]
        );

        $this->add($defaultGroupSelect);
    }
}