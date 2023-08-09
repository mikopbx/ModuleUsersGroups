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

/* global globalRootUrl, globalTranslate, Form */

/**
 * Call groups change default group configuration.
 * @namespace changeDefaultGroup
 */
var changeDefaultGroup = {
  /**
   * jQuery object representing the form.
   * @type {jQuery}
   */
  $formObj: $('#default-group-form'),

  /**
   * jQuery object for dropdown menu.
   * @type {jQuery}
   */
  $selectDefaultDropdown: $('.select-default-group'),

  /**
   * Initializes the module.
   * @memberof changeDefaultGroup
   */
  initialize: function initialize() {
    changeDefaultGroup.$selectDefaultDropdown.dropdown({
      onChange: changeDefaultGroup.cbOnChangeDefaultGroup
    });
    changeDefaultGroup.initializeForm();
  },

  /**
   * Callback on change dropdown for default call group.
   */
  cbOnChangeDefaultGroup: function cbOnChangeDefaultGroup() {
    Form.submitForm();
  },

  /**
   * Callback before sending the form.
   * @memberof changeDefaultGroup
   * @param {Object} settings - Ajax request settings.
   * @returns {Object} The modified Ajax request settings.
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
    var result = settings;
    result.data = changeDefaultGroup.$formObj.form('get values');
    return result;
  },

  /**
   * Callback after sending the form.
   * @memberof changeDefaultGroup
   */
  cbAfterSendForm: function cbAfterSendForm() {
    window.location = "".concat(globalRootUrl, "module-users-groups/module-users-groups/index");
  },

  /**
   * Initializes the form.
   * @memberof changeDefaultGroup
   */
  initializeForm: function initializeForm() {
    Form.$formObj = changeDefaultGroup.$formObj;
    Form.url = "".concat(globalRootUrl, "module-users-groups/module-users-groups/change-default");
    Form.cbBeforeSendForm = changeDefaultGroup.cbBeforeSendForm;
    Form.cbAfterSendForm = changeDefaultGroup.cbAfterSendForm;
    Form.initialize();
  }
};
$(document).ready(function () {
  changeDefaultGroup.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWRlZmF1bHQtZm9ybS5qcyJdLCJuYW1lcyI6WyJjaGFuZ2VEZWZhdWx0R3JvdXAiLCIkZm9ybU9iaiIsIiQiLCIkc2VsZWN0RGVmYXVsdERyb3Bkb3duIiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwib25DaGFuZ2UiLCJjYk9uQ2hhbmdlRGVmYXVsdEdyb3VwIiwiaW5pdGlhbGl6ZUZvcm0iLCJGb3JtIiwic3VibWl0Rm9ybSIsImNiQmVmb3JlU2VuZEZvcm0iLCJzZXR0aW5ncyIsInJlc3VsdCIsImRhdGEiLCJmb3JtIiwiY2JBZnRlclNlbmRGb3JtIiwid2luZG93IiwibG9jYXRpb24iLCJnbG9iYWxSb290VXJsIiwidXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsa0JBQWtCLEdBQUc7QUFDdkI7QUFDSjtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMscUJBQUQsQ0FMWTs7QUFPdkI7QUFDSjtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsc0JBQXNCLEVBQUVELENBQUMsQ0FBQyx1QkFBRCxDQVhGOztBQWF2QjtBQUNKO0FBQ0E7QUFDQTtBQUNJRSxFQUFBQSxVQWpCdUIsd0JBaUJWO0FBRVRKLElBQUFBLGtCQUFrQixDQUFDRyxzQkFBbkIsQ0FBMENFLFFBQTFDLENBQW1EO0FBQy9DQyxNQUFBQSxRQUFRLEVBQUVOLGtCQUFrQixDQUFDTztBQURrQixLQUFuRDtBQUlBUCxJQUFBQSxrQkFBa0IsQ0FBQ1EsY0FBbkI7QUFDSCxHQXhCc0I7O0FBMEJ2QjtBQUNKO0FBQ0E7QUFDSUQsRUFBQUEsc0JBN0J1QixvQ0E2QkM7QUFDcEJFLElBQUFBLElBQUksQ0FBQ0MsVUFBTDtBQUNILEdBL0JzQjs7QUFpQ3ZCO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxnQkF2Q3VCLDRCQXVDTkMsUUF2Q00sRUF1Q0k7QUFDdkIsUUFBTUMsTUFBTSxHQUFHRCxRQUFmO0FBQ0FDLElBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxHQUFjZCxrQkFBa0IsQ0FBQ0MsUUFBbkIsQ0FBNEJjLElBQTVCLENBQWlDLFlBQWpDLENBQWQ7QUFDQSxXQUFPRixNQUFQO0FBQ0gsR0EzQ3NCOztBQTZDdkI7QUFDSjtBQUNBO0FBQ0E7QUFDSUcsRUFBQUEsZUFqRHVCLDZCQWlETDtBQUNkQyxJQUFBQSxNQUFNLENBQUNDLFFBQVAsYUFBcUJDLGFBQXJCO0FBQ0gsR0FuRHNCOztBQXFEdkI7QUFDSjtBQUNBO0FBQ0E7QUFDSVgsRUFBQUEsY0F6RHVCLDRCQXlETjtBQUNiQyxJQUFBQSxJQUFJLENBQUNSLFFBQUwsR0FBZ0JELGtCQUFrQixDQUFDQyxRQUFuQztBQUNBUSxJQUFBQSxJQUFJLENBQUNXLEdBQUwsYUFBY0QsYUFBZDtBQUNBVixJQUFBQSxJQUFJLENBQUNFLGdCQUFMLEdBQXdCWCxrQkFBa0IsQ0FBQ1csZ0JBQTNDO0FBQ0FGLElBQUFBLElBQUksQ0FBQ08sZUFBTCxHQUF1QmhCLGtCQUFrQixDQUFDZ0IsZUFBMUM7QUFDQVAsSUFBQUEsSUFBSSxDQUFDTCxVQUFMO0FBQ0g7QUEvRHNCLENBQTNCO0FBa0VBRixDQUFDLENBQUNtQixRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3BCdEIsRUFBQUEsa0JBQWtCLENBQUNJLFVBQW5CO0FBQ0gsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0gKi9cblxuLyoqXG4gKiBDYWxsIGdyb3VwcyBjaGFuZ2UgZGVmYXVsdCBncm91cCBjb25maWd1cmF0aW9uLlxuICogQG5hbWVzcGFjZSBjaGFuZ2VEZWZhdWx0R3JvdXBcbiAqL1xuY29uc3QgY2hhbmdlRGVmYXVsdEdyb3VwID0ge1xuICAgIC8qKlxuICAgICAqIGpRdWVyeSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBmb3JtLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJGZvcm1PYmo6ICQoJyNkZWZhdWx0LWdyb3VwLWZvcm0nKSxcblxuICAgIC8qKlxuICAgICAqIGpRdWVyeSBvYmplY3QgZm9yIGRyb3Bkb3duIG1lbnUuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkc2VsZWN0RGVmYXVsdERyb3Bkb3duOiAkKCcuc2VsZWN0LWRlZmF1bHQtZ3JvdXAnKSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG4gICAgICogQG1lbWJlcm9mIGNoYW5nZURlZmF1bHRHcm91cFxuICAgICAqL1xuICAgIGluaXRpYWxpemUoKSB7XG5cbiAgICAgICAgY2hhbmdlRGVmYXVsdEdyb3VwLiRzZWxlY3REZWZhdWx0RHJvcGRvd24uZHJvcGRvd24oe1xuICAgICAgICAgICAgb25DaGFuZ2U6IGNoYW5nZURlZmF1bHRHcm91cC5jYk9uQ2hhbmdlRGVmYXVsdEdyb3VwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoYW5nZURlZmF1bHRHcm91cC5pbml0aWFsaXplRm9ybSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBvbiBjaGFuZ2UgZHJvcGRvd24gZm9yIGRlZmF1bHQgY2FsbCBncm91cC5cbiAgICAgKi9cbiAgICBjYk9uQ2hhbmdlRGVmYXVsdEdyb3VwKCl7XG4gICAgICAgIEZvcm0uc3VibWl0Rm9ybSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuICAgICAqIEBtZW1iZXJvZiBjaGFuZ2VEZWZhdWx0R3JvdXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIG1vZGlmaWVkIEFqYXggcmVxdWVzdCBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuICAgICAgICByZXN1bHQuZGF0YSA9IGNoYW5nZURlZmF1bHRHcm91cC4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG4gICAgICogQG1lbWJlcm9mIGNoYW5nZURlZmF1bHRHcm91cFxuICAgICAqL1xuICAgIGNiQWZ0ZXJTZW5kRm9ybSgpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvaW5kZXhgO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cbiAgICAgKiBAbWVtYmVyb2YgY2hhbmdlRGVmYXVsdEdyb3VwXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZUZvcm0oKSB7XG4gICAgICAgIEZvcm0uJGZvcm1PYmogPSBjaGFuZ2VEZWZhdWx0R3JvdXAuJGZvcm1PYmo7XG4gICAgICAgIEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlLWRlZmF1bHRgO1xuICAgICAgICBGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBjaGFuZ2VEZWZhdWx0R3JvdXAuY2JCZWZvcmVTZW5kRm9ybTtcbiAgICAgICAgRm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBjaGFuZ2VEZWZhdWx0R3JvdXAuY2JBZnRlclNlbmRGb3JtO1xuICAgICAgICBGb3JtLmluaXRpYWxpemUoKTtcbiAgICB9LFxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgIGNoYW5nZURlZmF1bHRHcm91cC5pbml0aWFsaXplKCk7XG59KTtcblxuIl19