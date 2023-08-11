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
 * @namespace ModuleCGChangeDefaultGroup
 */
var ModuleCGChangeDefaultGroup = {
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
   */
  initialize: function initialize() {
    ModuleCGChangeDefaultGroup.$selectDefaultDropdown.dropdown({
      onChange: ModuleCGChangeDefaultGroup.cbOnModuleCGChangeDefaultGroup
    });
    ModuleCGChangeDefaultGroup.initializeForm();
  },

  /**
   * Callback on change dropdown for default call group.
   */
  cbOnModuleCGChangeDefaultGroup: function cbOnModuleCGChangeDefaultGroup() {
    Form.submitForm();
  },

  /**
   * Callback before sending the form.
   * @param {Object} settings - Ajax request settings.
   * @returns {Object} The modified Ajax request settings.
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
    var result = settings;
    result.data = ModuleCGChangeDefaultGroup.$formObj.form('get values');
    return result;
  },

  /**
   * Callback after sending the form.
   */
  cbAfterSendForm: function cbAfterSendForm() {
    window.location = "".concat(globalRootUrl, "module-users-groups/module-users-groups/index");
  },

  /**
   * Initializes the form.
   */
  initializeForm: function initializeForm() {
    Form.$formObj = ModuleCGChangeDefaultGroup.$formObj;
    Form.url = "".concat(globalRootUrl, "module-users-groups/module-users-groups/change-default");
    Form.cbBeforeSendForm = ModuleCGChangeDefaultGroup.cbBeforeSendForm;
    Form.cbAfterSendForm = ModuleCGChangeDefaultGroup.cbAfterSendForm;
    Form.initialize();
  }
};
$(document).ready(function () {
  ModuleCGChangeDefaultGroup.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtdXNlcnMtZ3JvdXBzLWRlZmF1bHQtZm9ybS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cCIsIiRmb3JtT2JqIiwiJCIsIiRzZWxlY3REZWZhdWx0RHJvcGRvd24iLCJpbml0aWFsaXplIiwiZHJvcGRvd24iLCJvbkNoYW5nZSIsImNiT25Nb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cCIsImluaXRpYWxpemVGb3JtIiwiRm9ybSIsInN1Ym1pdEZvcm0iLCJjYkJlZm9yZVNlbmRGb3JtIiwic2V0dGluZ3MiLCJyZXN1bHQiLCJkYXRhIiwiZm9ybSIsImNiQWZ0ZXJTZW5kRm9ybSIsIndpbmRvdyIsImxvY2F0aW9uIiwiZ2xvYmFsUm9vdFVybCIsInVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLDBCQUEwQixHQUFHO0FBQy9CO0FBQ0o7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLHFCQUFELENBTG9COztBQU8vQjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxzQkFBc0IsRUFBRUQsQ0FBQyxDQUFDLHVCQUFELENBWE07O0FBYS9CO0FBQ0o7QUFDQTtBQUNJRSxFQUFBQSxVQWhCK0Isd0JBZ0JsQjtBQUVUSixJQUFBQSwwQkFBMEIsQ0FBQ0csc0JBQTNCLENBQWtERSxRQUFsRCxDQUEyRDtBQUN2REMsTUFBQUEsUUFBUSxFQUFFTiwwQkFBMEIsQ0FBQ087QUFEa0IsS0FBM0Q7QUFJQVAsSUFBQUEsMEJBQTBCLENBQUNRLGNBQTNCO0FBQ0gsR0F2QjhCOztBQXlCL0I7QUFDSjtBQUNBO0FBQ0lELEVBQUFBLDhCQTVCK0IsNENBNEJDO0FBQzVCRSxJQUFBQSxJQUFJLENBQUNDLFVBQUw7QUFDSCxHQTlCOEI7O0FBZ0MvQjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLGdCQXJDK0IsNEJBcUNkQyxRQXJDYyxFQXFDSjtBQUN2QixRQUFNQyxNQUFNLEdBQUdELFFBQWY7QUFDQUMsSUFBQUEsTUFBTSxDQUFDQyxJQUFQLEdBQWNkLDBCQUEwQixDQUFDQyxRQUEzQixDQUFvQ2MsSUFBcEMsQ0FBeUMsWUFBekMsQ0FBZDtBQUNBLFdBQU9GLE1BQVA7QUFDSCxHQXpDOEI7O0FBMkMvQjtBQUNKO0FBQ0E7QUFDSUcsRUFBQUEsZUE5QytCLDZCQThDYjtBQUNkQyxJQUFBQSxNQUFNLENBQUNDLFFBQVAsYUFBcUJDLGFBQXJCO0FBQ0gsR0FoRDhCOztBQWtEL0I7QUFDSjtBQUNBO0FBQ0lYLEVBQUFBLGNBckQrQiw0QkFxRGQ7QUFDYkMsSUFBQUEsSUFBSSxDQUFDUixRQUFMLEdBQWdCRCwwQkFBMEIsQ0FBQ0MsUUFBM0M7QUFDQVEsSUFBQUEsSUFBSSxDQUFDVyxHQUFMLGFBQWNELGFBQWQ7QUFDQVYsSUFBQUEsSUFBSSxDQUFDRSxnQkFBTCxHQUF3QlgsMEJBQTBCLENBQUNXLGdCQUFuRDtBQUNBRixJQUFBQSxJQUFJLENBQUNPLGVBQUwsR0FBdUJoQiwwQkFBMEIsQ0FBQ2dCLGVBQWxEO0FBQ0FQLElBQUFBLElBQUksQ0FBQ0wsVUFBTDtBQUNIO0FBM0Q4QixDQUFuQztBQThEQUYsQ0FBQyxDQUFDbUIsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUNwQnRCLEVBQUFBLDBCQUEwQixDQUFDSSxVQUEzQjtBQUNILENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCwgZ2xvYmFsVHJhbnNsYXRlLCBGb3JtICovXG5cbi8qKlxuICogQ2FsbCBncm91cHMgY2hhbmdlIGRlZmF1bHQgZ3JvdXAgY29uZmlndXJhdGlvbi5cbiAqIEBuYW1lc3BhY2UgTW9kdWxlQ0dDaGFuZ2VEZWZhdWx0R3JvdXBcbiAqL1xuY29uc3QgTW9kdWxlQ0dDaGFuZ2VEZWZhdWx0R3JvdXAgPSB7XG4gICAgLyoqXG4gICAgICogalF1ZXJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGZvcm0uXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkZm9ybU9iajogJCgnI2RlZmF1bHQtZ3JvdXAtZm9ybScpLFxuXG4gICAgLyoqXG4gICAgICogalF1ZXJ5IG9iamVjdCBmb3IgZHJvcGRvd24gbWVudS5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgICRzZWxlY3REZWZhdWx0RHJvcGRvd246ICQoJy5zZWxlY3QtZGVmYXVsdC1ncm91cCcpLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuXG4gICAgICAgIE1vZHVsZUNHQ2hhbmdlRGVmYXVsdEdyb3VwLiRzZWxlY3REZWZhdWx0RHJvcGRvd24uZHJvcGRvd24oe1xuICAgICAgICAgICAgb25DaGFuZ2U6IE1vZHVsZUNHQ2hhbmdlRGVmYXVsdEdyb3VwLmNiT25Nb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cFxuICAgICAgICB9KTtcblxuICAgICAgICBNb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cC5pbml0aWFsaXplRm9ybSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBvbiBjaGFuZ2UgZHJvcGRvd24gZm9yIGRlZmF1bHQgY2FsbCBncm91cC5cbiAgICAgKi9cbiAgICBjYk9uTW9kdWxlQ0dDaGFuZ2VEZWZhdWx0R3JvdXAoKXtcbiAgICAgICAgRm9ybS5zdWJtaXRGb3JtKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYmVmb3JlIHNlbmRpbmcgdGhlIGZvcm0uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzIC0gQWpheCByZXF1ZXN0IHNldHRpbmdzLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBtb2RpZmllZCBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG4gICAgICovXG4gICAgY2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBzZXR0aW5ncztcbiAgICAgICAgcmVzdWx0LmRhdGEgPSBNb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cC4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG4gICAgICovXG4gICAgY2JBZnRlclNlbmRGb3JtKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS11c2Vycy1ncm91cHMvbW9kdWxlLXVzZXJzLWdyb3Vwcy9pbmRleGA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBmb3JtLlxuICAgICAqL1xuICAgIGluaXRpYWxpemVGb3JtKCkge1xuICAgICAgICBGb3JtLiRmb3JtT2JqID0gTW9kdWxlQ0dDaGFuZ2VEZWZhdWx0R3JvdXAuJGZvcm1PYmo7XG4gICAgICAgIEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtdXNlcnMtZ3JvdXBzL21vZHVsZS11c2Vycy1ncm91cHMvY2hhbmdlLWRlZmF1bHRgO1xuICAgICAgICBGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBNb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cC5jYkJlZm9yZVNlbmRGb3JtO1xuICAgICAgICBGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUNHQ2hhbmdlRGVmYXVsdEdyb3VwLmNiQWZ0ZXJTZW5kRm9ybTtcbiAgICAgICAgRm9ybS5pbml0aWFsaXplKCk7XG4gICAgfSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBNb2R1bGVDR0NoYW5nZURlZmF1bHRHcm91cC5pbml0aWFsaXplKCk7XG59KTtcblxuIl19