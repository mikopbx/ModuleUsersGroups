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

namespace Modules\ModuleUsersGroups\App\Controllers;

use MikoPBX\AdminCabinet\Providers\AssetProvider;
use MikoPBX\Common\Models\OutgoingRoutingTable;
use MikoPBX\Common\Models\Extensions;
use MikoPBX\Common\Models\Users;
use Modules\ModuleUsersGroups\Models\{
    AllowedOutboundRules,
    GroupMembers,
    UsersGroups
};
use MikoPBX\AdminCabinet\Controllers\BaseController;
use MikoPBX\Modules\PbxExtensionUtils;
use Modules\ModuleUsersGroups\App\Forms\DefaultGroupForm;
use Modules\ModuleUsersGroups\App\Forms\ModuleUsersGroupsForm;

use function MikoPBX\Common\Config\appPath;

class ModuleUsersGroupsController extends BaseController
{
    private $moduleUniqueID = 'ModuleUsersGroups';
    private $moduleDir;

    /**
     * Basic initial class
     */
    public function initialize(): void
    {
        $this->moduleDir = PbxExtensionUtils::getModuleDir($this->moduleUniqueID);
        $this->view->logoImagePath = $this->url->get() . 'assets/img/cache/' . $this->moduleUniqueID . '/logo.png';
        $this->view->submitMode = null;
        parent::initialize();
    }

    /**
     * The index action for displaying the users groups page.
     *
     * @return void
     */
    public function indexAction(): void
    {
        $footerCollection = $this->assets->collection(AssetProvider::FOOTER_JS);
        $footerCollection->addJs('js/vendor/datatable/dataTables.semanticui.js', true);
        $footerCollection->addJs('js/cache/' . $this->moduleUniqueID . '/module-users-groups-index.js', true);
        $footerCollection->addJs('js/pbx/main/form.js', true);
        $footerCollection->addJs('js/cache/' . $this->moduleUniqueID . '/module-users-groups-default-form.js', true);

        $headerCollectionCSS = $this->assets->collection(AssetProvider::HEADER_CSS);
        $headerCollectionCSS
            ->addCss('css/vendor/datatable/dataTables.semanticui.min.css', true)
            ->addCss('css/cache/' . $this->moduleUniqueID . '/module-users-groups.css', true);

        $this->view->groups = UsersGroups::find();

        // Get the list of users for display in the filter
        $parameters = [
            'models' => [
                'Extensions' => Extensions::class,
            ],
            'conditions' => 'Extensions.is_general_user_number = 1',
            'columns' => [
                'id' => 'Extensions.id',
                'username' => 'Users.username',
                'number' => 'Extensions.number',
                'userid' => 'Users.id',
                'type' => 'Extensions.type',
                'avatar' => 'Users.avatar',

            ],
            'joins' => [
                'Users' => [
                    0 => Users::class,
                    1 => 'Users.id = Extensions.userid',
                    2 => 'Users',
                    3 => 'INNER',
                ],
            ],
        ];
        $query = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
        $extensions = $query->execute();

        // Get the mapping of employees and groups since join across different databases is not possible
        $parameters = [
            'models' => [
                'GroupMembers' => GroupMembers::class,
            ],
            'columns' => [
                'user_id' => 'GroupMembers.user_id',
                'group_name' => 'UsersGroups.name',
                'group_id' => 'UsersGroups.id',

            ],
            'joins' => [
                'UsersGroups' => [
                    0 => UsersGroups::class,
                    1 => 'UsersGroups.id = GroupMembers.group_id',
                    2 => 'UsersGroups',
                    3 => 'INNER',
                ],
            ],
        ];
        $query = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
        $groupMembers = $query->execute()->toArray();

        $groupMembersIds = array_column($groupMembers, 'user_id');
        $extensionTable = [];
        foreach ($extensions as $extension) {
            switch ($extension->type) {
                case 'SIP':
                    $extensionTable[$extension->userid]['userid'] = $extension->userid;
                    $extensionTable[$extension->userid]['number'] = $extension->number;
                    $extensionTable[$extension->userid]['id'] = $extension->id;
                    $extensionTable[$extension->userid]['username'] = $extension->username;
                    $extensionTable[$extension->userid]['group_name'] = null;
                    $extensionTable[$extension->userid]['group_id'] = null;
                    $key = array_search(
                        $extension->userid,
                        $groupMembersIds,
                        true
                    );
                    if ($key !== false) {
                        $extensionTable[$extension->userid]['group_name'] =  $groupMembers[$key]['group_name'];
                        $extensionTable[$extension->userid]['group_id'] =  $groupMembers[$key]['group_id'];
                    }

                    if (!array_key_exists('mobile', $extensionTable[$extension->userid])) {
                        $extensionTable[$extension->userid]['mobile'] = '';
                    }

                    $extensionTable[$extension->userid]['avatar'] = $this->url->get() . 'assets/img/unknownPerson.jpg';
                    if ($extension->avatar) {
                        $filename = md5($extension->avatar);
                        $imgCacheDir = appPath('sites/admin-cabinet/assets/img/cache');
                        $imgFile = "{$imgCacheDir}/{$filename}.jpg";
                        if (file_exists($imgFile)) {
                            $extensionTable[$extension->userid]['avatar'] = $this->url->get() . "assets/img/cache/{$filename}.jpg";
                        }
                    }
                    break;
                case 'EXTERNAL':
                    $extensionTable[$extension->userid]['mobile'] = $extension->number;
                    break;
                default:
            }
        }
        $this->view->members = $extensionTable;

        $this->view->form = new DefaultGroupForm();
    }

