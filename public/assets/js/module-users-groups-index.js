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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUNHSW5kZXgiLCIkc3RhdHVzVG9nZ2xlIiwiJCIsIiR1c2Vyc1RhYmxlIiwiJHNlbGVjdEdyb3VwIiwiJGRpc2FiaWxpdHlGaWVsZHMiLCJpbml0aWFsaXplIiwidGFiIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlIiwiZWFjaCIsImluZGV4Iiwib2JqIiwiZHJvcGRvd24iLCJ2YWx1ZXMiLCJtYWtlRHJvcGRvd25MaXN0IiwiYXR0ciIsIm9uQ2hhbmdlIiwiY2hhbmdlR3JvdXBJbkxpc3QiLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwiY2hlY2tib3giLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ0ZXh0IiwicHVzaCIsIm5hbWUiLCJ2YWx1ZSIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJkYXRhIiwidXNlcl9pZCIsImNsb3Nlc3QiLCJncm91cF9pZCIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxhQUFhLEdBQUc7QUFDckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsYUFBYSxFQUFFQyxDQUFDLENBQUMsdUJBQUQsQ0FMSzs7QUFPckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsV0FBVyxFQUFFRCxDQUFDLENBQUMsY0FBRCxDQVhPOztBQWFyQjtBQUNEO0FBQ0E7QUFDQTtBQUNDRSxFQUFBQSxZQUFZLEVBQUVGLENBQUMsQ0FBQyxlQUFELENBakJNOztBQW1CckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0csRUFBQUEsaUJBQWlCLEVBQUVILENBQUMsQ0FBQyxzQkFBRCxDQXZCQzs7QUF3QnJCO0FBQ0Q7QUFDQTtBQUNDSSxFQUFBQSxVQTNCcUIsd0JBMkJSO0FBQ1o7QUFDQUosSUFBQUEsQ0FBQyxDQUFDLG1DQUFELENBQUQsQ0FBdUNLLEdBQXZDLEdBRlksQ0FJWjs7QUFDQVAsSUFBQUEsYUFBYSxDQUFDUSxpQkFBZCxHQUxZLENBTVo7O0FBQ0FDLElBQUFBLE1BQU0sQ0FBQ0MsZ0JBQVAsQ0FBd0IscUJBQXhCLEVBQStDVixhQUFhLENBQUNRLGlCQUE3RCxFQVBZLENBU1o7O0FBQ0FSLElBQUFBLGFBQWEsQ0FBQ1csd0JBQWQsR0FWWSxDQVlaOztBQUNBWCxJQUFBQSxhQUFhLENBQUNJLFlBQWQsQ0FBMkJRLElBQTNCLENBQWdDLFVBQUNDLEtBQUQsRUFBUUMsR0FBUixFQUFnQjtBQUMvQ1osTUFBQUEsQ0FBQyxDQUFDWSxHQUFELENBQUQsQ0FBT0MsUUFBUCxDQUFnQjtBQUNmQyxRQUFBQSxNQUFNLEVBQUVoQixhQUFhLENBQUNpQixnQkFBZCxDQUErQmYsQ0FBQyxDQUFDWSxHQUFELENBQUQsQ0FBT0ksSUFBUCxDQUFZLFlBQVosQ0FBL0I7QUFETyxPQUFoQjtBQUdBLEtBSkQsRUFiWSxDQW1CWjs7QUFDQWxCLElBQUFBLGFBQWEsQ0FBQ0ksWUFBZCxDQUEyQlcsUUFBM0IsQ0FBb0M7QUFDbkNJLE1BQUFBLFFBQVEsRUFBRW5CLGFBQWEsQ0FBQ29CO0FBRFcsS0FBcEM7QUFJQSxHQW5Eb0I7O0FBcURyQjtBQUNEO0FBQ0E7QUFDQ1QsRUFBQUEsd0JBeERxQixzQ0F3RE07QUFDMUJYLElBQUFBLGFBQWEsQ0FBQ0csV0FBZCxDQUEwQmtCLFNBQTFCLENBQW9DO0FBQ25DO0FBQ0FDLE1BQUFBLFlBQVksRUFBRSxLQUZxQjtBQUduQ0MsTUFBQUEsTUFBTSxFQUFFLEtBSDJCO0FBSW5DQyxNQUFBQSxPQUFPLEVBQUUsQ0FDUixJQURRLEVBRVIsSUFGUSxFQUdSLElBSFEsRUFJUixJQUpRLENBSjBCO0FBVW5DQyxNQUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFELEVBQUksS0FBSixDQVY0QjtBQVduQ0MsTUFBQUEsUUFBUSxFQUFFQyxvQkFBb0IsQ0FBQ0M7QUFYSSxLQUFwQztBQWFBLEdBdEVvQjs7QUF3RXJCO0FBQ0Q7QUFDQTtBQUNDcEIsRUFBQUEsaUJBM0VxQiwrQkEyRUQ7QUFDbkIsUUFBSVIsYUFBYSxDQUFDQyxhQUFkLENBQTRCNEIsUUFBNUIsQ0FBcUMsWUFBckMsQ0FBSixFQUF3RDtBQUN2RDdCLE1BQUFBLGFBQWEsQ0FBQ0ssaUJBQWQsQ0FBZ0N5QixXQUFoQyxDQUE0QyxVQUE1QztBQUNBLEtBRkQsTUFFTztBQUNOOUIsTUFBQUEsYUFBYSxDQUFDSyxpQkFBZCxDQUFnQzBCLFFBQWhDLENBQXlDLFVBQXpDO0FBQ0E7QUFDRCxHQWpGb0I7O0FBbUZyQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0NkLEVBQUFBLGdCQXhGcUIsNEJBd0ZKZSxRQXhGSSxFQXdGTTtBQUMxQixRQUFNaEIsTUFBTSxHQUFHLEVBQWY7QUFDQWQsSUFBQUEsQ0FBQyxDQUFDLDJCQUFELENBQUQsQ0FBK0JVLElBQS9CLENBQW9DLFVBQUNDLEtBQUQsRUFBUUMsR0FBUixFQUFnQjtBQUNuRCxVQUFJa0IsUUFBUSxLQUFLbEIsR0FBRyxDQUFDbUIsSUFBckIsRUFBMkI7QUFDMUJqQixRQUFBQSxNQUFNLENBQUNrQixJQUFQLENBQVk7QUFDWEMsVUFBQUEsSUFBSSxFQUFFckIsR0FBRyxDQUFDbUIsSUFEQztBQUVYRyxVQUFBQSxLQUFLLEVBQUV0QixHQUFHLENBQUNzQixLQUZBO0FBR1hKLFVBQUFBLFFBQVEsRUFBRTtBQUhDLFNBQVo7QUFLQSxPQU5ELE1BTU87QUFDTmhCLFFBQUFBLE1BQU0sQ0FBQ2tCLElBQVAsQ0FBWTtBQUNYQyxVQUFBQSxJQUFJLEVBQUVyQixHQUFHLENBQUNtQixJQURDO0FBRVhHLFVBQUFBLEtBQUssRUFBRXRCLEdBQUcsQ0FBQ3NCO0FBRkEsU0FBWjtBQUlBO0FBQ0QsS0FiRDtBQWNBLFdBQU9wQixNQUFQO0FBQ0EsR0F6R29COztBQTJHckI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0NJLEVBQUFBLGlCQWpIcUIsNkJBaUhIZ0IsS0FqSEcsRUFpSElILElBakhKLEVBaUhVSSxPQWpIVixFQWlIbUI7QUFDdkNuQyxJQUFBQSxDQUFDLENBQUNvQyxHQUFGLENBQU07QUFDTEMsTUFBQUEsR0FBRyxZQUFLQyxhQUFMLCtEQURFO0FBRUxDLE1BQUFBLEVBQUUsRUFBRSxLQUZDO0FBR0xDLE1BQUFBLE1BQU0sRUFBRSxNQUhIO0FBSUxDLE1BQUFBLElBQUksRUFBRTtBQUNMQyxRQUFBQSxPQUFPLEVBQUUxQyxDQUFDLENBQUNtQyxPQUFELENBQUQsQ0FBV1EsT0FBWCxDQUFtQixJQUFuQixFQUF5QjNCLElBQXpCLENBQThCLElBQTlCLENBREo7QUFFTDRCLFFBQUFBLFFBQVEsRUFBRVY7QUFGTCxPQUpEO0FBUUxXLE1BQUFBLFNBUkssdUJBUU8sQ0FDWDtBQUNBO0FBQ0EsT0FYSTtBQVlMQyxNQUFBQSxPQVpLLG1CQVlHQyxRQVpILEVBWWE7QUFDakJDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRixRQUFaO0FBQ0E7QUFkSSxLQUFOO0FBZ0JBO0FBbElvQixDQUF0QjtBQXFJQTtBQUNBO0FBQ0E7O0FBQ0EvQyxDQUFDLENBQUNrRCxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCckQsRUFBQUEsYUFBYSxDQUFDTSxVQUFkO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBTZW1hbnRpY0xvY2FsaXphdGlvbiwgZ2xvYmFsUm9vdFVybCAqL1xuXG4vKipcbiAqIE1vZHVsZSBmb3IgbWFuYWdpbmcgY2FsbCBncm91cHMgYW5kIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eS5cbiAqIEBuYW1lc3BhY2VcbiAqL1xuY29uc3QgTW9kdWxlQ0dJbmRleCA9IHtcblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzdGF0dXMgdG9nZ2xlLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSB1c2VycyB0YWJsZS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCR1c2Vyc1RhYmxlOiAkKCcjdXNlcnMtdGFibGUnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3Igc2VsZWN0IGdyb3VwIGVsZW1lbnRzLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHNlbGVjdEdyb3VwOiAkKCcuc2VsZWN0LWdyb3VwJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIGN1cnJlbnQgZm9ybSBkaXNhYmlsaXR5IGZpZWxkc1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGRpc2FiaWxpdHlGaWVsZHM6ICQoJyNtb2R1bGUtdXNlcnMtZ3JvdXBzJyksXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQvLyBJbml0aWFsaXplIHRhYiBtZW51XG5cdFx0JCgnI21haW4tdXNlcnMtZ3JvdXBzLXRhYi1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHQvLyBDaGVjayBzdGF0dXMgdG9nZ2xlIGluaXRpYWxseVxuXHRcdE1vZHVsZUNHSW5kZXguY2hlY2tTdGF0dXNUb2dnbGUoKTtcblx0XHQvLyBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHN0YXR1cyBjaGFuZ2VzXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ01vZHVsZVN0YXR1c0NoYW5nZWQnLCBNb2R1bGVDR0luZGV4LmNoZWNrU3RhdHVzVG9nZ2xlKTtcblxuXHRcdC8vIEluaXRpYWxpemUgdXNlcnMgZGF0YSB0YWJsZVxuXHRcdE1vZHVsZUNHSW5kZXguaW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRyb3Bkb3ducyBmb3Igc2VsZWN0IGdyb3VwIGVsZW1lbnRzXG5cdFx0TW9kdWxlQ0dJbmRleC4kc2VsZWN0R3JvdXAuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0JChvYmopLmRyb3Bkb3duKHtcblx0XHRcdFx0dmFsdWVzOiBNb2R1bGVDR0luZGV4Lm1ha2VEcm9wZG93bkxpc3QoJChvYmopLmF0dHIoJ2RhdGEtdmFsdWUnKSksXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEluaXRpYWxpemUgZHJvcGRvd24gZm9yIHNlbGVjdCBncm91cFxuXHRcdE1vZHVsZUNHSW5kZXguJHNlbGVjdEdyb3VwLmRyb3Bkb3duKHtcblx0XHRcdG9uQ2hhbmdlOiBNb2R1bGVDR0luZGV4LmNoYW5nZUdyb3VwSW5MaXN0LFxuXHRcdH0pO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBEYXRhVGFibGUgZm9yIHVzZXJzIHRhYmxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlKCkge1xuXHRcdE1vZHVsZUNHSW5kZXguJHVzZXJzVGFibGUuRGF0YVRhYmxlKHtcblx0XHRcdC8vIGRlc3Ryb3k6IHRydWUsXG5cdFx0XHRsZW5ndGhDaGFuZ2U6IGZhbHNlLFxuXHRcdFx0cGFnaW5nOiBmYWxzZSxcblx0XHRcdGNvbHVtbnM6IFtcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdF0sXG5cdFx0XHRvcmRlcjogWzEsICdhc2MnXSxcblx0XHRcdGxhbmd1YWdlOiBTZW1hbnRpY0xvY2FsaXphdGlvbi5kYXRhVGFibGVMb2NhbGlzYXRpb24sXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBhbmQgdXBkYXRlcyBidXR0b24gc3RhdHVzIGJhc2VkIG9uIG1vZHVsZSBzdGF0dXMuXG5cdCAqL1xuXHRjaGVja1N0YXR1c1RvZ2dsZSgpIHtcblx0XHRpZiAoTW9kdWxlQ0dJbmRleC4kc3RhdHVzVG9nZ2xlLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdE1vZHVsZUNHSW5kZXguJGRpc2FiaWxpdHlGaWVsZHMucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1vZHVsZUNHSW5kZXguJGRpc2FiaWxpdHlGaWVsZHMuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcmVwYXJlcyBhIGRyb3Bkb3duIGxpc3QgZm9yIHVzZXIgc2VsZWN0aW9uLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0ZWQgLSBUaGUgc2VsZWN0ZWQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gLSBUaGUgcHJlcGFyZWQgZHJvcGRvd24gbGlzdC5cblx0ICovXG5cdG1ha2VEcm9wZG93bkxpc3Qoc2VsZWN0ZWQpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSBbXTtcblx0XHQkKCcjdXNlcnMtZ3JvdXBzLWxpc3Qgb3B0aW9uJykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdGVkID09PSBvYmoudGV4dCkge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHZhbHVlcztcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyBncm91cCBjaGFuZ2UgaW4gdGhlIGxpc3QuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBuZXcgZ3JvdXAgdmFsdWUuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIG5ldyBncm91cCB0ZXh0LlxuXHQgKiBAcGFyYW0ge2pRdWVyeX0gJGNob2ljZSAtIFRoZSBzZWxlY3RlZCBjaG9pY2UuXG5cdCAqL1xuXHRjaGFuZ2VHcm91cEluTGlzdCh2YWx1ZSwgdGV4dCwgJGNob2ljZSkge1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlLXVzZXItZ3JvdXAvYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHR1c2VyX2lkOiAkKCRjaG9pY2UpLmNsb3Nlc3QoJ3RyJykuYXR0cignaWQnKSxcblx0XHRcdFx0Z3JvdXBfaWQ6IHZhbHVlLFxuXHRcdFx0fSxcblx0XHRcdG9uU3VjY2VzcygpIHtcblx0XHRcdFx0Ly9cdE1vZHVsZUNHSW5kZXguaW5pdGlhbGl6ZURhdGFUYWJsZSgpO1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coJ3VwZGF0ZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvbkVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIG1vZHVsZSB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeS5cbiAqL1xuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=