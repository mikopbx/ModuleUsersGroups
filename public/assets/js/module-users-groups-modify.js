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

/* global globalRootUrl,globalTranslate, Form, Extensions */

/**
 * Call groups module configuration.
 * @namespace moduleUsersGroups
 */
var moduleUsersGroups = {
  /**
   * jQuery object representing the module's form.
   * @type {jQuery}
   */
  $formObj: $('#module-users-groups-form'),
  $rulesCheckBoxes: $('#outbound-rules-table .checkbox'),
  $selectUsersDropDown: $('.select-extension-field'),
  $showOnlyOnIsolateGroup: $('.show-only-on-isolate-group'),
  $statusToggle: $('#module-status-toggle'),
  $isolateCheckBox: $('#isolate').parent('.checkbox'),
  $isolatePickupCheckBox: $('#isolatePickUp').parent('.checkbox'),
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.mod_usrgr_ValidateNameIsEmpty
      }]
    }
  },

  /**
   * Initializes the module.
   * @memberof moduleUsersGroups
   */
  initialize: function initialize() {
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
      onChange: function onChange() {
        Form.dataChanged();
      },
      onChecked: function onChecked() {
        var number = $(this).attr('data-value');
        $("#".concat(number, " .disability")).removeClass('disabled');
      },
      onUnchecked: function onUnchecked() {
        var number = $(this).attr('data-value');
        $("#".concat(number, " .disability")).addClass('disabled');
      }
    });
    moduleUsersGroups.initializeUsersDropDown();
    $('body').on('click', 'div.delete-user-row', function (e) {
      e.preventDefault();
      moduleUsersGroups.deleteMemberFromTable(e.target);
    });
    moduleUsersGroups.$isolateCheckBox.checkbox({
      onChange: moduleUsersGroups.cbAfterChangeIsolate
    });
    moduleUsersGroups.cbAfterChangeIsolate();
  },

  /**
   * Handle isolation change.
   * @memberof moduleUsersGroups
   */
  cbAfterChangeIsolate: function cbAfterChangeIsolate() {
    if (moduleUsersGroups.$isolateCheckBox.checkbox('is checked')) {
      moduleUsersGroups.$isolatePickupCheckBox.hide();
      moduleUsersGroups.$showOnlyOnIsolateGroup.show();
    } else {
      moduleUsersGroups.$isolatePickupCheckBox.show();
      moduleUsersGroups.$showOnlyOnIsolateGroup.hide();
    }
  },

  /**
   * Delete Group member from list.
   * @memberof moduleUsersGroups
   * @param {HTMLElement} target - Link to the pushed button.
   */
  deleteMemberFromTable: function deleteMemberFromTable(target) {
    var id = $(target).closest('div').attr('data-value');
    $("#".concat(id)).removeClass('selected-member').hide();
    Form.dataChanged();
  },

  /**
   * Initializes the dropdown for selecting users.
   * @memberof moduleUsersGroups
   */
  initializeUsersDropDown: function initializeUsersDropDown() {
    var dropdownParams = Extensions.getDropdownSettingsOnlyInternalWithoutEmpty();
    dropdownParams.action = moduleUsersGroups.cbAfterUsersSelect;
    dropdownParams.templates = {
      menu: moduleUsersGroups.customDropdownMenu
    };
    moduleUsersGroups.$selectUsersDropDown.dropdown(dropdownParams);
  },

  /**
   * Customizes the dropdown menu.
   * @memberof moduleUsersGroups
   * @param {Object} response - Response data.
   * @param {Object} fields - Field properties.
   * @returns {string} The HTML for the custom dropdown menu.
   */
  customDropdownMenu: function customDropdownMenu(response, fields) {
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
  },

  /**
   * Callback after selecting a user in the group.
   * @memberof moduleUsersGroups
   * @param {string} text - Selected user's text.
   * @param {string} value - Selected user's value.
   * @param {jQuery} $element - The jQuery element representing the selected user.
   */
  cbAfterUsersSelect: function cbAfterUsersSelect(text, value, $element) {
    $("#ext-".concat(value)).closest('tr').addClass('selected-member').show();
    $($element).addClass('disabled');
    Form.dataChanged();
  },

  /**
   * Checks and updates button status when the module status changes.
   * @memberof moduleUsersGroups
   */
  checkStatusToggle: function checkStatusToggle() {
    if (moduleUsersGroups.$statusToggle.checkbox('is checked')) {
      $('[data-tab = "general"] .disability').removeClass('disabled');
      $('[data-tab="rules"] .checkbox').removeClass('disabled');
      $('[data-tab = "users"] .disability').removeClass('disabled');
    } else {
      $('[data-tab = "general"] .disability').addClass('disabled');
      $('[data-tab="rules"] .checkbox').addClass('disabled');
      $('[data-tab = "users"] .disability').addClass('disabled');
    }
  },

  /**
   * Callback before sending the form.
   * @memberof moduleUsersGroups
   * @param {Object} settings - Ajax request settings.
   * @returns {Object} The modified Ajax request settings.
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
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
  },

  /**
   * Callback after sending the form.
   * @memberof moduleUsersGroups
   */
  cbAfterSendForm: function cbAfterSendForm() {},

  /**
   * Initializes the form.
   * @memberof moduleUsersGroups
   */
  initializeForm: function initializeForm() {
    Form.$formObj = moduleUsersGroups.$formObj;
    Form.url = "".concat(globalRootUrl, "module-users-groups/module-users-groups/save");
    Form.validateRules = moduleUsersGroups.validateRules;
    Form.cbBeforeSendForm = moduleUsersGroups.cbBeforeSendForm;
    Form.cbAfterSendForm = moduleUsersGroups.cbAfterSendForm;
    Form.initialize();
  }
};
$(document).ready(function () {
  moduleUsersGroups.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJtb2R1bGVVc2Vyc0dyb3VwcyIsIiRmb3JtT2JqIiwiJCIsIiRydWxlc0NoZWNrQm94ZXMiLCIkc2VsZWN0VXNlcnNEcm9wRG93biIsIiRzaG93T25seU9uSXNvbGF0ZUdyb3VwIiwiJHN0YXR1c1RvZ2dsZSIsIiRpc29sYXRlQ2hlY2tCb3giLCJwYXJlbnQiLCIkaXNvbGF0ZVBpY2t1cENoZWNrQm94IiwidmFsaWRhdGVSdWxlcyIsIm5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kX3VzcmdyX1ZhbGlkYXRlTmFtZUlzRW1wdHkiLCJpbml0aWFsaXplIiwiY2hlY2tTdGF0dXNUb2dnbGUiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdGlhbGl6ZUZvcm0iLCJlYWNoIiwiYXR0ciIsImdsb2JhbFJvb3RVcmwiLCJ0YWIiLCJjaGVja2JveCIsIm9uQ2hhbmdlIiwiRm9ybSIsImRhdGFDaGFuZ2VkIiwib25DaGVja2VkIiwibnVtYmVyIiwicmVtb3ZlQ2xhc3MiLCJvblVuY2hlY2tlZCIsImFkZENsYXNzIiwiaW5pdGlhbGl6ZVVzZXJzRHJvcERvd24iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImRlbGV0ZU1lbWJlckZyb21UYWJsZSIsInRhcmdldCIsImNiQWZ0ZXJDaGFuZ2VJc29sYXRlIiwiaGlkZSIsInNob3ciLCJpZCIsImNsb3Nlc3QiLCJkcm9wZG93blBhcmFtcyIsIkV4dGVuc2lvbnMiLCJnZXREcm9wZG93blNldHRpbmdzT25seUludGVybmFsV2l0aG91dEVtcHR5IiwiYWN0aW9uIiwiY2JBZnRlclVzZXJzU2VsZWN0IiwidGVtcGxhdGVzIiwibWVudSIsImN1c3RvbURyb3Bkb3duTWVudSIsImRyb3Bkb3duIiwicmVzcG9uc2UiLCJmaWVsZHMiLCJ2YWx1ZXMiLCJodG1sIiwib2xkVHlwZSIsImluZGV4Iiwib3B0aW9uIiwidHlwZUxvY2FsaXplZCIsIm1heWJlVGV4dCIsInRleHQiLCJtYXliZURpc2FibGVkIiwidmFsdWUiLCJoYXNDbGFzcyIsIiRlbGVtZW50IiwiY2JCZWZvcmVTZW5kRm9ybSIsInNldHRpbmdzIiwicmVzdWx0IiwiZGF0YSIsImZvcm0iLCJhcnJNZW1iZXJzIiwib2JqIiwicHVzaCIsIm1lbWJlcnMiLCJKU09OIiwic3RyaW5naWZ5IiwiY2JBZnRlclNlbmRGb3JtIiwidXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsaUJBQWlCLEdBQUc7QUFDekI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsMkJBQUQsQ0FMYztBQU16QkMsRUFBQUEsZ0JBQWdCLEVBQUVELENBQUMsQ0FBQyxpQ0FBRCxDQU5NO0FBT3pCRSxFQUFBQSxvQkFBb0IsRUFBRUYsQ0FBQyxDQUFDLHlCQUFELENBUEU7QUFRekJHLEVBQUFBLHVCQUF1QixFQUFFSCxDQUFDLENBQUMsNkJBQUQsQ0FSRDtBQVN6QkksRUFBQUEsYUFBYSxFQUFFSixDQUFDLENBQUMsdUJBQUQsQ0FUUztBQVV6QkssRUFBQUEsZ0JBQWdCLEVBQUVMLENBQUMsQ0FBQyxVQUFELENBQUQsQ0FBY00sTUFBZCxDQUFxQixXQUFyQixDQVZPO0FBV3pCQyxFQUFBQSxzQkFBc0IsRUFBRVAsQ0FBQyxDQUFDLGdCQUFELENBQUQsQ0FBb0JNLE1BQXBCLENBQTJCLFdBQTNCLENBWEM7QUFhekJFLEVBQUFBLGFBQWEsRUFBRTtBQUNkQyxJQUFBQSxJQUFJLEVBQUU7QUFDTEMsTUFBQUEsVUFBVSxFQUFFLE1BRFA7QUFFTEMsTUFBQUEsS0FBSyxF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QyxDQUFDMEUsR0FBRCxDQUFELENBQU9wRCxJQUFQLENBQVksSUFBWixDQUFoQjtBQUNBO0FBQ0QsS0FKRDtBQU1BZ0QsSUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlLLE9BQVosR0FBc0JDLElBQUksQ0FBQ0MsU0FBTCxDQUFlTCxVQUFmLENBQXRCO0FBQ0EsV0FBT0gsTUFBUDtBQUNBLEdBeEx3Qjs7QUEwTHpCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NTLEVBQUFBLGVBOUx5Qiw2QkE4TFAsQ0FFakIsQ0FoTXdCOztBQWtNekI7QUFDRDtBQUNBO0FBQ0E7QUFDQzNELEVBQUFBLGNBdE15Qiw0QkFzTVI7QUFDaEJPLElBQUFBLElBQUksQ0FBQzVCLFFBQUwsR0FBZ0JELGlCQUFpQixDQUFDQyxRQUFsQztBQUNBNEIsSUFBQUEsSUFBSSxDQUFDcUQsR0FBTCxhQUFjekQsYUFBZDtBQUNBSSxJQUFBQSxJQUFJLENBQUNuQixhQUFMLEdBQXFCVixpQkFBaUIsQ0FBQ1UsYUFBdkM7QUFDQW1CLElBQUFBLElBQUksQ0FBQ3lDLGdCQUFMLEdBQXdCdEUsaUJBQWlCLENBQUNzRSxnQkFBMUM7QUFDQXpDLElBQUFBLElBQUksQ0FBQ29ELGVBQUwsR0FBdUJqRixpQkFBaUIsQ0FBQ2lGLGVBQXpDO0FBQ0FwRCxJQUFBQSxJQUFJLENBQUNYLFVBQUw7QUFDQTtBQTdNd0IsQ0FBMUI7QUFnTkFoQixDQUFDLENBQUNpRixRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCcEYsRUFBQUEsaUJBQWlCLENBQUNrQixVQUFsQjtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCxnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIEV4dGVuc2lvbnMgKi9cblxuLyoqXG4gKiBDYWxsIGdyb3VwcyBtb2R1bGUgY29uZmlndXJhdGlvbi5cbiAqIEBuYW1lc3BhY2UgbW9kdWxlVXNlcnNHcm91cHNcbiAqL1xuY29uc3QgbW9kdWxlVXNlcnNHcm91cHMgPSB7XG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kdWxlJ3MgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLXVzZXJzLWdyb3Vwcy1mb3JtJyksXG5cdCRydWxlc0NoZWNrQm94ZXM6ICQoJyNvdXRib3VuZC1ydWxlcy10YWJsZSAuY2hlY2tib3gnKSxcblx0JHNlbGVjdFVzZXJzRHJvcERvd246ICQoJy5zZWxlY3QtZXh0ZW5zaW9uLWZpZWxkJyksXG5cdCRzaG93T25seU9uSXNvbGF0ZUdyb3VwOiAkKCcuc2hvdy1vbmx5LW9uLWlzb2xhdGUtZ3JvdXAnKSxcblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cdCRpc29sYXRlQ2hlY2tCb3g6ICQoJyNpc29sYXRlJykucGFyZW50KCcuY2hlY2tib3gnKSxcblx0JGlzb2xhdGVQaWNrdXBDaGVja0JveDogJCgnI2lzb2xhdGVQaWNrVXAnKS5wYXJlbnQoJy5jaGVja2JveCcpLFxuXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRuYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnbmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2RfdXNyZ3JfVmFsaWRhdGVOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ01vZHVsZVN0YXR1c0NoYW5nZWQnLCBtb2R1bGVVc2Vyc0dyb3Vwcy5jaGVja1N0YXR1c1RvZ2dsZSk7XG5cdFx0bW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZUZvcm0oKTtcblx0XHQkKCcuYXZhdGFyJykuZWFjaCgoKSA9PiB7XG5cdFx0XHRpZiAoJCh0aGlzKS5hdHRyKCdzcmMnKSA9PT0gJycpIHtcblx0XHRcdFx0JCh0aGlzKS5hdHRyKCdzcmMnLCBgJHtnbG9iYWxSb290VXJsfWFzc2V0cy9pbWcvdW5rbm93blBlcnNvbi5qcGdgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQkKCcjbW9kdWxlLXVzZXJzLWdyb3VwLW1vZGlmeS1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kcnVsZXNDaGVja0JveGVzLmNoZWNrYm94KHtcblx0XHRcdG9uQ2hhbmdlKCkge1xuXHRcdFx0XHRGb3JtLmRhdGFDaGFuZ2VkKCk7XG5cdFx0XHR9LFxuXHRcdFx0b25DaGVja2VkKCkge1xuXHRcdFx0XHRjb25zdCBudW1iZXIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblx0XHRcdFx0JChgIyR7bnVtYmVyfSAuZGlzYWJpbGl0eWApLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0fSxcblx0XHRcdG9uVW5jaGVja2VkKCkge1xuXHRcdFx0XHRjb25zdCBudW1iZXIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblx0XHRcdFx0JChgIyR7bnVtYmVyfSAuZGlzYWJpbGl0eWApLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVVc2Vyc0Ryb3BEb3duKCk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJ2Rpdi5kZWxldGUtdXNlci1yb3cnLCAoZSkgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0bW9kdWxlVXNlcnNHcm91cHMuZGVsZXRlTWVtYmVyRnJvbVRhYmxlKGUudGFyZ2V0KTtcblx0XHR9KTtcblxuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLiRpc29sYXRlQ2hlY2tCb3guY2hlY2tib3goe1xuXHRcdFx0b25DaGFuZ2U6IG1vZHVsZVVzZXJzR3JvdXBzLmNiQWZ0ZXJDaGFuZ2VJc29sYXRlXG5cdFx0fSk7XG5cdFx0bW9kdWxlVXNlcnNHcm91cHMuY2JBZnRlckNoYW5nZUlzb2xhdGUoKTtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGlzb2xhdGlvbiBjaGFuZ2UuXG5cdCAqIEBtZW1iZXJvZiBtb2R1bGVVc2Vyc0dyb3Vwc1xuXHQgKi9cblx0Y2JBZnRlckNoYW5nZUlzb2xhdGUoKXtcblx0XHRpZihtb2R1bGVVc2Vyc0dyb3Vwcy4kaXNvbGF0ZUNoZWNrQm94LmNoZWNrYm94KCdpcyBjaGVja2VkJykpe1xuXHRcdFx0bW9kdWxlVXNlcnNHcm91cHMuJGlzb2xhdGVQaWNrdXBDaGVja0JveC5oaWRlKCk7XG5cdFx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kc2hvd09ubHlPbklzb2xhdGVHcm91cC5zaG93KCk7XG5cdFx0fWVsc2V7XG5cdFx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kaXNvbGF0ZVBpY2t1cENoZWNrQm94LnNob3coKTtcblx0XHRcdG1vZHVsZVVzZXJzR3JvdXBzLiRzaG93T25seU9uSXNvbGF0ZUdyb3VwLmhpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIERlbGV0ZSBHcm91cCBtZW1iZXIgZnJvbSBsaXN0LlxuXHQgKiBAbWVtYmVyb2YgbW9kdWxlVXNlcnNHcm91cHNcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gTGluayB0byB0aGUgcHVzaGVkIGJ1dHRvbi5cblx0ICovXG5cdGRlbGV0ZU1lbWJlckZyb21UYWJsZSh0YXJnZXQpIHtcblx0XHRjb25zdCBpZCA9ICQodGFyZ2V0KS5jbG9zZXN0KCdkaXYnKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0JChgIyR7aWR9YClcblx0XHRcdC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQtbWVtYmVyJylcblx0XHRcdC5oaWRlKCk7XG5cdFx0Rm9ybS5kYXRhQ2hhbmdlZCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZHJvcGRvd24gZm9yIHNlbGVjdGluZyB1c2Vycy5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqL1xuXHRpbml0aWFsaXplVXNlcnNEcm9wRG93bigpIHtcblx0XHRjb25zdCBkcm9wZG93blBhcmFtcyA9IEV4dGVuc2lvbnMuZ2V0RHJvcGRvd25TZXR0aW5nc09ubHlJbnRlcm5hbFdpdGhvdXRFbXB0eSgpO1xuXHRcdGRyb3Bkb3duUGFyYW1zLmFjdGlvbiA9IG1vZHVsZVVzZXJzR3JvdXBzLmNiQWZ0ZXJVc2Vyc1NlbGVjdDtcblx0XHRkcm9wZG93blBhcmFtcy50ZW1wbGF0ZXMgPSB7IG1lbnU6IG1vZHVsZVVzZXJzR3JvdXBzLmN1c3RvbURyb3Bkb3duTWVudSB9O1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLiRzZWxlY3RVc2Vyc0Ryb3BEb3duLmRyb3Bkb3duKGRyb3Bkb3duUGFyYW1zKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3VzdG9taXplcyB0aGUgZHJvcGRvd24gbWVudS5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSAtIFJlc3BvbnNlIGRhdGEuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBmaWVsZHMgLSBGaWVsZCBwcm9wZXJ0aWVzLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCBmb3IgdGhlIGN1c3RvbSBkcm9wZG93biBtZW51LlxuXHQgKi9cblx0Y3VzdG9tRHJvcGRvd25NZW51KHJlc3BvbnNlLCBmaWVsZHMpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSByZXNwb25zZVtmaWVsZHMudmFsdWVzXSB8fCB7fTtcblx0XHRsZXQgaHRtbCA9ICcnO1xuXHRcdGxldCBvbGRUeXBlID0gJyc7XG5cdFx0JC5lYWNoKHZhbHVlcywgKGluZGV4LCBvcHRpb24pID0+IHtcblx0XHRcdGlmIChvcHRpb24udHlwZSAhPT0gb2xkVHlwZSkge1xuXHRcdFx0XHRvbGRUeXBlID0gb3B0aW9uLnR5cGU7XG5cdFx0XHRcdGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkaXZpZGVyXCI+PC9kaXY+Jztcblx0XHRcdFx0aHRtbCArPSAnXHQ8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+Jztcblx0XHRcdFx0aHRtbCArPSAnXHQ8aSBjbGFzcz1cInRhZ3MgaWNvblwiPjwvaT4nO1xuXHRcdFx0XHRodG1sICs9IG9wdGlvbi50eXBlTG9jYWxpemVkO1xuXHRcdFx0XHRodG1sICs9ICc8L2Rpdj4nO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbWF5YmVUZXh0ID0gKG9wdGlvbltmaWVsZHMudGV4dF0pID8gYGRhdGEtdGV4dD1cIiR7b3B0aW9uW2ZpZWxkcy50ZXh0XX1cImAgOiAnJztcblx0XHRcdGNvbnN0IG1heWJlRGlzYWJsZWQgPSAoJChgI2V4dC0ke29wdGlvbltmaWVsZHMudmFsdWVdfWApLmhhc0NsYXNzKCdzZWxlY3RlZC1tZW1iZXInKSkgPyAnZGlzYWJsZWQgJyA6ICcnO1xuXHRcdFx0aHRtbCArPSBgPGRpdiBjbGFzcz1cIiR7bWF5YmVEaXNhYmxlZH1pdGVtXCIgZGF0YS12YWx1ZT1cIiR7b3B0aW9uW2ZpZWxkcy52YWx1ZV19XCIke21heWJlVGV4dH0+YDtcblx0XHRcdGh0bWwgKz0gb3B0aW9uW2ZpZWxkcy5uYW1lXTtcblx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGFmdGVyIHNlbGVjdGluZyBhIHVzZXIgaW4gdGhlIGdyb3VwLlxuXHQgKiBAbWVtYmVyb2YgbW9kdWxlVXNlcnNHcm91cHNcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBTZWxlY3RlZCB1c2VyJ3MgdGV4dC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gU2VsZWN0ZWQgdXNlcidzIHZhbHVlLlxuXHQgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBUaGUgalF1ZXJ5IGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSBzZWxlY3RlZCB1c2VyLlxuXHQgKi9cblx0Y2JBZnRlclVzZXJzU2VsZWN0KHRleHQsIHZhbHVlLCAkZWxlbWVudCkge1xuXHRcdCQoYCNleHQtJHt2YWx1ZX1gKVxuXHRcdFx0LmNsb3Nlc3QoJ3RyJylcblx0XHRcdC5hZGRDbGFzcygnc2VsZWN0ZWQtbWVtYmVyJylcblx0XHRcdC5zaG93KCk7XG5cdFx0JCgkZWxlbWVudCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0Rm9ybS5kYXRhQ2hhbmdlZCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgYW5kIHVwZGF0ZXMgYnV0dG9uIHN0YXR1cyB3aGVuIHRoZSBtb2R1bGUgc3RhdHVzIGNoYW5nZXMuXG5cdCAqIEBtZW1iZXJvZiBtb2R1bGVVc2Vyc0dyb3Vwc1xuXHQgKi9cblx0Y2hlY2tTdGF0dXNUb2dnbGUoKSB7XG5cdFx0aWYgKG1vZHVsZVVzZXJzR3JvdXBzLiRzdGF0dXNUb2dnbGUuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJnZW5lcmFsXCJdIC5kaXNhYmlsaXR5JykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHQkKCdbZGF0YS10YWI9XCJydWxlc1wiXSAuY2hlY2tib3gnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYiA9IFwidXNlcnNcIl0gLmRpc2FiaWxpdHknKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJnZW5lcmFsXCJdIC5kaXNhYmlsaXR5JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHQkKCdbZGF0YS10YWI9XCJydWxlc1wiXSAuY2hlY2tib3gnKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYiA9IFwidXNlcnNcIl0gLmRpc2FiaWxpdHknKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAbWVtYmVyb2YgbW9kdWxlVXNlcnNHcm91cHNcblx0ICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzIC0gQWpheCByZXF1ZXN0IHNldHRpbmdzLlxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgbW9kaWZpZWQgQWpheCByZXF1ZXN0IHNldHRpbmdzLlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gbW9kdWxlVXNlcnNHcm91cHMuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdGNvbnN0IGFyck1lbWJlcnMgPSBbXTtcblx0XHQkKCd0ci5zZWxlY3RlZC1tZW1iZXInKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoJChvYmopLmF0dHIoJ2lkJykpIHtcblx0XHRcdFx0YXJyTWVtYmVycy5wdXNoKCQob2JqKS5hdHRyKCdpZCcpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJlc3VsdC5kYXRhLm1lbWJlcnMgPSBKU09OLnN0cmluZ2lmeShhcnJNZW1iZXJzKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBhZnRlciBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAbWVtYmVyb2YgbW9kdWxlVXNlcnNHcm91cHNcblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gbW9kdWxlVXNlcnNHcm91cHMuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvbW9kdWxlLXVzZXJzLWdyb3Vwcy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBtb2R1bGVVc2Vyc0dyb3Vwcy52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IG1vZHVsZVVzZXJzR3JvdXBzLmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBtb2R1bGVVc2Vyc0dyb3Vwcy5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdG1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=