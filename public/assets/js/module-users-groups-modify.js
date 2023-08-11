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
 * Call groups module modify configuration.
 * @namespace ModuleCGModify
 */
var ModuleCGModify = {
  /**
   * jQuery object representing the module's form.
   * @type {jQuery}
   */
  $formObj: $('#module-users-groups-form'),
  $rulesCheckBoxes: $('#outbound-rules-table .checkbox'),
  $selectUsersDropDown: $('.select-extension-field'),
  $showOnlyOnIsolateGroup: $('.show-only-on-isolate-group'),
  $rulesTable: $('#outbound-rules-table'),
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
   * @memberof ModuleCGModify
   */
  initialize: function initialize() {
    var _this = this;

    ModuleCGModify.$formObj.parent('.ui.grey.segment').removeClass('segment');
    ModuleCGModify.checkStatusToggle();
    window.addEventListener('ModuleStatusChanged', ModuleCGModify.checkStatusToggle);
    $('.avatar').each(function () {
      if ($(_this).attr('src') === '') {
        $(_this).attr('src', "".concat(globalRootUrl, "assets/img/unknownPerson.jpg"));
      }
    });
    $('#module-users-group-modify-menu .item').tab();
    ModuleCGModify.$rulesCheckBoxes.checkbox({
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
    ModuleCGModify.initializeUsersDropDown();
    $('body').on('click', 'div.delete-user-row', function (e) {
      e.preventDefault();
      ModuleCGModify.deleteMemberFromTable(e.target);
    });
    ModuleCGModify.$isolateCheckBox.checkbox({
      onChange: ModuleCGModify.cbAfterChangeIsolate
    });
    ModuleCGModify.cbAfterChangeIsolate();
    ModuleCGModify.initializeRulesDataTable();
    ModuleCGModify.initializeForm();
  },

  /**
   * Initializes the DataTable for rules table.
   */
  initializeRulesDataTable: function initializeRulesDataTable() {
    ModuleCGModify.$rulesTable.DataTable({
      // destroy: true,
      lengthChange: false,
      paging: false,
      columns: [{
        orderable: false,
        searchable: false
      }, null, null, null, {
        orderable: false,
        searchable: false
      }],
      order: [1, 'asc'],
      language: SemanticLocalization.dataTableLocalisation
    });
  },

  /**
   * Handle isolation change.
   * @memberof ModuleCGModify
   */
  cbAfterChangeIsolate: function cbAfterChangeIsolate() {
    if (ModuleCGModify.$isolateCheckBox.checkbox('is checked')) {
      ModuleCGModify.$isolatePickupCheckBox.hide();
      ModuleCGModify.$showOnlyOnIsolateGroup.show();
    } else {
      ModuleCGModify.$isolatePickupCheckBox.show();
      ModuleCGModify.$showOnlyOnIsolateGroup.hide();
    }
  },

  /**
   * Delete Group member from list.
   * @memberof ModuleCGModify
   * @param {HTMLElement} target - Link to the pushed button.
   */
  deleteMemberFromTable: function deleteMemberFromTable(target) {
    var id = $(target).closest('div').attr('data-value');
    $("#".concat(id)).removeClass('selected-member').hide();
    Form.dataChanged();
  },

  /**
   * Initializes the dropdown for selecting users.
   * @memberof ModuleCGModify
   */
  initializeUsersDropDown: function initializeUsersDropDown() {
    var dropdownParams = Extensions.getDropdownSettingsOnlyInternalWithoutEmpty();
    dropdownParams.action = ModuleCGModify.cbAfterUsersSelect;
    dropdownParams.templates = {
      menu: ModuleCGModify.customDropdownMenu
    };
    ModuleCGModify.$selectUsersDropDown.dropdown(dropdownParams);
  },

  /**
   * Customizes the dropdown menu.
   * @memberof ModuleCGModify
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
   * @memberof ModuleCGModify
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
   * @memberof ModuleCGModify
   */
  checkStatusToggle: function checkStatusToggle() {
    if (ModuleCGModify.$statusToggle.checkbox('is checked')) {
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
   * @memberof ModuleCGModify
   * @param {Object} settings - Ajax request settings.
   * @returns {Object} The modified Ajax request settings.
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
    var result = settings;
    result.data = ModuleCGModify.$formObj.form('get values');
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
   * @memberof ModuleCGModify
   */
  cbAfterSendForm: function cbAfterSendForm() {},

  /**
   * Initializes the form.
   * @memberof ModuleCGModify
   */
  initializeForm: function initializeForm() {
    Form.$formObj = ModuleCGModify.$formObj;
    Form.url = "".concat(globalRootUrl, "module-users-groups/module-users-groups/save");
    Form.validateRules = ModuleCGModify.validateRules;
    Form.cbBeforeSendForm = ModuleCGModify.cbBeforeSendForm;
    Form.cbAfterSendForm = ModuleCGModify.cbAfterSendForm;
    Form.initialize();
  }
};
$(document).ready(function () {
  ModuleCGModify.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVDR01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRydWxlc0NoZWNrQm94ZXMiLCIkc2VsZWN0VXNlcnNEcm9wRG93biIsIiRzaG93T25seU9uSXNvbGF0ZUdyb3VwIiwiJHJ1bGVzVGFibGUiLCIkc3RhdHVzVG9nZ2xlIiwiJGlzb2xhdGVDaGVja0JveCIsInBhcmVudCIsIiRpc29sYXRlUGlja3VwQ2hlY2tCb3giLCJ2YWxpZGF0ZVJ1bGVzIiwibmFtZSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJtb2RfdXNyZ3JfVmFsaWRhdGVOYW1lSXNFbXB0eSIsImluaXRpYWxpemUiLCJyZW1vdmVDbGFzcyIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImVhY2giLCJhdHRyIiwiZ2xvYmFsUm9vdFVybCIsInRhYiIsImNoZWNrYm94Iiwib25DaGFuZ2UiLCJGb3JtIiwiZGF0YUNoYW5nZWQiLCJvbkNoZWNrZWQiLCJudW1iZXIiLCJvblVuY2hlY2tlZCIsImFkZENsYXNzIiwiaW5pdGlhbGl6ZVVzZXJzRHJvcERvd24iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImRlbGV0ZU1lbWJlckZyb21UYWJsZSIsInRhcmdldCIsImNiQWZ0ZXJDaGFuZ2VJc29sYXRlIiwiaW5pdGlhbGl6ZVJ1bGVzRGF0YVRhYmxlIiwiaW5pdGlhbGl6ZUZvcm0iLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJjb2x1bW5zIiwib3JkZXJhYmxlIiwic2VhcmNoYWJsZSIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJTZW1hbnRpY0xvY2FsaXphdGlvbiIsImRhdGFUYWJsZUxvY2FsaXNhdGlvbiIsImhpZGUiLCJzaG93IiwiaWQiLCJjbG9zZXN0IiwiZHJvcGRvd25QYXJhbXMiLCJFeHRlbnNpb25zIiwiZ2V0RHJvcGRvd25TZXR0aW5nc09ubHlJbnRlcm5hbFdpdGhvdXRFbXB0eSIsImFjdGlvbiIsImNiQWZ0ZXJVc2Vyc1NlbGVjdCIsInRlbXBsYXRlcyIsIm1lbnUiLCJjdXN0b21Ecm9wZG93bk1lbnUiLCJkcm9wZG93biIsInJlc3BvbnNlIiwiZmllbGRzIiwidmFsdWVzIiwiaHRtbCIsIm9sZFR5cGUiLCJpbmRleCIsIm9wdGlvbiIsInR5cGVMb2NhbGl6ZWQiLCJtYXliZVRleHQiLCJ0ZXh0IiwibWF5YmVEaXNhYmxlZCIsInZhbHVlIiwiaGFzQ2xhc3MiLCIkZWxlbWVudCIsImNiQmVmb3JlU2VuZEZvcm0iLCJzZXR0aW5ncyIsInJlc3VsdCIsImRhdGEiLCJmb3JtIiwiYXJyTWVtYmVycyIsIm9iaiIsInB1c2giLCJtZW1iZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsImNiQWZ0ZXJTZW5kRm9ybSIsInVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLGNBQWMsR0FBRztBQUN0QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxRQUFRLEVBQUVDLENBQUMsQ0FBQywyQkFBRCxDQUxXO0FBTXRCQyxFQUFBQSxnQkFBZ0IsRUFBRUQsQ0FBQyxDQUFDLGlDQUFELENBTkc7QUFPdEJFLEVBQUFBLG9CQUFvQixFQUFFRixDQUFDLENBQUMseUJBQUQsQ0FQRDtBQVF0QkcsRUFBQUEsdUJBQXVCLEVBQUVILENBQUMsQ0FBQyw2QkFBRCxDQVJKO0FBU3RCSSxFQUFBQSxXQUFXLEVBQUVKLENBQUMsQ0FBQyx1QkFBRCxDQVRRO0FBVXRCSyxFQUFBQSxhQUFhLEVBQUVMLENBQUMsQ0FBQyx1QkFBRCxDQVZNO0FBV3RCTSxFQUFBQSxnQkFBZ0IsRUFB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QUFDQSxHQWxOcUI7O0FBb050QjtBQUNEO0FBQ0E7QUFDQTtBQUNDUyxFQUFBQSxlQXhOc0IsNkJBd05KLENBRWpCLENBMU5xQjs7QUE0TnRCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NqRCxFQUFBQSxjQWhPc0IsNEJBZ09MO0FBQ2hCZCxJQUFBQSxJQUFJLENBQUM3QixRQUFMLEdBQWdCRCxjQUFjLENBQUNDLFFBQS9CO0FBQ0E2QixJQUFBQSxJQUFJLENBQUNnRSxHQUFMLGFBQWNwRSxhQUFkO0FBQ0FJLElBQUFBLElBQUksQ0FBQ25CLGFBQUwsR0FBcUJYLGNBQWMsQ0FBQ1csYUFBcEM7QUFDQW1CLElBQUFBLElBQUksQ0FBQ29ELGdCQUFMLEdBQXdCbEYsY0FBYyxDQUFDa0YsZ0JBQXZDO0FBQ0FwRCxJQUFBQSxJQUFJLENBQUMrRCxlQUFMLEdBQXVCN0YsY0FBYyxDQUFDNkYsZUFBdEM7QUFDQS9ELElBQUFBLElBQUksQ0FBQ1gsVUFBTDtBQUNBO0FBdk9xQixDQUF2QjtBQTBPQWpCLENBQUMsQ0FBQzZGLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJoRyxFQUFBQSxjQUFjLENBQUNtQixVQUFmO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgRXh0ZW5zaW9ucyAqL1xuXG4vKipcbiAqIENhbGwgZ3JvdXBzIG1vZHVsZSBtb2RpZnkgY29uZmlndXJhdGlvbi5cbiAqIEBuYW1lc3BhY2UgTW9kdWxlQ0dNb2RpZnlcbiAqL1xuY29uc3QgTW9kdWxlQ0dNb2RpZnkgPSB7XG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kdWxlJ3MgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLXVzZXJzLWdyb3Vwcy1mb3JtJyksXG5cdCRydWxlc0NoZWNrQm94ZXM6ICQoJyNvdXRib3VuZC1ydWxlcy10YWJsZSAuY2hlY2tib3gnKSxcblx0JHNlbGVjdFVzZXJzRHJvcERvd246ICQoJy5zZWxlY3QtZXh0ZW5zaW9uLWZpZWxkJyksXG5cdCRzaG93T25seU9uSXNvbGF0ZUdyb3VwOiAkKCcuc2hvdy1vbmx5LW9uLWlzb2xhdGUtZ3JvdXAnKSxcblx0JHJ1bGVzVGFibGU6ICQoJyNvdXRib3VuZC1ydWxlcy10YWJsZScpLFxuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblx0JGlzb2xhdGVDaGVja0JveDogJCgnI2lzb2xhdGUnKS5wYXJlbnQoJy5jaGVja2JveCcpLFxuXHQkaXNvbGF0ZVBpY2t1cENoZWNrQm94OiAkKCcjaXNvbGF0ZVBpY2tVcCcpLnBhcmVudCgnLmNoZWNrYm94JyksXG5cblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdG5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICduYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZF91c3Jncl9WYWxpZGF0ZU5hbWVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0TW9kdWxlQ0dNb2RpZnkuJGZvcm1PYmoucGFyZW50KCcudWkuZ3JleS5zZWdtZW50JykucmVtb3ZlQ2xhc3MoJ3NlZ21lbnQnKTtcblxuXHRcdE1vZHVsZUNHTW9kaWZ5LmNoZWNrU3RhdHVzVG9nZ2xlKCk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ01vZHVsZVN0YXR1c0NoYW5nZWQnLCBNb2R1bGVDR01vZGlmeS5jaGVja1N0YXR1c1RvZ2dsZSk7XG5cdFx0JCgnLmF2YXRhcicpLmVhY2goKCkgPT4ge1xuXHRcdFx0aWYgKCQodGhpcykuYXR0cignc3JjJykgPT09ICcnKSB7XG5cdFx0XHRcdCQodGhpcykuYXR0cignc3JjJywgYCR7Z2xvYmFsUm9vdFVybH1hc3NldHMvaW1nL3Vua25vd25QZXJzb24uanBnYCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0JCgnI21vZHVsZS11c2Vycy1ncm91cC1tb2RpZnktbWVudSAuaXRlbScpLnRhYigpO1xuXG5cdFx0TW9kdWxlQ0dNb2RpZnkuJHJ1bGVzQ2hlY2tCb3hlcy5jaGVja2JveCh7XG5cdFx0XHRvbkNoYW5nZSgpIHtcblx0XHRcdFx0Rm9ybS5kYXRhQ2hhbmdlZCgpO1xuXHRcdFx0fSxcblx0XHRcdG9uQ2hlY2tlZCgpIHtcblx0XHRcdFx0Y29uc3QgbnVtYmVyID0gJCh0aGlzKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0XHRcdCQoYCMke251bWJlcn0gLmRpc2FiaWxpdHlgKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdH0sXG5cdFx0XHRvblVuY2hlY2tlZCgpIHtcblx0XHRcdFx0Y29uc3QgbnVtYmVyID0gJCh0aGlzKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0XHRcdCQoYCMke251bWJlcn0gLmRpc2FiaWxpdHlgKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHRNb2R1bGVDR01vZGlmeS5pbml0aWFsaXplVXNlcnNEcm9wRG93bigpO1xuXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICdkaXYuZGVsZXRlLXVzZXItcm93JywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUNHTW9kaWZ5LmRlbGV0ZU1lbWJlckZyb21UYWJsZShlLnRhcmdldCk7XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVDR01vZGlmeS4kaXNvbGF0ZUNoZWNrQm94LmNoZWNrYm94KHtcblx0XHRcdG9uQ2hhbmdlOiBNb2R1bGVDR01vZGlmeS5jYkFmdGVyQ2hhbmdlSXNvbGF0ZVxuXHRcdH0pO1xuXHRcdE1vZHVsZUNHTW9kaWZ5LmNiQWZ0ZXJDaGFuZ2VJc29sYXRlKCk7XG5cblx0XHRNb2R1bGVDR01vZGlmeS5pbml0aWFsaXplUnVsZXNEYXRhVGFibGUoKTtcblxuXHRcdE1vZHVsZUNHTW9kaWZ5LmluaXRpYWxpemVGb3JtKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBEYXRhVGFibGUgZm9yIHJ1bGVzIHRhYmxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZVJ1bGVzRGF0YVRhYmxlKCkge1xuXHRcdE1vZHVsZUNHTW9kaWZ5LiRydWxlc1RhYmxlLkRhdGFUYWJsZSh7XG5cdFx0XHQvLyBkZXN0cm95OiB0cnVlLFxuXHRcdFx0bGVuZ3RoQ2hhbmdlOiBmYWxzZSxcblx0XHRcdHBhZ2luZzogZmFsc2UsXG5cdFx0XHRjb2x1bW5zOiBbXG5cdFx0XHRcdHtvcmRlcmFibGU6IGZhbHNlLCBzZWFyY2hhYmxlOiBmYWxzZX0sXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdHtvcmRlcmFibGU6IGZhbHNlLCBzZWFyY2hhYmxlOiBmYWxzZX0sXG5cdFx0XHRdLFxuXHRcdFx0b3JkZXI6IFsxLCAnYXNjJ10sXG5cdFx0XHRsYW5ndWFnZTogU2VtYW50aWNMb2NhbGl6YXRpb24uZGF0YVRhYmxlTG9jYWxpc2F0aW9uLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgaXNvbGF0aW9uIGNoYW5nZS5cblx0ICogQG1lbWJlcm9mIE1vZHVsZUNHTW9kaWZ5XG5cdCAqL1xuXHRjYkFmdGVyQ2hhbmdlSXNvbGF0ZSgpe1xuXHRcdGlmKE1vZHVsZUNHTW9kaWZ5LiRpc29sYXRlQ2hlY2tCb3guY2hlY2tib3goJ2lzIGNoZWNrZWQnKSl7XG5cdFx0XHRNb2R1bGVDR01vZGlmeS4kaXNvbGF0ZVBpY2t1cENoZWNrQm94LmhpZGUoKTtcblx0XHRcdE1vZHVsZUNHTW9kaWZ5LiRzaG93T25seU9uSXNvbGF0ZUdyb3VwLnNob3coKTtcblx0XHR9ZWxzZXtcblx0XHRcdE1vZHVsZUNHTW9kaWZ5LiRpc29sYXRlUGlja3VwQ2hlY2tCb3guc2hvdygpO1xuXHRcdFx0TW9kdWxlQ0dNb2RpZnkuJHNob3dPbmx5T25Jc29sYXRlR3JvdXAuaGlkZSgpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogRGVsZXRlIEdyb3VwIG1lbWJlciBmcm9tIGxpc3QuXG5cdCAqIEBtZW1iZXJvZiBNb2R1bGVDR01vZGlmeVxuXHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBMaW5rIHRvIHRoZSBwdXNoZWQgYnV0dG9uLlxuXHQgKi9cblx0ZGVsZXRlTWVtYmVyRnJvbVRhYmxlKHRhcmdldCkge1xuXHRcdGNvbnN0IGlkID0gJCh0YXJnZXQpLmNsb3Nlc3QoJ2RpdicpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblx0XHQkKGAjJHtpZH1gKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCdzZWxlY3RlZC1tZW1iZXInKVxuXHRcdFx0LmhpZGUoKTtcblx0XHRGb3JtLmRhdGFDaGFuZ2VkKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBkcm9wZG93biBmb3Igc2VsZWN0aW5nIHVzZXJzLlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICovXG5cdGluaXRpYWxpemVVc2Vyc0Ryb3BEb3duKCkge1xuXHRcdGNvbnN0IGRyb3Bkb3duUGFyYW1zID0gRXh0ZW5zaW9ucy5nZXREcm9wZG93blNldHRpbmdzT25seUludGVybmFsV2l0aG91dEVtcHR5KCk7XG5cdFx0ZHJvcGRvd25QYXJhbXMuYWN0aW9uID0gTW9kdWxlQ0dNb2RpZnkuY2JBZnRlclVzZXJzU2VsZWN0O1xuXHRcdGRyb3Bkb3duUGFyYW1zLnRlbXBsYXRlcyA9IHsgbWVudTogTW9kdWxlQ0dNb2RpZnkuY3VzdG9tRHJvcGRvd25NZW51IH07XG5cdFx0TW9kdWxlQ0dNb2RpZnkuJHNlbGVjdFVzZXJzRHJvcERvd24uZHJvcGRvd24oZHJvcGRvd25QYXJhbXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b21pemVzIHRoZSBkcm9wZG93biBtZW51LlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIC0gUmVzcG9uc2UgZGF0YS5cblx0ICogQHBhcmFtIHtPYmplY3R9IGZpZWxkcyAtIEZpZWxkIHByb3BlcnRpZXMuXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBIVE1MIGZvciB0aGUgY3VzdG9tIGRyb3Bkb3duIG1lbnUuXG5cdCAqL1xuXHRjdXN0b21Ecm9wZG93bk1lbnUocmVzcG9uc2UsIGZpZWxkcykge1xuXHRcdGNvbnN0IHZhbHVlcyA9IHJlc3BvbnNlW2ZpZWxkcy52YWx1ZXNdIHx8IHt9O1xuXHRcdGxldCBodG1sID0gJyc7XG5cdFx0bGV0IG9sZFR5cGUgPSAnJztcblx0XHQkLmVhY2godmFsdWVzLCAoaW5kZXgsIG9wdGlvbikgPT4ge1xuXHRcdFx0aWYgKG9wdGlvbi50eXBlICE9PSBvbGRUeXBlKSB7XG5cdFx0XHRcdG9sZFR5cGUgPSBvcHRpb24udHlwZTtcblx0XHRcdFx0aHRtbCArPSAnPGRpdiBjbGFzcz1cImRpdmlkZXJcIj48L2Rpdj4nO1xuXHRcdFx0XHRodG1sICs9ICdcdDxkaXYgY2xhc3M9XCJoZWFkZXJcIj4nO1xuXHRcdFx0XHRodG1sICs9ICdcdDxpIGNsYXNzPVwidGFncyBpY29uXCI+PC9pPic7XG5cdFx0XHRcdGh0bWwgKz0gb3B0aW9uLnR5cGVMb2NhbGl6ZWQ7XG5cdFx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBtYXliZVRleHQgPSAob3B0aW9uW2ZpZWxkcy50ZXh0XSkgPyBgZGF0YS10ZXh0PVwiJHtvcHRpb25bZmllbGRzLnRleHRdfVwiYCA6ICcnO1xuXHRcdFx0Y29uc3QgbWF5YmVEaXNhYmxlZCA9ICgkKGAjZXh0LSR7b3B0aW9uW2ZpZWxkcy52YWx1ZV19YCkuaGFzQ2xhc3MoJ3NlbGVjdGVkLW1lbWJlcicpKSA/ICdkaXNhYmxlZCAnIDogJyc7XG5cdFx0XHRodG1sICs9IGA8ZGl2IGNsYXNzPVwiJHttYXliZURpc2FibGVkfWl0ZW1cIiBkYXRhLXZhbHVlPVwiJHtvcHRpb25bZmllbGRzLnZhbHVlXX1cIiR7bWF5YmVUZXh0fT5gO1xuXHRcdFx0aHRtbCArPSBvcHRpb25bZmllbGRzLm5hbWVdO1xuXHRcdFx0aHRtbCArPSAnPC9kaXY+Jztcblx0XHR9KTtcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgYWZ0ZXIgc2VsZWN0aW5nIGEgdXNlciBpbiB0aGUgZ3JvdXAuXG5cdCAqIEBtZW1iZXJvZiBNb2R1bGVDR01vZGlmeVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFNlbGVjdGVkIHVzZXIncyB0ZXh0LlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBTZWxlY3RlZCB1c2VyJ3MgdmFsdWUuXG5cdCAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIFRoZSBqUXVlcnkgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHNlbGVjdGVkIHVzZXIuXG5cdCAqL1xuXHRjYkFmdGVyVXNlcnNTZWxlY3QodGV4dCwgdmFsdWUsICRlbGVtZW50KSB7XG5cdFx0JChgI2V4dC0ke3ZhbHVlfWApXG5cdFx0XHQuY2xvc2VzdCgndHInKVxuXHRcdFx0LmFkZENsYXNzKCdzZWxlY3RlZC1tZW1iZXInKVxuXHRcdFx0LnNob3coKTtcblx0XHQkKCRlbGVtZW50KS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRGb3JtLmRhdGFDaGFuZ2VkKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBhbmQgdXBkYXRlcyBidXR0b24gc3RhdHVzIHdoZW4gdGhlIG1vZHVsZSBzdGF0dXMgY2hhbmdlcy5cblx0ICogQG1lbWJlcm9mIE1vZHVsZUNHTW9kaWZ5XG5cdCAqL1xuXHRjaGVja1N0YXR1c1RvZ2dsZSgpIHtcblx0XHRpZiAoTW9kdWxlQ0dNb2RpZnkuJHN0YXR1c1RvZ2dsZS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHQkKCdbZGF0YS10YWIgPSBcImdlbmVyYWxcIl0gLmRpc2FiaWxpdHknKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYj1cInJ1bGVzXCJdIC5jaGVja2JveCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJ1c2Vyc1wiXSAuZGlzYWJpbGl0eScpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdbZGF0YS10YWIgPSBcImdlbmVyYWxcIl0gLmRpc2FiaWxpdHknKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYj1cInJ1bGVzXCJdIC5jaGVja2JveCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJ1c2Vyc1wiXSAuZGlzYWJpbGl0eScpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgYmVmb3JlIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqIEBtZW1iZXJvZiBNb2R1bGVDR01vZGlmeVxuXHQgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBtb2RpZmllZCBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG5cdCAqL1xuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBNb2R1bGVDR01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0Y29uc3QgYXJyTWVtYmVycyA9IFtdO1xuXHRcdCQoJ3RyLnNlbGVjdGVkLW1lbWJlcicpLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdGlmICgkKG9iaikuYXR0cignaWQnKSkge1xuXHRcdFx0XHRhcnJNZW1iZXJzLnB1c2goJChvYmopLmF0dHIoJ2lkJykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmVzdWx0LmRhdGEubWVtYmVycyA9IEpTT04uc3RyaW5naWZ5KGFyck1lbWJlcnMpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqIEBtZW1iZXJvZiBNb2R1bGVDR01vZGlmeVxuXHQgKi9cblx0Y2JBZnRlclNlbmRGb3JtKCkge1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBmb3JtLlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICovXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBNb2R1bGVDR01vZGlmeS4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLXVzZXJzLWdyb3Vwcy9tb2R1bGUtdXNlcnMtZ3JvdXBzL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IE1vZHVsZUNHTW9kaWZ5LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gTW9kdWxlQ0dNb2RpZnkuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUNHTW9kaWZ5LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlQ0dNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==