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
use MikoPBX\AdminCabinet\Forms\ExtensionEditForm;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;
use Phalcon\Forms\Element\Hidden;


class ExtensionEditAdditionalForm extends BaseForm
{
    public static function prepareAdditionalFields(ExtensionEditForm $form, \stdClass $entity, array $options = []): void
    {
        // Add hidden field for the group ID (value will be set by JavaScript)
        $form->add(new Hidden('mod_usrgr_select_group', [
            'value' => '',
            'id' => 'mod_usrgr_select_group'
        ]));

        // Get all groups for dropdown (will be used in Volt template)
        $groups = ModelUsersGroups::find([
            'columns' => ['id', 'name'],
            'order' => 'name ASC'
        ]);

        // Store groups data in form for access in Volt template
        $form->setUserOption('mod_usrgr_groups', $groups);
    }
}