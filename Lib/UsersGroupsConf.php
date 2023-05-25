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

namespace Modules\ModuleUsersGroups\Lib;

use MikoPBX\AdminCabinet\Forms\ExtensionEditForm;
use MikoPBX\Modules\Config\ConfigClass;
use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
use Modules\ModuleUsersGroups\Models\GroupMembers;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;
use Phalcon\Forms\Element\Select;
use Phalcon\Forms\Form;
use Phalcon\Mvc\Controller;
use Phalcon\Mvc\View;


class UsersGroupsConf extends ConfigClass
{
    /**
     * [
     *  'extension-1' => 'numberGroup1',
     *  'extension-2' => 'numberGroup2',
     * ]
     */
    private array $listUsers = [];
    private array $groupSettings = [];

    /**
     * Prepares settings dataset for a PBX module
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#other
     *
     * @return void
     */
    public function getSettings(): void{
        $this->listUsers = UsersGroups::initUserList();
        $data = ModelUsersGroups::find();
        /** @var ModelUsersGroups $settings */
        foreach ($data as $settings){
            $this->groupSettings[$settings->id + 1] = $settings->toArray();
        }
    }

    /**
     * Prepares additional rules for [all_peers] context section in the extensions.conf file
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#extensiongenallpeerscontext
     *
     * @return string
     */
    public function extensionGenAllPeersContext():string
    {
        // Проверка набираемого номера, относится ли он к группе сотрудников.
        $conf = 'same => n,NoOp( --- group: ${CHANNEL(callgroup)} | src: ${CALLERID(num)} | dst: ${EXTEN}---)'.PHP_EOL;
        $conf.= 'same => n,Set(srcIsolate=${DIALPLAN_EXISTS(users-group-isolate-${CHANNEL(callgroup)},s,1)})'.PHP_EOL;
        $conf.= 'same => n,Set(dstIsolateGroup=${DIALPLAN_EXISTS(users-group-dst-${CHANNEL(callgroup)},${EXTEN},1)})'.PHP_EOL;
        $conf.= 'same => n,Set(dstIsolate=${DIALPLAN_EXISTS(users-group-isolate,${EXTEN},1)})'.PHP_EOL;
        $conf.= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} != 1 && dstIsolate != 1 && ${DIALPLAN_EXISTS(internal,${EXTEN},1)} != 1 ]?Set(srcIsolate=0))'.PHP_EOL;
        $conf.= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} == 0 ]?Goto(internal-num-undefined,${EXTEN},1))'.PHP_EOL;
        $conf.= 'same => n,ExecIf($[ ${srcIsolate} == 0 && ${dstIsolate} ]?Goto(internal-num-undefined,${EXTEN},1))'.PHP_EOL;
        return $conf;
    }

    /**
     * Prepares additional contexts sections in the extensions.conf file
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#extensiongencontexts
     *
     * @return string
     */
    public function extensionGenContexts(): string
    {
        $this->getSettings();
        $groups = [];
        foreach ($this->listUsers as $user => $group){
            $groups[$group][] = $user;
        }

        $isolateDialplan = '[users-group-isolate]'.PHP_EOL;
        $dialplan = '';
        foreach ($groups as $group => $users){
            $isolate = $this->groupSettings[$group]['isolate'] === '1';
            if($isolate === false || count($users)===0){
                continue;
            }
            $dialplan.= "[users-group-isolate-$group]".PHP_EOL;
            $dialplan.= "exten => s,1,NoOp(-)]".PHP_EOL.PHP_EOL;

            $isolateDialplan.= "include => users-group-dst-$group" .PHP_EOL;
            $dialplan.= "[users-group-dst-$group]".PHP_EOL;
            foreach ($users as $user){
                $dialplan.= "exten => $user,1,NoOp(-)".PHP_EOL;
            }
            $patterns = explode(PHP_EOL, $this->groupSettings[$group]['patterns']);
            foreach ($patterns as $pattern){
                $pattern = preg_replace("/[^X0-9]/", '', $pattern);
                $dialplan.= "exten => _$pattern,1,NoOp(-)".PHP_EOL;
            }
            $dialplan.= PHP_EOL;
        }

        if($dialplan !== ''){
            $dialplan.= $isolateDialplan;
        }

        return $dialplan;
    }

    /**
     * Prepares additional parameters for each outgoing route context
     * before dial call in the extensions.conf file
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#generateoutroutcontext
     *
     * @param array $rout
     *
     * @return string
     */
    public function generateOutRoutContext(array $rout): string
    {
        $conf = "\t".'same => n,ExecIf($["x${FROM_PEER}" == "x" && "${CHANNEL(channeltype)}" == "PJSIP" ]?Gosub(set_from_peer,s,1))' . " \n\t";
        $conf .= 'same => n,Set(GR_VARS=${DB(UsersGroups/${FROM_PEER})})' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_VARS}x" != "x"]?Exec(Set(${GR_VARS})))' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_ID_' . $rout['id'] . '}" != "1"]?return)' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_CID_' . $rout['id'] . '}x" != "x"]?MSet(GR_OLD_CALLERID=${CALLERID(num)},OUTGOING_CID=${GR_CID_' . $rout['id'] . '}))' . "\n\t";
        $conf .= 'same => n,ExecIf($["${OUTGOING_CID}x" != "x"]?Set(DOPTIONS=${DOPTIONS}f(${OUTGOING_CID})))'." \n\t";
        $conf .= 'same => n,GosubIf($["${DIALPLAN_EXISTS(SIP-${CUT(CONTEXT,-,2)}-outgoing-ug-custom,${EXTEN},1)}" == "1"]?SIP-${CUT(CONTEXT,-,2)}-outgoing-ug-custom,${EXTEN},1)';

        return $conf;
    }

    /**
     * Prepares additional parameters for each outgoing route context
     * after dial call in the extensions.conf file
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#generateoutroutafterdialcontext
     *
     * @param array $rout
     *
     * @return string
     */
    public function generateOutRoutAfterDialContext(array $rout): string
    {
        return "\t".'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_OLD_CALLERID}x" != "x"]?MSet(CALLERID(num)=${GR_OLD_CALLERID},GR_OLD_CALLERID=${UNDEFINED}))';
    }

    /**
     * Prepares additional peers data in the pjsip.conf file
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#generatepeerspj
     *
     * @return string
     */
    public function generatePeersPj(): string
    {
        $mod = new UsersGroups();
        $mod->fillAsteriskDatabase();
        $this->getSettings();
        return '';
    }

    /**
     * This method is called in the WorkerModelsEvents after each model change.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#modelseventchangedata
     *
     * @param mixed $data The data related to the model change.
     *
     * @return void
     */
    public function modelsEventChangeData($data): void
    {
        $called_class = $data['model'] ?? '';
        switch ($called_class) {
            case AllowedOutboundRules::class:
            case GroupMembers::class:
            case ModelUsersGroups::class:
                $this->getSettings();
                UsersGroups::reloadConfigs();
                break;
            default:
        }
    }

    /**
     * Processes actions after enabling the module in the web interface
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#onaftermoduleenable
     *
     * @return void
     */
    public function onAfterModuleEnable(): void
    {
        $this->getSettings();
        UsersGroups::reloadConfigs();
    }

    /**
     * Processes actions after disabling the module in the web interface.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#onaftermoduledisable
     *
     * @return void
     */
    public function onAfterModuleDisable(): void{
        UsersGroups::reloadConfigs();
    }

    /**
     * Override pjsip options for peer in the pjsip.conf file
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#overridepjsipoptions
     *
     * @param string $extension the endpoint extension
     * @param array  $options   list of pjsip options
     *
     * @return array
     */
    public function overridePJSIPOptions(string $extension, array $options):array{
        if(empty($this->listUsers)){
            $this->getSettings();
        }
        $groupID = $this->listUsers[$extension]??'';
        $type    = $options['type']??'';
        if(!empty($groupID) && $type === 'endpoint'){
            if($this->groupSettings[$groupID]['isolate'] !== '1' && $this->groupSettings[$groupID]['isolatePickUp'] !== '1'){
                return $options;
            }
            // Для старых версий, удаляем опции:
            unset($options['call_group'], $options['pickup_group']);
            // Устанавливаем более
            $options['named_call_group']   = $groupID;
            $options['named_pickup_group'] = $groupID;
        }
        return $options;
    }

    /**
     * Prepares the include block within a Volt template.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#onvoltblockcompile
     *
     * @param string $controller The called controller name.
     * @param string $blockName The named in volt template block name.
     * @param View $view The view instance.
     *
     * @return string the volt partial file path without extension.
     */
    public function onVoltBlockCompile(string $controller, string $blockName, View $view):string
    {
        $result = '';
        if ($controller==='Extensions'){
            switch ($blockName){
                case "GeneralTabFields":
                    $result = "{$this->moduleDir}/App/Views/Extensions/modify";
                    break;
                default:
            }
        }

        return $result;
    }

    /**
     * Called from BaseForm before the form is initialized.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#onbeforeforminitialize
     *
     * @param Form $form The called form instance.
     * @param mixed $entity The called form entity.
     * @param mixed $options The called form options.
     *
     * @return void
     */
    public function onBeforeFormInitialize(Form $form, $entity, $options):void
    {
        if (is_a($form, ExtensionEditForm::class)) {
            // Prepare groups for select
            $parameters = [
                'columns'=>[
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
            if (isset($entity->userid)){
                $parameters = [
                    'conditions'=>'user_id = :user_id:',
                    'bind'=>['user_id'=>$entity->userid]
                ];

                $curUserGroup = GroupMembers::findFirst($parameters);
                if ($curUserGroup!==null){
                    // Get the group ID from the existing group membership
                    $userGroupId = $curUserGroup->group_id;
                }
            }

            $groupForSelect = new Select(
                'mod_usrgr_select_group', $arrGroupsForSelect, [
                    'using'    => [
                        'id',
                        'name',
                    ],
                    'value' => $userGroupId,
                    'useEmpty' => false,
                    'class'    => 'ui selection dropdown search select-group-field',
                ]
            );

            // Add the group select field to the form
            $form->add($groupForSelect);
        }
    }

    /**
     * Calls from BaseController on afterExecuteRoute function
     *
     * @param Controller $controller
     * @return void
     */
    public function onAfterExecuteRoute(Controller $controller):void
    {
        $userGroup = $controller->request->getPost('mod_usrgr_select_group');
        $userId = $controller->request->getPost('user_id');
        if (!empty($userGroup)){
            $parameters = [
                'conditions'=>'user_id = :user_id:',
                'bind'=>[
                    'user_id'=>$userId,
                ]
            ];

            $curUserGroup = GroupMembers::findFirst($parameters);
            if ($curUserGroup!==null){
                // Update the group ID with the selected user group
                $curUserGroup->group_id = $userGroup;
            } else {
                // Create a new group membership
                $curUserGroup = new GroupMembers();
                $curUserGroup->user_id = $userId;
                $curUserGroup->group_id = $userGroup;
            }
            $curUserGroup->save();
        }
    }
}