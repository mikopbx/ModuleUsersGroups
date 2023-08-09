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
   * jQuery object for select default group elements.
   * @type {jQuery}
   */
  $selectDefaultGroup: $('.select-default-group'),

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
    }); // Initialize dropdown for select default group

    ModuleUsersGroups.$selectDefaultGroup.dropdown();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZVVzZXJzR3JvdXBzIiwiJHN0YXR1c1RvZ2dsZSIsIiQiLCIkdXNlcnNUYWJsZSIsIiRzZWxlY3RHcm91cCIsIiRzZWxlY3REZWZhdWx0R3JvdXAiLCJpbml0aWFsaXplIiwidGFiIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZURhdGFUYWJsZSIsImVhY2giLCJpbmRleCIsIm9iaiIsImRyb3Bkb3duIiwidmFsdWVzIiwibWFrZURyb3Bkb3duTGlzdCIsImF0dHIiLCJvbkNoYW5nZSIsImNoYW5nZUdyb3VwSW5MaXN0IiwiRGF0YVRhYmxlIiwibGVuZ3RoQ2hhbmdlIiwicGFnaW5nIiwiY29sdW1ucyIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJTZW1hbnRpY0xvY2FsaXphdGlvbiIsImRhdGFUYWJsZUxvY2FsaXNhdGlvbiIsImNoZWNrYm94IiwiJGRpc2FiaWxpdHlGaWVsZHMiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ0ZXh0IiwicHVzaCIsIm5hbWUiLCJ2YWx1ZSIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJkYXRhIiwidXNlcl9pZCIsImNsb3Nlc3QiLCJncm91cF9pZCIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxpQkFBaUIsR0FBRztBQUN6QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxhQUFh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QUFNO0FBQ3ZCdEQsRUFBQUEsaUJBQWlCLENBQUNNLFVBQWxCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBTZW1hbnRpY0xvY2FsaXphdGlvbiwgZ2xvYmFsUm9vdFVybCAqL1xuXG4vKipcbiAqIE1vZHVsZSBmb3IgbWFuYWdpbmcgY2FsbCBncm91cHMgYW5kIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eS5cbiAqIEBuYW1lc3BhY2VcbiAqL1xuY29uc3QgTW9kdWxlVXNlcnNHcm91cHMgPSB7XG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3RhdHVzIHRvZ2dsZS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgdXNlcnMgdGFibGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdXNlcnNUYWJsZTogJCgnI3VzZXJzLXRhYmxlJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHNlbGVjdCBncm91cCBlbGVtZW50cy5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzZWxlY3RHcm91cDogJCgnLnNlbGVjdC1ncm91cCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciBzZWxlY3QgZGVmYXVsdCBncm91cCBlbGVtZW50cy5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzZWxlY3REZWZhdWx0R3JvdXA6ICQoJy5zZWxlY3QtZGVmYXVsdC1ncm91cCcpLFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQvLyBJbml0aWFsaXplIHRhYiBtZW51XG5cdFx0JCgnI21haW4tdXNlcnMtZ3JvdXBzLXRhYi1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHQvLyBDaGVjayBzdGF0dXMgdG9nZ2xlIGluaXRpYWxseVxuXHRcdE1vZHVsZVVzZXJzR3JvdXBzLmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0Ly8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBzdGF0dXMgY2hhbmdlc1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgTW9kdWxlVXNlcnNHcm91cHMuY2hlY2tTdGF0dXNUb2dnbGUpO1xuXHRcdC8vIEluaXRpYWxpemUgZGF0YSB0YWJsZVxuXHRcdE1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVEYXRhVGFibGUoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgZHJvcGRvd25zIGZvciBzZWxlY3QgZ3JvdXAgZWxlbWVudHNcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kc2VsZWN0R3JvdXAuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0JChvYmopLmRyb3Bkb3duKHtcblx0XHRcdFx0dmFsdWVzOiBNb2R1bGVVc2Vyc0dyb3Vwcy5tYWtlRHJvcGRvd25MaXN0KCQob2JqKS5hdHRyKCdkYXRhLXZhbHVlJykpLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRyb3Bkb3duIGZvciBzZWxlY3QgZ3JvdXBcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kc2VsZWN0R3JvdXAuZHJvcGRvd24oe1xuXHRcdFx0b25DaGFuZ2U6IE1vZHVsZVVzZXJzR3JvdXBzLmNoYW5nZUdyb3VwSW5MaXN0LFxuXHRcdH0pO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBkcm9wZG93biBmb3Igc2VsZWN0IGRlZmF1bHQgZ3JvdXBcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kc2VsZWN0RGVmYXVsdEdyb3VwLmRyb3Bkb3duKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBEYXRhVGFibGUgZm9yIHVzZXJzIHRhYmxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZURhdGFUYWJsZSgpIHtcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kdXNlcnNUYWJsZS5EYXRhVGFibGUoe1xuXHRcdFx0Ly8gZGVzdHJveTogdHJ1ZSxcblx0XHRcdGxlbmd0aENoYW5nZTogZmFsc2UsXG5cdFx0XHRwYWdpbmc6IGZhbHNlLFxuXHRcdFx0Y29sdW1uczogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XSxcblx0XHRcdG9yZGVyOiBbMSwgJ2FzYyddLFxuXHRcdFx0bGFuZ3VhZ2U6IFNlbWFudGljTG9jYWxpemF0aW9uLmRhdGFUYWJsZUxvY2FsaXNhdGlvbixcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGFuZCB1cGRhdGVzIGJ1dHRvbiBzdGF0dXMgYmFzZWQgb24gbW9kdWxlIHN0YXR1cy5cblx0ICovXG5cdGNoZWNrU3RhdHVzVG9nZ2xlKCkge1xuXHRcdGlmIChNb2R1bGVVc2Vyc0dyb3Vwcy4kc3RhdHVzVG9nZ2xlLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdE1vZHVsZVVzZXJzR3JvdXBzLiRkaXNhYmlsaXR5RmllbGRzLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kZGlzYWJpbGl0eUZpZWxkcy5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByZXBhcmVzIGEgZHJvcGRvd24gbGlzdCBmb3IgdXNlciBzZWxlY3Rpb24uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RlZCAtIFRoZSBzZWxlY3RlZCB2YWx1ZS5cblx0ICogQHJldHVybnMge0FycmF5fSAtIFRoZSBwcmVwYXJlZCBkcm9wZG93biBsaXN0LlxuXHQgKi9cblx0bWFrZURyb3Bkb3duTGlzdChzZWxlY3RlZCkge1xuXHRcdGNvbnN0IHZhbHVlcyA9IFtdO1xuXHRcdCQoJyN1c2Vycy1ncm91cHMtbGlzdCBvcHRpb24nKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoc2VsZWN0ZWQgPT09IG9iai50ZXh0KSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBvYmoudGV4dCxcblx0XHRcdFx0XHR2YWx1ZTogb2JqLnZhbHVlLFxuXHRcdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBvYmoudGV4dCxcblx0XHRcdFx0XHR2YWx1ZTogb2JqLnZhbHVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdmFsdWVzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGdyb3VwIGNoYW5nZSBpbiB0aGUgbGlzdC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIG5ldyBncm91cCB2YWx1ZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgbmV3IGdyb3VwIHRleHQuXG5cdCAqIEBwYXJhbSB7alF1ZXJ5fSAkY2hvaWNlIC0gVGhlIHNlbGVjdGVkIGNob2ljZS5cblx0ICovXG5cdGNoYW5nZUdyb3VwSW5MaXN0KHZhbHVlLCB0ZXh0LCAkY2hvaWNlKSB7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvbW9kdWxlLXVzZXJzLWdyb3Vwcy9jaGFuZ2UtdXNlci1ncm91cC9gLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHVzZXJfaWQ6ICQoJGNob2ljZSkuY2xvc2VzdCgndHInKS5hdHRyKCdpZCcpLFxuXHRcdFx0XHRncm91cF9pZDogdmFsdWUsXG5cdFx0XHR9LFxuXHRcdFx0b25TdWNjZXNzKCkge1xuXHRcdFx0XHQvL1x0TW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZURhdGFUYWJsZSgpO1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coJ3VwZGF0ZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvbkVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIG1vZHVsZSB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeS5cbiAqL1xuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVVc2Vyc0dyb3Vwcy5pbml0aWFsaXplKCk7XG59KTtcblxuIl19