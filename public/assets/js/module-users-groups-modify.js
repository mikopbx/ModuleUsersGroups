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
        orderable: true,
        // This column is not orderable
        searchable: false,
        // This column is not searchable
        orderDataType: 'dom-checkbox' // Use the custom sorting

      }, null, null, {
        orderable: false,
        searchable: false
      }],
      order: [0, 'desc'],
      language: SemanticLocalization.dataTableLocalisation,

      /**
       * Constructs the Extensions row.
       * @param {HTMLElement} row - The row element.
       * @param {Array} data - The row data.
       */
      createdRow: function createdRow(row, data) {
        $('td', row).eq(0).attr('style','max-width:15px;');
        $('td', row).eq(3).attr('style','min-width:70px;');
        $('td', row).eq(3).find('input').attr('style','width:85%;');
      }
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
  // Custom sorting for checkbox states
  $.fn.dataTable.ext.order['dom-checkbox'] = function (settings, col) {
    return this.api().column(col, {
      order: 'index'
    }).nodes().map(function (td, i) {
      return $('input', td).prop('checked') ? '1' : '0';
    });
  };

  ModuleCGModify.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVDR01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRydWxlc0NoZWNrQm94ZXMiLCIkc2VsZWN0VXNlcnNEcm9wRG93biIsIiRzaG93T25seU9uSXNvbGF0ZUdyb3VwIiwiJHJ1bGVzVGFibGUiLCIkc3RhdHVzVG9nZ2xlIiwiJGlzb2xhdGVDaGVja0JveCIsInBhcmVudCIsIiRpc29sYXRlUGlja3VwQ2hlY2tCb3giLCJ2YWxpZGF0ZVJ1bGVzIiwibmFtZSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJtb2RfdXNyZ3JfVmFsaWRhdGVOYW1lSXNFbXB0eSIsImluaXRpYWxpemUiLCJyZW1vdmVDbGFzcyIsImNoZWNrU3RhdHVzVG9nZ2xlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImVhY2giLCJhdHRyIiwiZ2xvYmFsUm9vdFVybCIsInRhYiIsImNoZWNrYm94Iiwib25DaGFuZ2UiLCJGb3JtIiwiZGF0YUNoYW5nZWQiLCJvbkNoZWNrZWQiLCJudW1iZXIiLCJvblVuY2hlY2tlZCIsImFkZENsYXNzIiwiaW5pdGlhbGl6ZVVzZXJzRHJvcERvd24iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImRlbGV0ZU1lbWJlckZyb21UYWJsZSIsInRhcmdldCIsImNiQWZ0ZXJDaGFuZ2VJc29sYXRlIiwiaW5pdGlhbGl6ZVJ1bGVzRGF0YVRhYmxlIiwiaW5pdGlhbGl6ZUZvcm0iLCJEYXRhVGFibGUiLCJsZW5ndGhDaGFuZ2UiLCJwYWdpbmciLCJjb2x1bW5zIiwib3JkZXJhYmxlIiwic2VhcmNoYWJsZSIsIm9yZGVyRGF0YVR5cGUiLCJvcmRlciIsImxhbmd1YWdlIiwiU2VtYW50aWNMb2NhbGl6YXRpb24iLCJkYXRhVGFibGVMb2NhbGlzYXRpb24iLCJjcmVhdGVkUm93Iiwicm93IiwiZGF0YSIsImVxIiwic3R5bGUiLCJoaWRlIiwic2hvdyIsImlkIiwiY2xvc2VzdCIsImRyb3Bkb3duUGFyYW1zIiwiRXh0ZW5zaW9ucyIsImdldERyb3Bkb3duU2V0dGluZ3NPbmx5SW50ZXJuYWxXaXRob3V0RW1wdHkiLCJhY3Rpb24iLCJjYkFmdGVyVXNlcnNTZWxlY3QiLCJ0ZW1wbGF0ZXMiLCJtZW51IiwiY3VzdG9tRHJvcGRvd25NZW51IiwiZHJvcGRvd24iLCJyZXNwb25zZSIsImZpZWxkcyIsInZhbHVlcyIsImh0bWwiLCJvbGRUeXBlIiwiaW5kZXgiLCJvcHRpb24iLCJ0eXBlTG9jYWxpemVkIiwibWF5YmVUZXh0IiwidGV4dCIsIm1heWJlRGlzYWJsZWQiLCJ2YWx1ZSIsImhhc0NsYXNzIiwiJGVsZW1lbnQiLCJjYkJlZm9yZVNlbmRGb3JtIiwic2V0dGluZ3MiLCJyZXN1bHQiLCJmb3JtIiwiYXJyTWVtYmVycyIsIm9iaiIsInB1c2giLCJtZW1iZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsImNiQWZ0ZXJTZW5kRm9ybSIsInVybCIsImRvY3VtZW50IiwicmVhZHkiLCJmbiIsImRhdGFUYWJsZSIsImV4dCIsImNvbCIsImFwaSIsImNvbHVtbiIsIm5vZGVzIiwibWFwIiwidGQiLCJpIiwicHJvcCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsY0FBYyxHQUFHO0FBQ3RCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLDJCQUFELENBTFc7QUFNdEJDLEVBQUFBLGdCQUFnQixFQUFFRCxDQUFDLENBQUMsaUNBQUQsQ0FORztBQU90QkUsRUFBQUEsb0JBQW9CLEVBQUVGLENBQUMsQ0FBQyx5QkFBRCxDQVBEO0FBUXRCRyxFQUFBQSx1QkFBdUIsRUFBRUgsQ0FBQyxDQUFDLDZC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QyxHQUFmLENBQW1CcEQsS0FBbkIsQ0FBeUIsY0FBekIsSUFBMkMsVUFBWXFDLFFBQVosRUFBc0JnQixHQUF0QixFQUMzQztBQUNDLFdBQU8sS0FBS0MsR0FBTCxHQUFXQyxNQUFYLENBQW1CRixHQUFuQixFQUF3QjtBQUFDckQsTUFBQUEsS0FBSyxFQUFDO0FBQVAsS0FBeEIsRUFBMEN3RCxLQUExQyxHQUFrREMsR0FBbEQsQ0FBdUQsVUFBV0MsRUFBWCxFQUFlQyxDQUFmLEVBQW1CO0FBQ2hGLGFBQU83RyxDQUFDLENBQUMsT0FBRCxFQUFVNEcsRUFBVixDQUFELENBQWVFLElBQWYsQ0FBb0IsU0FBcEIsSUFBaUMsR0FBakMsR0FBdUMsR0FBOUM7QUFDQSxLQUZNLENBQVA7QUFHQSxHQUxEOztBQU9BaEgsRUFBQUEsY0FBYyxDQUFDbUIsVUFBZjtBQUNBLENBVkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCxnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIEV4dGVuc2lvbnMgKi9cblxuLyoqXG4gKiBDYWxsIGdyb3VwcyBtb2R1bGUgbW9kaWZ5IGNvbmZpZ3VyYXRpb24uXG4gKiBAbmFtZXNwYWNlIE1vZHVsZUNHTW9kaWZ5XG4gKi9cbmNvbnN0IE1vZHVsZUNHTW9kaWZ5ID0ge1xuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG1vZHVsZSdzIGZvcm0uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZm9ybU9iajogJCgnI21vZHVsZS11c2Vycy1ncm91cHMtZm9ybScpLFxuXHQkcnVsZXNDaGVja0JveGVzOiAkKCcjb3V0Ym91bmQtcnVsZXMtdGFibGUgLmNoZWNrYm94JyksXG5cdCRzZWxlY3RVc2Vyc0Ryb3BEb3duOiAkKCcuc2VsZWN0LWV4dGVuc2lvbi1maWVsZCcpLFxuXHQkc2hvd09ubHlPbklzb2xhdGVHcm91cDogJCgnLnNob3ctb25seS1vbi1pc29sYXRlLWdyb3VwJyksXG5cdCRydWxlc1RhYmxlOiAkKCcjb3V0Ym91bmQtcnVsZXMtdGFibGUnKSxcblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cdCRpc29sYXRlQ2hlY2tCb3g6ICQoJyNpc29sYXRlJykucGFyZW50KCcuY2hlY2tib3gnKSxcblx0JGlzb2xhdGVQaWNrdXBDaGVja0JveDogJCgnI2lzb2xhdGVQaWNrVXAnKS5wYXJlbnQoJy5jaGVja2JveCcpLFxuXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRuYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnbmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2RfdXNyZ3JfVmFsaWRhdGVOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICogQG1lbWJlcm9mIE1vZHVsZUNHTW9kaWZ5XG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdE1vZHVsZUNHTW9kaWZ5LiRmb3JtT2JqLnBhcmVudCgnLnVpLmdyZXkuc2VnbWVudCcpLnJlbW92ZUNsYXNzKCdzZWdtZW50Jyk7XG5cblx0XHRNb2R1bGVDR01vZGlmeS5jaGVja1N0YXR1c1RvZ2dsZSgpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNb2R1bGVTdGF0dXNDaGFuZ2VkJywgTW9kdWxlQ0dNb2RpZnkuY2hlY2tTdGF0dXNUb2dnbGUpO1xuXHRcdCQoJy5hdmF0YXInKS5lYWNoKCgpID0+IHtcblx0XHRcdGlmICgkKHRoaXMpLmF0dHIoJ3NyYycpID09PSAnJykge1xuXHRcdFx0XHQkKHRoaXMpLmF0dHIoJ3NyYycsIGAke2dsb2JhbFJvb3RVcmx9YXNzZXRzL2ltZy91bmtub3duUGVyc29uLmpwZ2ApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCQoJyNtb2R1bGUtdXNlcnMtZ3JvdXAtbW9kaWZ5LW1lbnUgLml0ZW0nKS50YWIoKTtcblxuXHRcdE1vZHVsZUNHTW9kaWZ5LiRydWxlc0NoZWNrQm94ZXMuY2hlY2tib3goe1xuXHRcdFx0b25DaGFuZ2UoKSB7XG5cdFx0XHRcdEZvcm0uZGF0YUNoYW5nZWQoKTtcblx0XHRcdH0sXG5cdFx0XHRvbkNoZWNrZWQoKSB7XG5cdFx0XHRcdGNvbnN0IG51bWJlciA9ICQodGhpcykuYXR0cignZGF0YS12YWx1ZScpO1xuXHRcdFx0XHQkKGAjJHtudW1iZXJ9IC5kaXNhYmlsaXR5YCkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9LFxuXHRcdFx0b25VbmNoZWNrZWQoKSB7XG5cdFx0XHRcdGNvbnN0IG51bWJlciA9ICQodGhpcykuYXR0cignZGF0YS12YWx1ZScpO1xuXHRcdFx0XHQkKGAjJHtudW1iZXJ9IC5kaXNhYmlsaXR5YCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdFx0TW9kdWxlQ0dNb2RpZnkuaW5pdGlhbGl6ZVVzZXJzRHJvcERvd24oKTtcblxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnZGl2LmRlbGV0ZS11c2VyLXJvdycsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVDR01vZGlmeS5kZWxldGVNZW1iZXJGcm9tVGFibGUoZS50YXJnZXQpO1xuXHRcdH0pO1xuXG5cdFx0TW9kdWxlQ0dNb2RpZnkuJGlzb2xhdGVDaGVja0JveC5jaGVja2JveCh7XG5cdFx0XHRvbkNoYW5nZTogTW9kdWxlQ0dNb2RpZnkuY2JBZnRlckNoYW5nZUlzb2xhdGVcblx0XHR9KTtcblx0XHRNb2R1bGVDR01vZGlmeS5jYkFmdGVyQ2hhbmdlSXNvbGF0ZSgpO1xuXG5cdFx0TW9kdWxlQ0dNb2RpZnkuaW5pdGlhbGl6ZVJ1bGVzRGF0YVRhYmxlKCk7XG5cblx0XHRNb2R1bGVDR01vZGlmeS5pbml0aWFsaXplRm9ybSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgRGF0YVRhYmxlIGZvciBydWxlcyB0YWJsZS5cblx0ICovXG5cdGluaXRpYWxpemVSdWxlc0RhdGFUYWJsZSgpIHtcblx0XHRNb2R1bGVDR01vZGlmeS4kcnVsZXNUYWJsZS5EYXRhVGFibGUoe1xuXHRcdFx0Ly8gZGVzdHJveTogdHJ1ZSxcblx0XHRcdGxlbmd0aENoYW5nZTogZmFsc2UsXG5cdFx0XHRwYWdpbmc6IGZhbHNlLFxuXHRcdFx0Y29sdW1uczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0b3JkZXJhYmxlOiB0cnVlLCAgLy8gVGhpcyBjb2x1bW4gaXMgbm90IG9yZGVyYWJsZVxuXHRcdFx0XHRcdHNlYXJjaGFibGU6IGZhbHNlLCAgLy8gVGhpcyBjb2x1bW4gaXMgbm90IHNlYXJjaGFibGVcblx0XHRcdFx0XHRvcmRlckRhdGFUeXBlOiAnZG9tLWNoZWNrYm94JyAgLy8gVXNlIHRoZSBjdXN0b20gc29ydGluZ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR7b3JkZXJhYmxlOiBmYWxzZSwgc2VhcmNoYWJsZTogZmFsc2V9LFxuXHRcdFx0XSxcblx0XHRcdG9yZGVyOiBbMCwgJ2FzYyddLFxuXHRcdFx0bGFuZ3VhZ2U6IFNlbWFudGljTG9jYWxpemF0aW9uLmRhdGFUYWJsZUxvY2FsaXNhdGlvbixcblx0XHRcdC8qKlxuXHRcdFx0ICogQ29uc3RydWN0cyB0aGUgRXh0ZW5zaW9ucyByb3cuXG5cdFx0XHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSByb3cgLSBUaGUgcm93IGVsZW1lbnQuXG5cdFx0XHQgKiBAcGFyYW0ge0FycmF5fSBkYXRhIC0gVGhlIHJvdyBkYXRhLlxuXHRcdFx0ICovXG5cdFx0XHRjcmVhdGVkUm93KHJvdywgZGF0YSkge1xuXHRcdFx0XHQkKCd0ZCcsIHJvdykuZXEoMykuc3R5bGUoJ21pbi13aWR0aDo0NXB4OycpO1xuXHRcdFx0fSxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGlzb2xhdGlvbiBjaGFuZ2UuXG5cdCAqIEBtZW1iZXJvZiBNb2R1bGVDR01vZGlmeVxuXHQgKi9cblx0Y2JBZnRlckNoYW5nZUlzb2xhdGUoKXtcblx0XHRpZihNb2R1bGVDR01vZGlmeS4kaXNvbGF0ZUNoZWNrQm94LmNoZWNrYm94KCdpcyBjaGVja2VkJykpe1xuXHRcdFx0TW9kdWxlQ0dNb2RpZnkuJGlzb2xhdGVQaWNrdXBDaGVja0JveC5oaWRlKCk7XG5cdFx0XHRNb2R1bGVDR01vZGlmeS4kc2hvd09ubHlPbklzb2xhdGVHcm91cC5zaG93KCk7XG5cdFx0fWVsc2V7XG5cdFx0XHRNb2R1bGVDR01vZGlmeS4kaXNvbGF0ZVBpY2t1cENoZWNrQm94LnNob3coKTtcblx0XHRcdE1vZHVsZUNHTW9kaWZ5LiRzaG93T25seU9uSXNvbGF0ZUdyb3VwLmhpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIERlbGV0ZSBHcm91cCBtZW1iZXIgZnJvbSBsaXN0LlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gTGluayB0byB0aGUgcHVzaGVkIGJ1dHRvbi5cblx0ICovXG5cdGRlbGV0ZU1lbWJlckZyb21UYWJsZSh0YXJnZXQpIHtcblx0XHRjb25zdCBpZCA9ICQodGFyZ2V0KS5jbG9zZXN0KCdkaXYnKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0JChgIyR7aWR9YClcblx0XHRcdC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQtbWVtYmVyJylcblx0XHRcdC5oaWRlKCk7XG5cdFx0Rm9ybS5kYXRhQ2hhbmdlZCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZHJvcGRvd24gZm9yIHNlbGVjdGluZyB1c2Vycy5cblx0ICogQG1lbWJlcm9mIE1vZHVsZUNHTW9kaWZ5XG5cdCAqL1xuXHRpbml0aWFsaXplVXNlcnNEcm9wRG93bigpIHtcblx0XHRjb25zdCBkcm9wZG93blBhcmFtcyA9IEV4dGVuc2lvbnMuZ2V0RHJvcGRvd25TZXR0aW5nc09ubHlJbnRlcm5hbFdpdGhvdXRFbXB0eSgpO1xuXHRcdGRyb3Bkb3duUGFyYW1zLmFjdGlvbiA9IE1vZHVsZUNHTW9kaWZ5LmNiQWZ0ZXJVc2Vyc1NlbGVjdDtcblx0XHRkcm9wZG93blBhcmFtcy50ZW1wbGF0ZXMgPSB7IG1lbnU6IE1vZHVsZUNHTW9kaWZ5LmN1c3RvbURyb3Bkb3duTWVudSB9O1xuXHRcdE1vZHVsZUNHTW9kaWZ5LiRzZWxlY3RVc2Vyc0Ryb3BEb3duLmRyb3Bkb3duKGRyb3Bkb3duUGFyYW1zKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3VzdG9taXplcyB0aGUgZHJvcGRvd24gbWVudS5cblx0ICogQG1lbWJlcm9mIE1vZHVsZUNHTW9kaWZ5XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSAtIFJlc3BvbnNlIGRhdGEuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBmaWVsZHMgLSBGaWVsZCBwcm9wZXJ0aWVzLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCBmb3IgdGhlIGN1c3RvbSBkcm9wZG93biBtZW51LlxuXHQgKi9cblx0Y3VzdG9tRHJvcGRvd25NZW51KHJlc3BvbnNlLCBmaWVsZHMpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSByZXNwb25zZVtmaWVsZHMudmFsdWVzXSB8fCB7fTtcblx0XHRsZXQgaHRtbCA9ICcnO1xuXHRcdGxldCBvbGRUeXBlID0gJyc7XG5cdFx0JC5lYWNoKHZhbHVlcywgKGluZGV4LCBvcHRpb24pID0+IHtcblx0XHRcdGlmIChvcHRpb24udHlwZSAhPT0gb2xkVHlwZSkge1xuXHRcdFx0XHRvbGRUeXBlID0gb3B0aW9uLnR5cGU7XG5cdFx0XHRcdGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkaXZpZGVyXCI+PC9kaXY+Jztcblx0XHRcdFx0aHRtbCArPSAnXHQ8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+Jztcblx0XHRcdFx0aHRtbCArPSAnXHQ8aSBjbGFzcz1cInRhZ3MgaWNvblwiPjwvaT4nO1xuXHRcdFx0XHRodG1sICs9IG9wdGlvbi50eXBlTG9jYWxpemVkO1xuXHRcdFx0XHRodG1sICs9ICc8L2Rpdj4nO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbWF5YmVUZXh0ID0gKG9wdGlvbltmaWVsZHMudGV4dF0pID8gYGRhdGEtdGV4dD1cIiR7b3B0aW9uW2ZpZWxkcy50ZXh0XX1cImAgOiAnJztcblx0XHRcdGNvbnN0IG1heWJlRGlzYWJsZWQgPSAoJChgI2V4dC0ke29wdGlvbltmaWVsZHMudmFsdWVdfWApLmhhc0NsYXNzKCdzZWxlY3RlZC1tZW1iZXInKSkgPyAnZGlzYWJsZWQgJyA6ICcnO1xuXHRcdFx0aHRtbCArPSBgPGRpdiBjbGFzcz1cIiR7bWF5YmVEaXNhYmxlZH1pdGVtXCIgZGF0YS12YWx1ZT1cIiR7b3B0aW9uW2ZpZWxkcy52YWx1ZV19XCIke21heWJlVGV4dH0+YDtcblx0XHRcdGh0bWwgKz0gb3B0aW9uW2ZpZWxkcy5uYW1lXTtcblx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGFmdGVyIHNlbGVjdGluZyBhIHVzZXIgaW4gdGhlIGdyb3VwLlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBTZWxlY3RlZCB1c2VyJ3MgdGV4dC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gU2VsZWN0ZWQgdXNlcidzIHZhbHVlLlxuXHQgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBUaGUgalF1ZXJ5IGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSBzZWxlY3RlZCB1c2VyLlxuXHQgKi9cblx0Y2JBZnRlclVzZXJzU2VsZWN0KHRleHQsIHZhbHVlLCAkZWxlbWVudCkge1xuXHRcdCQoYCNleHQtJHt2YWx1ZX1gKVxuXHRcdFx0LmNsb3Nlc3QoJ3RyJylcblx0XHRcdC5hZGRDbGFzcygnc2VsZWN0ZWQtbWVtYmVyJylcblx0XHRcdC5zaG93KCk7XG5cdFx0JCgkZWxlbWVudCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0Rm9ybS5kYXRhQ2hhbmdlZCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgYW5kIHVwZGF0ZXMgYnV0dG9uIHN0YXR1cyB3aGVuIHRoZSBtb2R1bGUgc3RhdHVzIGNoYW5nZXMuXG5cdCAqIEBtZW1iZXJvZiBNb2R1bGVDR01vZGlmeVxuXHQgKi9cblx0Y2hlY2tTdGF0dXNUb2dnbGUoKSB7XG5cdFx0aWYgKE1vZHVsZUNHTW9kaWZ5LiRzdGF0dXNUb2dnbGUuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJnZW5lcmFsXCJdIC5kaXNhYmlsaXR5JykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHQkKCdbZGF0YS10YWI9XCJydWxlc1wiXSAuY2hlY2tib3gnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYiA9IFwidXNlcnNcIl0gLmRpc2FiaWxpdHknKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnW2RhdGEtdGFiID0gXCJnZW5lcmFsXCJdIC5kaXNhYmlsaXR5JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHQkKCdbZGF0YS10YWI9XCJydWxlc1wiXSAuY2hlY2tib3gnKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdCQoJ1tkYXRhLXRhYiA9IFwidXNlcnNcIl0gLmRpc2FiaWxpdHknKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzIC0gQWpheCByZXF1ZXN0IHNldHRpbmdzLlxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgbW9kaWZpZWQgQWpheCByZXF1ZXN0IHNldHRpbmdzLlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlQ0dNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdGNvbnN0IGFyck1lbWJlcnMgPSBbXTtcblx0XHQkKCd0ci5zZWxlY3RlZC1tZW1iZXInKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoJChvYmopLmF0dHIoJ2lkJykpIHtcblx0XHRcdFx0YXJyTWVtYmVycy5wdXNoKCQob2JqKS5hdHRyKCdpZCcpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJlc3VsdC5kYXRhLm1lbWJlcnMgPSBKU09OLnN0cmluZ2lmeShhcnJNZW1iZXJzKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBhZnRlciBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAbWVtYmVyb2YgTW9kdWxlQ0dNb2RpZnlcblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICogQG1lbWJlcm9mIE1vZHVsZUNHTW9kaWZ5XG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlQ0dNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvbW9kdWxlLXVzZXJzLWdyb3Vwcy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVDR01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUNHTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVDR01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdC8vIEN1c3RvbSBzb3J0aW5nIGZvciBjaGVja2JveCBzdGF0ZXNcblx0JC5mbi5kYXRhVGFibGUuZXh0Lm9yZGVyWydkb20tY2hlY2tib3gnXSA9IGZ1bmN0aW9uICAoIHNldHRpbmdzLCBjb2wgKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuYXBpKCkuY29sdW1uKCBjb2wsIHtvcmRlcjonaW5kZXgnfSApLm5vZGVzKCkubWFwKCBmdW5jdGlvbiAoIHRkLCBpICkge1xuXHRcdFx0cmV0dXJuICQoJ2lucHV0JywgdGQpLnByb3AoJ2NoZWNrZWQnKSA/ICcxJyA6ICcwJztcblx0XHR9ICk7XG5cdH07XG5cblx0TW9kdWxlQ0dNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==