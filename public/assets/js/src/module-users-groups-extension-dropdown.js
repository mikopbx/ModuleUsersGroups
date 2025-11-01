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

/* global globalRootUrl, PbxApi */

/**
 * ModuleUsersGroupsExtensionDropdown - Initialize user groups dropdown on extension edit page
 * Works with both old and new MikoPBX releases via FormPopulated event
 */
const ModuleUsersGroupsExtensionDropdown = {
    /**
     * jQuery object for the dropdown
     */
    $dropdown: $('#mod_usrgr_select_group_dropdown'),

    /**
     * Hidden input field for storing selected value
     */
    $hiddenInput: $('#mod_usrgr_select_group'),

    /**
     * Initialize the dropdown
     */
    initialize() {
        // Check if dropdown element exists
        if (ModuleUsersGroupsExtensionDropdown.$dropdown.length === 0) {
            return;
        }

        // Initialize Fomantic UI dropdown (items are already in HTML from server)
        ModuleUsersGroupsExtensionDropdown.$dropdown.dropdown({
            onChange(value) {
                // Sync value to hidden input
                ModuleUsersGroupsExtensionDropdown.$hiddenInput.val(value);

                // Trigger form change to enable save button
                if (typeof Form !== 'undefined' && typeof Form.dataChanged === 'function') {
                    Form.dataChanged();
                }
            },
            clearable: false,
            fullTextSearch: true,
            forceSelection: false
        });

        // Smart initialization - check if user_id or id exists in DOM
        // Old release: <input name="user_id">
        // New release: <input name="id">
        const userId = $('#user_id').val() || $('#id').val();

        if (userId && userId !== '' && userId !== 'new') {
            // Existing user - load their group
            ModuleUsersGroupsExtensionDropdown.loadUserGroup(userId);
        } else {
            // New user - load default group
            ModuleUsersGroupsExtensionDropdown.loadDefaultGroup();
        }

        // Listen for form population event (for new release with AJAX forms)
        $(document).on('FormPopulated', (event, formData) => {
            // Get user ID from DOM (new release always uses 'id')
            const populatedUserId = $('#id').val();

            if (populatedUserId && populatedUserId !== '' && populatedUserId !== 'new') {
                // Load user's actual group (will override default)
                ModuleUsersGroupsExtensionDropdown.loadUserGroup(populatedUserId);
            }
        });
    },

    /**
     * Update dropdown value from hidden input
     */
    updateDropdownValue() {
        const value = ModuleUsersGroupsExtensionDropdown.$hiddenInput.val();

        if (value && value !== '') {
            ModuleUsersGroupsExtensionDropdown.$dropdown.dropdown('set selected', String(value));
        }
    },

    /**
     * Load default group from module API
     */
    loadDefaultGroup() {
        $.ajax({
            url: '/pbxcore/api/modules/ModuleUsersGroups/getDefaultGroup',
            method: 'POST',
            dataType: 'json',
            success(response) {
                if (response.result === true && response.data && response.data.group_id) {
                    // Set value to hidden input
                    ModuleUsersGroupsExtensionDropdown.$hiddenInput.val(response.data.group_id);

                    // Update dropdown
                    ModuleUsersGroupsExtensionDropdown.updateDropdownValue();
                }
            },
            error(xhr, status, error) {
                console.error('ModuleUsersGroups: Failed to load default group', error);
            }
        });
    },

    /**
     * Load user's group from module API
     * @param {string|number} userId - User ID
     */
    loadUserGroup(userId) {
        if (!userId) {
            // For new users, load default group
            ModuleUsersGroupsExtensionDropdown.loadDefaultGroup();
            return;
        }

        $.ajax({
            url: '/pbxcore/api/modules/ModuleUsersGroups/getUserGroup',
            method: 'POST',
            dataType: 'json',
            data: {user_id: userId},
            success(response) {
                if (response.result === true && response.data && response.data.group_id) {
                    // Set value to hidden input
                    ModuleUsersGroupsExtensionDropdown.$hiddenInput.val(response.data.group_id);

                    // Update dropdown
                    ModuleUsersGroupsExtensionDropdown.updateDropdownValue();
                }
            },
            error(xhr, status, error) {
                console.error('ModuleUsersGroups: Failed to load user group', error);
            }
        });
    }
};

// Initialize when document is ready
$(document).ready(() => {
    ModuleUsersGroupsExtensionDropdown.initialize();
});
