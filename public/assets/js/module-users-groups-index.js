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
  }
};
/**
 * Initialize the module when the document is ready.
 */

$(document).ready(function () {
  ModuleCGIndex.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUNHSW5kZXgiLCIkc3RhdHVzVG9nZ2xlIiwiJCIsIiR1c2Vyc1RhYmxlIiwiJHNlbGVjdEdyb3VwIiwiJGRpc2FiaWxpdHlGaWVsZHMiLCJpbml0aWFsaXplIiwidGFiIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZVVzZXJzRGF0YVRhYmxlIiwiZWFjaCIsImluZGV4Iiwib2JqIiwiZHJvcGRvd24iLCJ2YWx1ZXMiLCJtYWtlRHJvcGRvd25MaXN0IiwiYXR0ciIsIm9uQ2hhbmdlIiwiY2hhbmdlR3JvdXBJbkxpc3QiLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJjb2x1bW5zIiwib3JkZXIiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwiY2hlY2tib3giLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwic2VsZWN0ZWQiLCJ2YWx1ZSIsInB1c2giLCJuYW1lIiwidGV4dCIsIiRjaG9pY2UiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwib24iLCJtZXRob2QiLCJkYXRhIiwidXNlcl9pZCIsImNsb3Nlc3QiLCJncm91cF9pZCIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxhQUFhLEdBQUc7QUFDckI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsYUFBYSxFQUFFQyxDQUFDLENBQUMsdUJBQUQs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QUFLQSxPQU5ELE1BTU87QUFDTmhCLFFBQUFBLE1BQU0sQ0FBQ2tCLElBQVAsQ0FBWTtBQUNYQyxVQUFBQSxJQUFJLEVBQUVyQixHQUFHLENBQUNzQixJQURDO0FBRVhILFVBQUFBLEtBQUssRUFBRW5CLEdBQUcsQ0FBQ21CO0FBRkEsU0FBWjtBQUlBO0FBQ0QsS0FiRDtBQWNBLFdBQU9qQixNQUFQO0FBQ0EsR0F6R29COztBQTJHckI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0NJLEVBQUFBLGlCQWpIcUIsNkJBaUhIYSxLQWpIRyxFQWlISUcsSUFqSEosRUFpSFVDLE9BakhWLEVBaUhtQjtBQUN2Q25DLElBQUFBLENBQUMsQ0FBQ29DLEdBQUYsQ0FBTTtBQUNMQyxNQUFBQSxHQUFHLFlBQUtDLGFBQUwsK0RBREU7QUFFTEMsTUFBQUEsRUFBRSxFQUFFLEtBRkM7QUFHTEMsTUFBQUEsTUFBTSxFQUFFLE1BSEg7QUFJTEMsTUFBQUEsSUFBSSxFQUFFO0FBQ0xDLFFBQUFBLE9BQU8sRUFBRTFDLENBQUMsQ0FBQ21DLE9BQUQsQ0FBRCxDQUFXUSxPQUFYLENBQW1CLElBQW5CLEVBQXlCM0IsSUFBekIsQ0FBOEIsSUFBOUIsQ0FESjtBQUVMNEIsUUFBQUEsUUFBUSxFQUFFYjtBQUZMLE9BSkQ7QUFRTGMsTUFBQUEsU0FSSyx1QkFRTyxDQUNYO0FBQ0E7QUFDQSxPQVhJO0FBWUxDLE1BQUFBLE9BWkssbUJBWUdDLFFBWkgsRUFZYTtBQUNqQkMsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlGLFFBQVo7QUFDQTtBQWRJLEtBQU47QUFnQkE7QUFsSW9CLENBQXRCO0FBcUlBO0FBQ0E7QUFDQTs7QUFDQS9DLENBQUMsQ0FBQ2tELFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJyRCxFQUFBQSxhQUFhLENBQUNNLFVBQWQ7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIFNlbWFudGljTG9jYWxpemF0aW9uLCBnbG9iYWxSb290VXJsICovXG5cbi8qKlxuICogTW9kdWxlIGZvciBtYW5hZ2luZyBjYWxsIGdyb3VwcyBhbmQgcmVsYXRlZCBmdW5jdGlvbmFsaXR5LlxuICogQG5hbWVzcGFjZVxuICovXG5jb25zdCBNb2R1bGVDR0luZGV4ID0ge1xuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHN0YXR1cyB0b2dnbGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHVzZXJzIHRhYmxlLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHVzZXJzVGFibGU6ICQoJyN1c2Vycy10YWJsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciBzZWxlY3QgZ3JvdXAgZWxlbWVudHMuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc2VsZWN0R3JvdXA6ICQoJy5zZWxlY3QtZ3JvdXAnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgY3VycmVudCBmb3JtIGRpc2FiaWxpdHkgZmllbGRzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZGlzYWJpbGl0eUZpZWxkczogJCgnI21vZHVsZS11c2Vycy1ncm91cHMnKSxcblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdC8vIEluaXRpYWxpemUgdGFiIG1lbnVcblx0XHQkKCcjbWFpbi11c2Vycy1ncm91cHMtdGFiLW1lbnUgLml0ZW0nKS50YWIoKTtcblxuXHRcdC8vIENoZWNrIHN0YXR1cyB0b2dnbGUgaW5pdGlhbGx5XG5cdFx0TW9kdWxlQ0dJbmRleC5jaGVja1N0YXR1c1RvZ2dsZSgpO1xuXHRcdC8vIEFkZCBldmVudCBsaXN0ZW5lciBmb3Igc3RhdHVzIGNoYW5nZXNcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignTW9kdWxlU3RhdHVzQ2hhbmdlZCcsIE1vZHVsZUNHSW5kZXguY2hlY2tTdGF0dXNUb2dnbGUpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB1c2VycyBkYXRhIHRhYmxlXG5cdFx0TW9kdWxlQ0dJbmRleC5pbml0aWFsaXplVXNlcnNEYXRhVGFibGUoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgZHJvcGRvd25zIGZvciBzZWxlY3QgZ3JvdXAgZWxlbWVudHNcblx0XHRNb2R1bGVDR0luZGV4LiRzZWxlY3RHcm91cC5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHQkKG9iaikuZHJvcGRvd24oe1xuXHRcdFx0XHR2YWx1ZXM6IE1vZHVsZUNHSW5kZXgubWFrZURyb3Bkb3duTGlzdCgkKG9iaikuYXR0cignZGF0YS12YWx1ZScpKSxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBkcm9wZG93biBmb3Igc2VsZWN0IGdyb3VwXG5cdFx0TW9kdWxlQ0dJbmRleC4kc2VsZWN0R3JvdXAuZHJvcGRvd24oe1xuXHRcdFx0b25DaGFuZ2U6IE1vZHVsZUNHSW5kZXguY2hhbmdlR3JvdXBJbkxpc3QsXG5cdFx0fSk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIERhdGFUYWJsZSBmb3IgdXNlcnMgdGFibGUuXG5cdCAqL1xuXHRpbml0aWFsaXplVXNlcnNEYXRhVGFibGUoKSB7XG5cdFx0TW9kdWxlQ0dJbmRleC4kdXNlcnNUYWJsZS5EYXRhVGFibGUoe1xuXHRcdFx0Ly8gZGVzdHJveTogdHJ1ZSxcblx0XHRcdGxlbmd0aENoYW5nZTogZmFsc2UsXG5cdFx0XHRwYWdpbmc6IGZhbHNlLFxuXHRcdFx0Y29sdW1uczogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XSxcblx0XHRcdG9yZGVyOiBbMSwgJ2FzYyddLFxuXHRcdFx0bGFuZ3VhZ2U6IFNlbWFudGljTG9jYWxpemF0aW9uLmRhdGFUYWJsZUxvY2FsaXNhdGlvbixcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGFuZCB1cGRhdGVzIGJ1dHRvbiBzdGF0dXMgYmFzZWQgb24gbW9kdWxlIHN0YXR1cy5cblx0ICovXG5cdGNoZWNrU3RhdHVzVG9nZ2xlKCkge1xuXHRcdGlmIChNb2R1bGVDR0luZGV4LiRzdGF0dXNUb2dnbGUuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0TW9kdWxlQ0dJbmRleC4kZGlzYWJpbGl0eUZpZWxkcy5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TW9kdWxlQ0dJbmRleC4kZGlzYWJpbGl0eUZpZWxkcy5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByZXBhcmVzIGEgZHJvcGRvd24gbGlzdCBmb3IgdXNlciBzZWxlY3Rpb24uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RlZCAtIFRoZSBzZWxlY3RlZCB2YWx1ZS5cblx0ICogQHJldHVybnMge0FycmF5fSAtIFRoZSBwcmVwYXJlZCBkcm9wZG93biBsaXN0LlxuXHQgKi9cblx0bWFrZURyb3Bkb3duTGlzdChzZWxlY3RlZCkge1xuXHRcdGNvbnN0IHZhbHVlcyA9IFtdO1xuXHRcdCQoJyN1c2Vycy1ncm91cHMtbGlzdCBvcHRpb24nKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoc2VsZWN0ZWQgPT09IG9iai52YWx1ZSkge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHZhbHVlcztcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyBncm91cCBjaGFuZ2UgaW4gdGhlIGxpc3QuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBuZXcgZ3JvdXAgdmFsdWUuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIG5ldyBncm91cCB0ZXh0LlxuXHQgKiBAcGFyYW0ge2pRdWVyeX0gJGNob2ljZSAtIFRoZSBzZWxlY3RlZCBjaG9pY2UuXG5cdCAqL1xuXHRjaGFuZ2VHcm91cEluTGlzdCh2YWx1ZSwgdGV4dCwgJGNob2ljZSkge1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlLXVzZXItZ3JvdXAvYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHR1c2VyX2lkOiAkKCRjaG9pY2UpLmNsb3Nlc3QoJ3RyJykuYXR0cignaWQnKSxcblx0XHRcdFx0Z3JvdXBfaWQ6IHZhbHVlLFxuXHRcdFx0fSxcblx0XHRcdG9uU3VjY2VzcygpIHtcblx0XHRcdFx0Ly9cdE1vZHVsZUNHSW5kZXguaW5pdGlhbGl6ZURhdGFUYWJsZSgpO1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coJ3VwZGF0ZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvbkVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIG1vZHVsZSB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeS5cbiAqL1xuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVDR0luZGV4LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=