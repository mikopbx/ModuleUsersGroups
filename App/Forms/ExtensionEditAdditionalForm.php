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
use Modules\ModuleUsersGroups\Models\GroupMembers;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;
use Phalcon\Forms\Element\Select;


class ExtensionEditAdditionalForm extends BaseForm
{
  public static function prepareAdditionalFields(ExtensionEditForm $form, \stdClass $entity, array $options = []){

      // Prepare groups for select
      $parameters = [
          'columns' => [
              'id',
              'name'
          ]
      ];
      $arrGroups = ModelUsersGroups::find($parameters);
      $arrGroupsForSelect = [];
      foreach ($arrGroups as $group) {
          $arrGroupsForSelect[$group->id] = $group->name;
      }

      // Find current value
      $userGroupId = null;
      if (isset($entity->user_id)) {
          $parameters = [
              'conditions' => 'user_id = :user_id:',
              'bind' => ['user_id' => $entity->user_id]
          ];

          $curUserGroup = GroupMembers::findFirst($parameters);
          if ($curUserGroup !== null) {
              // Get the group ID from the existing group membership
              $userGroupId = $curUserGroup->group_id;
          } else {
              // Get the group ID from the default group
              $defaultGroup = ModelUsersGroups::findFirst('defaultGroup=1');
              if ($defaultGroup){
                  $userGroupId = $defaultGroup->id;
              }
          }
      }

      $groupForSelect = new Select(
          'mod_usrgr_select_group', $arrGroupsForSelect, [
              'using' => [
                  'id',
                  'name',
              ],
              'value' => $userGroupId,
              'useEmpty' => false,
              'class' => 'ui selection dropdown search select-group-field',
          ]
      );

      // Add the group select field to the form
      $form->add($groupForSelect);
  }

}