    /**
     * The modify action for creating or editing a user group.
     *
     * @param string|null $id The ID of the user group (optional)
     *
     * @return void
     */
    public function modifyAction(string $id = null): void
    {
        $footerCollection = $this->assets->collection(AssetProvider::FOOTER_JS);
        $footerCollection->addJs('js/vendor/datatable/dataTables.semanticui.js', true);
        $footerCollection->addJs('js/pbx/main/form.js', true);
        $footerCollection->addJs('js/cache/' . $this->moduleUniqueID . '/module-users-groups-modify.js', true);

        $headerCollectionCSS = $this->assets->collection(AssetProvider::HEADER_CSS);
        $headerCollectionCSS
            ->addCss('css/vendor/datatable/dataTables.semanticui.min.css', true);

        $record = UsersGroups::findFirstById($id);
        if ($record === null) {
            $record = new UsersGroups();
        } else {
            // Get the list of users for display in the filter
            $parameters = [
                'models' => [
                    'Extensions' => Extensions::class,
                ],
                'conditions' => 'Extensions.is_general_user_number = 1',
                'columns' => [
                    'id' => 'Extensions.id',
                    'username' => 'Users.username',
                    'number' => 'Extensions.number',
                    'email' => 'Users.email',
                    'userid' => 'Extensions.userid',
                    'type' => 'Extensions.type',
                    'avatar' => 'Users.avatar',

                ],
                'order' => 'number',
                'joins' => [
                    'Users' => [
                        0 => Users::class,
                        1 => 'Users.id = Extensions.userid',
                        2 => 'Users',
                        3 => 'INNER',
                    ],
                ],
            ];

            $query = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
            $extensions = $query->execute();


            // Get the mapping of employees and groups since join across different databases is not possible
            $parameters = [
                'models' => [
                    'GroupMembers' => GroupMembers::class,
                ],
                'columns' => [
                    'user_id' => 'GroupMembers.user_id',
                    'group_id' => 'UsersGroups.id',

                ],
                'joins' => [
                    'UsersGroups' => [
                        0 => UsersGroups::class,
                        1 => 'UsersGroups.id = GroupMembers.group_id',
                        2 => 'UsersGroups',
                        3 => 'INNER',
                    ],
                ],
            ];
            $query = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
            $groupMembers = $query->execute()->toArray();
            $groupMembersIds = array_column($groupMembers, 'user_id');
            $extensionTable = [];
            foreach ($extensions as $extension) {
                switch ($extension->type) {
                    case 'SIP':
                        $extensionTable[$extension->userid]['userid'] = $extension->userid;
                        $extensionTable[$extension->userid]['number'] = $extension->number;
                        $extensionTable[$extension->userid]['id'] = $extension->id;
                        $extensionTable[$extension->userid]['username'] = $extension->username;
                        $extensionTable[$extension->userid]['hidden'] = true;
                        $extensionTable[$extension->userid]['email'] = $extension->email;
                        if (!array_key_exists('mobile', $extensionTable[$extension->userid])) {
                            $extensionTable[$extension->userid]['mobile'] = '';
                        }
                        $extensionTable[$extension->userid]['avatar'] = $this->url->get() . 'assets/img/unknownPerson.jpg';
                        if ($extension->avatar) {
                            $filename = md5($extension->avatar);
                            $imgCacheDir = appPath('sites/admin-cabinet/assets/img/cache');
                            $imgFile = "{$imgCacheDir}/$filename.jpg";
                            if (file_exists($imgFile)) {
                                $extensionTable[$extension->userid]['avatar'] = $this->url->get() . "assets/img/cache/{$filename}.jpg";
                            }
                        }
                        $key = array_search($extension->userid, $groupMembersIds, true);
                        if ($key !== false) {
                            $extensionTable[$extension->userid]['hidden'] = $id !== $groupMembers[$key]['group_id'];
                        }

                        break;
                    case 'EXTERNAL':
                        $extensionTable[$extension->userid]['mobile'] = $extension->number;
                        break;
                    default:
                }
            }
            usort($extensionTable, function ($a, $b) {
                return strcmp($a['username'], $b['username']);
            });
            $this->view->members = $extensionTable;

            // Get the list of links to allowed outbound rules in this group
            $parameters = [
                'columns' => 'rule_id, caller_id',
                'conditions' => 'group_id=:groupId:',
                'bind' => [
                    'groupId' => $id,
                ],
            ];
            $allowedRules = AllowedOutboundRules::find($parameters)->toArray();
            $allowedRulesIds = array_column($allowedRules, 'rule_id');

            // Get the list of outbound routing rules
            $rules = OutgoingRoutingTable::find(['order' => 'priority']);
            $routingTable = [];
            foreach ($rules as $rule) {
                $provider = $rule->Providers;
                $callerId = '';
                $key = array_search($rule->id, $allowedRulesIds, true);
                if ($key !== false) {
                    $callerId = $allowedRules[$key]['caller_id'];
                }

                if ($provider) {
                    $routingTable[] = [
                        'id' => $rule->id,
                        'priority' => $rule->priority,
                        'provider' => $provider->getRepresent(),
                        'numberbeginswith' => $rule->numberbeginswith,
                        'restnumbers' => $rule->restnumbers,
                        'trimfrombegin' => $rule->trimfrombegin,
                        'prepend' => $rule->prepend,
                        'note' => $rule->note,
                        'rulename' => $rule->getRepresent(),
                        'status' => in_array($rule->id, $allowedRulesIds, true) ? '' : 'disabled',
                        'callerid' => $callerId,
                    ];
                } else {
                    $routingTable[] = [
                        'id' => $rule->id,
                        'priority' => $rule->priority,
                        'provider' => null,
                        'numberbeginswith' => $rule->numberbeginswith,
                        'restnumbers' => $rule->restnumbers,
                        'trimfrombegin' => $rule->trimfrombegin,
                        'prepend' => $rule->prepend,
                        'note' => $rule->note,
                        'rulename' => '<i class="icon attention"></i> ' . $rule->getRepresent(),
                        'status' => in_array($rule->id, $allowedRulesIds, true) ? '' : 'disabled',
                        'callerid' => $callerId,
                    ];
                }
            }
            $this->view->rules = $routingTable;
        }

        $this->view->form = new ModuleUsersGroupsForm($record);
        $this->view->represent = $record->getRepresent();
        $this->view->id = $id;
    }

