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
use Phalcon\Forms\Element\Check;
use Phalcon\Forms\Element\Hidden;
use Phalcon\Forms\Element\Select;
use Phalcon\Forms\Element\Text;

class ModuleUsersGroupsForm extends BaseForm
{
    public function initialize($entity = null, $options = null): void
    {
        // id
        $this->add(new Hidden('id', ['value' => $entity->id]));

        // Name
        $this->add(new Text('name'));

        // Description
        $this->addTextArea('description', $entity->description ?? '', 90);

        // Patterns
        $patternsPlaceholder = '';
        for ($i = 1; $i < 8; $i++) {
            $patternsPlaceholder .= $this->translation->_("mod_usrgr_PatternsInstructions$i") . PHP_EOL;
        }
        $this->addTextArea('patterns', $entity->patterns ?? '', 90, ['placeholder' => $patternsPlaceholder]);

        // select-extension-field
        $extension = new Select(
            'select-extension-field',
            [],
            [
            'using'    => [
                'id',
                'name',
            ],
            'useEmpty' => true,
            'class'    => 'ui selection dropdown search select-extension-field',
            ]
        );
        $this->add($extension);

        // isolate
        $this->addCheckBox('isolate', intval($entity->isolate) === 1);

        // isolatePickUp
        $this->addCheckBox('isolatePickUp', intval($entity->isolatePickUp) === 1);
    }

    /**
     * Adds a checkbox to the form field with the given name.
     * Can be deleted if the module depends on MikoPBX later than 2024.3.0
     *
     * @param string $fieldName The name of the form field.
     * @param bool $checked Indicates whether the checkbox is checked by default.
     * @param string $checkedValue The value assigned to the checkbox when it is checked.
     * @return void
     */
    public function addCheckBox(string $fieldName, bool $checked, string $checkedValue = 'on'): void
    {
        $checkAr = ['value' => null];
        if ($checked) {
            $checkAr = ['checked' => $checkedValue,'value' => $checkedValue];
        }
        $this->add(new Check($fieldName, $checkAr));
    }
}
