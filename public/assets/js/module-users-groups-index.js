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

/* global SemanticLocalization, globalRootUrl */

/**
 * Module for managing call groups and related functionality.
 * @namespace
 */
var ModuleUsersGroups = {
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

    ModuleUsersGroups.checkStatusToggle(); // Add event listener for status changes

    window.addEventListener('ModuleStatusChanged', ModuleUsersGroups.checkStatusToggle); // Initialize data table

    ModuleUsersGroups.initializeDataTable(); // Initialize dropdowns for select group elements

    ModuleUsersGroups.$selectGroup.each(function (index, obj) {
      $(obj).dropdown({
        values: ModuleUsersGroups.makeDropdownList($(obj).attr('data-value'))
      });
    }); // Initialize dropdown for select group

    ModuleUsersGroups.$selectGroup.dropdown({
      onChange: ModuleUsersGroups.changeGroupInList
    });
  },

  /**
   * Initializes the DataTable for users table.
   */
  initializeDataTable: function initializeDataTable() {
    ModuleUsersGroups.$usersTable.DataTable({
      // destroy: true,
      lengthChange: false,
      paging: false,
      columns: [null, null, null, null, null],
      order: [1, 'asc'],
      language: SemanticLocalization.dataTableLocalisation
    });
  },

  /**
   * Checks and updates button status based on module status.
   */
  checkStatusToggle: function checkStatusToggle() {
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
  makeDropdownList: function makeDropdownList(selected) {
    var values = [];
    $('#users-groups-list option').each(function (index, obj) {
      if (selected === obj.text) {
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
      onSuccess: function onSuccess() {//	ModuleUsersGroups.initializeDataTable();
        //	console.log('updated');
      },
      onError: function onError(response) {
        console.log(response);
      }
    });
  }
};
/**
 * Initialize the module when the document is ready.
 */

$(document).ready(function () {
  ModuleUsersGroups.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZVVzZXJzR3JvdXBzIiwiJHN0YXR1c1RvZ2dsZSIsIiQiLCIkdXNlcnNUYWJsZSIsIiRzZWxlY3RHcm91cCIsIiRkaXNhYmlsaXR5RmllbGRzIiwiaW5pdGlhbGl6ZSIsInRhYiIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxpemVEYXRhVGFibGUiLCJlYWNoIiwiaW5kZXgiLCJvYmoiLCJkcm9wZG93biIsInZhbHVlcyIsIm1ha2VEcm9wZG93bkxpc3QiLCJhdHRyIiwib25DaGFuZ2UiLCJjaGFuZ2VHcm91cEluTGlzdCIsIkRhdGFUYWJsZSIsImxlbmd0aENoYW5nZSIsInBhZ2luZyIsImNvbHVtbnMiLCJvcmRlciIsImxhbmd1YWdlIiwiU2VtYW50aWNMb2NhbGl6YXRpb24iLCJkYXRhVGFibGVMb2NhbGlzYXRpb24iLCJjaGVja2JveCIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJzZWxlY3RlZCIsInRleHQiLCJwdXNoIiwibmFtZSIsInZhbHVlIiwiJGNob2ljZSIsImFwaSIsInVybCIsImdsb2JhbFJvb3RVcmwiLCJvbiIsIm1ldGhvZCIsImRhdGEiLCJ1c2VyX2lkIiwiY2xvc2VzdCIsImdyb3VwX2lkIiwib25TdWNjZXNzIiwib25FcnJvciIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLGlCQUFpQixHQUFHO0FBQ3pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGFBQWEsRUFBRUMsQ0FBQyxDQUFDLHVCQUFE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LSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIFNlbWFudGljTG9jYWxpemF0aW9uLCBnbG9iYWxSb290VXJsICovXG5cbi8qKlxuICogTW9kdWxlIGZvciBtYW5hZ2luZyBjYWxsIGdyb3VwcyBhbmQgcmVsYXRlZCBmdW5jdGlvbmFsaXR5LlxuICogQG5hbWVzcGFjZVxuICovXG5jb25zdCBNb2R1bGVVc2Vyc0dyb3VwcyA9IHtcblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzdGF0dXMgdG9nZ2xlLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSB1c2VycyB0YWJsZS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCR1c2Vyc1RhYmxlOiAkKCcjdXNlcnMtdGFibGUnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3Igc2VsZWN0IGdyb3VwIGVsZW1lbnRzLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHNlbGVjdEdyb3VwOiAkKCcuc2VsZWN0LWdyb3VwJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIGN1cnJlbnQgZm9ybSBkaXNhYmlsaXR5IGZpZWxkc1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGRpc2FiaWxpdHlGaWVsZHM6ICQoJyNtb2R1bGUtdXNlcnMtZ3JvdXBzJyksXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQvLyBJbml0aWFsaXplIHRhYiBtZW51XG5cdFx0JCgnI21haW4tdXNlcnMtZ3JvdXBzLXRhYi1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHQvLyBDaGVjayBzdGF0dXMgdG9nZ2xlIGluaXRpYWxseVxuXHRcdE1vZHVsZVVzZXJzR3JvdXBzLmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0Ly8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBzdGF0dXMgY2hhbmdlc1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgTW9kdWxlVXNlcnNHcm91cHMuY2hlY2tTdGF0dXNUb2dnbGUpO1xuXHRcdC8vIEluaXRpYWxpemUgZGF0YSB0YWJsZVxuXHRcdE1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVEYXRhVGFibGUoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgZHJvcGRvd25zIGZvciBzZWxlY3QgZ3JvdXAgZWxlbWVudHNcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kc2VsZWN0R3JvdXAuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0JChvYmopLmRyb3Bkb3duKHtcblx0XHRcdFx0dmFsdWVzOiBNb2R1bGVVc2Vyc0dyb3Vwcy5tYWtlRHJvcGRvd25MaXN0KCQob2JqKS5hdHRyKCdkYXRhLXZhbHVlJykpLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRyb3Bkb3duIGZvciBzZWxlY3QgZ3JvdXBcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kc2VsZWN0R3JvdXAuZHJvcGRvd24oe1xuXHRcdFx0b25DaGFuZ2U6IE1vZHVsZVVzZXJzR3JvdXBzLmNoYW5nZUdyb3VwSW5MaXN0LFxuXHRcdH0pO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBEYXRhVGFibGUgZm9yIHVzZXJzIHRhYmxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZURhdGFUYWJsZSgpIHtcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kdXNlcnNUYWJsZS5EYXRhVGFibGUoe1xuXHRcdFx0Ly8gZGVzdHJveTogdHJ1ZSxcblx0XHRcdGxlbmd0aENoYW5nZTogZmFsc2UsXG5cdFx0XHRwYWdpbmc6IGZhbHNlLFxuXHRcdFx0Y29sdW1uczogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XSxcblx0XHRcdG9yZGVyOiBbMSwgJ2FzYyddLFxuXHRcdFx0bGFuZ3VhZ2U6IFNlbWFudGljTG9jYWxpemF0aW9uLmRhdGFUYWJsZUxvY2FsaXNhdGlvbixcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGFuZCB1cGRhdGVzIGJ1dHRvbiBzdGF0dXMgYmFzZWQgb24gbW9kdWxlIHN0YXR1cy5cblx0ICovXG5cdGNoZWNrU3RhdHVzVG9nZ2xlKCkge1xuXHRcdGlmIChNb2R1bGVVc2Vyc0dyb3Vwcy4kc3RhdHVzVG9nZ2xlLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdE1vZHVsZVVzZXJzR3JvdXBzLiRkaXNhYmlsaXR5RmllbGRzLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kZGlzYWJpbGl0eUZpZWxkcy5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByZXBhcmVzIGEgZHJvcGRvd24gbGlzdCBmb3IgdXNlciBzZWxlY3Rpb24uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RlZCAtIFRoZSBzZWxlY3RlZCB2YWx1ZS5cblx0ICogQHJldHVybnMge0FycmF5fSAtIFRoZSBwcmVwYXJlZCBkcm9wZG93biBsaXN0LlxuXHQgKi9cblx0bWFrZURyb3Bkb3duTGlzdChzZWxlY3RlZCkge1xuXHRcdGNvbnN0IHZhbHVlcyA9IFtdO1xuXHRcdCQoJyN1c2Vycy1ncm91cHMtbGlzdCBvcHRpb24nKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoc2VsZWN0ZWQgPT09IG9iai50ZXh0KSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBvYmoudGV4dCxcblx0XHRcdFx0XHR2YWx1ZTogb2JqLnZhbHVlLFxuXHRcdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBvYmoudGV4dCxcblx0XHRcdFx0XHR2YWx1ZTogb2JqLnZhbHVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdmFsdWVzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGdyb3VwIGNoYW5nZSBpbiB0aGUgbGlzdC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIG5ldyBncm91cCB2YWx1ZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgbmV3IGdyb3VwIHRleHQuXG5cdCAqIEBwYXJhbSB7alF1ZXJ5fSAkY2hvaWNlIC0gVGhlIHNlbGVjdGVkIGNob2ljZS5cblx0ICovXG5cdGNoYW5nZUdyb3VwSW5MaXN0KHZhbHVlLCB0ZXh0LCAkY2hvaWNlKSB7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvbW9kdWxlLXVzZXJzLWdyb3Vwcy9jaGFuZ2UtdXNlci1ncm91cC9gLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHVzZXJfaWQ6ICQoJGNob2ljZSkuY2xvc2VzdCgndHInKS5hdHRyKCdpZCcpLFxuXHRcdFx0XHRncm91cF9pZDogdmFsdWUsXG5cdFx0XHR9LFxuXHRcdFx0b25TdWNjZXNzKCkge1xuXHRcdFx0XHQvL1x0TW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZURhdGFUYWJsZSgpO1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coJ3VwZGF0ZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvbkVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIG1vZHVsZSB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeS5cbiAqL1xuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVVc2Vyc0dyb3Vwcy5pbml0aWFsaXplKCk7XG59KTtcblxuIl19