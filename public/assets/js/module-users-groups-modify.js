"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 11 2019
 *
 */

/* global globalRootUrl,globalTranslate, Form, Extensions */
var moduleUsersGroups = {
  $formObj: $('#module-users-groups-form'),
  $rulesCheckBoxes: $('#outbound-rules-table .checkbox'),
  $selectUsersDropDown: $('.select-extension-field'),
  $dirrtyField: $('#dirrty'),
  $statusToggle: $('#module-status-toggle'),
  defaultExtension: '',
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.mod_usrgr_ValidateNameIsEmpty
      }]
    }
  },
  initialize: function () {
    function initialize() {
      var _this = this;

      moduleUsersGroups.checkStatusToggle();
      window.addEventListener('ModuleStatusChanged', moduleUsersGroups.checkStatusToggle);
      moduleUsersGroups.initializeForm();
      $('.avatar').each(function () {
        if ($(_this).attr('src') === '') {
          $(_this).attr('src', "".concat(globalRootUrl, "assets/img/unknownPerson.jpg"));
        }
      });
      $('#module-users-group-modify-menu .item').tab();
      moduleUsersGroups.$rulesCheckBoxes.checkbox({
        onChange: function () {
          function onChange() {
            moduleUsersGroups.$dirrtyField.val(Math.random());
            moduleUsersGroups.$dirrtyField.trigger('change');
          }

          return onChange;
        }(),
        onChecked: function () {
          function onChecked() {
            var number = $(this).attr('data-value');
            $("#".concat(number, " .disability")).removeClass('disabled');
          }

          return onChecked;
        }(),
        onUnchecked: function () {
          function onUnchecked() {
            var number = $(this).attr('data-value');
            $("#".concat(number, " .disability")).addClass('disabled');
          }

          return onUnchecked;
        }()
      });
      moduleUsersGroups.initializeUsersDropDown();
      $('body').on('click', 'div.delete-user-row', function (e) {
        e.preventDefault();
        moduleUsersGroups.deleteMemberFromTable(e.target);
      });
    }

    return initialize;
  }(),

  /**
   * Delete Group member from list
   * @param target - link to pushed button
   */
  deleteMemberFromTable: function () {
    function deleteMemberFromTable(target) {
      var id = $(target).closest('div').attr('data-value');
      $("#".concat(id)).removeClass('selected-member').hide();
      moduleUsersGroups.$dirrtyField.val(Math.random());
      moduleUsersGroups.$dirrtyField.trigger('change');
    }

    return deleteMemberFromTable;
  }(),

  /**
   * Настройка выпадающего списка пользователей
   */
  initializeUsersDropDown: function () {
    function initializeUsersDropDown() {
      var dropdownParams = Extensions.getDropdownSettingsOnlyInternalWithoutEmpty();
      dropdownParams.action = moduleUsersGroups.cbAfterUsersSelect;
      dropdownParams.templates = {
        menu: moduleUsersGroups.customDropdownMenu
      };
      moduleUsersGroups.$selectUsersDropDown.dropdown(dropdownParams);
    }

    return initializeUsersDropDown;
  }(),

  /**
   * Change custom menu visualisation
   * @param response
   * @param fields
   * @returns {string}
   */
  customDropdownMenu: function () {
    function customDropdownMenu(response, fields) {
      var values = response[fields.values] || {};
      var html = '';
      var oldType = '';
      $.each(values, function (index, option) {
        if (option.type !== oldType) {
          oldType = option.type;
          html += '<div class="divider"></div>';
          html += '	<div class="header">';
          html += '	<i class="tags icon"></i>';
          html += option.typeLocalized;
          html += '</div>';
        }

        var maybeText = option[fields.text] ? "data-text=\"".concat(option[fields.text], "\"") : '';
        var maybeDisabled = $("#ext-".concat(option[fields.value])).hasClass('selected-member') ? 'disabled ' : '';
        html += "<div class=\"".concat(maybeDisabled, "item\" data-value=\"").concat(option[fields.value], "\"").concat(maybeText, ">");
        html += option[fields.name];
        html += '</div>';
      });
      return html;
    }

    return customDropdownMenu;
  }(),

  /**
   * Колбек после выбора пользователя в группу
   * @param value
   */
  cbAfterUsersSelect: function () {
    function cbAfterUsersSelect(text, value, $element) {
      $("#ext-".concat(value)).closest('tr').addClass('selected-member').show();
      $($element).addClass('disabled');
      moduleUsersGroups.$dirrtyField.val(Math.random());
      moduleUsersGroups.$dirrtyField.trigger('change');
    }

    return cbAfterUsersSelect;
  }(),

  /**
   * Изменение статуса кнопок при изменении статуса модуля
   */
  checkStatusToggle: function () {
    function checkStatusToggle() {
      if (moduleUsersGroups.$statusToggle.checkbox('is checked')) {
        $('[data-tab = "general"] .disability').removeClass('disabled');
        $('[data-tab="rules"] .checkbox').removeClass('disabled');
        $('[data-tab = "users"] .disability').removeClass('disabled');
      } else {
        $('[data-tab = "general"] .disability').addClass('disabled');
        $('[data-tab="rules"] .checkbox').addClass('disabled');
        $('[data-tab = "users"] .disability').addClass('disabled');
      }
    }

    return checkStatusToggle;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = moduleUsersGroups.$formObj.form('get values');
      var arrMembers = [];
      $('tr.selected-member').each(function (index, obj) {
        if ($(obj).attr('id')) {
          arrMembers.push($(obj).attr('id'));
        }
      });
      result.data.members = JSON.stringify(arrMembers);
      return result;
    }

    return cbBeforeSendForm;
  }(),
  cbAfterSendForm: function () {
    function cbAfterSendForm() {}

    return cbAfterSendForm;
  }(),
  initializeForm: function () {
    function initializeForm() {
      Form.$formObj = moduleUsersGroups.$formObj;
      Form.url = "".concat(globalRootUrl, "module-users-groups/save");
      Form.validateRules = moduleUsersGroups.validateRules;
      Form.cbBeforeSendForm = moduleUsersGroups.cbBeforeSendForm;
      Form.cbAfterSendForm = moduleUsersGroups.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};
$(document).ready(function () {
  moduleUsersGroups.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJtb2R1bGVVc2Vyc0dyb3VwcyIsIiRmb3JtT2JqIiwiJCIsIiRydWxlc0NoZWNrQm94ZXMiLCIkc2VsZWN0VXNlcnNEcm9wRG93biIsIiRkaXJydHlGaWVsZCIsIiRzdGF0dXNUb2dnbGUiLCJkZWZhdWx0RXh0ZW5zaW9uIiwidmFsaWRhdGVSdWxlcyIsIm5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kX3VzcmdyX1ZhbGlkYXRlTmFtZUlzRW1wdHkiLCJpbml0aWFsaXplIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZUZvcm0iLCJlYWNoIiwiYXR0ciIsImdsb2JhbFJvb3RVcmwiLCJ0YWIiLCJjaGVja2JveCIsIm9uQ2hhbmdlIiwidmFsIiwiTWF0aCIsInJhbmRvbSIsInRyaWdnZXIiLCJvbkNoZWNrZWQiLCJudW1iZXIiLCJyZW1vdmVDbGFzcyIsIm9uVW5jaGVja2VkIiwiYWRkQ2xhc3MiLCJpbml0aWFsaXplVXNlcnNEcm9wRG93biIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZGVsZXRlTWVtYmVyRnJvbVRhYmxlIiwidGFyZ2V0IiwiaWQiLCJjbG9zZXN0IiwiaGlkZSIsImRyb3Bkb3duUGFyYW1zIiwiRXh0ZW5zaW9ucyIsImdldERyb3Bkb3duU2V0dGluZ3NPbmx5SW50ZXJuYWxXaXRob3V0RW1wdHkiLCJhY3Rpb24iLCJjYkFmdGVyVXNlcnNTZWxlY3QiLCJ0ZW1wbGF0ZXMiLCJtZW51IiwiY3VzdG9tRHJvcGRvd25NZW51IiwiZHJvcGRvd24iLCJyZXNwb25zZSIsImZpZWxkcyIsInZhbHVlcyIsImh0bWwiLCJvbGRUeXBlIiwiaW5kZXgiLCJvcHRpb24iLCJ0eXBlTG9jYWxpemVkIiwibWF5YmVUZXh0IiwidGV4dCIsIm1heWJlRGlzYWJsZWQiLCJ2YWx1ZSIsImhhc0NsYXNzIiwiJGVsZW1lbnQiLCJzaG93IiwiY2JCZWZvcmVTZW5kRm9ybSIsInNldHRpbmdzIiwicmVzdWx0IiwiZGF0YSIsImZvcm0iLCJhcnJNZW1iZXJzIiwib2JqIiwicHVzaCIsIm1lbWJlcnMiLCJKU09OIiwic3RyaW5naWZ5IiwiY2JBZnRlclNlbmRGb3JtIiwiRm9ybSIsInVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBUUE7QUFHQSxJQUFNQSxpQkFBaUIsR0FBRztBQUN6QkMsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsMkJBQUQsQ0FEYztBQUV6QkMsRUFBQUEsZ0JBQWdCLEVBQUVELENBQUMsQ0FBQyxpQ0FBRCxDQUZNO0FBR3pCRSxFQUFBQSxvQkFBb0IsRUFBRUYsQ0FBQyxDQUFDLHlCQUFELENBSEU7QUFJekJHLEVBQUFBLFlBQVksRUFBRUgsQ0FBQyxDQUFDLFNBQUQsQ0FKVTtBQUt6QkksRUFBQUEsYUFBYSxFQUFFSixDQUFDLENBQUMsdUJBQUQsQ0FMUztBQU16QkssRUFBQUEsZ0JBQWdCLEVBQUUsRUFOTztBQU96QkMsRUFBQUEsYUFBYSxFQUFFO0FBQ2RDLElBQUFBLElBQUksRUFBRTtBQUNMQyxNQUFBQSxVQUFVLEVBQUUsTUFEUDtBQUVMQyxNQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDQyxRQUFBQSxJQUFJLEVBQUUsT0FEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ0M7QUFGekIsT0FETTtBQUZGO0FBRFEsR0FQVTtBQWtCekJDLEVBQUFBLFVBbEJ5QjtBQUFBLDBCQWtCWjtBQUFBOztBQUNaaEIsTUFBQUEsaUJBQWlCLENBQUNpQixpQkFBbEI7QUFDQUMsTUFBQUEsTUFBTSxDQUFDQyxnQkFBUCxDQUF3QixxQkFBeEIsRUFBK0NuQixpQkFBaUIsQ0FBQ2lCLGlCQUFqRTtBQUNBakIsTUFBQUEsaUJBQWlCLENBQUNvQixjQUFsQjtBQUNBbEIsTUFBQUEsQ0FB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LElBQUksQ0FBQ0QsZUFBTCxHQUF1QmhGLGlCQUFpQixDQUFDZ0YsZUFBekM7QUFDQUMsTUFBQUEsSUFBSSxDQUFDakUsVUFBTDtBQUNBOztBQXJKd0I7QUFBQTtBQUFBLENBQTFCO0FBd0pBZCxDQUFDLENBQUNpRixRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCcEYsRUFBQUEsaUJBQWlCLENBQUNnQixVQUFsQjtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChDKSBNSUtPIExMQyAtIEFsbCBSaWdodHMgUmVzZXJ2ZWRcbiAqIFVuYXV0aG9yaXplZCBjb3B5aW5nIG9mIHRoaXMgZmlsZSwgdmlhIGFueSBtZWRpdW0gaXMgc3RyaWN0bHkgcHJvaGliaXRlZFxuICogUHJvcHJpZXRhcnkgYW5kIGNvbmZpZGVudGlhbFxuICogV3JpdHRlbiBieSBOaWtvbGF5IEJla2V0b3YsIDExIDIwMTlcbiAqXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsZ2xvYmFsVHJhbnNsYXRlLCBGb3JtLCBFeHRlbnNpb25zICovXG5cblxuY29uc3QgbW9kdWxlVXNlcnNHcm91cHMgPSB7XG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLXVzZXJzLWdyb3Vwcy1mb3JtJyksXG5cdCRydWxlc0NoZWNrQm94ZXM6ICQoJyNvdXRib3VuZC1ydWxlcy10YWJsZSAuY2hlY2tib3gnKSxcblx0JHNlbGVjdFVzZXJzRHJvcERvd246ICQoJy5zZWxlY3QtZXh0ZW5zaW9uLWZpZWxkJyksXG5cdCRkaXJydHlGaWVsZDogJCgnI2RpcnJ0eScpLFxuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblx0ZGVmYXVsdEV4dGVuc2lvbjogJycsXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRuYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnbmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2RfdXNyZ3JfVmFsaWRhdGVOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy5jaGVja1N0YXR1c1RvZ2dsZSgpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgbW9kdWxlVXNlcnNHcm91cHMuY2hlY2tTdGF0dXNUb2dnbGUpO1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVGb3JtKCk7XG5cdFx0JCgnLmF2YXRhcicpLmVhY2goKCkgPT4ge1xuXHRcdFx0aWYgKCQodGhpcykuYXR0cignc3JjJykgPT09ICcnKSB7XG5cdFx0XHRcdCQodGhpcykuYXR0cignc3JjJywgYCR7Z2xvYmFsUm9vdFVybH1hc3NldHMvaW1nL3Vua25vd25QZXJzb24uanBnYCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0JCgnI21vZHVsZS11c2Vycy1ncm91cC1tb2RpZnktbWVudSAuaXRlbScpLnRhYigpO1xuXG5cdFx0bW9kdWxlVXNlcnNHcm91cHMuJHJ1bGVzQ2hlY2tCb3hlcy5jaGVja2JveCh7XG5cdFx0XHRvbkNoYW5nZSgpIHtcblx0XHRcdFx0bW9kdWxlVXNlcnNHcm91cHMuJGRpcnJ0eUZpZWxkLnZhbChNYXRoLnJhbmRvbSgpKTtcblx0XHRcdFx0bW9kdWxlVXNlcnNHcm91cHMuJGRpcnJ0eUZpZWxkLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHRcdFx0fSxcblx0XHRcdG9uQ2hlY2tlZCgpIHtcblx0XHRcdFx0Y29uc3QgbnVtYmVyID0gJCh0aGlzKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0XHRcdCQoYCMke251bWJlcn0gLmRpc2FiaWxpdHlgKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvblVuY2hlY2tlZCgpIHtcblx0XHRcdFx0Y29uc3QgbnVtYmVyID0gJCh0aGlzKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0XHRcdCQoYCMke251bWJlcn0gLmRpc2FiaWxpdHlgKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy5pbml0aWFsaXplVXNlcnNEcm9wRG93bigpO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdkaXYuZGVsZXRlLXVzZXItcm93JywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdG1vZHVsZVVzZXJzR3JvdXBzLmRlbGV0ZU1lbWJlckZyb21UYWJsZShlLnRhcmdldCk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBEZWxldGUgR3JvdXAgbWVtYmVyIGZyb20gbGlzdFxuXHQgKiBAcGFyYW0gdGFyZ2V0IC0gbGluayB0byBwdXNoZWQgYnV0dG9uXG5cdCAqL1xuXHRkZWxldGVNZW1iZXJGcm9tVGFibGUodGFyZ2V0KSB7XG5cdFx0Y29uc3QgaWQgPSAkKHRhcmdldCkuY2xvc2VzdCgnZGl2JykuYXR0cignZGF0YS12YWx1ZScpO1xuXHRcdCQoYCMke2lkfWApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkLW1lbWJlcicpXG5cdFx0XHQuaGlkZSgpO1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLiRkaXJydHlGaWVsZC52YWwoTWF0aC5yYW5kb20oKSk7XG5cdFx0bW9kdWxlVXNlcnNHcm91cHMuJGRpcnJ0eUZpZWxkLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHR9LFxuXHQvKipcblx0ICog0J3QsNGB0YLRgNC+0LnQutCwINCy0YvQv9Cw0LTQsNGO0YnQtdCz0L4g0YHQv9C40YHQutCwINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC5XG5cdCAqL1xuXHRpbml0aWFsaXplVXNlcnNEcm9wRG93bigpIHtcblx0XHRjb25zdCBkcm9wZG93blBhcmFtcyA9IEV4dGVuc2lvbnMuZ2V0RHJvcGRvd25TZXR0aW5nc09ubHlJbnRlcm5hbFdpdGhvdXRFbXB0eSgpO1xuXHRcdGRyb3Bkb3duUGFyYW1zLmFjdGlvbiA9IG1vZHVsZVVzZXJzR3JvdXBzLmNiQWZ0ZXJVc2Vyc1NlbGVjdDtcblx0XHRkcm9wZG93blBhcmFtcy50ZW1wbGF0ZXMgPSB7IG1lbnU6IG1vZHVsZVVzZXJzR3JvdXBzLmN1c3RvbURyb3Bkb3duTWVudSB9O1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLiRzZWxlY3RVc2Vyc0Ryb3BEb3duLmRyb3Bkb3duKGRyb3Bkb3duUGFyYW1zKTtcblx0fSxcblx0LyoqXG5cdCAqIENoYW5nZSBjdXN0b20gbWVudSB2aXN1YWxpc2F0aW9uXG5cdCAqIEBwYXJhbSByZXNwb25zZVxuXHQgKiBAcGFyYW0gZmllbGRzXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHRjdXN0b21Ecm9wZG93bk1lbnUocmVzcG9uc2UsIGZpZWxkcykge1xuXHRcdGNvbnN0IHZhbHVlcyA9IHJlc3BvbnNlW2ZpZWxkcy52YWx1ZXNdIHx8IHt9O1xuXHRcdGxldCBodG1sID0gJyc7XG5cdFx0bGV0IG9sZFR5cGUgPSAnJztcblx0XHQkLmVhY2godmFsdWVzLCAoaW5kZXgsIG9wdGlvbikgPT4ge1xuXHRcdFx0aWYgKG9wdGlvbi50eXBlICE9PSBvbGRUeXBlKSB7XG5cdFx0XHRcdG9sZFR5cGUgPSBvcHRpb24udHlwZTtcblx0XHRcdFx0aHRtbCArPSAnPGRpdiBjbGFzcz1cImRpdmlkZXJcIj48L2Rpdj4nO1xuXHRcdFx0XHRodG1sICs9ICdcdDxkaXYgY2xhc3M9XCJoZWFkZXJcIj4nO1xuXHRcdFx0XHRodG1sICs9ICdcdDxpIGNsYXNzPVwidGFncyBpY29uXCI+PC9pPic7XG5cdFx0XHRcdGh0bWwgKz0gb3B0aW9uLnR5cGVMb2NhbGl6ZWQ7XG5cdFx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBtYXliZVRleHQgPSAob3B0aW9uW2ZpZWxkcy50ZXh0XSkgPyBgZGF0YS10ZXh0PVwiJHtvcHRpb25bZmllbGRzLnRleHRdfVwiYCA6ICcnO1xuXHRcdFx0Y29uc3QgbWF5YmVEaXNhYmxlZCA9ICgkKGAjZXh0LSR7b3B0aW9uW2ZpZWxkcy52YWx1ZV19YCkuaGFzQ2xhc3MoJ3NlbGVjdGVkLW1lbWJlcicpKSA/ICdkaXNhYmxlZCAnIDogJyc7XG5cdFx0XHRodG1sICs9IGA8ZGl2IGNsYXNzPVwiJHttYXliZURpc2FibGVkfWl0ZW1cIiBkYXRhLXZhbHVlPVwiJHtvcHRpb25bZmllbGRzLnZhbHVlXX1cIiR7bWF5YmVUZXh0fT5gO1xuXHRcdFx0aHRtbCArPSBvcHRpb25bZmllbGRzLm5hbWVdO1xuXHRcdFx0aHRtbCArPSAnPC9kaXY+Jztcblx0XHR9KTtcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0LyoqXG5cdCAqINCa0L7Qu9Cx0LXQuiDQv9C+0YHQu9C1INCy0YvQsdC+0YDQsCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8g0LIg0LPRgNGD0L/Qv9GDXG5cdCAqIEBwYXJhbSB2YWx1ZVxuXHQgKi9cblx0Y2JBZnRlclVzZXJzU2VsZWN0KHRleHQsIHZhbHVlLCAkZWxlbWVudCkge1xuXHRcdCQoYCNleHQtJHt2YWx1ZX1gKVxuXHRcdFx0LmNsb3Nlc3QoJ3RyJylcblx0XHRcdC5hZGRDbGFzcygnc2VsZWN0ZWQtbWVtYmVyJylcblx0XHRcdC5zaG93KCk7XG5cdFx0JCgkZWxlbWVudCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0bW9kdWxlVXNlcnNHcm91cHMuJGRpcnJ0eUZpZWxkLnZhbChNYXRoLnJhbmRvbSgpKTtcblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kZGlycnR5RmllbGQudHJpZ2dlcignY2hhbmdlJyk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQmNC30LzQtdC90LXQvdC40LUg0YHRgtCw0YLRg9GB0LAg0LrQvdC+0L/QvtC6INC/0YDQuCDQuNC30LzQtdC90LXQvdC40Lgg0YHRgtCw0YLRg9GB0LAg0LzQvtC00YPQu9GPXG5cdCAqL1xuXHRjaGVja1N0YXR1c1RvZ2dsZSgpIHtcblx0XHRpZiAobW9kdWxlVXNlcnNHcm91cHMuJHN0YXR1c1RvZ2dsZS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHQkKCdbZGF0YS10YWIgPSBcImdlbmVyYWxcIl0gLmRpc2FiaWxpdHknKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYj1cInJ1bGVzXCJdIC5jaGVja2JveCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJ1c2Vyc1wiXSAuZGlzYWJpbGl0eScpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdbZGF0YS10YWIgPSBcImdlbmVyYWxcIl0gLmRpc2FiaWxpdHknKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYj1cInJ1bGVzXCJdIC5jaGVja2JveCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJ1c2Vyc1wiXSAuZGlzYWJpbGl0eScpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH1cblx0fSxcblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gbW9kdWxlVXNlcnNHcm91cHMuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdGNvbnN0IGFyck1lbWJlcnMgPSBbXTtcblx0XHQkKCd0ci5zZWxlY3RlZC1tZW1iZXInKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoJChvYmopLmF0dHIoJ2lkJykpIHtcblx0XHRcdFx0YXJyTWVtYmVycy5wdXNoKCQob2JqKS5hdHRyKCdpZCcpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJlc3VsdC5kYXRhLm1lbWJlcnMgPSBKU09OLnN0cmluZ2lmeShhcnJNZW1iZXJzKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cblx0fSxcblx0aW5pdGlhbGl6ZUZvcm0oKSB7XG5cdFx0Rm9ybS4kZm9ybU9iaiA9IG1vZHVsZVVzZXJzR3JvdXBzLiRmb3JtT2JqO1xuXHRcdEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IG1vZHVsZVVzZXJzR3JvdXBzLnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gbW9kdWxlVXNlcnNHcm91cHMuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IG1vZHVsZVVzZXJzR3JvdXBzLmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0bW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==