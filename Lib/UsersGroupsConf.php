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
use MikoPBX\Common\Models\Users;
use MikoPBX\Common\Models\Extensions;
use MikoPBX\Modules\Config\ConfigClass;
use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
use Modules\ModuleUsersGroups\Models\GroupMembers;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;
use Modules\ModuleUsersGroups\App\Forms\ExtensionEditAdditionalForm;
use Phalcon\Forms\Form;
use Phalcon\Mvc\Micro;
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
    public function getSettings(): void
    {
        $this->listUsers = UsersGroups::initUserList();
        $data = ModelUsersGroups::find();
        /** @var ModelUsersGroups $settings */
        foreach ($data as $settings) {
            $this->groupSettings[$settings->id + 1] = $settings->toArray();
        }
    }

    /**
     * Prepares additional rules for [all_peers] context section in the extensions.conf file.
     *
     * This function generates a string containing additional rules for the [all_peers]
     * context section in the extensions.conf file. The rules are used to check if the
     * dialed number belongs to a specific employee group and handle the call accordingly.
     *
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#extensiongenallpeerscontext
     *
     * @return string The generated rules as a string.
     */
    public function extensionGenAllPeersContext(): string
    {
        // Check if the dialed number belongs to an employee group.
        $conf = 'same => n,NoOp( --- group: ${CHANNEL(callgroup)} | src: ${CALLERID(num)} | dst: ${EXTEN}---)' . PHP_EOL;
        $conf .= 'same => n,Set(srcIsolate=${DIALPLAN_EXISTS(users-group-isolate-${CHANNEL(callgroup)},s,1)})' . PHP_EOL;
        $conf .= 'same => n,Set(dstIsolateGroup=${DIALPLAN_EXISTS(users-group-dst-${CHANNEL(callgroup)},${EXTEN},1)})' . PHP_EOL;
        $conf .= 'same => n,Set(dstIsolate=${DIALPLAN_EXISTS(users-group-isolate,${EXTEN},1)})' . PHP_EOL;

        // Check and set isolation flags based on conditions.
        $conf .= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} != 1 && dstIsolate != 1 && ${DIALPLAN_EXISTS(internal,${EXTEN},1)} != 1 ]?Set(srcIsolate=0))' . PHP_EOL;
        $conf .= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} == 0 ]?Goto(internal-num-undefined,${EXTEN},1))' . PHP_EOL;
        $conf .= 'same => n,ExecIf($[ ${srcIsolate} == 0 && ${dstIsolate} ]?Goto(internal-num-undefined,${EXTEN},1))' . PHP_EOL;
        return $conf;
    }

    /**
     * Prepares additional context sections in the extensions.conf file.
     *
     * This function generates additional context sections in the extensions.conf file
     * based on the settings of user groups. It creates contexts for isolating users
     * and groups of users, and includes them in the main contexts section.
     *
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#extensiongencontexts
     *
     * @return string The generated contexts as a string.
     */
    public function extensionGenContexts(): string
    {
        // Ensure we have the list of users and their settings.
        $this->getSettings();

        // Group users based on their groups.
        $groups = [];
        foreach ($this->listUsers as $user => $group) {
            $groups[$group][] = $user;
        }

        // Initialize dialplan strings for isolation contexts.
        $isolateDialplan = '[users-group-isolate]' . PHP_EOL;
        $dialplan = '';

        // Generate contexts for each group with isolation.
        foreach ($groups as $group => $users) {
            $isolate = $this->groupSettings[$group]['isolate'] === '1';

            // Skip if isolation is disabled or no users in the group.
            if ($isolate === false || count($users) === 0) {
                continue;
            }

            // Create the context for isolating the group.
            $dialplan .= "[users-group-isolate-$group]" . PHP_EOL;
            $dialplan .= "exten => s,1,NoOp(-)]" . PHP_EOL . PHP_EOL;

            // Include the isolated group in the main isolation context.
            $isolateDialplan .= "include => users-group-dst-$group" . PHP_EOL;

            // Create the context for each user in the group.
            $dialplan .= "[users-group-dst-$group]" . PHP_EOL;
            foreach ($users as $user) {
                $dialplan .= "exten => $user,1,NoOp(-)" . PHP_EOL;
            }

            // Process custom patterns for the group.
            $patterns = explode(PHP_EOL, $this->groupSettings[$group]['patterns']);
            foreach ($patterns as $pattern) {
                // Remove non-digit characters from the pattern.
                $pattern = preg_replace("/[^X0-9]/", '', $pattern);
                $dialplan .= "exten => _$pattern,1,NoOp(-)" . PHP_EOL;
            }
            $dialplan .= PHP_EOL;
        }

        // Combine the main dialplan and isolation dialplan.
        if ($dialplan !== '') {
            $dialplan .= $isolateDialplan;
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
        $conf = "\t" . 'same => n,ExecIf($["x${FROM_PEER}" == "x" && "${CHANNEL(channeltype)}" == "PJSIP" ]?Gosub(set_from_peer,s,1))' . " \n\t";
        $conf .= 'same => n,Set(GR_VARS=${DB(UsersGroups/${FROM_PEER})})' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_VARS}x" != "x"]?Exec(Set(${GR_VARS})))' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_ID_' . $rout['id'] . '}" != "1"]?return)' . " \n\t";
        $conf .= 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_CID_' . $rout['id'] . '}x" != "x"]?MSet(GR_OLD_CALLERID=${CALLERID(num)},OUTGOING_CID=${GR_CID_' . $rout['id'] . '}))' . "\n\t";
        $conf .= 'same => n,ExecIf($["${OUTGOING_CID}x" != "x"]?Set(DOPTIONS=${DOPTIONS}f(${OUTGOING_CID})))' . " \n\t";
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
        return "\t" . 'same => n,ExecIf($["${GR_PERM_ENABLE}" == "1" && "${GR_OLD_CALLERID}x" != "x"]?MSet(CALLERID(num)=${GR_OLD_CALLERID},GR_OLD_CALLERID=${UNDEFINED}))';
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
    public function onAfterModuleDisable(): void
    {
        UsersGroups::reloadConfigs();
    }

    /**
     * Override PJSIP options for a peer in the pjsip.conf file.
     *
     * This function allows overriding PJSIP options for a specific peer in the pjsip.conf file.
     * The options are provided as an array, and the function checks if the provided extension
     * belongs to a group with specific settings. If the group allows isolation, it modifies
     * the options accordingly, and if not, it leaves the options unchanged.
     *
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#overridepjsipoptions
     *
     * @param string $extension The endpoint extension.
     * @param array $options List of PJSIP options.
     *
     * @return array The modified array of PJSIP options.
     */
    public function overridePJSIPOptions(string $extension, array $options): array
    {
        // Ensure we have the list of users and their settings.
        if (empty($this->listUsers)) {
            $this->getSettings();
        }

        // Get the group ID of the extension if available.
        $groupID = $this->listUsers[$extension] ?? '';
        $type = $options['type'] ?? '';

        // Check if the extension belongs to a group and the options are for an endpoint.
        if (!empty($groupID) && $type === 'endpoint') {
            // Check if the group allows isolation.
            if ($this->groupSettings[$groupID]['isolate'] !== '1' && $this->groupSettings[$groupID]['isolatePickUp'] !== '1') {
                return $options; // Return the options unchanged.
            }

            // For older versions, remove the 'call_group' and 'pickup_group' options.
            unset($options['call_group'], $options['pickup_group']);

            // Set new options for isolation.
            $options['named_call_group'] = $groupID;
            $options['named_pickup_group'] = $groupID;
        }
        return $options;
    }

    /**
     * This method is called during Volt block compilation.
     * It handles the compilation of specific blocks and returns the compiled result.
     *
     * @param string $controller The controller name.
     * @param string $blockName The block name.
     * @param View $view The view object.
     *
     * @return string The compiled result.
     */
    public function onVoltBlockCompile(string $controller, string $blockName, View $view): string
    {
        $result = '';
        // Check the controller and block name to determine the action
        switch ("$controller:$blockName") {
            case 'Extensions:GeneralTabFields':
                // Add additional tab to the Extension edit page
                $result = "Modules/ModuleUsersGroups/Extensions/modify";
                break;
            default:
                // Default case when no specific action is required
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
    public function onBeforeFormInitialize(Form $form, $entity, $options): void
    {
        if (is_a($form, ExtensionEditForm::class)) {
            ExtensionEditAdditionalForm::prepareAdditionalFields($form, $entity, $options);
        }
    }

    /**
     * This method is called from RouterProvider's onAfterExecuteRoute function.
     * It handles the form submission and updates the user credentials.
     *
     * @param Micro $app The micro application instance.
     *
     * @return void
     */
    public function onAfterExecuteRestAPIRoute(Micro $app): void
    {
        // Intercept the form submission of Extensions, only save action
        $calledUrl = $app->request->get('_url');
        if ($calledUrl!=='/api/extensions/saveRecord') {
            return;
        }
        $response = json_decode($app->response->getContent());
        if (!empty($response->result) and $response->result===true){
            // Intercept the form submission of Extensions with fields mod_usrgr_select_group and user_id
            $postData = $app->request->getPost();
            UsersGroups::updateUserGroup($postData);
        }
    }
}