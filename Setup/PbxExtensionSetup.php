<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 11 2019
 */

namespace Modules\ModuleUsersGroups\Setup;

use MikoPBX\Common\Models\PbxSettings;
use MikoPBX\Modules\Setup\PbxExtensionSetupBase;
use Modules\ModuleUsersGroups\Models\{AllowedOutboundRules, GroupMembers, UsersGroups};
use Phalcon\Text;

class PbxExtensionSetup extends PbxExtensionSetupBase
{

    /**
     * Создает структуру для хранения настроек модуля в своей модели
     * и заполняет настройки по-умолчанию если таблицы не было в системе
     * см (unInstallDB)
     *
     * Регистрирует модуль в PbxExtensionModules
     *
     * @return bool результат установки
     */
    public function installDB(): bool
    {
        // Create module Database
        $result = $this->createSettingsTableByModelsAnnotations();

        // Register module in PBX Extensions subsystem
        if ($result) {
            $result = $this->registerNewModule();
        }

        if ($result) {
            $this->transferOldSettings();
        }

        // Show module on sidebar menu
        $this->addToSidebar();

        return $result;
    }

    /**
     *  Transfer settings from db to own module database
     */
    protected function transferOldSettings(): void
    {
        // m_ModuleUsersGroups_UsersGroups
        if ($this->db->tableExists('m_ModuleUsersGroups_UsersGroups')) {
            $oldSettings = $this->db->fetchOne(
                'Select * from m_ModuleUsersGroups_AllowedOutboundRules',
                \Phalcon\Db\Enum::FETCH_ASSOC
            );

            $settings = AllowedOutboundRules::findFirst();
            if ($settings === null) {
                $settings = new AllowedOutboundRules();
            }
            foreach ($settings as $key => $value) {
                if (isset($oldSettings[$key])) {
                    $settings->$key = $oldSettings[$key];
                }
            }
            if ($settings->save()) {
                $this->db->dropTable('m_ModuleUsersGroups_AllowedOutboundRules');
            } else {
                $this->messges[] = 'Error on transfer old settings for m_ModuleUsersGroups_AllowedOutboundRules';
            }
        }
        // m_ModuleUsersGroups_GroupMembers
        if ($this->db->tableExists('m_ModuleUsersGroups_GroupMembers')) {
            $oldSettings = $this->db->fetchOne('Select * from m_ModuleUsersGroups_GroupMembers', \Phalcon\Db\Enum::FETCH_ASSOC);

            $settings = GroupMembers::findFirst();
            if ($settings === null) {
                $settings = new GroupMembers();
            }
            foreach ($settings as $key => $value) {
                if (isset($oldSettings[$key])) {
                    $settings->$key = $oldSettings[$key];
                }
            }
            if ($settings->save()) {
                $this->db->dropTable('m_ModuleUsersGroups_GroupMembers');
            } else {
                $this->messges[] = 'Error on transfer old settings for m_ModuleUsersGroups_GroupMembers';
            }
        }

        // m_ModuleUsersGroups_UsersGroups
        if ($this->db->tableExists('m_ModuleUsersGroups_UsersGroups')) {
            $oldSettings = $this->db->fetchOne('Select * from m_ModuleUsersGroups_UsersGroups', \Phalcon\Db\Enum::FETCH_ASSOC);

            $settings = UsersGroups::findFirst();
            if ($settings === null) {
                $settings = new UsersGroups();
            }
            foreach ($settings as $key => $value) {
                if (isset($oldSettings[$key])) {
                    $settings->$key = $oldSettings[$key];
                }
            }
            if ($settings->save()) {
                $this->db->dropTable('m_ModuleUsersGroups_UsersGroups');
            } else {
                $this->messges[] = 'Error on transfer old settings for ModuleUsersGroups_UsersGroups';
            }
        }
    }

    /**
     * Добавляет модуль в боковое меню
     *
     * @return bool
     */
    public function addToSidebar(): bool
    {
        $menuSettingsKey           = "AdditionalMenuItem{$this->moduleUniqueID}";
        $unCamelizedControllerName = Text::uncamelize($this->moduleUniqueID, '-');
        $menuSettings              = PbxSettings::findFirstByKey($menuSettingsKey);
        if ($menuSettings === null) {
            $menuSettings      = new PbxSettings();
            $menuSettings->key = $menuSettingsKey;
        }
        $value               = [
            'uniqid'        => $this->moduleUniqueID,
            'href'          => "/admin-cabinet/$unCamelizedControllerName",
            'group'         => 'routing',
            'iconClass'     => 'users',
            'caption'       => "Breadcrumb$this->moduleUniqueID",
            'showAtSidebar' => true,
        ];
        $menuSettings->value = json_encode($value, JSON_UNESCAPED_UNICODE);

        return $menuSettings->save();
    }


}
