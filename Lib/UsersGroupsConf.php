<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 11 2019
 */

namespace Modules\ModuleUsersGroups\Lib;

use MikoPBX\Common\Models\PbxExtensionModules;
use MikoPBX\Modules\Config\ConfigClass;
use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use MikoPBX\Core\System\{PBX, System, Util};
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

    public function getSettings(): void{
        $this->listUsers = UsersGroups::initUserList();
    }

    /**
     *  Process CoreAPI requests under root rights
     *
     * @param array $request
     *
     * @return PBXApiResult
     */
    public function moduleRestAPICallback(array $request): PBXApiResult
    {
        $res = new PBXApiResult();
        $res->processor = __METHOD__;
        $action = strtoupper($request['action']);
        switch ($action){
            default:
                $res->success = false;
                $res->messages[]='API action not found in moduleRestAPICallback ModuleUsersGroups';
        }
        return $res;
    }

    /**
     * Кастомизация исходящего контекста для конкретного маршрута.
     *
     * @param $rout
     *
     * @return string
     */
    public function generateOutRoutContext($rout): string
    {
        $conf = 'same => n,ExecIf($["x${FROM_PEER}" == "x" && "${CHANNEL(channeltype)}" == "PJSIP" ]?Gosub(set_from_peer,s,1))' . " \n\t";
        $conf .= 'same => n,Set(GR_VARS=${DB(UsersGroups/${FROM_PEER})})' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_VARS}x" != "x"]?Exec(MSet(${GR_VARS})))' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_ID_' . $rout['id'] . '}" != "1"]?return)' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_CID_' . $rout['id'] . '}x" != "x"]?MSet(GR_OLD_CALLERID=${CALLERID(num)},CALLERID(num)=${GR_CID_' . $rout['id'] . '}))' . " \n\t";

        return $conf;
    }

    /**
     * Кастомизация исходящего контекста для конкретного маршрута.
     *
     * @param $rout
     *
     * @return string
     */
    public function generateOutRoutAfterDialContext($rout): string
    {
        return 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_OLD_CALLERID}x" != "x"]?MSet(CALLERID(num)=${GR_OLD_CALLERID},GR_OLD_CALLERID=${UNDEFINED}))' . " \n\t";
    }

    /**
     * Дополнительные параметры для
     *
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
                $mod = new UsersGroups();
                $mod->fillAsteriskDatabase();
                $this->getSettings();
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
        $mod = new UsersGroups();
        $mod->fillAsteriskDatabase();
        $this->getSettings();
        PBX::sipReload();
    }

    public function onAfterModuleDisable(): void{
        PBX::sipReload();
    }

    /**
     * Переопределение опций Endpoint в pjsip.conf
     * @param string $id
     * @param array $options
     * @return array
     */
    public function overridePJSIPOptions(string $id, array $options):array{
        if(empty($this->listUsers)){
            $this->getSettings();
        }
        $groupID = $this->listUsers[$id]??'';
        $type    = $options['type']??'';
        if(!empty($groupID) && $type === 'endpoint'){
            $options['call_group']   = $groupID;
            $options['pickup_group'] = $groupID;
        }
        return $options;
    }

}