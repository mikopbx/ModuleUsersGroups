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

/* global globalRootUrl, globalTranslate, Form */

/**
 * Call groups change default group configuration.
 * @namespace ModuleCGChangeDefaultGroup
 */
const ModuleCGChangeDefaultGroup = {
    /**
     * jQuery object representing the form.
     * @type {jQuery}
     */
    $formObj: $('#default-group-form'),

    /**
     * jQuery object for dropdown menu.
     * @type {jQuery}
     */
    $selectDefaultDropdown: $('.select-default-group'),

    /**
     * Initializes the module.
     */
    initialize() {

        ModuleCGChangeDefaultGroup.$selectDefaultDropdown.dropdown({
            onChange: ModuleCGChangeDefaultGroup.cbOnModuleCGChangeDefaultGroup
        });

        ModuleCGChangeDefaultGroup.initializeForm();
    },

    /**
     * Callback on change dropdown for default call group.
     */
    cbOnModuleCGChangeDefaultGroup(){
        Form.submitForm()
    },

    /**
     * Callback before sending the form.
     * @param {Object} settings - Ajax request settings.
     * @returns {Object} The modified Ajax request settings.
     */
    cbBeforeSendForm(settings) {
        const result = settings;
        result.data = ModuleCGChangeDefaultGroup.$formObj.form('get values');
        return result;
    },

    /**
     * Callback after sending the form.
     */
    cbAfterSendForm() {
        window.location = `${globalRootUrl}module-users-groups/module-users-groups/index`;
    },

    /**
     * Initializes the form.
     */
    initializeForm() {
        Form.$formObj = ModuleCGChangeDefaultGroup.$formObj;
        Form.url = `${globalRootUrl}module-users-groups/module-users-groups/change-default`;
        Form.cbBeforeSendForm = ModuleCGChangeDefaultGroup.cbBeforeSendForm;
        Form.cbAfterSendForm = ModuleCGChangeDefaultGroup.cbAfterSendForm;
        Form.initialize();
    },
};

$(document).ready(() => {
    ModuleCGChangeDefaultGroup.initialize();
});

