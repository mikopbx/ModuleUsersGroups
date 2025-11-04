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
use MikoPBX\Common\Models\PbxSettings;
use MikoPBX\Common\Models\Users;
use MikoPBX\Core\System\Directories;
use MikoPBX\Core\System\SystemMessages;
use MikoPBX\Modules\Config\ConfigClass;
use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use Modules\ModuleUsersGroups\App\Forms\ExtensionEditAdditionalForm;
use Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroups\UpdateUserGroupAction;
use Modules\ModuleUsersGroups\Models\AllowedOutboundRules;
use Modules\ModuleUsersGroups\Models\GroupMembers;
use Modules\ModuleUsersGroups\Models\UsersGroups as ModelUsersGroups;
use Phalcon\Forms\Form;
use Phalcon\Mvc\Micro;
use Phalcon\Mvc\View;


class UsersGroupsConf extends ConfigClass
{
    // Constants for API endpoints (PHP 7.4 compatible)
    private const API_V2_EXTENSIONS_SAVE = '/api/extensions/saveRecord';
    private const API_V3_EMPLOYEES = '/pbxcore/api/v3/employees';
    private const MODULE_PREFIX = 'mod_usrgr_';

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
        $conf = 'same => n,NoOp( --- group: ${CHANNEL(namedcallgroup)} | src: ${CALLERID(num)} | dst: ${EXTEN}---)' . PHP_EOL;
        $conf .= 'same => n,Set(srcIsolate=${DIALPLAN_EXISTS(users-group-isolate-${CHANNEL(namedcallgroup)},s,1)})' . PHP_EOL;
        $conf .= 'same => n,Set(dstIsolateGroup=${DIALPLAN_EXISTS(users-group-dst-${CHANNEL(namedcallgroup)},${EXTEN},1)})' . PHP_EOL;
        $conf .= 'same => n,Set(dstIsolate=${DIALPLAN_EXISTS(users-group-isolate,${EXTEN},1)})' . PHP_EOL;

