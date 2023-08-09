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
   * Initializes the module.
   * @memberof changeDefaultGroup
   */
  initialize: function initialize() {
    changeDefaultGroup.initializeForm();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWRlZmF1bHQtZm9ybS5qcyJdLCJuYW1lcyI6WyJjaGFuZ2VEZWZhdWx0R3JvdXAiLCIkZm9ybU9iaiIsIiQiLCJpbml0aWFsaXplIiwiaW5pdGlhbGl6ZUZvcm0iLCJjYkJlZm9yZVNlbmRGb3JtIiwic2V0dGluZ3MiLCJyZXN1bHQiLCJkYXRhIiwiZm9ybSIsImNiQWZ0ZXJTZW5kRm9ybSIsIndpbmRvdyIsImxvY2F0aW9uIiwiZ2xvYmFsUm9vdFVybCIsIkZvcm0iLCJ1cmwiLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxrQkFBa0IsR0FBRztBQUN2QjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxRQUFRLEVBQUVDLENBQUMsQ0FBQyxxQkFBRCxDQUxZOztBQU92QjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxVQVh1Qix3QkFXVjtBQUNUSCxJQUFBQSxrQkFBa0IsQ0FBQ0ksY0FBbkI7QUFDSCxHQWJzQjs7QUFjdkI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLGdCQXBCdUIsNEJBb0JOQyxRQXBCTSxFQW9CSTtBQUN2QixRQUFNQyxNQUFNLEdBQUdELFFBQWY7QUFDQUMsSUFBQUEsTUFBTSxDQUFDQyxJQUFQLEdBQWNSLGtCQUFrQixDQUFDQyxRQUFuQixDQUE0QlEsSUFBNUIsQ0FBaUMsWUFBakMsQ0FBZDtBQUNBLFdBQU9GLE1BQVA7QUFDSCxHQXhCc0I7O0FBMEJ2QjtBQUNKO0FBQ0E7QUFDQTtBQUNJRyxFQUFBQSxlQTlCdUIsNkJBOEJMO0FBQ2RDLElBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxhQUFxQkMsYUFBckI7QUFDSCxHQWhDc0I7O0FBa0N2QjtBQUNKO0FBQ0E7QUFDQTtBQUNJVCxFQUFBQSxjQXRDdUIsNEJBc0NOO0FBQ2JVLElBQUFBLElBQUksQ0FBQ2IsUUFBTCxHQUFnQkQsa0JBQWtCLENBQUNDLFFBQW5DO0FBQ0FhLElBQUFBLElBQUksQ0FBQ0MsR0FBTCxhQUFjRixhQUFkO0FBQ0FDLElBQUFBLElBQUksQ0FBQ1QsZ0JBQUwsR0FBd0JMLGtCQUFrQixDQUFDSyxnQkFBM0M7QUFDQVMsSUFBQUEsSUFBSSxDQUFDSixlQUFMLEdBQXVCVixrQkFBa0IsQ0FBQ1UsZUFBMUM7QUFDQUksSUFBQUEsSUFBSSxDQUFDWCxVQUFMO0FBQ0g7QUE1Q3NCLENBQTNCO0FBK0NBRCxDQUFDLENBQUNjLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDcEJqQixFQUFBQSxrQkFBa0IsQ0FBQ0csVUFBbkI7QUFDSCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsZ2xvYmFsVHJhbnNsYXRlLCBGb3JtLCBFeHRlbnNpb25zICovXG5cbi8qKlxuICogQ2FsbCBncm91cHMgY2hhbmdlIGRlZmF1bHQgZ3JvdXAgY29uZmlndXJhdGlvbi5cbiAqIEBuYW1lc3BhY2UgY2hhbmdlRGVmYXVsdEdyb3VwXG4gKi9cbmNvbnN0IGNoYW5nZURlZmF1bHRHcm91cCA9IHtcbiAgICAvKipcbiAgICAgKiBqUXVlcnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZm9ybS5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgICRmb3JtT2JqOiAkKCcjZGVmYXVsdC1ncm91cC1mb3JtJyksXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuICAgICAqIEBtZW1iZXJvZiBjaGFuZ2VEZWZhdWx0R3JvdXBcbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICBjaGFuZ2VEZWZhdWx0R3JvdXAuaW5pdGlhbGl6ZUZvcm0oKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuICAgICAqIEBtZW1iZXJvZiBjaGFuZ2VEZWZhdWx0R3JvdXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIG1vZGlmaWVkIEFqYXggcmVxdWVzdCBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuICAgICAgICByZXN1bHQuZGF0YSA9IGNoYW5nZURlZmF1bHRHcm91cC4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG4gICAgICogQG1lbWJlcm9mIGNoYW5nZURlZmF1bHRHcm91cFxuICAgICAqL1xuICAgIGNiQWZ0ZXJTZW5kRm9ybSgpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvaW5kZXhgO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cbiAgICAgKiBAbWVtYmVyb2YgY2hhbmdlRGVmYXVsdEdyb3VwXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZUZvcm0oKSB7XG4gICAgICAgIEZvcm0uJGZvcm1PYmogPSBjaGFuZ2VEZWZhdWx0R3JvdXAuJGZvcm1PYmo7XG4gICAgICAgIEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlLWRlZmF1bHRgO1xuICAgICAgICBGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBjaGFuZ2VEZWZhdWx0R3JvdXAuY2JCZWZvcmVTZW5kRm9ybTtcbiAgICAgICAgRm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBjaGFuZ2VEZWZhdWx0R3JvdXAuY2JBZnRlclNlbmRGb3JtO1xuICAgICAgICBGb3JtLmluaXRpYWxpemUoKTtcbiAgICB9LFxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgIGNoYW5nZURlZmF1bHRHcm91cC5pbml0aWFsaXplKCk7XG59KTtcblxuIl19