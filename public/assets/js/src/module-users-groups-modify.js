/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 11 2019
 *
 */

/* global globalRootUrl,globalTranslate, Form, Extensions */


const moduleUsersGroups = {
	$formObj: $('#module-users-groups-form'),
	$rulesCheckBoxes: $('#outbound-rules-table .checkbox'),
	$selectUsersDropDown: $('.select-extension-field'),
	$dirrtyField: $('#dirrty'),
	$statusToggle: $('#module-status-toggle'),
	defaultExtension: '',
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
	initialize() {
		moduleUsersGroups.checkStatusToggle();
		window.addEventListener('ModuleStatusChanged', moduleUsersGroups.checkStatusToggle);
		moduleUsersGroups.initializeForm();
		$('.avatar').each(() => {
			if ($(this).attr('src') === '') {
				$(this).attr('src', `${globalRootUrl}assets/img/unknownPerson.jpg`);
			}
		});
		$('#module-users-group-modify-menu .item').tab();

		moduleUsersGroups.$rulesCheckBoxes.checkbox({
			onChange() {
				moduleUsersGroups.$dirrtyField.val(Math.random());
				moduleUsersGroups.$dirrtyField.trigger('change');
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

		moduleUsersGroups.initializeUsersDropDown();

		$('body').on('click', 'div.delete-user-row', (e) => {
			e.preventDefault();
			moduleUsersGroups.deleteMemberFromTable(e.target);
		});

		$('#isolate').parent().checkbox({
			onChange: moduleUsersGroups.changeIsolate
		});
		moduleUsersGroups.changeIsolate();
	},

	changeIsolate(){
		if($('#isolate').parent().checkbox('is checked')){
			$("#isolatePickUp").parent().hide();
		}else{
			$("#isolatePickUp").parent().show();
		}
	},
	/**
	 * Delete Group member from list
	 * @param target - link to pushed button
	 */
	deleteMemberFromTable(target) {
		const id = $(target).closest('div').attr('data-value');
		$(`#${id}`)
			.removeClass('selected-member')
			.hide();
		moduleUsersGroups.$dirrtyField.val(Math.random());
		moduleUsersGroups.$dirrtyField.trigger('change');
	},
	/**
	 * Настройка выпадающего списка пользователей
	 */
	initializeUsersDropDown() {
		const dropdownParams = Extensions.getDropdownSettingsOnlyInternalWithoutEmpty();
		dropdownParams.action = moduleUsersGroups.cbAfterUsersSelect;
		dropdownParams.templates = { menu: moduleUsersGroups.customDropdownMenu };
		moduleUsersGroups.$selectUsersDropDown.dropdown(dropdownParams);
	},
	/**
	 * Change custom menu visualisation
	 * @param response
	 * @param fields
	 * @returns {string}
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
	 * Колбек после выбора пользователя в группу
	 * @param value
	 */
	cbAfterUsersSelect(text, value, $element) {
		$(`#ext-${value}`)
			.closest('tr')
			.addClass('selected-member')
			.show();
		$($element).addClass('disabled');
		moduleUsersGroups.$dirrtyField.val(Math.random());
		moduleUsersGroups.$dirrtyField.trigger('change');
	},
	/**
	 * Изменение статуса кнопок при изменении статуса модуля
	 */
	checkStatusToggle() {
		if (moduleUsersGroups.$statusToggle.checkbox('is checked')) {
			$('[data-tab = "general"] .disability').removeClass('disabled');
			$('[data-tab="rules"] .checkbox').removeClass('disabled');
			$('[data-tab = "users"] .disability').removeClass('disabled');
		} else {
			$('[data-tab = "general"] .disability').addClass('disabled');
			$('[data-tab="rules"] .checkbox').addClass('disabled');
			$('[data-tab = "users"] .disability').addClass('disabled');
		}
	},
	cbBeforeSendForm(settings) {
		const result = settings;
		result.data = moduleUsersGroups.$formObj.form('get values');
		const arrMembers = [];
		$('tr.selected-member').each((index, obj) => {
			if ($(obj).attr('id')) {
				arrMembers.push($(obj).attr('id'));
			}
		});

		result.data.members = JSON.stringify(arrMembers);
		return result;
	},
	cbAfterSendForm() {

	},
	initializeForm() {
		Form.$formObj = moduleUsersGroups.$formObj;
		Form.url = `${globalRootUrl}module-users-groups/save`;
		Form.validateRules = moduleUsersGroups.validateRules;
		Form.cbBeforeSendForm = moduleUsersGroups.cbBeforeSendForm;
		Form.cbAfterSendForm = moduleUsersGroups.cbAfterSendForm;
		Form.initialize();
	},
};

$(document).ready(() => {
	moduleUsersGroups.initialize();
});