        // Check and set isolation flags based on conditions.
        $conf .= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} != 1 && dstIsolate != 1 && ${DIALPLAN_EXISTS(internal,${EXTEN},1)} != 1 ]?Set(srcIsolate=0))' . PHP_EOL;
        $conf .= 'same => n,ExecIf($[ ${srcIsolate} && ${dstIsolateGroup} == 0 ]?Goto(users-group-forbidden,${EXTEN},1))' . PHP_EOL;
        $conf .= 'same => n,ExecIf($[ ${srcIsolate} == 0 && ${dstIsolate} ]?Goto(users-group-forbidden,${EXTEN},1))' . PHP_EOL;
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

        // Add context for forbidden calls with voice notification
        $dialplan .= $this->generateForbiddenCallContext();

        return $dialplan;
    }

    /**
     * Generate context for handling forbidden calls with voice notification
     *
     * This context is triggered when a user tries to call a number that is
     * forbidden by their group isolation settings. It plays a custom voice
     * message in the system language and provides a hook for custom implementations.
     *
     * Sound file structure:
     * ModuleUsersGroups/sounds/{lang}/forbidden.mp3
     * Where {lang} is language code from system settings (ru, en, de, etc.)
     *
     * @return string The generated context as a string.
     */
    private function generateForbiddenCallContext(): string
    {
        $conf = PHP_EOL . '[users-group-forbidden]' . PHP_EOL;
        $conf .= 'exten => _X.,1,NoOp(--- Call to ${EXTEN} forbidden by UsersGroups module ---)' . PHP_EOL;
        $conf .= 'same => n,Answer()' . PHP_EOL;
        $conf .= 'same => n,Wait(1)' . PHP_EOL;

        // Try to play module custom sound file with automatic language selection
        // Asterisk will use CHANNEL(language) to find: ModuleUsersGroups/sounds/{lang}/forbidden
        // Supported formats: mp3, wav, gsm (Asterisk auto-selects best available)
        $conf .= 'same => n,Playback(moduleusersgroups-forbidden)' . PHP_EOL;

        // Fallback to standard Asterisk sound if custom sound not found
        // ss-noservice = "The number you have dialed is not in service"
        $conf .= 'same => n,ExecIf($["${PLAYBACKSTATUS}" = "FAILED"]?Playback(ss-noservice))' . PHP_EOL;

        // Allow custom dialplan extension for additional processing
        $conf .= 'same => n,GosubIf(${DIALPLAN_EXISTS(users-group-forbidden-custom,${EXTEN},1)}?users-group-forbidden-custom,${EXTEN},1)' . PHP_EOL;

        $conf .= 'same => n,Hangup()' . PHP_EOL;
        $conf .= PHP_EOL;

        return $conf;
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
        // If call is forwarded, use the forwarding source peer instead of calling peer for CallerID rules
        $conf .= 'same => n,Set(EFFECTIVE_FROM_PEER=${IF($["${FW_SOURCE_PEER}x" != "x"]?${FW_SOURCE_PEER}:${FROM_PEER})})' . " \n\t";
        $conf .= 'same => n,Set(GR_VARS=${DB(UsersGroups/${EFFECTIVE_FROM_PEER})})' . " \n\t";
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
        // Clean up orphaned group member records
        RestAPI\UsersGroups\CleanupOrphanedMembersAction::main([]);

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
     * Modifies the system assets.
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#onafterassetsprepared
     *
     * @param \Phalcon\Assets\Manager $assets The assets manager for additional modifications from module.
     * @param \Phalcon\Mvc\Dispatcher $dispatcher The dispatcher instance.
     *
     * @return void
     */
    public function onAfterAssetsPrepared($assets, $dispatcher): void
    {
        $currentController = $dispatcher->getControllerName();
        $currentAction = $dispatcher->getActionName();

        // Add JS for extension-modify page
        if ($currentController === 'Extensions' && $currentAction === 'modify') {
            $assets->collection('footerJS')
                ->addJs("js/cache/ModuleUsersGroups/module-users-groups-extension-dropdown.js", true);
        }
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
     * Process REST API requests
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#modulerestapicallback
     *
     * @param array $request The request data
     *
     * @return PBXApiResult The response data
     */
    public function moduleRestAPICallback(array $request): PBXApiResult
    {
        $action = $request['action'] ?? '';
        $data = $request['data'] ?? [];

        // Use the processor to handle the action
        $processor = new \Modules\ModuleUsersGroups\Lib\RestAPI\UsersGroupsManagementProcessor();
        return $processor->callBack($action, $data);
    }

    /**
     * This method is called from RouterProvider's onAfterExecuteRoute function.
     * It handles the form submission and updates the user credentials.
     *
     * Supports both:
     * - Old API v2: /api/extensions/saveRecord
     * - New REST API v3: API_V3_EMPLOYEES
     *
     * @param Micro $app The micro application instance.
     * @phpstan-param Micro<\MikoPBX\PBXCoreREST\Http\Request> $app
     *
     * @return void
     */
    public function onAfterExecuteRestAPIRoute(Micro $app): void
    {
        $calledUrl = $app->request->get('_url');

        // Handle API v2
        if ($calledUrl === self::API_V2_EXTENSIONS_SAVE) {
            $this->handleApiV2Request($app);
            return;
        }

        // Handle REST API v3
        $router = $app->getRouter();
        $matchedRoute = $router->getMatchedRoute();
        if ($matchedRoute !== null) {
            $this->handleApiV3Request($app, $matchedRoute);
        }
    }

    /**
     * Handle API v2 request: /api/extensions/saveRecord
     *
     * @param Micro $app The micro application instance.
     * @return void
     */
    private function handleApiV2Request(Micro $app): void
    {
        $response = json_decode($app->response->getContent());

        if (!$this->isSuccessfulResponseV2($response)) {
            return;
        }

        $postData = $app->request->getPost();
        if (!$this->hasModuleData($postData)) {
            return;
        }

        // Execute update through REST API Action
        $result = UpdateUserGroupAction::main($postData);

        // Log the result
        if (!$result->success) {
            SystemMessages::sysLogMsg(
                __METHOD__,
                "REST API v2: Failed to update group: " . implode(', ', $result->messages),
                LOG_ERR
            );
        }
    }

    /**
     * Handle REST API v3 request: API_V3_EMPLOYEES
     *
     * @param Micro $app The micro application instance.
     * @param mixed $matchedRoute The matched route object.
     * @return void
     */
    private function handleApiV3Request(Micro $app, $matchedRoute): void
    {
        $pattern = $matchedRoute->getPattern();
        $httpMethod = $app->request->getMethod();

        // Check if this is an employee-related request
        $isEmployeeRoute = strpos($pattern, self::API_V3_EMPLOYEES) === 0;
        if (!$isEmployeeRoute) {
            return;
        }

        // Handle POST/PUT requests - save group data
        if (in_array($httpMethod, ['POST', 'PUT'], true)) {
            /** @var \MikoPBX\PBXCoreREST\Http\Request $request */
            $request = $app->request;
            $requestData = $request->getData();
            $response = json_decode($app->response->getContent(), false);

            $this->processEmployeeGroupUpdate($requestData, $response);
        }
    }

    /**
     * Check if API v2 response is successful
     *
     * @param mixed $response The decoded JSON response
     * @return bool True if successful
     */
    private function isSuccessfulResponseV2($response): bool
    {
        return !empty($response->result) && $response->result === true;
    }

    /**
     * Check if POST data contains module-specific fields
     * PHP 7.4 compatible - using strpos instead of str_starts_with
     *
     * @param array $postData The POST data array
     * @return bool True if module data exists
     */
    private function hasModuleData(array $postData): bool
    {
        foreach (array_keys($postData) as $key) {
            if (strpos($key, self::MODULE_PREFIX) === 0) {
                return true;
            }
        }
        return false;
    }

    

    /**
     * Process employee group update for REST API v3
     *
     * @param array $requestData The request data
     * @param mixed $response The decoded JSON response
     * @return void
     */
    private function processEmployeeGroupUpdate(array $requestData, $response): void
    {
        // Extract IDs from request and response
        $employeeId = $response->data->id ?? null;
        $groupId = $requestData['mod_usrgr_select_group'] ?? null;

        // Validate employee ID (silent fail)
        if (!$this->isValidEmployeeId($employeeId)) {
            return;
        }

        // Skip if no group data or empty string (silent fail)
        if ($groupId === null || $groupId === '') {
            return;
        }

        // Validate group ID (silent fail)
        if (!$this->isValidGroupId($groupId)) {
            return;
        }

        // Prepare and execute update through REST API Action
        $postData = [
            'mod_usrgr_select_group' => $groupId,
            'user_id' => $employeeId,
            'number' => $requestData['number'] ?? null
        ];

        $result = UpdateUserGroupAction::main($postData);

        // Log the result
        if ($result->success) {
            SystemMessages::sysLogMsg(
                __METHOD__,
                "REST API v3: Updated group for employee #{$employeeId} to group #{$groupId}",
                LOG_INFO
            );
        } else {
            SystemMessages::sysLogMsg(
                __METHOD__,
                "REST API v3: Failed to update group for employee #{$employeeId}: " . implode(', ', $result->messages),
                LOG_ERR
            );
        }
    }

    /**
     * Validate employee ID
     * PHP 7.4 compatible validation
     *
     * @param mixed $employeeId The employee ID to validate
     * @return bool True if valid
     */
    private function isValidEmployeeId($employeeId): bool
    {
        return $employeeId !== null
            && $employeeId !== ''
            && is_numeric($employeeId);
    }

    /**
     * Validate group ID
     * PHP 7.4 compatible validation
     *
     * @param mixed $groupId The group ID to validate
     * @return bool True if valid
     */
    private function isValidGroupId($groupId): bool
    {
        return is_numeric($groupId);
    }

    /**
     * Clean up orphaned group member records
     *
     * Removes GroupMembers records that reference non-existent users.
     * This happens after module reinstallation or restore from backup
     * when employee records no longer exist in the main database.
     *
     * @return void
     */
    private function cleanupOrphanedGroupMembers(): void
    {
        try {
            // Get valid user IDs using simple find (works cross-database)
            $validUsers = Users::find(['columns' => 'id']);

            if (count($validUsers) === 0) {
                SystemMessages::sysLogMsg(__METHOD__, 'No users in system, skipping cleanup', LOG_INFO);
                return;
            }

            // Build list of valid user IDs
            $validIds = [];
            foreach ($validUsers as $user) {
                $validIds[] = (int)$user->id;
            }

            // Get module database connection through model
            $connection = GroupMembers::getReadConnection();
            $validIdsList = implode(',', $validIds);

            // Use direct SQL DELETE for performance
            $sql = "DELETE FROM m_ModuleUsersGroups_GroupMembers WHERE user_id NOT IN ({$validIdsList})";
            $success = $connection->execute($sql);
            $deletedCount = $success ? $connection->affectedRows() : 0;

            // Log cleanup results
            if ($deletedCount > 0) {
                SystemMessages::sysLogMsg(
                    __METHOD__,
                    "Cleaned up {$deletedCount} orphaned group member record(s)",
                    LOG_INFO
                );
            }
        } catch (\Throwable $e) {
            SystemMessages::sysLogMsg(
                __METHOD__,
                "Failed to cleanup orphaned members: " . $e->getMessage(),
                LOG_ERR
            );
        }
    }
}