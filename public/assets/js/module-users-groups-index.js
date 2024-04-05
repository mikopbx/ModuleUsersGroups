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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUNHSW5kZXgiLCIkc3RhdHVzVG9nZ2xlIiwiJCIsIiR1c2Vyc1RhYmxlIiwidXNlckRhdGFUYWJsZSIsIiRzZWxlY3RHcm91cCIsIiRkaXNhYmlsaXR5RmllbGRzIiwiaW5pdGlhbGl6ZSIsInRhYiIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSIsImVhY2giLCJpbmRleCIsIm9iaiIsImRyb3Bkb3duIiwidmFsdWVzIiwibWFrZURyb3Bkb3duTGlzdCIsImF0dHIiLCJvbkNoYW5nZSIsImNoYW5nZUdyb3VwSW5MaXN0Iiwib25WaXNpYmxlIiwiZGF0YSIsIm5ld1BhZ2VMZW5ndGgiLCJjYWxjdWxhdGVQYWdlTGVuZ3RoIiwicGFnZSIsImxlbiIsImRyYXciLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJwYWdlTGVuZ3RoIiwic2Nyb2xsQ29sbGFwc2UiLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwiY2hlY2tib3giLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ2YWx1ZSIsInB1c2giLCJuYW1lIiwidGV4dCIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJ1c2VyX2lkIiwiY2xvc2VzdCIsImdyb3VwX2lkIiwib25TdWNjZXNzIiwib25FcnJvciIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsInJvd0hlaWdodCIsImZpbmQiLCJmaXJzdCIsIm91dGVySGVpZ2h0Iiwid2luZG93SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJoZWFkZXJGb290ZXJIZWlnaHQiLCJNYXRoIiwibWF4IiwiZmxvb3Ii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akQsQ0FBVCxFQUFzRSxFQUF0RSxDQUFQO0FBQ0E7QUFwS29CLENBQXRCO0FBdUtBO0FBQ0E7QUFDQTs7QUFDQTNELENBQUMsQ0FBQ3FFLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJ4RSxFQUFBQSxhQUFhLENBQUNPLFVBQWQ7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIFNlbWFudGljTG9jYWxpemF0aW9uLCBnbG9iYWxSb290VXJsLCBEYXRhdGFibGUgKi9cblxuLyoqXG4gKiBNb2R1bGUgZm9yIG1hbmFnaW5nIGNhbGwgZ3JvdXBzIGFuZCByZWxhdGVkIGZ1bmN0aW9uYWxpdHkuXG4gKiBAbmFtZXNwYWNlXG4gKi9cbmNvbnN0IE1vZHVsZUNHSW5kZXggPSB7XG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3RhdHVzIHRvZ2dsZS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgdXNlcnMgdGFibGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdXNlcnNUYWJsZTogJCgnI3VzZXJzLXRhYmxlJyksXG5cblx0LyoqXG5cdCAqIFVzZXIgZGF0YSB0YWJsZS5cblx0ICogQHR5cGUge0RhdGF0YWJsZX1cblx0ICovXG5cdHVzZXJEYXRhVGFibGU6IG51bGwsXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHNlbGVjdCBncm91cCBlbGVtZW50cy5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzZWxlY3RHcm91cDogJCgnLnNlbGVjdC1ncm91cCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciBjdXJyZW50IGZvcm0gZGlzYWJpbGl0eSBmaWVsZHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRkaXNhYmlsaXR5RmllbGRzOiAkKCcjbW9kdWxlLXVzZXJzLWdyb3VwcycpLFxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0Ly8gSW5pdGlhbGl6ZSB0YWIgbWVudVxuXHRcdCQoJyNtYWluLXVzZXJzLWdyb3Vwcy10YWItbWVudSAuaXRlbScpLnRhYigpO1xuXG5cdFx0Ly8gQ2hlY2sgc3RhdHVzIHRvZ2dsZSBpbml0aWFsbHlcblx0XHRNb2R1bGVDR0luZGV4LmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0Ly8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBzdGF0dXMgY2hhbmdlc1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgTW9kdWxlQ0dJbmRleC5jaGVja1N0YXR1c1RvZ2dsZSk7XG5cblx0XHQvLyBJbml0aWFsaXplIHVzZXJzIGRhdGEgdGFibGVcblx0XHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSgpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBkcm9wZG93bnMgZm9yIHNlbGVjdCBncm91cCBlbGVtZW50c1xuXHRcdE1vZHVsZUNHSW5kZXguJHNlbGVjdEdyb3VwLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdCQob2JqKS5kcm9wZG93bih7XG5cdFx0XHRcdHZhbHVlczogTW9kdWxlQ0dJbmRleC5tYWtlRHJvcGRvd25MaXN0KCQob2JqKS5hdHRyKCdkYXRhLXZhbHVlJykpLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRyb3Bkb3duIGZvciBzZWxlY3QgZ3JvdXBcblx0XHRNb2R1bGVDR0luZGV4LiRzZWxlY3RHcm91cC5kcm9wZG93bih7XG5cdFx0XHRvbkNoYW5nZTogTW9kdWxlQ0dJbmRleC5jaGFuZ2VHcm91cEluTGlzdCxcblx0XHR9KTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgRGF0YVRhYmxlIGZvciB1c2VycyB0YWJsZS5cblx0ICovXG5cdGluaXRpYWxpemVVc2Vyc0RhdGFUYWJsZSgpIHtcblxuXHRcdCQoJyNtYWluLXVzZXJzLWdyb3Vwcy10YWItbWVudSAuaXRlbScpLnRhYih7XG5cdFx0XHRvblZpc2libGUoKXtcblx0XHRcdFx0aWYgKCQodGhpcykuZGF0YSgndGFiJyk9PT0ndXNlcnMnICYmIE1vZHVsZUNHSW5kZXgudXNlckRhdGFUYWJsZSE9PW51bGwpe1xuXHRcdFx0XHRcdGNvbnN0IG5ld1BhZ2VMZW5ndGggPSBNb2R1bGVDR0luZGV4LmNhbGN1bGF0ZVBhZ2VMZW5ndGgoKTtcblx0XHRcdFx0XHRNb2R1bGVDR0luZGV4LnVzZXJEYXRhVGFibGUucGFnZS5sZW4obmV3UGFnZUxlbmd0aCkuZHJhdyhmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdE1vZHVsZUNHSW5kZXgudXNlckRhdGFUYWJsZSA9IE1vZHVsZUNHSW5kZXguJHVzZXJzVGFibGUuRGF0YVRhYmxlKHtcblx0XHRcdC8vIGRlc3Ryb3k6IHRydWUsXG5cdFx0XHRsZW5ndGhDaGFuZ2U6IGZhbHNlLFxuXHRcdFx0cGFnaW5nOiB0cnVlLFxuXHRcdFx0cGFnZUxlbmd0aDogTW9kdWxlQ0dJbmRleC5jYWxjdWxhdGVQYWdlTGVuZ3RoKCksXG5cdFx0XHRzY3JvbGxDb2xsYXBzZTogdHJ1ZSxcblx0XHRcdGNvbHVtbnM6IFtcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdF0sXG5cdFx0XHRvcmRlcjogWzEsICdhc2MnXSxcblx0XHRcdGxhbmd1YWdlOiBTZW1hbnRpY0xvY2FsaXphdGlvbi5kYXRhVGFibGVMb2NhbGlzYXRpb24sXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBhbmQgdXBkYXRlcyBidXR0b24gc3RhdHVzIGJhc2VkIG9uIG1vZHVsZSBzdGF0dXMuXG5cdCAqL1xuXHRjaGVja1N0YXR1c1RvZ2dsZSgpIHtcblx0XHRpZiAoTW9kdWxlQ0dJbmRleC4kc3RhdHVzVG9nZ2xlLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdE1vZHVsZUNHSW5kZXguJGRpc2FiaWxpdHlGaWVsZHMucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1vZHVsZUNHSW5kZXguJGRpc2FiaWxpdHlGaWVsZHMuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcmVwYXJlcyBhIGRyb3Bkb3duIGxpc3QgZm9yIHVzZXIgc2VsZWN0aW9uLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0ZWQgLSBUaGUgc2VsZWN0ZWQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gLSBUaGUgcHJlcGFyZWQgZHJvcGRvd24gbGlzdC5cblx0ICovXG5cdG1ha2VEcm9wZG93bkxpc3Qoc2VsZWN0ZWQpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSBbXTtcblx0XHQkKCcjdXNlcnMtZ3JvdXBzLWxpc3Qgb3B0aW9uJykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdGVkID09PSBvYmoudmFsdWUpIHtcblx0XHRcdFx0dmFsdWVzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IG9iai50ZXh0LFxuXHRcdFx0XHRcdHZhbHVlOiBvYmoudmFsdWUsXG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IG9iai50ZXh0LFxuXHRcdFx0XHRcdHZhbHVlOiBvYmoudmFsdWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB2YWx1ZXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZ3JvdXAgY2hhbmdlIGluIHRoZSBsaXN0LlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgbmV3IGdyb3VwIHZhbHVlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSBuZXcgZ3JvdXAgdGV4dC5cblx0ICogQHBhcmFtIHtqUXVlcnl9ICRjaG9pY2UgLSBUaGUgc2VsZWN0ZWQgY2hvaWNlLlxuXHQgKi9cblx0Y2hhbmdlR3JvdXBJbkxpc3QodmFsdWUsIHRleHQsICRjaG9pY2UpIHtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLXVzZXJzLWdyb3Vwcy9tb2R1bGUtdXNlcnMtZ3JvdXBzL2NoYW5nZS11c2VyLWdyb3VwL2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0dXNlcl9pZDogJCgkY2hvaWNlKS5jbG9zZXN0KCd0cicpLmF0dHIoJ2lkJyksXG5cdFx0XHRcdGdyb3VwX2lkOiB2YWx1ZSxcblx0XHRcdH0sXG5cdFx0XHRvblN1Y2Nlc3MoKSB7XG5cdFx0XHRcdC8vXHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemVEYXRhVGFibGUoKTtcblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKCd1cGRhdGVkJyk7XG5cdFx0XHR9LFxuXHRcdFx0b25FcnJvcihyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGUgZGF0YSB0YWJsZSBwYWdlIGxlbmd0aFxuXHQgKlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0Y2FsY3VsYXRlUGFnZUxlbmd0aCgpIHtcblx0XHQvLyBDYWxjdWxhdGUgcm93IGhlaWdodFxuXHRcdGxldCByb3dIZWlnaHQgPSBNb2R1bGVDR0luZGV4LiR1c2Vyc1RhYmxlLmZpbmQoJ3RyJykuZmlyc3QoKS5vdXRlckhlaWdodCgpO1xuXHRcdC8vIENhbGN1bGF0ZSB3aW5kb3cgaGVpZ2h0IGFuZCBhdmFpbGFibGUgc3BhY2UgZm9yIHRhYmxlXG5cdFx0Y29uc3Qgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdGNvbnN0IGhlYWRlckZvb3RlckhlaWdodCA9IDUwMDsgLy8gRXN0aW1hdGUgaGVpZ2h0IGZvciBoZWFkZXIsIGZvb3RlciwgYW5kIG90aGVyIGVsZW1lbnRzXG5cblx0XHQvLyBDYWxjdWxhdGUgbmV3IHBhZ2UgbGVuZ3RoXG5cdFx0cmV0dXJuIE1hdGgubWF4KE1hdGguZmxvb3IoKHdpbmRvd0hlaWdodCAtIGhlYWRlckZvb3RlckhlaWdodCkgLyByb3dIZWlnaHQpLCAxMCk7XG5cdH0sXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIG1vZHVsZSB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeS5cbiAqL1xuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=