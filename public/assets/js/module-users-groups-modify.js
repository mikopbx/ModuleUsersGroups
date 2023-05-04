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
        moduleUsersGroups.$dirrtyField.val(Math.random());
        moduleUsersGroups.$dirrtyField.trigger('change');
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
    $('#isolate').parent().checkbox({
      onChange: moduleUsersGroups.changeIsolate
    });
    moduleUsersGroups.changeIsolate();
  },
  changeIsolate: function changeIsolate() {
    if ($('#isolate').parent().checkbox('is checked')) {
      $("#isolatePickUp").parent().hide();
    } else {
      $("#isolatePickUp").parent().show();
    }
  },

  /**
   * Delete Group member from list
   * @param target - link to pushed button
   */
  deleteMemberFromTable: function deleteMemberFromTable(target) {
    var id = $(target).closest('div').attr('data-value');
    $("#".concat(id)).removeClass('selected-member').hide();
    moduleUsersGroups.$dirrtyField.val(Math.random());
    moduleUsersGroups.$dirrtyField.trigger('change');
  },

  /**
   * Настройка выпадающего списка пользователей
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
   * Change custom menu visualisation
   * @param response
   * @param fields
   * @returns {string}
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
   * Колбек после выбора пользователя в группу
   * @param value
   */
  cbAfterUsersSelect: function cbAfterUsersSelect(text, value, $element) {
    $("#ext-".concat(value)).closest('tr').addClass('selected-member').show();
    $($element).addClass('disabled');
    moduleUsersGroups.$dirrtyField.val(Math.random());
    moduleUsersGroups.$dirrtyField.trigger('change');
  },

  /**
   * Изменение статуса кнопок при изменении статуса модуля
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
  cbAfterSendForm: function cbAfterSendForm() {},
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
//# sourceMappingURL=module-users-groups-modify.js.map