    /**
     * Save settings AJAX action
     */
    public function saveAction(): void
    {
        if (!$this->request->isPost()) {
            return;
        }
        $data = $this->request->getPost();
        $record = UsersGroups::findFirstById($data['id']);
        if ($record === null) {
            $record = new UsersGroups();
        }
        $this->db->begin();
        foreach ($record as $key => $value) {
            switch ($key) {
                case 'id':
                case 'defaultGroup':
                    break;
                case 'isolatePickUp':
                case 'isolate':
                    if (array_key_exists($key, $data)) {
                        $record->$key = ($data[$key] === 'on') ? '1' : '0';
                    } else {
                        $record->$key = '0';
                    }
                    break;
                default:
                    if (array_key_exists($key, $data)) {
                        $record->$key = $data[$key];
                    } else {
                        $record->$key = '';
                    }
            }
        }

        $error = false;
        if ($this->saveEntity($record) === false) {
            $error = true;
        }

        if (!$error) {
            $error = !$this->saveAllowedOutboundRules($data);
        }

        if (!$error) {
            $error = !$this->saveUsersGroups($data);
        }

        if ($error) {
            $this->view->success = false;
            $this->db->rollback();
        } else {
            $this->flash->success($this->translation->_('ms_SuccessfulSaved'));
            $this->view->success = true;
            $this->db->commit();

            // If it was a new record, reload the page with the specified ID
            if (empty($data['id'])) {
                $this->view->reload = "module-users-groups/module-users-groups/modify/{$record->id}";
            }
        }
    }

