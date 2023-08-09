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
    });
  },

  /**
   * Initializes the DataTable for users table.
   */
  initializeUsersDataTable: function initializeUsersDataTable() {
    ModuleCGIndex.$usersTable.DataTable({
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
      onSuccess: function onSuccess() {//	ModuleCGIndex.initializeDataTable();
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
  ModuleCGIndex.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUNHSW5kZXgiLCIkc3RhdHVzVG9nZ2xlIiwiJCIsIiR1c2Vyc1RhYmxlIiwiJHNlbGVjdEdyb3VwIiwiJGRpc2FiaWxpdHlGaWVsZHMiLCJpbml0aWFsaXplIiwidGFiIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlIiwiZWFjaCIsImluZGV4Iiwib2JqIiwiZHJvcGRvd24iLCJ2YWx1ZXMiLCJtYWtlRHJvcGRvd25MaXN0IiwiYXR0ciIsIm9uQ2hhbmdlIiwiY2hhbmdlR3JvdXBJbkxpc3QiLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwiY2hlY2tib3giLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ0ZXh0IiwicHVzaCIsIm5hbWUiLCJ2YWx1ZSIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJkYXRhIiwidXNlcl9pZCIsImNsb3Nlc3QiLCJncm91cF9pZCIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxhQUFhLEdBQUc7QUFDckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsYUFBYSxFQUFFQyxDQUFDLENBQUMsdUJBQUQs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bmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgU2VtYW50aWNMb2NhbGl6YXRpb24sIGdsb2JhbFJvb3RVcmwgKi9cblxuLyoqXG4gKiBNb2R1bGUgZm9yIG1hbmFnaW5nIGNhbGwgZ3JvdXBzIGFuZCByZWxhdGVkIGZ1bmN0aW9uYWxpdHkuXG4gKiBAbmFtZXNwYWNlXG4gKi9cbmNvbnN0IE1vZHVsZUNHSW5kZXggPSB7XG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3RhdHVzIHRvZ2dsZS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgdXNlcnMgdGFibGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdXNlcnNUYWJsZTogJCgnI3VzZXJzLXRhYmxlJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHNlbGVjdCBncm91cCBlbGVtZW50cy5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzZWxlY3RHcm91cDogJCgnLnNlbGVjdC1ncm91cCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciBjdXJyZW50IGZvcm0gZGlzYWJpbGl0eSBmaWVsZHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRkaXNhYmlsaXR5RmllbGRzOiAkKCcjbW9kdWxlLXVzZXJzLWdyb3VwcycpLFxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0Ly8gSW5pdGlhbGl6ZSB0YWIgbWVudVxuXHRcdCQoJyNtYWluLXVzZXJzLWdyb3Vwcy10YWItbWVudSAuaXRlbScpLnRhYigpO1xuXG5cdFx0Ly8gQ2hlY2sgc3RhdHVzIHRvZ2dsZSBpbml0aWFsbHlcblx0XHRNb2R1bGVDR0luZGV4LmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0Ly8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBzdGF0dXMgY2hhbmdlc1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgTW9kdWxlQ0dJbmRleC5jaGVja1N0YXR1c1RvZ2dsZSk7XG5cblx0XHQvLyBJbml0aWFsaXplIHVzZXJzIGRhdGEgdGFibGVcblx0XHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSgpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBkcm9wZG93bnMgZm9yIHNlbGVjdCBncm91cCBlbGVtZW50c1xuXHRcdE1vZHVsZUNHSW5kZXguJHNlbGVjdEdyb3VwLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdCQob2JqKS5kcm9wZG93bih7XG5cdFx0XHRcdHZhbHVlczogTW9kdWxlQ0dJbmRleC5tYWtlRHJvcGRvd25MaXN0KCQob2JqKS5hdHRyKCdkYXRhLXZhbHVlJykpLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRyb3Bkb3duIGZvciBzZWxlY3QgZ3JvdXBcblx0XHRNb2R1bGVDR0luZGV4LiRzZWxlY3RHcm91cC5kcm9wZG93bih7XG5cdFx0XHRvbkNoYW5nZTogTW9kdWxlQ0dJbmRleC5jaGFuZ2VHcm91cEluTGlzdCxcblx0XHR9KTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgRGF0YVRhYmxlIGZvciB1c2VycyB0YWJsZS5cblx0ICovXG5cdGluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSgpIHtcblx0XHRNb2R1bGVDR0luZGV4LiR1c2Vyc1RhYmxlLkRhdGFUYWJsZSh7XG5cdFx0XHQvLyBkZXN0cm95OiB0cnVlLFxuXHRcdFx0bGVuZ3RoQ2hhbmdlOiBmYWxzZSxcblx0XHRcdHBhZ2luZzogZmFsc2UsXG5cdFx0XHRjb2x1bW5zOiBbXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRdLFxuXHRcdFx0b3JkZXI6IFsxLCAnYXNjJ10sXG5cdFx0XHRsYW5ndWFnZTogU2VtYW50aWNMb2NhbGl6YXRpb24uZGF0YVRhYmxlTG9jYWxpc2F0aW9uLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgYW5kIHVwZGF0ZXMgYnV0dG9uIHN0YXR1cyBiYXNlZCBvbiBtb2R1bGUgc3RhdHVzLlxuXHQgKi9cblx0Y2hlY2tTdGF0dXNUb2dnbGUoKSB7XG5cdFx0aWYgKE1vZHVsZUNHSW5kZXguJHN0YXR1c1RvZ2dsZS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRNb2R1bGVDR0luZGV4LiRkaXNhYmlsaXR5RmllbGRzLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVDR0luZGV4LiRkaXNhYmlsaXR5RmllbGRzLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogUHJlcGFyZXMgYSBkcm9wZG93biBsaXN0IGZvciB1c2VyIHNlbGVjdGlvbi5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdGVkIC0gVGhlIHNlbGVjdGVkIHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IC0gVGhlIHByZXBhcmVkIGRyb3Bkb3duIGxpc3QuXG5cdCAqL1xuXHRtYWtlRHJvcGRvd25MaXN0KHNlbGVjdGVkKSB7XG5cdFx0Y29uc3QgdmFsdWVzID0gW107XG5cdFx0JCgnI3VzZXJzLWdyb3Vwcy1saXN0IG9wdGlvbicpLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdGlmIChzZWxlY3RlZCA9PT0gb2JqLnRleHQpIHtcblx0XHRcdFx0dmFsdWVzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IG9iai50ZXh0LFxuXHRcdFx0XHRcdHZhbHVlOiBvYmoudmFsdWUsXG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IG9iai50ZXh0LFxuXHRcdFx0XHRcdHZhbHVlOiBvYmoudmFsdWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB2YWx1ZXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZ3JvdXAgY2hhbmdlIGluIHRoZSBsaXN0LlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgbmV3IGdyb3VwIHZhbHVlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSBuZXcgZ3JvdXAgdGV4dC5cblx0ICogQHBhcmFtIHtqUXVlcnl9ICRjaG9pY2UgLSBUaGUgc2VsZWN0ZWQgY2hvaWNlLlxuXHQgKi9cblx0Y2hhbmdlR3JvdXBJbkxpc3QodmFsdWUsIHRleHQsICRjaG9pY2UpIHtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLXVzZXJzLWdyb3Vwcy9tb2R1bGUtdXNlcnMtZ3JvdXBzL2NoYW5nZS11c2VyLWdyb3VwL2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0dXNlcl9pZDogJCgkY2hvaWNlKS5jbG9zZXN0KCd0cicpLmF0dHIoJ2lkJyksXG5cdFx0XHRcdGdyb3VwX2lkOiB2YWx1ZSxcblx0XHRcdH0sXG5cdFx0XHRvblN1Y2Nlc3MoKSB7XG5cdFx0XHRcdC8vXHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemVEYXRhVGFibGUoKTtcblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKCd1cGRhdGVkJyk7XG5cdFx0XHR9LFxuXHRcdFx0b25FcnJvcihyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBtb2R1bGUgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHkuXG4gKi9cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlQ0dJbmRleC5pbml0aWFsaXplKCk7XG59KTtcblxuIl19