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

