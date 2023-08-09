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

/**
 * Module for managing call groups and related functionality.
 * @namespace
 */
const ModuleUsersGroups = {
	/**
	 * jQuery object for the status toggle.
	 * @type {jQuery}
	 */
	$statusToggle: $('#module-status-toggle'),

	/**
	 * jQuery object for the users table.
	 * @type {jQuery}
	 */
	$usersTable: $('#users-table'),

	/**
	 * jQuery object for select group elements.
	 * @type {jQuery}
	 */
	$selectGroup: $('.select-group'),

	/**
	 * jQuery object for select default group elements.
	 * @type {jQuery}
	 */
	$selectDefaultGroup: $('.select-default-group'),

	/**
	 * Initializes the module.
	 */
	initialize() {
		// Initialize tab menu
		$('#main-users-groups-tab-menu .item').tab();

		// Check status toggle initially
		ModuleUsersGroups.checkStatusToggle();
		// Add event listener for status changes
		window.addEventListener('ModuleStatusChanged', ModuleUsersGroups.checkStatusToggle);
		// Initialize data table
		ModuleUsersGroups.initializeDataTable();

		// Initialize dropdowns for select group elements
		ModuleUsersGroups.$selectGroup.each((index, obj) => {
			$(obj).dropdown({
				values: ModuleUsersGroups.makeDropdownList($(obj).attr('data-value')),
			});
		});

		// Initialize dropdown for select group
		ModuleUsersGroups.$selectGroup.dropdown({
			onChange: ModuleUsersGroups.changeGroupInList,
		});

		// Initialize dropdown for select default group
		ModuleUsersGroups.$selectDefaultGroup.dropdown();
	},

	/**
	 * Initializes the DataTable for users table.
	 */
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
	 * Checks and updates button status based on module status.
	 */
	checkStatusToggle() {
		if (ModuleUsersGroups.$statusToggle.checkbox('is checked')) {
			ModuleUsersGroups.$disabilityFields.removeClass('disabled');
		} else {
			ModuleUsersGroups.$disabilityFields.addClass('disabled');
		}
	},

	/**
	 * Prepares a dropdown list for user selection.
	 * @param {string} selected - The selected value.
	 * @returns {Array} - The prepared dropdown list.
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
	 * Handles group change in the list.
	 * @param {string} value - The new group value.
	 * @param {string} text - The new group text.
	 * @param {jQuery} $choice - The selected choice.
	 */
	changeGroupInList(value, text, $choice) {
		$.api({
			url: `${globalRootUrl}module-users-groups/module-users-groups/change-user-group/`,
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

/**
 * Initialize the module when the document is ready.
 */
$(document).ready(() => {
	ModuleUsersGroups.initialize();
});