    /**
     * Save the allowed outbound rules for a group.
     *
     * @param array $data The data containing the form inputs.
     *
     * @return bool True if the saving process is successful, false otherwise.
     */
    private function saveAllowedOutboundRules(array $data): bool
    {
        // 1. Delete all old references to rules related to this group
        $parameters = [
            'conditions' => 'group_id=:groupId:',
            'bind' => [
                'groupId' => $data['id'],
            ],
        ];
        $oldRules = AllowedOutboundRules::find($parameters);
        foreach ($oldRules as $oldRule) {
            if ($this->deleteEntity($oldRule) === false) {
                return false;
            }
        }

        // 2. Save the allowed outbound rules
        foreach ($data as $key => $value) {
            if (substr_count($key, 'rule-') > 0) {
                $rule_id = explode('rule-', $key)[1];
                if ($value === 'on') {
                    $newRule = new AllowedOutboundRules();
                    $callerIdKey = "caller_id-$rule_id";
                    if (array_key_exists($callerIdKey, $data)) {
                        $newRule->caller_id = $data[$callerIdKey];
                    }
                    $newRule->group_id = $data['id'];
                    $newRule->rule_id = $rule_id;
                    if ($this->saveEntity($newRule) === false) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Save the users associated with the group.
     *
     * @param array $data The data containing the form inputs.
     *
     * @return bool True if the saving process is successful, false otherwise.
     */
    private function saveUsersGroups(array $data): bool
    {
        // 1. Collect new users
        $savedExtensions = [];
        $arrMembers = json_decode($data['members'], true);
        foreach ($arrMembers as $key => $value) {
            if (substr_count($value, 'ext-') > 0) {
                $savedExtensions[] = explode('ext-', $value)[1];
            }
        }

        // If there are no users in the group, delete all and return
        if (count($savedExtensions) === 0) {
            $parameters = [
                'conditions' => 'group_id=:groupId:',
                'bind' => [
                    'groupId' => $data['id'],
                ],
            ];
            $oldMembers = GroupMembers::find($parameters);
            foreach ($oldMembers as $oldMember) {
                if ($this->deleteEntity($oldMember) === false) {
                    return false;
                }
            }
            return true;
        }

        // Remember current users before update
        $parameters = [
            'conditions' => 'group_id=:groupId:',
            'bind' => [
                'groupId' => $data['id'],
            ],
        ];
        $membersForDelete = GroupMembers::find($parameters)->toArray();

        $parameters = [
            'models' => [
                'Users' => Users::class,
            ],
            'columns' => [
                'id' => 'Users.id',
            ],
            'conditions' => 'Extensions.number IN ({ext:array})',
            'bind' => [
                'ext' => $savedExtensions,
            ],
            'joins' => [
                'Extensions' => [
                    0 => Extensions::class,
                    1 => 'Extensions.userid = Users.id',
                    2 => 'Extensions',
                    3 => 'INNER',
                ],
            ],
        ];
        $query = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
        $newMembers = $query->execute();

        // 3. Move selected users from other groups and create new links for current group members
        foreach ($newMembers as $member) {
            $parameters = [
                'conditions' => 'user_id=:userID:',
                'bind' => [
                    'userID' => $member->id,
                ],
            ];
            $groupMember = GroupMembers::findFirst($parameters);
            if ($groupMember === null) {
                $groupMember = new GroupMembers();
                $groupMember->user_id = $member->id;
            }
            $groupMember->group_id = $data['id'];
            $key = array_search($groupMember->toArray(), $membersForDelete, true);
            if ($key !== false) {
                unset($membersForDelete[$key]);
            }

            if ($this->saveEntity($groupMember) === false) {
                return false;
            }
        }

        // 4. Move users to default group if was it set
        $defaultGroup = UsersGroups::findFirst('defaultGroup=1');
        if ($defaultGroup) {
            foreach ($membersForDelete as $member) {
                $groupMember = GroupMembers::findFirstById($member['id']);
                if ($groupMember !== null) {
                    $key = array_search($groupMember->toArray(), $membersForDelete, true);
                    if ($key !== false) {
                        unset($membersForDelete[$key]);
                    }
                    $groupMember->group_id = $defaultGroup->id;
                    if (!$this->saveEntity($groupMember)) {
                        return false;
                    }
                }
            }
        }

        // 5. Delete all old links to users related to this group
        foreach ($membersForDelete as $member) {
            $groupMember = GroupMembers::findFirstById($member['id']);
            if ($groupMember !== null && $this->deleteEntity($groupMember) === false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Change the group of a user.
     */
    public function changeUserGroupAction(): void
    {
        if (!$this->request->isPost()) {
            return;
        }
        $data = $this->request->getPost();
        $parameters = [
            'conditions' => 'user_id=:userID:',
            'bind' => [
                'userID' => $data['user_id'],
            ],
        ];
        $groupMember = GroupMembers::findFirst($parameters);
        if ($groupMember === null) {
            $groupMember = new GroupMembers();
            $groupMember->user_id = $data['user_id'];
        }
        $groupMember->group_id = $data['group_id'];
        $this->saveEntity($groupMember);
    }

    /**
     * Deletes a user group.
     *
     * @param string $groupId The ID of the group to be deleted.
     * @return void
     */
    public function deleteAction(string $groupId): void
    {
        // Find the user group by its ID
        $group = UsersGroups::findFirstById($groupId);

        // Check if the group exists
        if ($group === null) {
            return;
        }

        // Check if the group is a default group
        if ($group->defaultGroup === '1') {
            $this->view->success = false;
            $this->flash->error($this->translation->_('mod_usrgr_ErrorOnDeleteDefaultGroup'));
            $this->forward('module-users-groups/module-users-groups/index');
            return;
        } else {
            // Find the default group
            $defaultGroup = UsersGroups::findFirst('defaultGroup=1');

            // Find users belonging to the current group
            $usersOfCurrentGroup = GroupMembers::find('group_id=' . $group->id);
            if ($defaultGroup) {
                foreach ($usersOfCurrentGroup as $groupMember) {
                    // Change the group membership to the default group
                    $groupMember->group_id = $defaultGroup->id;
                    if (!$this->saveEntity($groupMember)) {
                        return;
                    }
                }
            }
        }

        // Delete the user group
        $this->deleteEntity($group, 'module-users-groups/module-users-groups/index');
    }

}
