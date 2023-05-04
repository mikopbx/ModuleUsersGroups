<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 11 2019
 */

namespace Modules\ModuleUsersGroups\App\Controllers;

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
        $this->moduleDir           = PbxExtensionUtils::getModuleDir($this->moduleUniqueID);
        $this->view->logoImagePath = "{$this->url->get()}assets/img/cache/{$this->moduleUniqueID}/logo.png";
        $this->view->submitMode    = null;
        parent::initialize();
    }

    /**
     * Index page controller
     */
    public function indexAction(): void
    {
        $footerCollection = $this->assets->collection('footerJS');
        $footerCollection->addJs('js/vendor/datatable/dataTables.semanticui.js', true);
        $footerCollection->addJs("js/cache/{$this->moduleUniqueID}/module-users-groups-index.js", true);

        $headerCollectionCSS = $this->assets->collection('headerCSS');
        $headerCollectionCSS
            ->addCss('css/vendor/datatable/dataTables.semanticui.min.css', true)
            ->addCss("css/cache/{$this->moduleUniqueID}/module-users-groups.css", true);

        $this->view->groups = UsersGroups::find();
        $this->view->pick("{$this->moduleDir}/App/Views/index");

        // Получим список пользователей для отображения в фильтре
        $parameters = [
            'models'     => [
                'Extensions' => Extensions::class,
            ],
            'conditions' => 'Extensions.is_general_user_number = 1',
            'columns'    => [
                'id'       => 'Extensions.id',
                'username' => 'Users.username',
                'number'   => 'Extensions.number',
                'email'    => 'Users.email',
                'userid'   => 'Users.id',
                'type'     => 'Extensions.type',
                'avatar'   => 'Users.avatar',

            ],
            'order'      => 'number',
            'joins'      => [
                'Users' => [
                    0 => Users::class,
                    1 => 'Users.id = Extensions.userid',
                    2 => 'Users',
                    3 => 'INNER',
                ],
            ],
        ];
        $query      = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
        $extensions = $query->execute();



        // Получим соответствие сотрудников и групп т.к. join в разных базах сделать нельзя
        $parameters      = [
            'models'     => [
                'GroupMembers' => GroupMembers::class,
            ],
            'columns' => [
                'user_id' => 'GroupMembers.user_id',
                'group'   => 'UsersGroups.name',

            ],
            'joins'   => [
                'UsersGroups' => [
                    0 => UsersGroups::class,
                    1 => 'UsersGroups.id = GroupMembers.group_id',
                    2 => 'UsersGroups',
                    3 => 'INNER',
                ],
            ],
        ];
        $query      = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
        $groupMembers = $query->execute()->toArray();

        $groupMembersIds = array_column($groupMembers, 'user_id');
        $extensionTable  = [];
        foreach ($extensions as $extension) {
            switch ($extension->type) {
                case 'SIP':
                    $extensionTable[$extension->userid]['userid']   = $extension->userid;
                    $extensionTable[$extension->userid]['number']   = $extension->number;
                    $extensionTable[$extension->userid]['id']       = $extension->id;
                    $extensionTable[$extension->userid]['username'] = $extension->username;
                    $extensionTable[$extension->userid]['group']    = null;
                    $extensionTable[$extension->userid]['email']    = $extension->email;
                    $key                                            = array_search(
                        $extension->userid,
                        $groupMembersIds,
                        true
                    );
                    if ($key !== false) {
                        $extensionTable[$extension->userid]['group'] = $groupMembers[$key]['group'];
                    }

                    if ( ! array_key_exists('mobile', $extensionTable[$extension->userid])) {
                        $extensionTable[$extension->userid]['mobile'] = '';
                    }

                    $extensionTable[$extension->userid]['avatar'] = "{$this->url->get()}assets/img/unknownPerson.jpg";
                    if ($extension->avatar) {
                        $filename = md5($extension->avatar);
                        $imgCacheDir = appPath('sites/admin-cabinet/assets/img/cache');
                        $imgFile  = "{$imgCacheDir}/{$filename}.jpg";
                        if (file_exists($imgFile)) {
                            $extensionTable[$extension->userid]['avatar'] = "{$this->url->get()}assets/img/cache/{$filename}.jpg";
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
    }

    /**
     * Users group modify card
     *
     * @param string|NULL $id
     */
    public function modifyAction(string $id = null): void
    {
        $footerCollection = $this->assets->collection('footerJS');
        $footerCollection->addJs('js/pbx/main/form.js', true);
        $footerCollection->addJs("js/cache/{$this->moduleUniqueID}/module-users-groups-modify.js", true);
        $record = UsersGroups::findFirstById($id);
        if ($record === null) {
            $record = new UsersGroups();
        } else {
            // Получим список пользователей для отображения в фильтре
            $parameters = [
                'models'     => [
                    'Extensions' => Extensions::class,
                ],
                'conditions' => 'Extensions.is_general_user_number = 1',
                'columns'    => [
                    'id'       => 'Extensions.id',
                    'username' => 'Users.username',
                    'number'   => 'Extensions.number',
                    'email'    => 'Users.email',
                    'userid'   => 'Extensions.userid',
                    'type'     => 'Extensions.type',
                    'avatar'   => 'Users.avatar',

                ],
                'order'      => 'number',
                'joins'      => [
                    'Users' => [
                        0 => Users::class,
                        1 => 'Users.id = Extensions.userid',
                        2 => 'Users',
                        3 => 'INNER',
                    ],
                ],
            ];

            $query      = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
            $extensions = $query->execute();


            // Получим соответствие сотрудников и групп т.к. join в разных базах сделать нельзя
            $parameters      = [
                'models'     => [
                    'GroupMembers' => GroupMembers::class,
                ],
                'columns' => [
                    'user_id'  => 'GroupMembers.user_id',
                    'group_id' => 'UsersGroups.id',

                ],
                'joins'   => [
                    'UsersGroups' => [
                        0 => UsersGroups::class,
                        1 => 'UsersGroups.id = GroupMembers.group_id',
                        2 => 'UsersGroups',
                        3 => 'INNER',
                    ],
                ],
            ];
            $query      = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
            $groupMembers = $query->execute()->toArray();
            $groupMembersIds = array_column($groupMembers, 'user_id');
            $extensionTable  = [];
            foreach ($extensions as $extension) {
                switch ($extension->type) {
                    case 'SIP':
                        $extensionTable[$extension->userid]['userid']   = $extension->userid;
                        $extensionTable[$extension->userid]['number']   = $extension->number;
                        $extensionTable[$extension->userid]['id']       = $extension->id;
                        $extensionTable[$extension->userid]['username'] = $extension->username;
                        $extensionTable[$extension->userid]['hidden']   = true;
                        $extensionTable[$extension->userid]['email']    = $extension->email;
                        if ( ! array_key_exists('mobile', $extensionTable[$extension->userid])) {
                            $extensionTable[$extension->userid]['mobile'] = '';
                        }
                        $extensionTable[$extension->userid]['avatar'] = "{$this->url->get()}assets/img/unknownPerson.jpg";
                        if ($extension->avatar) {
                            $filename = md5($extension->avatar);
                            $imgCacheDir = appPath('sites/admin-cabinet/assets/img/cache');
                            $imgFile  = "{$imgCacheDir}/$filename.jpg";
                            if (file_exists($imgFile)) {
                                $extensionTable[$extension->userid]['avatar'] = "{$this->url->get()}assets/img/cache/{$filename}.jpg";
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
            $this->view->members = $extensionTable;

            // Получим список ссылок на разрещенные правила маршутизации в этой группе
            $parameters      = [
                'columns'    => 'rule_id, caller_id',
                'conditions' => 'group_id=:groupId:',
                'bind'       => [
                    'groupId' => $id,
                ],
            ];
            $allowedRules    = AllowedOutboundRules::find($parameters)->toArray();
            $allowedRulesIds = array_column($allowedRules, 'rule_id');

            // Получим список правил маршрутизации
            $rules        = OutgoingRoutingTable::find(['order' => 'priority']);
            $routingTable = [];
            foreach ($rules as $rule) {
                $provider = $rule->Providers;
                $callerId = '';
                $key      = array_search($rule->id, $allowedRulesIds, true);
                if ($key !== false) {
                    $callerId = $allowedRules[$key]['caller_id'];
                }

                if ($provider) {
                    $routingTable[] = [
                        'id'               => $rule->id,
                        'priority'         => $rule->priority,
                        'provider'         => $provider->getRepresent(),
                        'numberbeginswith' => $rule->numberbeginswith,
                        'restnumbers'      => $rule->restnumbers,
                        'trimfrombegin'    => $rule->trimfrombegin,
                        'prepend'          => $rule->prepend,
                        'note'             => $rule->note,
                        'rulename'         => $rule->getRepresent(),
                        'status'           => in_array($rule->id, $allowedRulesIds, true) ? '' : 'disabled',
                        'callerid'         => $callerId,
                    ];
                } else {
                    $routingTable[] = [
                        'id'               => $rule->id,
                        'priority'         => $rule->priority,
                        'provider'         => null,
                        'numberbeginswith' => $rule->numberbeginswith,
                        'restnumbers'      => $rule->restnumbers,
                        'trimfrombegin'    => $rule->trimfrombegin,
                        'prepend'          => $rule->prepend,
                        'note'             => $rule->note,
                        'rulename'         => '<i class="icon attention"></i> ' . $rule->getRepresent(),
                        'status'           => in_array($rule->id, $allowedRulesIds, true) ? '' : 'disabled',
                        'callerid'         => $callerId,
                    ];
                }
            }
            $this->view->rules = $routingTable;
        }

        $this->view->form      = new ModuleUsersGroupsForm($record);
        $this->view->represent = $record->getRepresent();
        $this->view->id        = $id;
        $this->view->pick("{$this->moduleDir}/App/Views/modify");
    }

    /**
     * Save settings AJAX action
     */
    public function saveAction(): void
    {
        if ( ! $this->request->isPost()) {
            return;
        }
        $data   = $this->request->getPost();
        $record = UsersGroups::findFirstById($data['id']);
        if ($record === null) {
            $record = new UsersGroups();
        }
        $this->db->begin();
        foreach ($record as $key => $value) {
            switch ($key) {
                case 'id':
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
        if ($record->save() === false) {
            $errors = $record->getMessages();
            $this->flash->error(implode('<br>', $errors));
            $error = true;
        }

        if ( ! $error) {
            $error = ! $this->saveAllowedOutboundRules($data);
        }

        if ( ! $error) {
            $error = ! $this->saveUsersGroups($data);
        }

        if ($error) {
            $this->view->success = false;
            $this->db->rollback();
        } else {
            $this->flash->success($this->translation->_('ms_SuccessfulSaved'));
            $this->view->success = true;
            $this->db->commit();
            // Если это было создание карточки то надо перегрузить страницу с указанием ID
            if (empty($data['id'])) {
                $this->view->reload = "module-users-groups/modify/{$record->id}";
            }
        }
    }

    /**
     * Сохраняет параметры маршрутов
     *
     * @param $data
     *
     * @return bool
     */
    private function saveAllowedOutboundRules($data): bool
    {
        // 1. Удалим все старые ссылки на правила относящиеся к этой группе
        $parameters = [
            'conditions' => 'group_id=:groupId:',
            'bind'       => [
                'groupId' => $data['id'],
            ],
        ];
        $oldRules   = AllowedOutboundRules::find($parameters);
        if ($oldRules->delete() === false) {
            $errors = $oldRules->getMessages();
            $this->flash->error(implode('<br>', $errors));

            return false;
        }

        // 2. Запишем разрешенные направления
        foreach ($data as $key => $value) {
            if (substr_count($key, 'rule-') > 0) {
                $rule_id = explode('rule-', $key)[1];
                if ($data[$key] === 'on') {
                    $newRule     = new AllowedOutboundRules();
                    $callerIdKey = "caller_id-$rule_id";
                    if (array_key_exists($callerIdKey, $data)) {
                        $newRule->caller_id = $data[$callerIdKey];
                    }
                    $newRule->group_id = $data['id'];
                    $newRule->rule_id  = $rule_id;
                    if ($newRule->save() === false) {
                        $errors = $newRule->getMessages();
                        $this->flash->error(implode('<br>', $errors));

                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Сохраняет параметр выбранные пользоваетели
     *
     * @param $data
     *
     * @return bool
     */
    private function saveUsersGroups($data): bool
    {
        // 1. Соберем новых пользователей
        $savedExtensions = [];
        $arrMembers      = json_decode($data['members'], true);
        foreach ($arrMembers as $key => $value) {
            if (substr_count($value, 'ext-') > 0) {
                $savedExtensions[] = explode('ext-', $value)[1];
            }
        }

        // Если никого в группе нет, то просто удалим всех и вернемся
        if (count($savedExtensions) === 0) {
            $parameters = [
                'conditions' => 'group_id=:groupId:',
                'bind'       => [
                    'groupId' => $data['id'],
                ],
            ];
            $oldMembers = GroupMembers::find($parameters);
            if ($oldMembers->delete() === false) {
                $errors = $oldMembers->getMessages();
                $this->flash->error(implode('<br>', $errors));

                return false;
            }

            return true;
        }

        // Remember current users before update
        $parameters       = [
            'conditions' => 'group_id=:groupId:',
            'bind'       => [
                'groupId' => $data['id'],
            ],
        ];
        $membersForDelete = GroupMembers::find($parameters)->toArray();

        $parameters = [
            'models'     => [
                'Users' => Users::class,
            ],
            'columns'    => [
                'id' => 'Users.id',
            ],
            'conditions' => 'Extensions.number IN ({ext:array})',
            'bind'       => [
                'ext' => $savedExtensions,
            ],
            'joins'      => [
                'Extensions' => [
                    0 => Extensions::class,
                    1 => 'Extensions.userid = Users.id',
                    2 => 'Extensions',
                    3 => 'INNER',
                ],
            ],
        ];
        $query      = $this->di->get('modelsManager')->createBuilder($parameters)->getQuery();
        $newMembers = $query->execute();

        // 3. Переместим выбранных пользователей из других групп и создадим новые ссылки для текущих членов группы
        foreach ($newMembers as $member) {
            $parameters  = [
                'conditions' => 'user_id=:userID:',
                'bind'       => [
                    'userID' => $member->id,
                ],
            ];
            $groupMember = GroupMembers::findFirst($parameters);
            if ($groupMember === null) {
                $groupMember          = new GroupMembers();
                $groupMember->user_id = $member->id;
            }
            $groupMember->group_id = $data['id'];
            $key                   = array_search($groupMember->toArray(), $membersForDelete, true);
            if ($key !== false) {
                unset($membersForDelete[$key]);
            }

            if ($groupMember->save() === false) {
                $errors = $groupMember->getMessages();
                $this->flash->error(implode('<br>', $errors));

                return false;
            }
        }


        // 4. Удалим все старые ссылки на пользователей относящиеся к этой группе
        foreach ($membersForDelete as $member) {
            $groupMember = GroupMembers::findFirstById($member['id']);
            if ($groupMember !== null && $groupMember->delete() === false) {
                $errors = $groupMember->getMessages();
                $this->flash->error(implode('<br>', $errors));

                return false;
            }
        }

        return true;
    }

    /**
     * Меняем группу пользователя в списке
     */
    public function changeUserGroupAction(): void
    {
        if ( ! $this->request->isPost()) {
            return;
        }
        $data        = $this->request->getPost();
        $parameters  = [
            'conditions' => 'user_id=:userID:',
            'bind'       => [
                'userID' => $data['user_id'],
            ],
        ];
        $groupMember = GroupMembers::findFirst($parameters);
        if ($groupMember === null) {
            $groupMember          = new GroupMembers();
            $groupMember->user_id = $data['user_id'];
        }
        $groupMember->group_id = $data['group_id'];
        if ($groupMember->save() === false) {
            $errors = $groupMember->getMessages();
            $this->flash->error(implode('<br>', $errors));
            $this->view->success = false;
        } else {
            $this->flash->success($this->translation->_('ms_SuccessfulSaved'));
            $this->view->success = true;
        }
    }

    /**
     * Delete group
     *
     * @param $groupId
     */
    public function deleteAction($groupId): void
    {
        $group = UsersGroups::findFirstById($groupId);
        if ($group !== null && ! $group->delete()) {
            $errors = $group->getMessages();
            $this->flash->error(implode('<br>', $errors));
            $this->view->success = false;
        } else {
            $this->view->success = true;
        }

        $this->forward('module-users-groups/index');
    }

}