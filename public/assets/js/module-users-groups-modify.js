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
    moduleUsersGroups.$cdrFilterToggles.checkbox();
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
    Form.url = "".concat(globalRootUrl, "module-users-groups/save");
    Form.validateRules = moduleUsersGroups.validateRules;
    Form.cbBeforeSendForm = moduleUsersGroups.cbBeforeSendForm;
    Form.cbAfterSendForm = moduleUsersGroups.cbAfterSendForm;
    Form.initialize();
  }
};
$(document).ready(function () {
  moduleUsersGroups.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJtb2R1bGVVc2Vyc0dyb3VwcyIsIiRmb3JtT2JqIiwiJCIsIiRydWxlc0NoZWNrQm94ZXMiLCIkc2VsZWN0VXNlcnNEcm9wRG93biIsIiRzaG93T25seU9uSXNvbGF0ZUdyb3VwIiwiJHN0YXR1c1RvZ2dsZSIsIiRpc29sYXRlQ2hlY2tCb3giLCJwYXJlbnQiLCIkaXNvbGF0ZVBpY2t1cENoZWNrQm94IiwiZGVmYXVsdEV4dGVuc2lvbiIsInZhbGlkYXRlUnVsZXMiLCJuYW1lIiwiaWRlbnRpZmllciIsInJ1bGVzIiwidHlwZSIsInByb21wdCIsImdsb2JhbFRyYW5zbGF0ZSIsIm1vZF91c3Jncl9WYWxpZGF0ZU5hbWVJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxpemVGb3JtIiwiZWFjaCIsImF0dHIiLCJnbG9iYWxSb290VXJsIiwidGFiIiwiY2hlY2tib3giLCJvbkNoYW5nZSIsIkZvcm0iLCJkYXRhQ2hhbmdlZCIsIm9uQ2hlY2tlZCIsIm51bWJlciIsInJlbW92ZUNsYXNzIiwib25VbmNoZWNrZWQiLCJhZGRDbGFzcyIsImluaXRpYWxpemVVc2Vyc0Ryb3BEb3duIiwiJGNkckZpbHRlclRvZ2dsZXMiLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImRlbGV0ZU1lbWJlckZyb21UYWJsZSIsInRhcmdldCIsImNiQWZ0ZXJDaGFuZ2VJc29sYXRlIiwiaGlkZSIsInNob3ciLCJpZCIsImNsb3Nlc3QiLCJkcm9wZG93blBhcmFtcyIsIkV4dGVuc2lvbnMiLCJnZXREcm9wZG93blNldHRpbmdzT25seUludGVybmFsV2l0aG91dEVtcHR5IiwiYWN0aW9uIiwiY2JBZnRlclVzZXJzU2VsZWN0IiwidGVtcGxhdGVzIiwibWVudSIsImN1c3RvbURyb3Bkb3duTWVudSIsImRyb3Bkb3duIiwicmVzcG9uc2UiLCJmaWVsZHMiLCJ2YWx1ZXMiLCJodG1sIiwib2xkVHlwZSIsImluZGV4Iiwib3B0aW9uIiwidHlwZUxvY2FsaXplZCIsIm1heWJlVGV4dCIsInRleHQiLCJtYXliZURpc2FibGVkIiwidmFsdWUiLCJoYXNDbGFzcyIsIiRlbGVtZW50IiwiY2JCZWZvcmVTZW5kRm9ybSIsInNldHRpbmdzIiwicmVzdWx0IiwiZGF0YSIsImZvcm0iLCJhcnJNZW1iZXJzIiwib2JqIiwicHVzaCIsIm1lbWJlcnMiLCJKU09OIiwic3RyaW5naWZ5IiwiY2JBZnRlclNlbmRGb3JtIiwidXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsaUJBQWlCLEdBQUc7QUFDekI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsMkJBQUQsQ0FMYztBQU16QkMsRUFBQUEsZ0JBQWdCLEVBQUVELENBQUMsQ0FBQyxpQ0FBRCxDQU5NO0FBT3pCRSxFQUFBQSxvQkFBb0IsRUFBRUYsQ0FBQyxDQUFDLHlCQUFELENBUEU7QUFRekJHLEVBQUFBLHVCQUF1QixFQUFFSCxDQUFDLENBQUMsNkJBQUQsQ0FSRDtBQVN6QkksRUFBQUEsYUFBYSxFQUFFSixDQUFDLENBQUMsdUJBQUQsQ0FUUztBQVV6QkssRUFBQUEsZ0JBQWdCLEVBQUVMLENBQUMsQ0FBQyxVQUFELENBQUQsQ0FBY00sTUFBZCxDQUFxQixXQUFyQixDQVZPO0FBV3pCQyxFQUFBQSxzQkFBc0IsRUFBRVAsQ0FBQyxDQUFDLGdCQUFELENBQUQsQ0FBb0JNLE1BQXBCLENBQTJCLFdBQTNCLENBWEM7QUFhekJFLEVBQUFBLGdCQUFnQixFQUFFLEVBYk87QUFjekJDLEVBQUFBLGFBQWEsRUFB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LEVBQWdCO0FBQzVDLFVBQUk1RSxDQUFDLENBQUM0RSxHQUFELENBQUQsQ0FBT3JELElBQVAsQ0FBWSxJQUFaLENBQUosRUFBdUI7QUFDdEJvRCxRQUFBQSxVQUFVLENBQUNFLElBQVgsQ0FBZ0I3RSxDQUFDLENBQUM0RSxHQUFELENBQUQsQ0FBT3JELElBQVAsQ0FBWSxJQUFaLENBQWhCO0FBQ0E7QUFDRCxLQUpEO0FBTUFpRCxJQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUssT0FBWixHQUFzQkMsSUFBSSxDQUFDQyxTQUFMLENBQWVMLFVBQWYsQ0FBdEI7QUFDQSxXQUFPSCxNQUFQO0FBQ0EsR0EzTHdCOztBQTZMekI7QUFDRDtBQUNBO0FBQ0E7QUFDQ1MsRUFBQUEsZUFqTXlCLDZCQWlNUCxDQUVqQixDQW5Nd0I7O0FBcU16QjtBQUNEO0FBQ0E7QUFDQTtBQUNDNUQsRUFBQUEsY0F6TXlCLDRCQXlNUjtBQUNoQk8sSUFBQUEsSUFBSSxDQUFDN0IsUUFBTCxHQUFnQkQsaUJBQWlCLENBQUNDLFFBQWxDO0FBQ0E2QixJQUFBQSxJQUFJLENBQUNzRCxHQUFMLGFBQWMxRCxhQUFkO0FBQ0FJLElBQUFBLElBQUksQ0FBQ25CLGFBQUwsR0FBcUJYLGlCQUFpQixDQUFDVyxhQUF2QztBQUNBbUIsSUFBQUEsSUFBSSxDQUFDMEMsZ0JBQUwsR0FBd0J4RSxpQkFBaUIsQ0FBQ3dFLGdCQUExQztBQUNBMUMsSUFBQUEsSUFBSSxDQUFDcUQsZUFBTCxHQUF1Qm5GLGlCQUFpQixDQUFDbUYsZUFBekM7QUFDQXJELElBQUFBLElBQUksQ0FBQ1gsVUFBTDtBQUNBO0FBaE53QixDQUExQjtBQW1OQWpCLENBQUMsQ0FBQ21GLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJ0RixFQUFBQSxpQkFBaUIsQ0FBQ21CLFVBQWxCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgRXh0ZW5zaW9ucyAqL1xuXG4vKipcbiAqIENhbGwgZ3JvdXBzIG1vZHVsZSBjb25maWd1cmF0aW9uLlxuICogQG5hbWVzcGFjZSBtb2R1bGVVc2Vyc0dyb3Vwc1xuICovXG5jb25zdCBtb2R1bGVVc2Vyc0dyb3VwcyA9IHtcblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2R1bGUncyBmb3JtLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGZvcm1PYmo6ICQoJyNtb2R1bGUtdXNlcnMtZ3JvdXBzLWZvcm0nKSxcblx0JHJ1bGVzQ2hlY2tCb3hlczogJCgnI291dGJvdW5kLXJ1bGVzLXRhYmxlIC5jaGVja2JveCcpLFxuXHQkc2VsZWN0VXNlcnNEcm9wRG93bjogJCgnLnNlbGVjdC1leHRlbnNpb24tZmllbGQnKSxcblx0JHNob3dPbmx5T25Jc29sYXRlR3JvdXA6ICQoJy5zaG93LW9ubHktb24taXNvbGF0ZS1ncm91cCcpLFxuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblx0JGlzb2xhdGVDaGVja0JveDogJCgnI2lzb2xhdGUnKS5wYXJlbnQoJy5jaGVja2JveCcpLFxuXHQkaXNvbGF0ZVBpY2t1cENoZWNrQm94OiAkKCcjaXNvbGF0ZVBpY2tVcCcpLnBhcmVudCgnLmNoZWNrYm94JyksXG5cblx0ZGVmYXVsdEV4dGVuc2lvbjogJycsXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRuYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnbmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2RfdXNyZ3JfVmFsaWRhdGVOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ01vZHVsZVN0YXR1c0NoYW5nZWQnLCBtb2R1bGVVc2Vyc0dyb3Vwcy5jaGVja1N0YXR1c1RvZ2dsZSk7XG5cdFx0bW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZUZvcm0oKTtcblx0XHQkKCcuYXZhdGFyJykuZWFjaCgoKSA9PiB7XG5cdFx0XHRpZiAoJCh0aGlzKS5hdHRyKCdzcmMnKSA9PT0gJycpIHtcblx0XHRcdFx0JCh0aGlzKS5hdHRyKCdzcmMnLCBgJHtnbG9iYWxSb290VXJsfWFzc2V0cy9pbWcvdW5rbm93blBlcnNvbi5qcGdgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQkKCcjbW9kdWxlLXVzZXJzLWdyb3VwLW1vZGlmeS1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kcnVsZXNDaGVja0JveGVzLmNoZWNrYm94KHtcblx0XHRcdG9uQ2hhbmdlKCkge1xuXHRcdFx0XHRGb3JtLmRhdGFDaGFuZ2VkKCk7XG5cdFx0XHR9LFxuXHRcdFx0b25DaGVja2VkKCkge1xuXHRcdFx0XHRjb25zdCBudW1iZXIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblx0XHRcdFx0JChgIyR7bnVtYmVyfSAuZGlzYWJpbGl0eWApLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0fSxcblx0XHRcdG9uVW5jaGVja2VkKCkge1xuXHRcdFx0XHRjb25zdCBudW1iZXIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblx0XHRcdFx0JChgIyR7bnVtYmVyfSAuZGlzYWJpbGl0eWApLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLmluaXRpYWxpemVVc2Vyc0Ryb3BEb3duKCk7XG5cblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kY2RyRmlsdGVyVG9nZ2xlcy5jaGVja2JveCgpO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdkaXYuZGVsZXRlLXVzZXItcm93JywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdG1vZHVsZVVzZXJzR3JvdXBzLmRlbGV0ZU1lbWJlckZyb21UYWJsZShlLnRhcmdldCk7XG5cdFx0fSk7XG5cblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kaXNvbGF0ZUNoZWNrQm94LmNoZWNrYm94KHtcblx0XHRcdG9uQ2hhbmdlOiBtb2R1bGVVc2Vyc0dyb3Vwcy5jYkFmdGVyQ2hhbmdlSXNvbGF0ZVxuXHRcdH0pO1xuXHRcdG1vZHVsZVVzZXJzR3JvdXBzLmNiQWZ0ZXJDaGFuZ2VJc29sYXRlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBpc29sYXRpb24gY2hhbmdlLlxuXHQgKiBAbWVtYmVyb2YgbW9kdWxlVXNlcnNHcm91cHNcblx0ICovXG5cdGNiQWZ0ZXJDaGFuZ2VJc29sYXRlKCl7XG5cdFx0aWYobW9kdWxlVXNlcnNHcm91cHMuJGlzb2xhdGVDaGVja0JveC5jaGVja2JveCgnaXMgY2hlY2tlZCcpKXtcblx0XHRcdG1vZHVsZVVzZXJzR3JvdXBzLiRpc29sYXRlUGlja3VwQ2hlY2tCb3guaGlkZSgpO1xuXHRcdFx0bW9kdWxlVXNlcnNHcm91cHMuJHNob3dPbmx5T25Jc29sYXRlR3JvdXAuc2hvdygpO1xuXHRcdH1lbHNle1xuXHRcdFx0bW9kdWxlVXNlcnNHcm91cHMuJGlzb2xhdGVQaWNrdXBDaGVja0JveC5zaG93KCk7XG5cdFx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kc2hvd09ubHlPbklzb2xhdGVHcm91cC5oaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBEZWxldGUgR3JvdXAgbWVtYmVyIGZyb20gbGlzdC5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIExpbmsgdG8gdGhlIHB1c2hlZCBidXR0b24uXG5cdCAqL1xuXHRkZWxldGVNZW1iZXJGcm9tVGFibGUodGFyZ2V0KSB7XG5cdFx0Y29uc3QgaWQgPSAkKHRhcmdldCkuY2xvc2VzdCgnZGl2JykuYXR0cignZGF0YS12YWx1ZScpO1xuXHRcdCQoYCMke2lkfWApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkLW1lbWJlcicpXG5cdFx0XHQuaGlkZSgpO1xuXHRcdEZvcm0uZGF0YUNoYW5nZWQoKTtcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGRyb3Bkb3duIGZvciBzZWxlY3RpbmcgdXNlcnMuXG5cdCAqIEBtZW1iZXJvZiBtb2R1bGVVc2Vyc0dyb3Vwc1xuXHQgKi9cblx0aW5pdGlhbGl6ZVVzZXJzRHJvcERvd24oKSB7XG5cdFx0Y29uc3QgZHJvcGRvd25QYXJhbXMgPSBFeHRlbnNpb25zLmdldERyb3Bkb3duU2V0dGluZ3NPbmx5SW50ZXJuYWxXaXRob3V0RW1wdHkoKTtcblx0XHRkcm9wZG93blBhcmFtcy5hY3Rpb24gPSBtb2R1bGVVc2Vyc0dyb3Vwcy5jYkFmdGVyVXNlcnNTZWxlY3Q7XG5cdFx0ZHJvcGRvd25QYXJhbXMudGVtcGxhdGVzID0geyBtZW51OiBtb2R1bGVVc2Vyc0dyb3Vwcy5jdXN0b21Ecm9wZG93bk1lbnUgfTtcblx0XHRtb2R1bGVVc2Vyc0dyb3Vwcy4kc2VsZWN0VXNlcnNEcm9wRG93bi5kcm9wZG93bihkcm9wZG93blBhcmFtcyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEN1c3RvbWl6ZXMgdGhlIGRyb3Bkb3duIG1lbnUuXG5cdCAqIEBtZW1iZXJvZiBtb2R1bGVVc2Vyc0dyb3Vwc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgLSBSZXNwb25zZSBkYXRhLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZmllbGRzIC0gRmllbGQgcHJvcGVydGllcy5cblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgZm9yIHRoZSBjdXN0b20gZHJvcGRvd24gbWVudS5cblx0ICovXG5cdGN1c3RvbURyb3Bkb3duTWVudShyZXNwb25zZSwgZmllbGRzKSB7XG5cdFx0Y29uc3QgdmFsdWVzID0gcmVzcG9uc2VbZmllbGRzLnZhbHVlc10gfHwge307XG5cdFx0bGV0IGh0bWwgPSAnJztcblx0XHRsZXQgb2xkVHlwZSA9ICcnO1xuXHRcdCQuZWFjaCh2YWx1ZXMsIChpbmRleCwgb3B0aW9uKSA9PiB7XG5cdFx0XHRpZiAob3B0aW9uLnR5cGUgIT09IG9sZFR5cGUpIHtcblx0XHRcdFx0b2xkVHlwZSA9IG9wdGlvbi50eXBlO1xuXHRcdFx0XHRodG1sICs9ICc8ZGl2IGNsYXNzPVwiZGl2aWRlclwiPjwvZGl2Pic7XG5cdFx0XHRcdGh0bWwgKz0gJ1x0PGRpdiBjbGFzcz1cImhlYWRlclwiPic7XG5cdFx0XHRcdGh0bWwgKz0gJ1x0PGkgY2xhc3M9XCJ0YWdzIGljb25cIj48L2k+Jztcblx0XHRcdFx0aHRtbCArPSBvcHRpb24udHlwZUxvY2FsaXplZDtcblx0XHRcdFx0aHRtbCArPSAnPC9kaXY+Jztcblx0XHRcdH1cblx0XHRcdGNvbnN0IG1heWJlVGV4dCA9IChvcHRpb25bZmllbGRzLnRleHRdKSA/IGBkYXRhLXRleHQ9XCIke29wdGlvbltmaWVsZHMudGV4dF19XCJgIDogJyc7XG5cdFx0XHRjb25zdCBtYXliZURpc2FibGVkID0gKCQoYCNleHQtJHtvcHRpb25bZmllbGRzLnZhbHVlXX1gKS5oYXNDbGFzcygnc2VsZWN0ZWQtbWVtYmVyJykpID8gJ2Rpc2FibGVkICcgOiAnJztcblx0XHRcdGh0bWwgKz0gYDxkaXYgY2xhc3M9XCIke21heWJlRGlzYWJsZWR9aXRlbVwiIGRhdGEtdmFsdWU9XCIke29wdGlvbltmaWVsZHMudmFsdWVdfVwiJHttYXliZVRleHR9PmA7XG5cdFx0XHRodG1sICs9IG9wdGlvbltmaWVsZHMubmFtZV07XG5cdFx0XHRodG1sICs9ICc8L2Rpdj4nO1xuXHRcdH0pO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBhZnRlciBzZWxlY3RpbmcgYSB1c2VyIGluIHRoZSBncm91cC5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gU2VsZWN0ZWQgdXNlcidzIHRleHQuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFNlbGVjdGVkIHVzZXIncyB2YWx1ZS5cblx0ICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0gVGhlIGpRdWVyeSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgc2VsZWN0ZWQgdXNlci5cblx0ICovXG5cdGNiQWZ0ZXJVc2Vyc1NlbGVjdCh0ZXh0LCB2YWx1ZSwgJGVsZW1lbnQpIHtcblx0XHQkKGAjZXh0LSR7dmFsdWV9YClcblx0XHRcdC5jbG9zZXN0KCd0cicpXG5cdFx0XHQuYWRkQ2xhc3MoJ3NlbGVjdGVkLW1lbWJlcicpXG5cdFx0XHQuc2hvdygpO1xuXHRcdCQoJGVsZW1lbnQpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdEZvcm0uZGF0YUNoYW5nZWQoKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGFuZCB1cGRhdGVzIGJ1dHRvbiBzdGF0dXMgd2hlbiB0aGUgbW9kdWxlIHN0YXR1cyBjaGFuZ2VzLlxuXHQgKiBAbWVtYmVyb2YgbW9kdWxlVXNlcnNHcm91cHNcblx0ICovXG5cdGNoZWNrU3RhdHVzVG9nZ2xlKCkge1xuXHRcdGlmIChtb2R1bGVVc2Vyc0dyb3Vwcy4kc3RhdHVzVG9nZ2xlLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdCQoJ1tkYXRhLXRhYiA9IFwiZ2VuZXJhbFwiXSAuZGlzYWJpbGl0eScpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0JCgnW2RhdGEtdGFiPVwicnVsZXNcIl0gLmNoZWNrYm94JykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHQkKCdbZGF0YS10YWIgPSBcInVzZXJzXCJdIC5kaXNhYmlsaXR5JykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ1tkYXRhLXRhYiA9IFwiZ2VuZXJhbFwiXSAuZGlzYWJpbGl0eScpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0JCgnW2RhdGEtdGFiPVwicnVsZXNcIl0gLmNoZWNrYm94JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHQkKCdbZGF0YS10YWIgPSBcInVzZXJzXCJdIC5kaXNhYmlsaXR5JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBzZXR0aW5ncyAtIEFqYXggcmVxdWVzdCBzZXR0aW5ncy5cblx0ICogQHJldHVybnMge09iamVjdH0gVGhlIG1vZGlmaWVkIEFqYXggcmVxdWVzdCBzZXR0aW5ncy5cblx0ICovXG5cdGNiQmVmb3JlU2VuZEZvcm0oc2V0dGluZ3MpIHtcblx0XHRjb25zdCByZXN1bHQgPSBzZXR0aW5ncztcblx0XHRyZXN1bHQuZGF0YSA9IG1vZHVsZVVzZXJzR3JvdXBzLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRjb25zdCBhcnJNZW1iZXJzID0gW107XG5cdFx0JCgndHIuc2VsZWN0ZWQtbWVtYmVyJykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0aWYgKCQob2JqKS5hdHRyKCdpZCcpKSB7XG5cdFx0XHRcdGFyck1lbWJlcnMucHVzaCgkKG9iaikuYXR0cignaWQnKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXN1bHQuZGF0YS5tZW1iZXJzID0gSlNPTi5zdHJpbmdpZnkoYXJyTWVtYmVycyk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgYWZ0ZXIgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQG1lbWJlcm9mIG1vZHVsZVVzZXJzR3JvdXBzXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqIEBtZW1iZXJvZiBtb2R1bGVVc2Vyc0dyb3Vwc1xuXHQgKi9cblx0aW5pdGlhbGl6ZUZvcm0oKSB7XG5cdFx0Rm9ybS4kZm9ybU9iaiA9IG1vZHVsZVVzZXJzR3JvdXBzLiRmb3JtT2JqO1xuXHRcdEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IG1vZHVsZVVzZXJzR3JvdXBzLnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gbW9kdWxlVXNlcnNHcm91cHMuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IG1vZHVsZVVzZXJzR3JvdXBzLmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0bW9kdWxlVXNlcnNHcm91cHMuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==