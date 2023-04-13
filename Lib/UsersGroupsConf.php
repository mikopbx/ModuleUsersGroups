<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 11 2019
 */

namespace Modules\ModuleUsersGroups\Lib;

use MikoPBX\Core\Asterisk\Configs\ExtensionsConf;
use MikoPBX\Modules\Config\ConfigClass;
use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
use Modules\ModuleUsersGroups\Models\GroupMembers;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;


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

    public function getSettings(): void{
        $this->listUsers = UsersGroups::initUserList();
        $data = ModelUsersGroups::find();
        /** @var ModelUsersGroups $settings */
        foreach ($data as $settings){
            $this->groupSettings[$settings->id + 1] = $settings->toArray();
        }
    }

    public function extensionGenAllPeersContext():string
    {
        // Проверка набираемого номера, относится ли он к группе сотрудников.
        $conf = 'same => n,NoOp( --- group: ${CHANNEL(callgroup)} | src: ${CALLERID(num)} | dst: ${EXTEN}---)'.PHP_EOL;
        $conf.= 'same => n,Set(srcIsolate=${DIALPLAN_EXISTS(users-group-isolate-${CHANNEL(callgroup)},s,1)})'.PHP_EOL;
        $conf.= 'same => n,Set(dstIsolateGroup=${DIALPLAN_EXISTS(users-group-dst-${CHANNEL(callgroup)},${EXTEN},1)})'.PHP_EOL;
        $conf.= 'same => n,Set(dstIsolate=${DIALPLAN_EXISTS(users-group-isolate,${EXTEN},1)})'.PHP_EOL;
        $conf.= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} != 1 && dstIsolate != 1 && ${DIALPLAN_EXISTS(internal,${EXTEN},1} != 1 ]?Set(srcIsolate=0))'.PHP_EOL;
        $conf.= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} == 0 ]?Goto(internal-num-undefined,${EXTEN},1))'.PHP_EOL;
        $conf.= 'same => n,ExecIf($[ ${srcIsolate} == 0 && ${dstIsolate} ]?Goto(internal-num-undefined,${EXTEN},1))'.PHP_EOL;
        return $conf;
    }

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
     * Кастомизация исходящего контекста для конкретного маршрута.
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
     * Кастомизация исходящего контекста для конкретного маршрута.
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
     * Дополнительные параметры для
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
     * Обработчик события изменения данных в базе настроек mikopbx.db.
     *
     * @param $data
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
     * Process after enable action in web interface
     *
     * @return void
     */
    public function onAfterModuleEnable(): void
    {
        $this->getSettings();
        UsersGroups::reloadConfigs();
    }

    public function onAfterModuleDisable(): void{
        UsersGroups::reloadConfigs();
    }

    /**
     * Переопределение опций Endpoint в pjsip.conf
     *
     * @param string $extension
     * @param array  $options
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
            $options['call_group']   = $groupID;
            $options['pickup_group'] = $groupID;
        }
        return $options;
    }
}