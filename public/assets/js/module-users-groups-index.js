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
      onSuccess: function onSuccess() {//	ModuleCGIndex.initializeDataTable();
        //	console.log('updated');
      },
      onError: function onError(response) {
        console.log(response);
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
      error: function error(xhr, status, _error) {
        console.error('ModuleUsersGroups: Failed to set default group', _error);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUNHSW5kZXgiLCIkc3RhdHVzVG9nZ2xlIiwiJCIsIiR1c2Vyc1RhYmxlIiwidXNlckRhdGFUYWJsZSIsIiRzZWxlY3RHcm91cCIsIiRkZWZhdWx0R3JvdXBEcm9wZG93biIsIiRkaXNhYmlsaXR5RmllbGRzIiwiaW5pdGlhbGl6ZSIsInRhYiIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSIsImVhY2giLCJpbmRleCIsIm9iaiIsImRyb3Bkb3duIiwidmFsdWVzIiwibWFrZURyb3Bkb3duTGlzdCIsImF0dHIiLCJvbkNoYW5nZSIsImNoYW5nZUdyb3VwSW5MaXN0IiwiY2hhbmdlRGVmYXVsdEdyb3VwIiwib25WaXNpYmxlIiwiZGF0YSIsIm5ld1BhZ2VMZW5ndGgiLCJjYWxjdWxhdGVQYWdlTGVuZ3RoIiwicGFnZSIsImxlbiIsImRyYXciLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJwYWdlTGVuZ3RoIiwic2Nyb2xsQ29sbGFwc2UiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwiY2hlY2tib3giLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ2YWx1ZSIsInB1c2giLCJuYW1lIiwidGV4dCIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJ1c2VyX2lkIiwiY2xvc2VzdCIsImdyb3VwX2lkIiwib25TdWNjZXNzIiwib25FcnJvciIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsImFqYXgiLCJkYXRhVHlwZSIsInN1Y2Nlc3MiLCJyZXN1bHQiLCJlcnJvck1lc3NhZ2UiLCJtZXNzYWdlcyIsImxlbmd0aCIsImpvaW4iLCJVc2VyTWVzc2FnZSIsInNob3dFcnJvciIsImVycm9yIiwieGhyIiwic3RhdHVzIiwiY29tcGxldGUiLCJyb3dIZWlnaHQiLCJmaW5kIiwiZmlyc3QiLCJvdXRlckhlaWdodCIsIndpbmRvd0hlaWdodCIsImlubmVySGVpZ2h0IiwiaGVhZGVyRm9vdGVySGVpZ2h0IiwiTWF0aCIsIm1heCIsImZsb29yIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsYUFBYSxHQUFHO0FBQ3JCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGFBQWEsRUFBRUMsQ0FBQyxDQUFDLHVCQUFELENBTEs7O0FBT3JCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFdBQVcsRUFBRUQsQ0FBQyxDQUFDLGNBQUQsQ0FYTzs7QUFhckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0UsRUFBQUEsYUFBYSxFQUFFLElBakJNOztBQW1CckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsWUFBWSxFQUFFSCxDQUFDLENBQUMsZUFBRCxDQXZCTTs7QUF5QnJCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NJLEVBQUFBLHFCQUFxQixFQUFFSixDQUFDLENBQUMsdUJBQUQsQ0E3Qkg7O0FBK0JyQjtBQUNEO0FBQ0E7QUFDQTtBQUNDSyxFQUFBQSxpQkFBaUIsRUFBRUwsQ0FBQyxDQUFDLHNCQUFELENBbkNDOztBQW9DckI7QUFDRDtBQUNBO0FBQ0NNLEVBQUFBLFVBdkNxQix3QkF1Q1I7QUFDWjtBQUNBTixJQUFBQSxDQUFDLENBQUMsbUNBQUQsQ0FBRCxDQUF1Q08sR0FBdkMsR0FGWSxDQUlaOztBQUNBVCxJQUFBQSxhQUFhLENBQUNVLGlCQUFkLEdBTFksQ0FNWjs7QUFDQUMsSUFBQUEsTUFB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QUEsUUFwQk0sc0JBb0JLO0FBQ1Y7QUFDQTVFLFFBQUFBLGFBQWEsQ0FBQ00scUJBQWQsQ0FBb0NvQyxXQUFwQyxDQUFnRCxTQUFoRDtBQUNBO0FBdkJLLEtBQVA7QUF5QkEsR0F4TW9COztBQTBNckI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNDZixFQUFBQSxtQkEvTXFCLGlDQStNQztBQUNyQjtBQUNBLFFBQUlrRCxTQUFTLEdBQUc3RSxhQUFhLENBQUNHLFdBQWQsQ0FBMEIyRSxJQUExQixDQUErQixJQUEvQixFQUFxQ0MsS0FBckMsR0FBNkNDLFdBQTdDLEVBQWhCLENBRnFCLENBR3JCOztBQUNBLFFBQU1DLFlBQVksR0FBR3RFLE1BQU0sQ0FBQ3VFLFdBQTVCO0FBQ0EsUUFBTUMsa0JBQWtCLEdBQUcsR0FBM0IsQ0FMcUIsQ0FLVztBQUVoQzs7QUFDQSxXQUFPQyxJQUFJLENBQUNDLEdBQUwsQ0FBU0QsSUFBSSxDQUFDRSxLQUFMLENBQVcsQ0FBQ0wsWUFBWSxHQUFHRSxrQkFBaEIsSUFBc0NOLFNBQWpELENBQVQsRUFBc0UsRUFBdEUsQ0FBUDtBQUNBO0FBeE5vQixDQUF0QjtBQTJOQTtBQUNBO0FBQ0E7O0FBQ0EzRSxDQUFDLENBQUNxRixRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCeEYsRUFBQUEsYUFBYSxDQUFDUSxVQUFkO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBTZW1hbnRpY0xvY2FsaXphdGlvbiwgZ2xvYmFsUm9vdFVybCwgRGF0YXRhYmxlICovXG5cbi8qKlxuICogTW9kdWxlIGZvciBtYW5hZ2luZyBjYWxsIGdyb3VwcyBhbmQgcmVsYXRlZCBmdW5jdGlvbmFsaXR5LlxuICogQG5hbWVzcGFjZVxuICovXG5jb25zdCBNb2R1bGVDR0luZGV4ID0ge1xuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHN0YXR1cyB0b2dnbGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHVzZXJzIHRhYmxlLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHVzZXJzVGFibGU6ICQoJyN1c2Vycy10YWJsZScpLFxuXG5cdC8qKlxuXHQgKiBVc2VyIGRhdGEgdGFibGUuXG5cdCAqIEB0eXBlIHtEYXRhdGFibGV9XG5cdCAqL1xuXHR1c2VyRGF0YVRhYmxlOiBudWxsLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciBzZWxlY3QgZ3JvdXAgZWxlbWVudHMuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc2VsZWN0R3JvdXA6ICQoJy5zZWxlY3QtZ3JvdXAnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgZGVmYXVsdCBncm91cCBkcm9wZG93bi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRkZWZhdWx0R3JvdXBEcm9wZG93bjogJCgnLnNlbGVjdC1kZWZhdWx0LWdyb3VwJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIGN1cnJlbnQgZm9ybSBkaXNhYmlsaXR5IGZpZWxkc1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGRpc2FiaWxpdHlGaWVsZHM6ICQoJyNtb2R1bGUtdXNlcnMtZ3JvdXBzJyksXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQvLyBJbml0aWFsaXplIHRhYiBtZW51XG5cdFx0JCgnI21haW4tdXNlcnMtZ3JvdXBzLXRhYi1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHQvLyBDaGVjayBzdGF0dXMgdG9nZ2xlIGluaXRpYWxseVxuXHRcdE1vZHVsZUNHSW5kZXguY2hlY2tTdGF0dXNUb2dnbGUoKTtcblx0XHQvLyBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHN0YXR1cyBjaGFuZ2VzXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ01vZHVsZVN0YXR1c0NoYW5nZWQnLCBNb2R1bGVDR0luZGV4LmNoZWNrU3RhdHVzVG9nZ2xlKTtcblxuXHRcdC8vIEluaXRpYWxpemUgdXNlcnMgZGF0YSB0YWJsZVxuXHRcdE1vZHVsZUNHSW5kZXguaW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRyb3Bkb3ducyBmb3Igc2VsZWN0IGdyb3VwIGVsZW1lbnRzXG5cdFx0TW9kdWxlQ0dJbmRleC4kc2VsZWN0R3JvdXAuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0JChvYmopLmRyb3Bkb3duKHtcblx0XHRcdFx0dmFsdWVzOiBNb2R1bGVDR0luZGV4Lm1ha2VEcm9wZG93bkxpc3QoJChvYmopLmF0dHIoJ2RhdGEtdmFsdWUnKSksXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEluaXRpYWxpemUgZHJvcGRvd24gZm9yIHNlbGVjdCBncm91cFxuXHRcdE1vZHVsZUNHSW5kZXguJHNlbGVjdEdyb3VwLmRyb3Bkb3duKHtcblx0XHRcdG9uQ2hhbmdlOiBNb2R1bGVDR0luZGV4LmNoYW5nZUdyb3VwSW5MaXN0LFxuXHRcdH0pO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBkZWZhdWx0IGdyb3VwIGRyb3Bkb3duXG5cdFx0TW9kdWxlQ0dJbmRleC4kZGVmYXVsdEdyb3VwRHJvcGRvd24uZHJvcGRvd24oe1xuXHRcdFx0b25DaGFuZ2U6IE1vZHVsZUNHSW5kZXguY2hhbmdlRGVmYXVsdEdyb3VwLFxuXHRcdH0pO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBEYXRhVGFibGUgZm9yIHVzZXJzIHRhYmxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlKCkge1xuXG5cdFx0JCgnI21haW4tdXNlcnMtZ3JvdXBzLXRhYi1tZW51IC5pdGVtJykudGFiKHtcblx0XHRcdG9uVmlzaWJsZSgpe1xuXHRcdFx0XHRpZiAoJCh0aGlzKS5kYXRhKCd0YWInKT09PSd1c2VycycgJiYgTW9kdWxlQ0dJbmRleC51c2VyRGF0YVRhYmxlIT09bnVsbCl7XG5cdFx0XHRcdFx0Y29uc3QgbmV3UGFnZUxlbmd0aCA9IE1vZHVsZUNHSW5kZXguY2FsY3VsYXRlUGFnZUxlbmd0aCgpO1xuXHRcdFx0XHRcdE1vZHVsZUNHSW5kZXgudXNlckRhdGFUYWJsZS5wYWdlLmxlbihuZXdQYWdlTGVuZ3RoKS5kcmF3KGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0TW9kdWxlQ0dJbmRleC51c2VyRGF0YVRhYmxlID0gTW9kdWxlQ0dJbmRleC4kdXNlcnNUYWJsZS5EYXRhVGFibGUoe1xuXHRcdFx0Ly8gZGVzdHJveTogdHJ1ZSxcblx0XHRcdGxlbmd0aENoYW5nZTogZmFsc2UsXG5cdFx0XHRwYWdpbmc6IHRydWUsXG5cdFx0XHRwYWdlTGVuZ3RoOiBNb2R1bGVDR0luZGV4LmNhbGN1bGF0ZVBhZ2VMZW5ndGgoKSxcblx0XHRcdHNjcm9sbENvbGxhcHNlOiB0cnVlLFxuXHRcdFx0Y29sdW1uczogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XSxcblx0XHRcdG9yZGVyOiBbMSwgJ2FzYyddLFxuXHRcdFx0bGFuZ3VhZ2U6IFNlbWFudGljTG9jYWxpemF0aW9uLmRhdGFUYWJsZUxvY2FsaXNhdGlvbixcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGFuZCB1cGRhdGVzIGJ1dHRvbiBzdGF0dXMgYmFzZWQgb24gbW9kdWxlIHN0YXR1cy5cblx0ICovXG5cdGNoZWNrU3RhdHVzVG9nZ2xlKCkge1xuXHRcdGlmIChNb2R1bGVDR0luZGV4LiRzdGF0dXNUb2dnbGUuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0TW9kdWxlQ0dJbmRleC4kZGlzYWJpbGl0eUZpZWxkcy5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TW9kdWxlQ0dJbmRleC4kZGlzYWJpbGl0eUZpZWxkcy5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByZXBhcmVzIGEgZHJvcGRvd24gbGlzdCBmb3IgdXNlciBzZWxlY3Rpb24uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RlZCAtIFRoZSBzZWxlY3RlZCB2YWx1ZS5cblx0ICogQHJldHVybnMge0FycmF5fSAtIFRoZSBwcmVwYXJlZCBkcm9wZG93biBsaXN0LlxuXHQgKi9cblx0bWFrZURyb3Bkb3duTGlzdChzZWxlY3RlZCkge1xuXHRcdGNvbnN0IHZhbHVlcyA9IFtdO1xuXHRcdCQoJyN1c2Vycy1ncm91cHMtbGlzdCBvcHRpb24nKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoc2VsZWN0ZWQgPT09IG9iai52YWx1ZSkge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHZhbHVlcztcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyBncm91cCBjaGFuZ2UgaW4gdGhlIGxpc3QuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBuZXcgZ3JvdXAgdmFsdWUuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIG5ldyBncm91cCB0ZXh0LlxuXHQgKiBAcGFyYW0ge2pRdWVyeX0gJGNob2ljZSAtIFRoZSBzZWxlY3RlZCBjaG9pY2UuXG5cdCAqL1xuXHRjaGFuZ2VHcm91cEluTGlzdCh2YWx1ZSwgdGV4dCwgJGNob2ljZSkge1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlLXVzZXItZ3JvdXAvYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHR1c2VyX2lkOiAkKCRjaG9pY2UpLmNsb3Nlc3QoJ3RyJykuYXR0cignaWQnKSxcblx0XHRcdFx0Z3JvdXBfaWQ6IHZhbHVlLFxuXHRcdFx0fSxcblx0XHRcdG9uU3VjY2VzcygpIHtcblx0XHRcdFx0Ly9cdE1vZHVsZUNHSW5kZXguaW5pdGlhbGl6ZURhdGFUYWJsZSgpO1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coJ3VwZGF0ZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvbkVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZGVmYXVsdCBncm91cCBjaGFuZ2UuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBuZXcgZGVmYXVsdCBncm91cCB2YWx1ZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgbmV3IGdyb3VwIHRleHQuXG5cdCAqIEBwYXJhbSB7alF1ZXJ5fSAkY2hvaWNlIC0gVGhlIHNlbGVjdGVkIGNob2ljZS5cblx0ICovXG5cdGNoYW5nZURlZmF1bHRHcm91cCh2YWx1ZSwgdGV4dCwgJGNob2ljZSkge1xuXHRcdGlmICghdmFsdWUgfHwgdmFsdWUgPT09ICcnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIGxvYWRpbmcgc3RhdGUgdG8gZHJvcGRvd25cblx0XHRNb2R1bGVDR0luZGV4LiRkZWZhdWx0R3JvdXBEcm9wZG93bi5hZGRDbGFzcygnbG9hZGluZycpO1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogJy9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZVVzZXJzR3JvdXBzL3NldERlZmF1bHRHcm91cCcsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdGdyb3VwX2lkOiB2YWx1ZSxcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5yZXN1bHQgIT09IHRydWUpIHtcblx0XHRcdFx0XHQvLyBTaG93IGVycm9yIG5vdGlmaWNhdGlvbiBvbmx5IG9uIGZhaWx1cmVcblx0XHRcdFx0XHRjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNwb25zZS5tZXNzYWdlcyAmJiByZXNwb25zZS5tZXNzYWdlcy5sZW5ndGggPiAwXG5cdFx0XHRcdFx0XHQ/IHJlc3BvbnNlLm1lc3NhZ2VzLmpvaW4oJywgJylcblx0XHRcdFx0XHRcdDogJ0ZhaWxlZCB0byB1cGRhdGUgZGVmYXVsdCBncm91cCc7XG5cdFx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRlcnJvcih4aHIsIHN0YXR1cywgZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignTW9kdWxlVXNlcnNHcm91cHM6IEZhaWxlZCB0byBzZXQgZGVmYXVsdCBncm91cCcsIGVycm9yKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd0Vycm9yKCdGYWlsZWQgdG8gdXBkYXRlIGRlZmF1bHQgZ3JvdXAnKTtcblx0XHRcdH0sXG5cdFx0XHRjb21wbGV0ZSgpIHtcblx0XHRcdFx0Ly8gUmVtb3ZlIGxvYWRpbmcgc3RhdGUgZnJvbSBkcm9wZG93blxuXHRcdFx0XHRNb2R1bGVDR0luZGV4LiRkZWZhdWx0R3JvdXBEcm9wZG93bi5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuXHRcdFx0fSxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIGRhdGEgdGFibGUgcGFnZSBsZW5ndGhcblx0ICpcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdGNhbGN1bGF0ZVBhZ2VMZW5ndGgoKSB7XG5cdFx0Ly8gQ2FsY3VsYXRlIHJvdyBoZWlnaHRcblx0XHRsZXQgcm93SGVpZ2h0ID0gTW9kdWxlQ0dJbmRleC4kdXNlcnNUYWJsZS5maW5kKCd0cicpLmZpcnN0KCkub3V0ZXJIZWlnaHQoKTtcblx0XHQvLyBDYWxjdWxhdGUgd2luZG93IGhlaWdodCBhbmQgYXZhaWxhYmxlIHNwYWNlIGZvciB0YWJsZVxuXHRcdGNvbnN0IHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHRjb25zdCBoZWFkZXJGb290ZXJIZWlnaHQgPSA1MDA7IC8vIEVzdGltYXRlIGhlaWdodCBmb3IgaGVhZGVyLCBmb290ZXIsIGFuZCBvdGhlciBlbGVtZW50c1xuXG5cdFx0Ly8gQ2FsY3VsYXRlIG5ldyBwYWdlIGxlbmd0aFxuXHRcdHJldHVybiBNYXRoLm1heChNYXRoLmZsb29yKCh3aW5kb3dIZWlnaHQgLSBoZWFkZXJGb290ZXJIZWlnaHQpIC8gcm93SGVpZ2h0KSwgMTApO1xuXHR9LFxufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBtb2R1bGUgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHkuXG4gKi9cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlQ0dJbmRleC5pbml0aWFsaXplKCk7XG59KTtcblxuIl19