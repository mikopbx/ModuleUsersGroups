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

/* global SemanticLocalization, globalRootUrl, Datatable */

/**
 * Module for managing call groups and related functionality.
 * @namespace
 */
const ModuleCGIndex = {
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
	 * User data table.
	 * @type {Datatable}
	 */
	userDataTable: null,

	/**
	 * jQuery object for select group elements.
	 * @type {jQuery}
	 */
	$selectGroup: $('.select-group'),

	/**
	 * jQuery object for default group dropdown.
	 * @type {jQuery}
	 */
	$defaultGroupDropdown: $('.select-default-group'),

	/**
	 * jQuery object for current form disability fields
	 * @type {jQuery}
	 */
	$disabilityFields: $('#module-users-groups'),
	/**
	 * Initializes the module.
	 */
	initialize() {
		// Initialize tab menu
		$('#main-users-groups-tab-menu .item').tab();

		// Check status toggle initially
		ModuleCGIndex.checkStatusToggle();
		// Add event listener for status changes
		window.addEventListener('ModuleStatusChanged', ModuleCGIndex.checkStatusToggle);

		// Initialize users data table
		ModuleCGIndex.initializeUsersDataTable();

		// Initialize dropdowns for select group elements
		ModuleCGIndex.$selectGroup.each((index, obj) => {
			$(obj).dropdown({
				values: ModuleCGIndex.makeDropdownList($(obj).attr('data-value')),
			});
		});

		// Initialize dropdown for select group
		ModuleCGIndex.$selectGroup.dropdown({
			onChange: ModuleCGIndex.changeGroupInList,
		});

		// Initialize default group dropdown
		ModuleCGIndex.$defaultGroupDropdown.dropdown({
			onChange: ModuleCGIndex.changeDefaultGroup,
		});

	},

	/**
	 * Initializes the DataTable for users table.
	 */
	initializeUsersDataTable() {

		$('#main-users-groups-tab-menu .item').tab({
			onVisible(){
				if ($(this).data('tab')==='users' && ModuleCGIndex.userDataTable!==null){
					const newPageLength = ModuleCGIndex.calculatePageLength();
					ModuleCGIndex.userDataTable.page.len(newPageLength).draw(false);
				}
			}
		});

		ModuleCGIndex.userDataTable = ModuleCGIndex.$usersTable.DataTable({
			// destroy: true,
			lengthChange: false,
			paging: true,
			pageLength: ModuleCGIndex.calculatePageLength(),
			scrollCollapse: true,
			columns: [
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
		if (ModuleCGIndex.$statusToggle.checkbox('is checked')) {
			ModuleCGIndex.$disabilityFields.removeClass('disabled');
		} else {
			ModuleCGIndex.$disabilityFields.addClass('disabled');
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
			if (selected === obj.value) {
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
				// Update group member counters after successful group change
				ModuleCGIndex.updateGroupCounters();
			},
			onError(response) {
				console.log(response);
			},
		});
	},

	/**
	 * Update group member counters via API
	 */
	updateGroupCounters() {
		$.ajax({
			url: '/pbxcore/api/modules/ModuleUsersGroups/getGroupsStats',
			method: 'GET',
			dataType: 'json',
			success(response) {
				if (response.result === true && response.data && response.data.stats) {
					const stats = response.data.stats;

					// Update each group's member count in the table
					Object.keys(stats).forEach((groupId) => {
						const count = stats[groupId];
						const $row = $(`#users-groups-table tr#${groupId}`);
						if ($row.length > 0) {
							// Find the counter cell (second td with center aligned class)
							$row.find('td.center.aligned').first().text(count);
						}
					});
				}
			},
			error(xhr, status, error) {
				console.error('ModuleUsersGroups: Failed to update group counters', error);
			},
		});
	},

	/**
	 * Handles default group change.
	 * @param {string} value - The new default group value.
	 * @param {string} text - The new group text.
	 * @param {jQuery} $choice - The selected choice.
	 */
	changeDefaultGroup(value, text, $choice) {
		if (!value || value === '') {
			return;
		}

		// Add loading state to dropdown
		ModuleCGIndex.$defaultGroupDropdown.addClass('loading');

		$.ajax({
			url: '/pbxcore/api/modules/ModuleUsersGroups/setDefaultGroup',
			method: 'POST',
			dataType: 'json',
			data: {
				group_id: value,
			},
			success(response) {
				if (response.result !== true) {
					// Show error notification only on failure
					const errorMessage = response.messages && response.messages.length > 0
						? response.messages.join(', ')
						: 'Failed to update default group';
					UserMessage.showError(errorMessage);
				}
			},
			error(xhr, status, error) {
				console.error('ModuleUsersGroups: Failed to set default group', error);
				UserMessage.showError('Failed to update default group');
			},
			complete() {
				// Remove loading state from dropdown
				ModuleCGIndex.$defaultGroupDropdown.removeClass('loading');
			},
		});
	},

	/**
	 * Calculate data table page length
	 *
	 * @returns {number}
	 */
	calculatePageLength() {
		// Calculate row height
		let rowHeight = ModuleCGIndex.$usersTable.find('tr').first().outerHeight();
		// Calculate window height and available space for table
		const windowHeight = window.innerHeight;
		const headerFooterHeight = 500; // Estimate height for header, footer, and other elements

		// Calculate new page length
		return Math.max(Math.floor((windowHeight - headerFooterHeight) / rowHeight), 10);
	},
};

/**
 * Initialize the module when the document is ready.
 */
$(document).ready(() => {
	ModuleCGIndex.initialize();
});

