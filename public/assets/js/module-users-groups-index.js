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
var ModuleUsersGroups = {
  $formObj: $('#module-user-groups-form'),
  $disabilityFields: $('#module-user-groups-form  .disability'),
  $statusToggle: $('#module-status-toggle'),
  $usersTable: $('#users-table'),
  initialize: function initialize() {
    $('#main-users-groups-tab-menu .item').tab();
    ModuleUsersGroups.checkStatusToggle();
    window.addEventListener('ModuleStatusChanged', ModuleUsersGroups.checkStatusToggle);
    ModuleUsersGroups.initializeDataTable();
    $('.select-group').each(function (index, obj) {
      $(obj).dropdown({
        values: ModuleUsersGroups.makeDropdownList($(obj).attr('data-value'))
      });
    });
    $('.select-group').dropdown({
      onChange: ModuleUsersGroups.changeGroupInList
    });
  },
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
   * Изменение статуса кнопок при изменении статуса модуля
   */
  checkStatusToggle: function checkStatusToggle() {
    if (ModuleUsersGroups.$statusToggle.checkbox('is checked')) {
      ModuleUsersGroups.$disabilityFields.removeClass('disabled');
    } else {
      ModuleUsersGroups.$disabilityFields.addClass('disabled');
    }
  },

  /**
   * Подготавливает список выбора пользователей
   * @param selected
   * @returns {[]}
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
   * Обработка изменения группы в списке
   */
  changeGroupInList: function changeGroupInList(value, text, $choice) {
    $.api({
      url: "".concat(globalRootUrl, "module-users-groups/changeUserGroup/"),
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
$(document).ready(function () {
  ModuleUsersGroups.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZVVzZXJzR3JvdXBzIiwiJGZvcm1PYmoiLCIkIiwiJGRpc2FiaWxpdHlGaWVsZHMiLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZXJzVGFibGUiLCJpbml0aWFsaXplIiwidGFiIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZURhdGFUYWJsZSIsImVhY2giLCJpbmRleCIsIm9iaiIsImRyb3Bkb3duIiwidmFsdWVzIiwibWFrZURyb3Bkb3duTGlzdCIsImF0dHIiLCJvbkNoYW5nZSIsImNoYW5nZUdyb3VwSW5MaXN0IiwiRGF0YVRhYmxlIiwibGVuZ3RoQ2hhbmdlIiwicGFnaW5nIiwiY29sdW1ucyIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJTZW1hbnRpY0xvY2FsaXphdGlvbiIsImRhdGFUYWJsZUxvY2FsaXNhdGlvbiIsImNoZWNrYm94IiwicmVtb3ZlQ2xhc3MiLCJhZGRDbGFzcyIsInNlbGVjdGVkIiwidGV4dCIsInB1c2giLCJuYW1lIiwidmFsdWUiLCIkY2hvaWNlIiwiYXBpIiwidXJsIiwiZ2xvYmFsUm9vdFVybCIsIm9uIiwibWV0aG9kIiwiZGF0YSIsInVzZXJfaWQiLCJjbG9zZXN0IiwiZ3JvdXBfaWQiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwicmVzcG9uc2UiLCJjb25zb2xlIiwibG9nIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBRUEsSUFBTUEsaUJBQWlCLEdBQUc7QUFDekJDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLDBCQUFELENBRGM7QUFFekJDLEVBQUFBLGlCQUFpQixFQUFFRCxDQUFDLENBQUMsdUNB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QixNQUFQO0FBQ0EsR0FuRXdCOztBQW9FekI7QUFDRDtBQUNBO0FBQ0NJLEVBQUFBLGlCQXZFeUIsNkJBdUVQZ0IsS0F2RU8sRUF1RUFILElBdkVBLEVBdUVNSSxPQXZFTixFQXVFZTtBQUN2Q25DLElBQUFBLENBQUMsQ0FBQ29DLEdBQUYsQ0FBTTtBQUNMQyxNQUFBQSxHQUFHLFlBQUtDLGFBQUwseUNBREU7QUFFTEMsTUFBQUEsRUFBRSxFQUFFLEtBRkM7QUFHTEMsTUFBQUEsTUFBTSxFQUFFLE1BSEg7QUFJTEMsTUFBQUEsSUFBSSxFQUFFO0FBQ0xDLFFBQUFBLE9BQU8sRUFBRTFDLENBQUMsQ0FBQ21DLE9BQUQsQ0FBRCxDQUFXUSxPQUFYLENBQW1CLElBQW5CLEVBQXlCM0IsSUFBekIsQ0FBOEIsSUFBOUIsQ0FESjtBQUVMNEIsUUFBQUEsUUFBUSxFQUFFVjtBQUZMLE9BSkQ7QUFRTFcsTUFBQUEsU0FSSyx1QkFRTyxDQUNYO0FBQ0E7QUFDQSxPQVhJO0FBWUxDLE1BQUFBLE9BWkssbUJBWUdDLFFBWkgsRUFZYTtBQUNqQkMsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlGLFFBQVo7QUFDQTtBQWRJLEtBQU47QUFnQkE7QUF4RndCLENBQTFCO0FBMkZBL0MsQ0FBQyxDQUFDa0QsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2QnJELEVBQUFBLGlCQUFpQixDQUFDTSxVQUFsQjtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgU2VtYW50aWNMb2NhbGl6YXRpb24sIGdsb2JhbFJvb3RVcmwgKi9cblxuY29uc3QgTW9kdWxlVXNlcnNHcm91cHMgPSB7XG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLXVzZXItZ3JvdXBzLWZvcm0nKSxcblx0JGRpc2FiaWxpdHlGaWVsZHM6ICQoJyNtb2R1bGUtdXNlci1ncm91cHMtZm9ybSAgLmRpc2FiaWxpdHknKSxcblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cdCR1c2Vyc1RhYmxlOiAkKCcjdXNlcnMtdGFibGUnKSxcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQkKCcjbWFpbi11c2Vycy1ncm91cHMtdGFiLW1lbnUgLml0ZW0nKS50YWIoKTtcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy5jaGVja1N0YXR1c1RvZ2dsZSgpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgTW9kdWxlVXNlcnNHcm91cHMuY2hlY2tTdGF0dXNUb2dnbGUpO1xuXHRcdE1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVEYXRhVGFibGUoKTtcblx0XHQkKCcuc2VsZWN0LWdyb3VwJykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0JChvYmopLmRyb3Bkb3duKHtcblx0XHRcdFx0dmFsdWVzOiBNb2R1bGVVc2Vyc0dyb3Vwcy5tYWtlRHJvcGRvd25MaXN0KCQob2JqKS5hdHRyKCdkYXRhLXZhbHVlJykpLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0JCgnLnNlbGVjdC1ncm91cCcpLmRyb3Bkb3duKHtcblx0XHRcdG9uQ2hhbmdlOiBNb2R1bGVVc2Vyc0dyb3Vwcy5jaGFuZ2VHcm91cEluTGlzdCxcblx0XHR9KTtcblx0fSxcblx0aW5pdGlhbGl6ZURhdGFUYWJsZSgpIHtcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kdXNlcnNUYWJsZS5EYXRhVGFibGUoe1xuXHRcdFx0Ly8gZGVzdHJveTogdHJ1ZSxcblx0XHRcdGxlbmd0aENoYW5nZTogZmFsc2UsXG5cdFx0XHRwYWdpbmc6IGZhbHNlLFxuXHRcdFx0Y29sdW1uczogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XSxcblx0XHRcdG9yZGVyOiBbMSwgJ2FzYyddLFxuXHRcdFx0bGFuZ3VhZ2U6IFNlbWFudGljTG9jYWxpemF0aW9uLmRhdGFUYWJsZUxvY2FsaXNhdGlvbixcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqINCY0LfQvNC10L3QtdC90LjQtSDRgdGC0LDRgtGD0YHQsCDQutC90L7Qv9C+0Log0L/RgNC4INC40LfQvNC10L3QtdC90LjQuCDRgdGC0LDRgtGD0YHQsCDQvNC+0LTRg9C70Y9cblx0ICovXG5cdGNoZWNrU3RhdHVzVG9nZ2xlKCkge1xuXHRcdGlmIChNb2R1bGVVc2Vyc0dyb3Vwcy4kc3RhdHVzVG9nZ2xlLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdE1vZHVsZVVzZXJzR3JvdXBzLiRkaXNhYmlsaXR5RmllbGRzLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kZGlzYWJpbGl0eUZpZWxkcy5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiDQn9C+0LTQs9C+0YLQsNCy0LvQuNCy0LDQtdGCINGB0L/QuNGB0L7QuiDQstGL0LHQvtGA0LAg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10Llcblx0ICogQHBhcmFtIHNlbGVjdGVkXG5cdCAqIEByZXR1cm5zIHtbXX1cblx0ICovXG5cdG1ha2VEcm9wZG93bkxpc3Qoc2VsZWN0ZWQpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSBbXTtcblx0XHQkKCcjdXNlcnMtZ3JvdXBzLWxpc3Qgb3B0aW9uJykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdGVkID09PSBvYmoudGV4dCkge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogb2JqLnRleHQsXG5cdFx0XHRcdFx0dmFsdWU6IG9iai52YWx1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHZhbHVlcztcblx0fSxcblx0LyoqXG5cdCAqINCe0LHRgNCw0LHQvtGC0LrQsCDQuNC30LzQtdC90LXQvdC40Y8g0LPRgNGD0L/Qv9GLINCyINGB0L/QuNGB0LrQtVxuXHQgKi9cblx0Y2hhbmdlR3JvdXBJbkxpc3QodmFsdWUsIHRleHQsICRjaG9pY2UpIHtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLXVzZXJzLWdyb3Vwcy9jaGFuZ2VVc2VyR3JvdXAvYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHR1c2VyX2lkOiAkKCRjaG9pY2UpLmNsb3Nlc3QoJ3RyJykuYXR0cignaWQnKSxcblx0XHRcdFx0Z3JvdXBfaWQ6IHZhbHVlLFxuXHRcdFx0fSxcblx0XHRcdG9uU3VjY2VzcygpIHtcblx0XHRcdFx0Ly9cdE1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVEYXRhVGFibGUoKTtcblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKCd1cGRhdGVkJyk7XG5cdFx0XHR9LFxuXHRcdFx0b25FcnJvcihyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVVc2Vyc0dyb3Vwcy5pbml0aWFsaXplKCk7XG59KTtcblxuIl19