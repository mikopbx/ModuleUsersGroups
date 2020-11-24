"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 11 2019
 *
 */

/* global SemanticLocalization, globalRootUrl */
var ModuleUsersGroups = {
  $formObj: $('#module-user-groups-form'),
  $disabilityFields: $('#module-user-groups-form  .disability'),
  $statusToggle: $('#module-status-toggle'),
  $usersTable: $('#users-table'),
  initialize: function () {
    function initialize() {
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
    }

    return initialize;
  }(),
  initializeDataTable: function () {
    function initializeDataTable() {
      ModuleUsersGroups.$usersTable.DataTable({
        // destroy: true,
        lengthChange: false,
        paging: false,
        columns: [null, null, null, null, null],
        order: [1, 'asc'],
        language: SemanticLocalization.dataTableLocalisation
      });
    }

    return initializeDataTable;
  }(),

  /**
   * Изменение статуса кнопок при изменении статуса модуля
   */
  checkStatusToggle: function () {
    function checkStatusToggle() {
      if (ModuleUsersGroups.$statusToggle.checkbox('is checked')) {
        ModuleUsersGroups.$disabilityFields.removeClass('disabled');
      } else {
        ModuleUsersGroups.$disabilityFields.addClass('disabled');
      }
    }

    return checkStatusToggle;
  }(),

  /**
   * Подготавливает список выбора пользователей
   * @param selected
   * @returns {[]}
   */
  makeDropdownList: function () {
    function makeDropdownList(selected) {
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
    }

    return makeDropdownList;
  }(),

  /**
   * Обработка изменения группы в списке
   */
  changeGroupInList: function () {
    function changeGroupInList(value, text, $choice) {
      $.api({
        url: "".concat(globalRootUrl, "module-users-groups/changeUserGroup/"),
        on: 'now',
        method: 'POST',
        data: {
          user_id: $($choice).closest('tr').attr('id'),
          group_id: value
        },
        onSuccess: function () {
          function onSuccess() {//	ModuleUsersGroups.initializeDataTable();
            //	console.log('updated');
          }

          return onSuccess;
        }(),
        onError: function () {
          function onError(response) {
            console.log(response);
          }

          return onError;
        }()
      });
    }

    return changeGroupInList;
  }()
};
$(document).ready(function () {
  ModuleUsersGroups.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZVVzZXJzR3JvdXBzIiwiJGZvcm1PYmoiLCIkIiwiJGRpc2FiaWxpdHlGaWVsZHMiLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZXJzVGFibGUiLCJpbml0aWFsaXplIiwidGFiIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZURhdGFUYWJsZSIsImVhY2giLCJpbmRleCIsIm9iaiIsImRyb3Bkb3duIiwidmFsdWVzIiwibWFrZURyb3Bkb3duTGlzdCIsImF0dHIiLCJvbkNoYW5nZSIsImNoYW5nZUdyb3VwSW5MaXN0IiwiRGF0YVRhYmxlIiwibGVuZ3RoQ2hhbmdlIiwicGFnaW5nIiwiY29sdW1ucyIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJTZW1hbnRpY0xvY2FsaXphdGlvbiIsImRhdGFUYWJsZUxvY2FsaXNhdGlvbiIsImNoZWNrYm94IiwicmVtb3ZlQ2xhc3MiLCJhZGRDbGFzcyIsInNlbGVjdGVkIiwidGV4dCIsInB1c2giLCJuYW1lIiwidmFsdWUiLCIkY2hvaWNlIiwiYXBpIiwidXJsIiwiZ2xvYmFsUm9vdFVybCIsIm9uIiwibWV0aG9kIiwiZGF0YSIsInVzZXJfaWQiLCJjbG9zZXN0IiwiZ3JvdXBfaWQiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwicmVzcG9uc2UiLCJjb25zb2xlIiwibG9nIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7QUFPQTtBQUVBLElBQU1BLGlCQUFpQixHQUFHO0FBQ3pCQyxFQUFBQSxRQUFRLEVBQUVDLENBQUMsQ0FBQywwQkFBRCxDQURjO0FBRXpCQyxFQUFBQSxpQkFBaUIsRUFBRUQsQ0FBQyxDQUFDLHVDQUFELENBRks7QUFHekJFLEVBQUFBLGFBQWEsRUFBRUYsQ0FBQyxDQUFDLHVCQUFELENBSFM7QUFJekJHLEVBQUFBLFdBQVcsRUFB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K0JBdUVQZ0IsS0F2RU8sRUF1RUFILElBdkVBLEVBdUVNSSxPQXZFTixFQXVFZTtBQUN2Q25DLE1BQUFBLENBQUMsQ0FBQ29DLEdBQUYsQ0FBTTtBQUNMQyxRQUFBQSxHQUFHLFlBQUtDLGFBQUwseUNBREU7QUFFTEMsUUFBQUEsRUFBRSxFQUFFLEtBRkM7QUFHTEMsUUFBQUEsTUFBTSxFQUFFLE1BSEg7QUFJTEMsUUFBQUEsSUFBSSxFQUFFO0FBQ0xDLFVBQUFBLE9BQU8sRUFBRTFDLENBQUMsQ0FBQ21DLE9BQUQsQ0FBRCxDQUFXUSxPQUFYLENBQW1CLElBQW5CLEVBQXlCM0IsSUFBekIsQ0FBOEIsSUFBOUIsQ0FESjtBQUVMNEIsVUFBQUEsUUFBUSxFQUFFVjtBQUZMLFNBSkQ7QUFRTFcsUUFBQUEsU0FSSztBQUFBLCtCQVFPLENBQ1g7QUFDQTtBQUNBOztBQVhJO0FBQUE7QUFZTEMsUUFBQUEsT0FaSztBQUFBLDJCQVlHQyxRQVpILEVBWWE7QUFDakJDLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRixRQUFaO0FBQ0E7O0FBZEk7QUFBQTtBQUFBLE9BQU47QUFnQkE7O0FBeEZ3QjtBQUFBO0FBQUEsQ0FBMUI7QUEyRkEvQyxDQUFDLENBQUNrRCxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCckQsRUFBQUEsaUJBQWlCLENBQUNNLFVBQWxCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKEMpIE1JS08gTExDIC0gQWxsIFJpZ2h0cyBSZXNlcnZlZFxuICogVW5hdXRob3JpemVkIGNvcHlpbmcgb2YgdGhpcyBmaWxlLCB2aWEgYW55IG1lZGl1bSBpcyBzdHJpY3RseSBwcm9oaWJpdGVkXG4gKiBQcm9wcmlldGFyeSBhbmQgY29uZmlkZW50aWFsXG4gKiBXcml0dGVuIGJ5IE5pa29sYXkgQmVrZXRvdiwgMTEgMjAxOVxuICpcbiAqL1xuLyogZ2xvYmFsIFNlbWFudGljTG9jYWxpemF0aW9uLCBnbG9iYWxSb290VXJsICovXG5cbmNvbnN0IE1vZHVsZVVzZXJzR3JvdXBzID0ge1xuXHQkZm9ybU9iajogJCgnI21vZHVsZS11c2VyLWdyb3Vwcy1mb3JtJyksXG5cdCRkaXNhYmlsaXR5RmllbGRzOiAkKCcjbW9kdWxlLXVzZXItZ3JvdXBzLWZvcm0gIC5kaXNhYmlsaXR5JyksXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXHQkdXNlcnNUYWJsZTogJCgnI3VzZXJzLXRhYmxlJyksXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0JCgnI21haW4tdXNlcnMtZ3JvdXBzLXRhYi1tZW51IC5pdGVtJykudGFiKCk7XG5cdFx0TW9kdWxlVXNlcnNHcm91cHMuY2hlY2tTdGF0dXNUb2dnbGUoKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignTW9kdWxlU3RhdHVzQ2hhbmdlZCcsIE1vZHVsZVVzZXJzR3JvdXBzLmNoZWNrU3RhdHVzVG9nZ2xlKTtcblx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy5pbml0aWFsaXplRGF0YVRhYmxlKCk7XG5cdFx0JCgnLnNlbGVjdC1ncm91cCcpLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdCQob2JqKS5kcm9wZG93bih7XG5cdFx0XHRcdHZhbHVlczogTW9kdWxlVXNlcnNHcm91cHMubWFrZURyb3Bkb3duTGlzdCgkKG9iaikuYXR0cignZGF0YS12YWx1ZScpKSxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdCQoJy5zZWxlY3QtZ3JvdXAnKS5kcm9wZG93bih7XG5cdFx0XHRvbkNoYW5nZTogTW9kdWxlVXNlcnNHcm91cHMuY2hhbmdlR3JvdXBJbkxpc3QsXG5cdFx0fSk7XG5cdH0sXG5cdGluaXRpYWxpemVEYXRhVGFibGUoKSB7XG5cdFx0TW9kdWxlVXNlcnNHcm91cHMuJHVzZXJzVGFibGUuRGF0YVRhYmxlKHtcblx0XHRcdC8vIGRlc3Ryb3k6IHRydWUsXG5cdFx0XHRsZW5ndGhDaGFuZ2U6IGZhbHNlLFxuXHRcdFx0cGFnaW5nOiBmYWxzZSxcblx0XHRcdGNvbHVtbnM6IFtcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdF0sXG5cdFx0XHRvcmRlcjogWzEsICdhc2MnXSxcblx0XHRcdGxhbmd1YWdlOiBTZW1hbnRpY0xvY2FsaXphdGlvbi5kYXRhVGFibGVMb2NhbGlzYXRpb24sXG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQmNC30LzQtdC90LXQvdC40LUg0YHRgtCw0YLRg9GB0LAg0LrQvdC+0L/QvtC6INC/0YDQuCDQuNC30LzQtdC90LXQvdC40Lgg0YHRgtCw0YLRg9GB0LAg0LzQvtC00YPQu9GPXG5cdCAqL1xuXHRjaGVja1N0YXR1c1RvZ2dsZSgpIHtcblx0XHRpZiAoTW9kdWxlVXNlcnNHcm91cHMuJHN0YXR1c1RvZ2dsZS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRNb2R1bGVVc2Vyc0dyb3Vwcy4kZGlzYWJpbGl0eUZpZWxkcy5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TW9kdWxlVXNlcnNHcm91cHMuJGRpc2FiaWxpdHlGaWVsZHMuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0J/QvtC00LPQvtGC0LDQstC70LjQstCw0LXRgiDRgdC/0LjRgdC+0Log0LLRi9Cx0L7RgNCwINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC5XG5cdCAqIEBwYXJhbSBzZWxlY3RlZFxuXHQgKiBAcmV0dXJucyB7W119XG5cdCAqL1xuXHRtYWtlRHJvcGRvd25MaXN0KHNlbGVjdGVkKSB7XG5cdFx0Y29uc3QgdmFsdWVzID0gW107XG5cdFx0JCgnI3VzZXJzLWdyb3Vwcy1saXN0IG9wdGlvbicpLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdGlmIChzZWxlY3RlZCA9PT0gb2JqLnRleHQpIHtcblx0XHRcdFx0dmFsdWVzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IG9iai50ZXh0LFxuXHRcdFx0XHRcdHZhbHVlOiBvYmoudmFsdWUsXG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IG9iai50ZXh0LFxuXHRcdFx0XHRcdHZhbHVlOiBvYmoudmFsdWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB2YWx1ZXM7XG5cdH0sXG5cdC8qKlxuXHQgKiDQntCx0YDQsNCx0L7RgtC60LAg0LjQt9C80LXQvdC10L3QuNGPINCz0YDRg9C/0L/RiyDQsiDRgdC/0LjRgdC60LVcblx0ICovXG5cdGNoYW5nZUdyb3VwSW5MaXN0KHZhbHVlLCB0ZXh0LCAkY2hvaWNlKSB7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlVXNlckdyb3VwL2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0dXNlcl9pZDogJCgkY2hvaWNlKS5jbG9zZXN0KCd0cicpLmF0dHIoJ2lkJyksXG5cdFx0XHRcdGdyb3VwX2lkOiB2YWx1ZSxcblx0XHRcdH0sXG5cdFx0XHRvblN1Y2Nlc3MoKSB7XG5cdFx0XHRcdC8vXHRNb2R1bGVVc2Vyc0dyb3Vwcy5pbml0aWFsaXplRGF0YVRhYmxlKCk7XG5cdFx0XHRcdC8vXHRjb25zb2xlLmxvZygndXBkYXRlZCcpO1xuXHRcdFx0fSxcblx0XHRcdG9uRXJyb3IocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0fSxcblx0XHR9KTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==