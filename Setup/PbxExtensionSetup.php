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

namespace Modules\ModuleUsersGroups\Setup;

use MikoPBX\Common\Models\PbxSettings;
use MikoPBX\Modules\Setup\PbxExtensionSetupBase;

class PbxExtensionSetup extends PbxExtensionSetupBase
{

    /**
     * Performs the main module installation process called by PBXCoreRest after unzipping module files.
     * It invokes private functions and sets up error messages in the message variable.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-installer#installmodule
     *
     * @return bool The result of the installation process.
     */
    public function installDB(): bool
    {
        // Create module Database
        $result = $this->createSettingsTableByModelsAnnotations();

        // Register module in PBX Extensions subsystem
        if ($result) {
            $result = $this->registerNewModule();
        }

        // Show module on sidebar menu
        $this->addToSidebar();

        return $result;
    }

    /**
     * Adds the module to the sidebar menu.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-installer#addtosidebar
     *
     * @return bool The result of the addition process.
     */
    public function addToSidebar(): bool
    {
        $menuSettingsKey           = "AdditionalMenuItem{$this->moduleUniqueID}";
        $menuSettings              = PbxSettings::findFirstByKey($menuSettingsKey);
        if ($menuSettings === null) {
            $menuSettings      = new PbxSettings();
            $menuSettings->key = $menuSettingsKey;
        }
        $value               = [
            'uniqid'        => $this->moduleUniqueID,
            'group'         => 'routing',
            'iconClass'     => 'users',
            'caption'       => "Breadcrumb$this->moduleUniqueID",
            'showAtSidebar' => true,
        ];
        $menuSettings->value = json_encode($value, JSON_UNESCAPED_UNICODE);

        return $menuSettings->save();
    }


}
