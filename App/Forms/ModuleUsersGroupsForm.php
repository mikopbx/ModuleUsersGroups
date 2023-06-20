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

use Phalcon\Forms\Element\Check;
use Phalcon\Forms\Element\Hidden;
use Phalcon\Forms\Element\Select;
use Phalcon\Forms\Element\Text;
use Phalcon\Forms\Element\TextArea;
use Phalcon\Forms\Form;


class ModuleUsersGroupsForm extends Form
{

    public function initialize($entity = null, $options = null): void
    {
        // id
        $this->add(new Hidden('id', ['value' => $entity->id]));

        // Name
        $this->add(new Text('name'));

        // Description
        $rows = max(round(strlen($entity->description) / 95), 2);
        $this->add(new TextArea('description', ['rows' => $rows]));
        $this->add(new TextArea('patterns',    ['rows' => 6]));

        // select-extension-field
        $extension = new Select(
            'select-extension-field', [], [
            'using'    => [
                'id',
                'name',
            ],
            'useEmpty' => true,
            'class'    => 'ui selection dropdown search select-extension-field',
        ]
        );
        $this->add($extension);

        $isolate = ['value' => null];
        if ($entity->isolate === '1') {
            $isolate = ['checked' => 'checked', 'value' => null];
        }
        $this->add(new Check('isolate', $isolate));

        $isolatePickUp = ['value' => null];
        if ($entity->isolatePickUp === '1') {
            $isolatePickUp = ['checked' => 'checked', 'value' => null];
        }
        $this->add(new Check('isolatePickUp', $isolatePickUp));
    }
}