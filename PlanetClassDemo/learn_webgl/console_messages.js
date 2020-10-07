/**
 * console_messages.js, By Wayne Brown, Fall 2017
 *
 * A class to track and display messages. Messages are always displayed
 * to the Javascript console window. For webglinteractive directive applications
 * the messages are also displayed to the output div textarea.
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

/**
 * A class for storing information messages for webglinteractive applications.
 *
 * @param id The runestone identifier for the webglinteractive directive
 * @constructor
 */
class ConsoleMessages {
  constructor(id) {

    // let self = this;

    this.errors_are_visible;     // Boolean: if true, display error messages.
    this.warnings_are_visible;   // Boolean: if true, display warning messages.
    this.info_are_visible;       // Boolean: if true, display info messages.
    this.number_messages;        // Integer: the number of messages stored.
    this.error_messages;         // Array of strings
    this.warning_messages;       // Array of strings
    this.info_messages;          // Array of strings
    this.error_messages_order;   // Array of integer indexes
    this.warning_messages_order; // Array of integer indexes
    this.info_messages_order;    // Array of integer indexes
    this.messages;               // All messages in one string

    this.console_id;  // The id of the <div> element to display messages.
    //-----------------------------------------------------------------------
    // Constructor

    this.errors_are_visible = true;
    this.warnings_are_visible = true;
    this.info_are_visible = true;
    this.number_messages = 0;
    this.clearMessages();
  }

  //-----------------------------------------------------------------------
  showErrors(event) {
    this.errors_are_visible = $("#" + this.id + "_webgl_displayErrors").is(':checked');
    this._updateScreen();
  }

  //-----------------------------------------------------------------------
  showWarnings(event) {
    this.warnings_are_visible = $("#" + this.id + "_webgl_displayWarnings").is(':checked');
    this._updateScreen();
  }

  //-----------------------------------------------------------------------
  showInfo(event) {
    this.info_are_visible = $("#" + this.id + "_webgl_displayInfo").is(':checked');
    this._updateScreen(this);
  }

  //-----------------------------------------------------------------------
  _output_div() {
    if (document.getElementById(this.id + "_webgl_output_div")) {
      this.console_id = "#" + this.id + "_webgl_output_div";

      // Register the callbacks for the display check boxes
      $("#" + this.id + "_webgl_displayInfo").on('click', this.showInfo);
      $("#" + this.id + "_webgl_displayWarnings").on('click', this.showWarnings);
      $("#" + this.id + "_webgl_displayErrors").on('click', this.showErrors);
      return true;
    }
    return false;
  }

  //-----------------------------------------------------------------------
  displayError(error_message) {
    console.log("ERROR: " + error_message);
    this.error_messages.push(error_message);
    this.error_messages_order.push(this.number_messages);
    this._addError(error_message);
    this.number_messages += 1;
    this._updateScreen();
  }

  //-----------------------------------------------------------------------
  displayWarning(warning_message) {
    console.log("WARNING: " + warning_message);
    this.warning_messages.push(warning_message);
    this.warning_messages_order.push(this.number_messages);
    this._addWarning(warning_message);
    this.number_messages += 1;
    this._updateScreen();
  }

  //-----------------------------------------------------------------------
  displayInfo(info_message) {
    console.log(info_message);
    this.info_messages.push(info_message);
    this.info_messages_order.push(this.number_messages);
    this._addInfo(info_message);
    this.number_messages += 1;
    this._updateScreen();
  }

  //-----------------------------------------------------------------------
  clearMessages() {
    this.number_messages = 0;
    this.messages = "";
    this.error_messages = [];
    this.error_messages_order = [];
    this.warning_messages = [];
    this.warning_messages_order = [];
    this.info_messages = [];
    this.info_messages_order = [];
    this._updateScreen();
  }

  //-----------------------------------------------------------------------
  _addError(error_message) {
    if (this.errors_are_visible) {
      this.messages += '<div class="webgl_errorMessages">' + error_message + '</div>';
    }
  }

  //-----------------------------------------------------------------------
  _addWarning(warning_message) {
    if (this.warnings_are_visible) {
      this.messages += '<div class="webgl_warningMessages">' + warning_message + '</div>';
    }
  }

  //-----------------------------------------------------------------------
  _addInfo(info_message) {
    if (this.info_are_visible) {
      this.messages += '<div class="webgl_infoMessages">' + info_message + '</div>';
    }
  }

  //-----------------------------------------------------------------------
  _buildDisplay() {
    let n = 0;
    let e = 0;
    let w = 0;
    let i = 0;
    this.messages = "";
    while (n < this.number_messages) {
      if (n === this.error_messages_order[e]) {
        this._addError(this.error_messages[e]);
        e += 1;
      } else if (n === this.warning_messages_order[w]) {
        this._addWarning(this.warning_messages[w]);
        w += 1;
      } else if (n === this.info_messages_order[i]) {
        this._addInfo(this.info_messages[i]);
        i += 1;
      }
      n += 1;
    }
  }

  //-----------------------------------------------------------------------
  _updateScreen() {
    if (this._output_div()) {
      this._buildDisplay();
      $(this.console_id).html(this.messages);
    }
  }

};

