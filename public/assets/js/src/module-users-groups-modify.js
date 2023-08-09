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

/* global globalRootUrl,globalTranslate, Form, Extensions */

/**
 * Call groups module modify configuration.
 * @namespace ModuleCGModify
 */
const ModuleCGModify = {
	/**
	 * jQuery object representing the module's form.
	 * @type {jQuery}
	 */
	$formObj: $('#module-users-groups-form'),
	$rulesCheckBoxes: $('#outbound-rules-table .checkbox'),
	$selectUsersDropDown: $('.select-extension-field'),
	$showOnlyOnIsolateGroup: $('.show-only-on-isolate-group'),
	$rulesTable: $('#outbound-rules-table'),
	$statusToggle: $('#module-status-toggle'),
	$isolateCheckBox: $('#isolate').parent('.checkbox'),
	$isolatePickupCheckBox: $('#isolatePickUp').parent('.checkbox'),

	validateRules: {
		name: {
			identifier: 'name',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.mod_usrgr_ValidateNameIsEmpty,
				},
			],
		},
	},

	/**
	 * Initializes the module.
	 * @memberof ModuleCGModify
	 */
	initialize() {
		ModuleCGModify.$formObj.parent('.ui.grey.segment').removeClass('segment');

		ModuleCGModify.checkStatusToggle();
		window.addEventListener('ModuleStatusChanged', ModuleCGModify.checkStatusToggle);
		$('.avatar').each(() => {
			if ($(this).attr('src') === '') {
				$(this).attr('src', `${globalRootUrl}assets/img/unknownPerson.jpg`);
			}
		});
		$('#module-users-group-modify-menu .item').tab();

		ModuleCGModify.$rulesCheckBoxes.checkbox({
			onChange() {
				Form.dataChanged();
			},
			onChecked() {
				const number = $(this).attr('data-value');
				$(`#${number} .disability`).removeClass('disabled');
			},
			onUnchecked() {
				const number = $(this).attr('data-value');
				$(`#${number} .disability`).addClass('disabled');
			},
		});

		ModuleCGModify.initializeUsersDropDown();

		$('body').on('click', 'div.delete-user-row', (e) => {
			e.preventDefault();
			ModuleCGModify.deleteMemberFromTable(e.target);
		});

		ModuleCGModify.$isolateCheckBox.checkbox({
			onChange: ModuleCGModify.cbAfterChangeIsolate
		});
		ModuleCGModify.cbAfterChangeIsolate();

		ModuleCGModify.initializeRulesDataTable();

		ModuleCGModify.initializeForm();
	},

	/**
	 * Initializes the DataTable for rules table.
	 */
	initializeRulesDataTable() {
		ModuleCGModify.$rulesTable.DataTable({
			// destroy: true,
			lengthChange: false,
			paging: false,
			columns: [
				{orderable: false, searchable: false},
				null,
				null,
				null,
				{orderable: false, searchable: false},
			],
			order: [1, 'asc'],
			language: SemanticLocalization.dataTableLocalisation,
		});
	},

	/**
	 * Handle isolation change.
	 * @memberof ModuleCGModify
	 */
	cbAfterChangeIsolate(){
		if(ModuleCGModify.$isolateCheckBox.checkbox('is checked')){
			ModuleCGModify.$isolatePickupCheckBox.hide();
			ModuleCGModify.$showOnlyOnIsolateGroup.show();
		}else{
			ModuleCGModify.$isolatePickupCheckBox.show();
			ModuleCGModify.$showOnlyOnIsolateGroup.hide();
		}
	},

	/**
	 * Delete Group member from list.
	 * @memberof ModuleCGModify
	 * @param {HTMLElement} target - Link to the pushed button.
	 */
	deleteMemberFromTable(target) {
		const id = $(target).closest('div').attr('data-value');
		$(`#${id}`)
			.removeClass('selected-member')
			.hide();
		Form.dataChanged();
	},

	/**
	 * Initializes the dropdown for selecting users.
	 * @memberof ModuleCGModify
	 */
	initializeUsersDropDown() {
		const dropdownParams = Extensions.getDropdownSettingsOnlyInternalWithoutEmpty();
		dropdownParams.action = ModuleCGModify.cbAfterUsersSelect;
		dropdownParams.templates = { menu: ModuleCGModify.customDropdownMenu };
		ModuleCGModify.$selectUsersDropDown.dropdown(dropdownParams);
	},

	/**
	 * Customizes the dropdown menu.
	 * @memberof ModuleCGModify
	 * @param {Object} response - Response data.
	 * @param {Object} fields - Field properties.
	 * @returns {string} The HTML for the custom dropdown menu.
	 */
	customDropdownMenu(response, fields) {
		const values = response[fields.values] || {};
		let html = '';
		let oldType = '';
		$.each(values, (index, option) => {
			if (option.type !== oldType) {
				oldType = option.type;
				html += '<div class="divider"></div>';
				html += '	<div class="header">';
				html += '	<i class="tags icon"></i>';
				html += option.typeLocalized;
				html += '</div>';
			}
			const maybeText = (option[fields.text]) ? `data-text="${option[fields.text]}"` : '';
			const maybeDisabled = ($(`#ext-${option[fields.value]}`).hasClass('selected-member')) ? 'disabled ' : '';
			html += `<div class="${maybeDisabled}item" data-value="${option[fields.value]}"${maybeText}>`;
			html += option[fields.name];
			html += '</div>';
		});
		return html;
	},

	/**
	 * Callback after selecting a user in the group.
	 * @memberof ModuleCGModify
	 * @param {string} text - Selected user's text.
	 * @param {string} value - Selected user's value.
	 * @param {jQuery} $element - The jQuery element representing the selected user.
	 */
	cbAfterUsersSelect(text, value, $element) {
		$(`#ext-${value}`)
			.closest('tr')
			.addClass('selected-member')
			.show();
		$($element).addClass('disabled');
		Form.dataChanged();
	},

	/**
	 * Checks and updates button status when the module status changes.
	 * @memberof ModuleCGModify
	 */
	checkStatusToggle() {
		if (ModuleCGModify.$statusToggle.checkbox('is checked')) {
			$('[data-tab = "general"] .disability').removeClass('disabled');
			$('[data-tab="rules"] .checkbox').removeClass('disabled');
			$('[data-tab = "users"] .disability').removeClass('disabled');
		} else {
			$('[data-tab = "general"] .disability').addClass('disabled');
			$('[data-tab="rules"] .checkbox').addClass('disabled');
			$('[data-tab = "users"] .disability').addClass('disabled');
		}
	},

	/**
	 * Callback before sending the form.
	 * @memberof ModuleCGModify
	 * @param {Object} settings - Ajax request settings.
	 * @returns {Object} The modified Ajax request settings.
	 */
	cbBeforeSendForm(settings) {
		const result = settings;
		result.data = ModuleCGModify.$formObj.form('get values');
		const arrMembers = [];
		$('tr.selected-member').each((index, obj) => {
			if ($(obj).attr('id')) {
				arrMembers.push($(obj).attr('id'));
			}
		});

		result.data.members = JSON.stringify(arrMembers);
		return result;
	},

	/**
	 * Callback after sending the form.
	 * @memberof ModuleCGModify
	 */
	cbAfterSendForm() {

	},

	/**
	 * Initializes the form.
	 * @memberof ModuleCGModify
	 */
	initializeForm() {
		Form.$formObj = ModuleCGModify.$formObj;
		Form.url = `${globalRootUrl}module-users-groups/module-users-groups/save`;
		Form.validateRules = ModuleCGModify.validateRules;
		Form.cbBeforeSendForm = ModuleCGModify.cbBeforeSendForm;
		Form.cbAfterSendForm = ModuleCGModify.cbAfterSendForm;
		Form.initialize();
	},
};

$(document).ready(() => {
	ModuleCGModify.initialize();
});

