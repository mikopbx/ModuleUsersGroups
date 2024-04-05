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
				//	ModuleCGIndex.initializeDataTable();
				//	console.log('updated');
			},
			onError(response) {
				console.log(response);
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

