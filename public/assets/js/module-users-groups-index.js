"use strict";

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
var ModuleCGIndex = {
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
  initialize: function initialize() {
    // Initialize tab menu
    $('#main-users-groups-tab-menu .item').tab(); // Check status toggle initially

    ModuleCGIndex.checkStatusToggle(); // Add event listener for status changes

    window.addEventListener('ModuleStatusChanged', ModuleCGIndex.checkStatusToggle); // Initialize users data table

    ModuleCGIndex.initializeUsersDataTable(); // Initialize dropdowns for select group elements

    ModuleCGIndex.$selectGroup.each(function (index, obj) {
      $(obj).dropdown({
        values: ModuleCGIndex.makeDropdownList($(obj).attr('data-value'))
      });
    }); // Initialize dropdown for select group

    ModuleCGIndex.$selectGroup.dropdown({
      onChange: ModuleCGIndex.changeGroupInList
    }); // Initialize default group dropdown

    ModuleCGIndex.$defaultGroupDropdown.dropdown({
      onChange: ModuleCGIndex.changeDefaultGroup
    });
  },

  /**
   * Initializes the DataTable for users table.
   */
  initializeUsersDataTable: function initializeUsersDataTable() {
    $('#main-users-groups-tab-menu .item').tab({
      onVisible: function onVisible() {
        if ($(this).data('tab') === 'users' && ModuleCGIndex.userDataTable !== null) {
          var newPageLength = ModuleCGIndex.calculatePageLength();
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
      columns: [null, null, null, null],
      order: [1, 'asc'],
      language: SemanticLocalization.dataTableLocalisation
    });
  },

  /**
   * Checks and updates button status based on module status.
   */
  checkStatusToggle: function checkStatusToggle() {
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
  makeDropdownList: function makeDropdownList(selected) {
    var values = [];
    $('#users-groups-list option').each(function (index, obj) {
      if (selected === obj.value) {
        values.push({
          name: obj.text,
          value: obj.value,
          selected: true
        });
      } else {
        values.push({
          name: obj.text,
          value: obj.value
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
  changeGroupInList: function changeGroupInList(value, text, $choice) {
    $.api({
      url: "".concat(globalRootUrl, "module-users-groups/module-users-groups/change-user-group/"),
      on: 'now',
      method: 'POST',
      data: {
        user_id: $($choice).closest('tr').attr('id'),
        group_id: value
      },
      onSuccess: function onSuccess() {
        // Update group member counters after successful group change
        ModuleCGIndex.updateGroupCounters();
      },
      onError: function onError(response) {
        console.log(response);
      }
    });
  },

  /**
   * Update group member counters via API
   */
  updateGroupCounters: function updateGroupCounters() {
    $.ajax({
      url: '/pbxcore/api/modules/ModuleUsersGroups/getGroupsStats',
      method: 'GET',
      dataType: 'json',
      success: function success(response) {
        if (response.result === true && response.data && response.data.stats) {
          var stats = response.data.stats; // Update each group's member count in the table

          Object.keys(stats).forEach(function (groupId) {
            var count = stats[groupId];
            var $row = $("#users-groups-table tr#".concat(groupId));

            if ($row.length > 0) {
              // Find the counter cell (second td with center aligned class)
              $row.find('td.center.aligned').first().text(count);
            }
          });
        }
      },
      error: function error(xhr, status, _error) {
        console.error('ModuleUsersGroups: Failed to update group counters', _error);
      }
    });
  },

  /**
   * Handles default group change.
   * @param {string} value - The new default group value.
   * @param {string} text - The new group text.
   * @param {jQuery} $choice - The selected choice.
   */
  changeDefaultGroup: function changeDefaultGroup(value, text, $choice) {
    if (!value || value === '') {
      return;
    } // Add loading state to dropdown


    ModuleCGIndex.$defaultGroupDropdown.addClass('loading');
    $.ajax({
      url: '/pbxcore/api/modules/ModuleUsersGroups/setDefaultGroup',
      method: 'POST',
      dataType: 'json',
      data: {
        group_id: value
      },
      success: function success(response) {
        if (response.result !== true) {
          // Show error notification only on failure
          var errorMessage = response.messages && response.messages.length > 0 ? response.messages.join(', ') : 'Failed to update default group';
          UserMessage.showError(errorMessage);
        }
      },
      error: function error(xhr, status, _error2) {
        console.error('ModuleUsersGroups: Failed to set default group', _error2);
        UserMessage.showError('Failed to update default group');
      },
      complete: function complete() {
        // Remove loading state from dropdown
        ModuleCGIndex.$defaultGroupDropdown.removeClass('loading');
      }
    });
  },

  /**
   * Calculate data table page length
   *
   * @returns {number}
   */
  calculatePageLength: function calculatePageLength() {
    // Calculate row height
    var rowHeight = ModuleCGIndex.$usersTable.find('tr').first().outerHeight(); // Calculate window height and available space for table

    var windowHeight = window.innerHeight;
    var headerFooterHeight = 500; // Estimate height for header, footer, and other elements
    // Calculate new page length

    return Math.max(Math.floor((windowHeight - headerFooterHeight) / rowHeight), 10);
  }
};
/**
 * Initialize the module when the document is ready.
 */

$(document).ready(function () {
  ModuleCGIndex.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUNHSW5kZXgiLCIkc3RhdHVzVG9nZ2xlIiwiJCIsIiR1c2Vyc1RhYmxlIiwidXNlckRhdGFUYWJsZSIsIiRzZWxlY3RHcm91cCIsIiRkZWZhdWx0R3JvdXBEcm9wZG93biIsIiRkaXNhYmlsaXR5RmllbGRzIiwiaW5pdGlhbGl6ZSIsInRhYiIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSIsImVhY2giLCJpbmRleCIsIm9iaiIsImRyb3Bkb3duIiwidmFsdWVzIiwibWFrZURyb3Bkb3duTGlzdCIsImF0dHIiLCJvbkNoYW5nZSIsImNoYW5nZUdyb3VwSW5MaXN0IiwiY2hhbmdlRGVmYXVsdEdyb3VwIiwib25WaXNpYmxlIiwiZGF0YSIsIm5ld1BhZ2VMZW5ndGgiLCJjYWxjdWxhdGVQYWdlTGVuZ3RoIiwicGFnZSIsImxlbiIsImRyYXciLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJwYWdlTGVuZ3RoIiwic2Nyb2xsQ29sbGFwc2UiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwiY2hlY2tib3giLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ2YWx1ZSIsInB1c2giLCJuYW1lIiwidGV4dCIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJ1c2VyX2lkIiwiY2xvc2VzdCIsImdyb3VwX2lkIiwib25TdWNjZXNzIiwidXBkYXRlR3JvdXBDb3VudGVycyIsIm9uRXJyb3IiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJhamF4IiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwicmVzdWx0Iiwic3RhdHMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImdyb3VwSWQiLCJjb3VudCIsIiRyb3ciLCJsZW5ndGgiLCJmaW5kIiwiZmlyc3QiLCJlcnJvciIsInhociIsInN0YXR1cyIsImVycm9yTWVzc2FnZSIsIm1lc3NhZ2VzIiwiam9pbiIsIlVzZXJNZXNzYWdlIiwic2hvd0Vycm9yIiwiY29tcGxldGUiLCJyb3dIZWlnaHQiLCJvdXRlckhlaWdodCIsIndpbmRvd0hlaWdodCIsImlubmVySGVpZ2h0IiwiaGVhZGVyRm9vdGVySGVpZ2h0IiwiTWF0aCIsIm1heCIsImZsb29yIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsYUFBYSxHQUFHO0FBQ3JCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGFBQWEsRUFBRUMsQ0FBQyxDQUFDLHVCQUFELENBTEs7O0FBT3JCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFdBQVcsRUFBRUQsQ0FBQyxDQUFDLGNBQUQsQ0FYTzs7QUFhckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0UsRUFBQUEsYUFBYSxFQUFFLElBakJNOztBQW1CckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsWUFBWSxFQUFFSCxDQUFDLENBQUMsZUFBRCxDQXZCTTs7QUF5QnJCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NJLEVBQUFBLHFCQUFxQixFQUFFSixDQUFDLENBQUMsdUJBQUQsQ0E3Qkg7O0FBK0JyQjtBQUNEO0FBQ0E7QUFDQTtBQUNDSyxFQUFBQSxpQkFBaUIsRUFBRUwsQ0FBQyxDQUFDLHNCQUFELENBbkNDOztBQW9DckI7QUFDRDtBQUNBO0FBQ0NNLEVBQUFBLFVBdkNxQix3QkF1Q1I7QUFDWjtBQUNBTixJQUFBQSxDQUFDLENBQUMsbUNBQUQsQ0FB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T0FBaEU7QUFDQU0sUUFBQUEsV0FBVyxDQUFDQyxTQUFaLENBQXNCLGdDQUF0QjtBQUNBLE9BbkJLO0FBb0JOQyxNQUFBQSxRQXBCTSxzQkFvQks7QUFDVjtBQUNBdEYsUUFBQUEsYUFBYSxDQUFDTSxxQkFBZCxDQUFvQ29DLFdBQXBDLENBQWdELFNBQWhEO0FBQ0E7QUF2QkssS0FBUDtBQXlCQSxHQXJPb0I7O0FBdU9yQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0NmLEVBQUFBLG1CQTVPcUIsaUNBNE9DO0FBQ3JCO0FBQ0EsUUFBSTRELFNBQVMsR0FBR3ZGLGFBQWEsQ0FBQ0csV0FBZCxDQUEwQnlFLElBQTFCLENBQStCLElBQS9CLEVBQXFDQyxLQUFyQyxHQUE2Q1csV0FBN0MsRUFBaEIsQ0FGcUIsQ0FHckI7O0FBQ0EsUUFBTUMsWUFBWSxHQUFHOUUsTUFBTSxDQUFDK0UsV0FBNUI7QUFDQSxRQUFNQyxrQkFBa0IsR0FBRyxHQUEzQixDQUxxQixDQUtXO0FBRWhDOztBQUNBLFdBQU9DLElBQUksQ0FBQ0MsR0FBTCxDQUFTRCxJQUFJLENBQUNFLEtBQUwsQ0FBVyxDQUFDTCxZQUFZLEdBQUdFLGtCQUFoQixJQUFzQ0osU0FBakQsQ0FBVCxFQUFzRSxFQUF0RSxDQUFQO0FBQ0E7QUFyUG9CLENBQXRCO0FBd1BBO0FBQ0E7QUFDQTs7QUFDQXJGLENBQUMsQ0FBQzZGLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJoRyxFQUFBQSxhQUFhLENBQUNRLFVBQWQ7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIFNlbWFudGljTG9jYWxpemF0aW9uLCBnbG9iYWxSb290VXJsLCBEYXRhdGFibGUgKi9cblxuLyoqXG4gKiBNb2R1bGUgZm9yIG1hbmFnaW5nIGNhbGwgZ3JvdXBzIGFuZCByZWxhdGVkIGZ1bmN0aW9uYWxpdHkuXG4gKiBAbmFtZXNwYWNlXG4gKi9cbmNvbnN0IE1vZHVsZUNHSW5kZXggPSB7XG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3RhdHVzIHRvZ2dsZS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgdXNlcnMgdGFibGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdXNlcnNUYWJsZTogJCgnI3VzZXJzLXRhYmxlJyksXG5cblx0LyoqXG5cdCAqIFVzZXIgZGF0YSB0YWJsZS5cblx0ICogQHR5cGUge0RhdGF0YWJsZX1cblx0ICovXG5cdHVzZXJEYXRhVGFibGU6IG51bGwsXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHNlbGVjdCBncm91cCBlbGVtZW50cy5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzZWxlY3RHcm91cDogJCgnLnNlbGVjdC1ncm91cCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciBkZWZhdWx0IGdyb3VwIGRyb3Bkb3duLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGRlZmF1bHRHcm91cERyb3Bkb3duOiAkKCcuc2VsZWN0LWRlZmF1bHQtZ3JvdXAnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgY3VycmVudCBmb3JtIGRpc2FiaWxpdHkgZmllbGRzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZGlzYWJpbGl0eUZpZWxkczogJCgnI21vZHVsZS11c2Vycy1ncm91cHMnKSxcblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdC8vIEluaXRpYWxpemUgdGFiIG1lbnVcblx0XHQkKCcjbWFpbi11c2Vycy1ncm91cHMtdGFiLW1lbnUgLml0ZW0nKS50YWIoKTtcblxuXHRcdC8vIENoZWNrIHN0YXR1cyB0b2dnbGUgaW5pdGlhbGx5XG5cdFx0TW9kdWxlQ0dJbmRleC5jaGVja1N0YXR1c1RvZ2dsZSgpO1xuXHRcdC8vIEFkZCBldmVudCBsaXN0ZW5lciBmb3Igc3RhdHVzIGNoYW5nZXNcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignTW9kdWxlU3RhdHVzQ2hhbmdlZCcsIE1vZHVsZUNHSW5kZXguY2hlY2tTdGF0dXNUb2dnbGUpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB1c2VycyBkYXRhIHRhYmxlXG5cdFx0TW9kdWxlQ0dJbmRleC5pbml0aWFsaXplVXNlcnNEYXRhVGFibGUoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgZHJvcGRvd25zIGZvciBzZWxlY3QgZ3JvdXAgZWxlbWVudHNcblx0XHRNb2R1bGVDR0luZGV4LiRzZWxlY3RHcm91cC5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHQkKG9iaikuZHJvcGRvd24oe1xuXHRcdFx0XHR2YWx1ZXM6IE1vZHVsZUNHSW5kZXgubWFrZURyb3Bkb3duTGlzdCgkKG9iaikuYXR0cignZGF0YS12YWx1ZScpKSxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBkcm9wZG93biBmb3Igc2VsZWN0IGdyb3VwXG5cdFx0TW9kdWxlQ0dJbmRleC4kc2VsZWN0R3JvdXAuZHJvcGRvd24oe1xuXHRcdFx0b25DaGFuZ2U6IE1vZHVsZUNHSW5kZXguY2hhbmdlR3JvdXBJbkxpc3QsXG5cdFx0fSk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRlZmF1bHQgZ3JvdXAgZHJvcGRvd25cblx0XHRNb2R1bGVDR0luZGV4LiRkZWZhdWx0R3JvdXBEcm9wZG93bi5kcm9wZG93bih7XG5cdFx0XHRvbkNoYW5nZTogTW9kdWxlQ0dJbmRleC5jaGFuZ2VEZWZhdWx0R3JvdXAsXG5cdFx0fSk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIERhdGFUYWJsZSBmb3IgdXNlcnMgdGFibGUuXG5cdCAqL1xuXHRpbml0aWFsaXplVXNlcnNEYXRhVGFibGUoKSB7XG5cblx0XHQkKCcjbWFpbi11c2Vycy1ncm91cHMtdGFiLW1lbnUgLml0ZW0nKS50YWIoe1xuXHRcdFx0b25WaXNpYmxlKCl7XG5cdFx0XHRcdGlmICgkKHRoaXMpLmRhdGEoJ3RhYicpPT09J3VzZXJzJyAmJiBNb2R1bGVDR0luZGV4LnVzZXJEYXRhVGFibGUhPT1udWxsKXtcblx0XHRcdFx0XHRjb25zdCBuZXdQYWdlTGVuZ3RoID0gTW9kdWxlQ0dJbmRleC5jYWxjdWxhdGVQYWdlTGVuZ3RoKCk7XG5cdFx0XHRcdFx0TW9kdWxlQ0dJbmRleC51c2VyRGF0YVRhYmxlLnBhZ2UubGVuKG5ld1BhZ2VMZW5ndGgpLmRyYXcoZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVDR0luZGV4LnVzZXJEYXRhVGFibGUgPSBNb2R1bGVDR0luZGV4LiR1c2Vyc1RhYmxlLkRhdGFUYWJsZSh7XG5cdFx0XHQvLyBkZXN0cm95OiB0cnVlLFxuXHRcdFx0bGVuZ3RoQ2hhbmdlOiBmYWxzZSxcblx0XHRcdHBhZ2luZzogdHJ1ZSxcblx0XHRcdHBhZ2VMZW5ndGg6IE1vZHVsZUNHSW5kZXguY2FsY3VsYXRlUGFnZUxlbmd0aCgpLFxuXHRcdFx0c2Nyb2xsQ29sbGFwc2U6IHRydWUsXG5cdFx0XHRjb2x1bW5zOiBbXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRdLFxuXHRcdFx0b3JkZXI6IFsxLCAnYXNjJ10sXG5cdFx0XHRsYW5ndWFnZTogU2VtYW50aWNMb2NhbGl6YXRpb24uZGF0YVRhYmxlTG9jYWxpc2F0aW9uLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgYW5kIHVwZGF0ZXMgYnV0dG9uIHN0YXR1cyBiYXNlZCBvbiBtb2R1bGUgc3RhdHVzLlxuXHQgKi9cblx0Y2hlY2tTdGF0dXNUb2dnbGUoKSB7XG5cdFx0aWYgKE1vZHVsZUNHSW5kZXguJHN0YXR1c1RvZ2dsZS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRNb2R1bGVDR0luZGV4LiRkaXNhYmlsaXR5RmllbGRzLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVDR0luZGV4LiRkaXNhYmlsaXR5RmllbGRzLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogUHJlcGFyZXMgYSBkcm9wZG93biBsaXN0IGZvciB1c2VyIHNlbGVjdGlvbi5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdGVkIC0gVGhlIHNlbGVjdGVkIHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IC0gVGhlIHByZXBhcmVkIGRyb3Bkb3duIGxpc3QuXG5cdCAqL1xuXHRtYWtlRHJvcGRvd25MaXN0KHNlbGVjdGVkKSB7XG5cdFx0Y29uc3QgdmFsdWVzID0gW107XG5cdFx0JCgnI3VzZXJzLWdyb3Vwcy1saXN0IG9wdGlvbicpLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdGlmIChzZWxlY3RlZCA9PT0gb2JqLnZhbHVlKSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBvYmoudGV4dCxcblx0XHRcdFx0XHR2YWx1ZTogb2JqLnZhbHVlLFxuXHRcdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBvYmoudGV4dCxcblx0XHRcdFx0XHR2YWx1ZTogb2JqLnZhbHVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdmFsdWVzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGdyb3VwIGNoYW5nZSBpbiB0aGUgbGlzdC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIG5ldyBncm91cCB2YWx1ZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgbmV3IGdyb3VwIHRleHQuXG5cdCAqIEBwYXJhbSB7alF1ZXJ5fSAkY2hvaWNlIC0gVGhlIHNlbGVjdGVkIGNob2ljZS5cblx0ICovXG5cdGNoYW5nZUdyb3VwSW5MaXN0KHZhbHVlLCB0ZXh0LCAkY2hvaWNlKSB7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvbW9kdWxlLXVzZXJzLWdyb3Vwcy9jaGFuZ2UtdXNlci1ncm91cC9gLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHVzZXJfaWQ6ICQoJGNob2ljZSkuY2xvc2VzdCgndHInKS5hdHRyKCdpZCcpLFxuXHRcdFx0XHRncm91cF9pZDogdmFsdWUsXG5cdFx0XHR9LFxuXHRcdFx0b25TdWNjZXNzKCkge1xuXHRcdFx0XHQvLyBVcGRhdGUgZ3JvdXAgbWVtYmVyIGNvdW50ZXJzIGFmdGVyIHN1Y2Nlc3NmdWwgZ3JvdXAgY2hhbmdlXG5cdFx0XHRcdE1vZHVsZUNHSW5kZXgudXBkYXRlR3JvdXBDb3VudGVycygpO1xuXHRcdFx0fSxcblx0XHRcdG9uRXJyb3IocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0fSxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIGdyb3VwIG1lbWJlciBjb3VudGVycyB2aWEgQVBJXG5cdCAqL1xuXHR1cGRhdGVHcm91cENvdW50ZXJzKCkge1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6ICcvcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVVc2Vyc0dyb3Vwcy9nZXRHcm91cHNTdGF0cycsXG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnJlc3VsdCA9PT0gdHJ1ZSAmJiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGEuc3RhdHMpIHtcblx0XHRcdFx0XHRjb25zdCBzdGF0cyA9IHJlc3BvbnNlLmRhdGEuc3RhdHM7XG5cblx0XHRcdFx0XHQvLyBVcGRhdGUgZWFjaCBncm91cCdzIG1lbWJlciBjb3VudCBpbiB0aGUgdGFibGVcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaCgoZ3JvdXBJZCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgY291bnQgPSBzdGF0c1tncm91cElkXTtcblx0XHRcdFx0XHRcdGNvbnN0ICRyb3cgPSAkKGAjdXNlcnMtZ3JvdXBzLXRhYmxlIHRyIyR7Z3JvdXBJZH1gKTtcblx0XHRcdFx0XHRcdGlmICgkcm93Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gRmluZCB0aGUgY291bnRlciBjZWxsIChzZWNvbmQgdGQgd2l0aCBjZW50ZXIgYWxpZ25lZCBjbGFzcylcblx0XHRcdFx0XHRcdFx0JHJvdy5maW5kKCd0ZC5jZW50ZXIuYWxpZ25lZCcpLmZpcnN0KCkudGV4dChjb3VudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRlcnJvcih4aHIsIHN0YXR1cywgZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignTW9kdWxlVXNlcnNHcm91cHM6IEZhaWxlZCB0byB1cGRhdGUgZ3JvdXAgY291bnRlcnMnLCBlcnJvcik7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGRlZmF1bHQgZ3JvdXAgY2hhbmdlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgbmV3IGRlZmF1bHQgZ3JvdXAgdmFsdWUuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIG5ldyBncm91cCB0ZXh0LlxuXHQgKiBAcGFyYW0ge2pRdWVyeX0gJGNob2ljZSAtIFRoZSBzZWxlY3RlZCBjaG9pY2UuXG5cdCAqL1xuXHRjaGFuZ2VEZWZhdWx0R3JvdXAodmFsdWUsIHRleHQsICRjaG9pY2UpIHtcblx0XHRpZiAoIXZhbHVlIHx8IHZhbHVlID09PSAnJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEFkZCBsb2FkaW5nIHN0YXRlIHRvIGRyb3Bkb3duXG5cdFx0TW9kdWxlQ0dJbmRleC4kZGVmYXVsdEdyb3VwRHJvcGRvd24uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcblxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6ICcvcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVVc2Vyc0dyb3Vwcy9zZXREZWZhdWx0R3JvdXAnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRncm91cF9pZDogdmFsdWUsXG5cdFx0XHR9LFxuXHRcdFx0c3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UucmVzdWx0ICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0Ly8gU2hvdyBlcnJvciBub3RpZmljYXRpb24gb25seSBvbiBmYWlsdXJlXG5cdFx0XHRcdFx0Y29uc3QgZXJyb3JNZXNzYWdlID0gcmVzcG9uc2UubWVzc2FnZXMgJiYgcmVzcG9uc2UubWVzc2FnZXMubGVuZ3RoID4gMFxuXHRcdFx0XHRcdFx0PyByZXNwb25zZS5tZXNzYWdlcy5qb2luKCcsICcpXG5cdFx0XHRcdFx0XHQ6ICdGYWlsZWQgdG8gdXBkYXRlIGRlZmF1bHQgZ3JvdXAnO1xuXHRcdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dFcnJvcihlcnJvck1lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3IoeGhyLCBzdGF0dXMsIGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ01vZHVsZVVzZXJzR3JvdXBzOiBGYWlsZWQgdG8gc2V0IGRlZmF1bHQgZ3JvdXAnLCBlcnJvcik7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dFcnJvcignRmFpbGVkIHRvIHVwZGF0ZSBkZWZhdWx0IGdyb3VwJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29tcGxldGUoKSB7XG5cdFx0XHRcdC8vIFJlbW92ZSBsb2FkaW5nIHN0YXRlIGZyb20gZHJvcGRvd25cblx0XHRcdFx0TW9kdWxlQ0dJbmRleC4kZGVmYXVsdEdyb3VwRHJvcGRvd24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSBkYXRhIHRhYmxlIHBhZ2UgbGVuZ3RoXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRjYWxjdWxhdGVQYWdlTGVuZ3RoKCkge1xuXHRcdC8vIENhbGN1bGF0ZSByb3cgaGVpZ2h0XG5cdFx0bGV0IHJvd0hlaWdodCA9IE1vZHVsZUNHSW5kZXguJHVzZXJzVGFibGUuZmluZCgndHInKS5maXJzdCgpLm91dGVySGVpZ2h0KCk7XG5cdFx0Ly8gQ2FsY3VsYXRlIHdpbmRvdyBoZWlnaHQgYW5kIGF2YWlsYWJsZSBzcGFjZSBmb3IgdGFibGVcblx0XHRjb25zdCB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0Y29uc3QgaGVhZGVyRm9vdGVySGVpZ2h0ID0gNTAwOyAvLyBFc3RpbWF0ZSBoZWlnaHQgZm9yIGhlYWRlciwgZm9vdGVyLCBhbmQgb3RoZXIgZWxlbWVudHNcblxuXHRcdC8vIENhbGN1bGF0ZSBuZXcgcGFnZSBsZW5ndGhcblx0XHRyZXR1cm4gTWF0aC5tYXgoTWF0aC5mbG9vcigod2luZG93SGVpZ2h0IC0gaGVhZGVyRm9vdGVySGVpZ2h0KSAvIHJvd0hlaWdodCksIDEwKTtcblx0fSxcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgbW9kdWxlIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5LlxuICovXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUNHSW5kZXguaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==