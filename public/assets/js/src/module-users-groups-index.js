/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 11 2019
 *
 */
/* global SemanticLocalization, globalRootUrl */

const ModuleUsersGroups = {
	$formObj: $('#module-user-groups-form'),
	$disabilityFields: $('#module-user-groups-form  .disability'),
	$statusToggle: $('#module-status-toggle'),
	$usersTable: $('#users-table'),
	initialize() {
		$('#main-users-groups-tab-menu .item').tab();
		ModuleUsersGroups.checkStatusToggle();
		window.addEventListener('ModuleStatusChanged', ModuleUsersGroups.checkStatusToggle);
		ModuleUsersGroups.initializeDataTable();
		$('.select-group').each((index, obj) => {
			$(obj).dropdown({
				values: ModuleUsersGroups.makeDropdownList($(obj).attr('data-value')),
			});
		});
		$('.select-group').dropdown({
			onChange: ModuleUsersGroups.changeGroupInList,
		});
	},
	initializeDataTable() {
		ModuleUsersGroups.$usersTable.DataTable({
			// destroy: true,
			lengthChange: false,
			paging: false,
			columns: [
				null,
				null,
				null,
				null,
				null,
			],
			order: [1, 'asc'],
			language: SemanticLocalization.dataTableLocalisation,
		});
	},
	/**
	 * Изменение статуса кнопок при изменении статуса модуля
	 */
	checkStatusToggle() {
		if (ModuleUsersGroups.$statusToggle.checkbox('is checked')) {
			ModuleUsersGroups.$disabilityFields.removeClass('disabled');
		} else {
			ModuleUsersGroups.$disabilityFields.addClass('disabled');
		}
	},
	/**
	 * Подготавливает список выбора пользователей
	 * @param selected
	 * @returns {[]}
	 */
	makeDropdownList(selected) {
		const values = [];
		$('#users-groups-list option').each((index, obj) => {
			if (selected === obj.text) {
				values.push({
					name: obj.text,
					value: obj.value,
					selected: true,
				});
			} else {
				values.push({
					name: obj.text,
					value: obj.value,
				});
			}
		});
		return values;
	},
	/**
	 * Обработка изменения группы в списке
	 */
	changeGroupInList(value, text, $choice) {
		$.api({
			url: `${globalRootUrl}module-users-groups/changeUserGroup/`,
			on: 'now',
			method: 'POST',
			data: {
				user_id: $($choice).closest('tr').attr('id'),
				group_id: value,
			},
			onSuccess() {
				//	ModuleUsersGroups.initializeDataTable();
				//	console.log('updated');
			},
			onError(response) {
				console.log(response);
			},
		});
	},
};

$(document).ready(() => {
	ModuleUsersGroups.initialize();
});

