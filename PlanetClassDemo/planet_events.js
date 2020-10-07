/**
 * simple_pyramid_events.js, By Wayne Brown, Spring 2016
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
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

class PlanetEvents {
    
  constructor(id, scene) {
    /** -----------------------------------------------------------------------
     * Process the events of a WebGL program.
     *
     * @param id {string} The id of the webglinteractive directive
     * @param scene {object} An instance of the ObjectExampleScene class
     * @constructor
     */

    this.id = id;
    this.scene = scene;


    // Private variables
    // var self = this;        // Store a local reference to the new object.
    this.out = scene.out;    // Debugging and output goes here.
    this.canvas = scene.canvas;

    // Remember the current state of events
    this.start_of_mouse_drag = null;
    this.previous_time = Date.now();
    this.animate_is_on = scene.animate_active;

    // Control the rate at which animations refresh
    this.frame_rate = 33; // 33 milliseconds = 1/30 sec

    this.scene.angle_x = 0;
    this.scene.angle_y = 0;
    // this.scene.angle_z = 0;

    this.my_var = 3;
    // console.log("my_var in constructor: " + this.my_var);

    //------------------------------------------------------------------------------

    // Constructor code after the functions are defined.
    // Add an onclick callback to each HTML control
    $('#' + id + '_pause').on('click', evt => this.animation_status(evt));

    // Add standard mouse events to the canvas
    var cid = '#' + id + "_canvas";
    $(cid).mousedown(evt => this.mouse_drag_started(evt));
    $(cid).mouseup(evt => this.mouse_drag_ended(evt));
    $(cid).mousemove(evt => this.mouse_dragged(evt));

  }
   

  //-----------------------------------------------------------------------
  mouse_drag_started(event) {

    this.start_of_mouse_drag = event;
    event.preventDefault();

    if (this.animate_is_on) {
      this.scene.animate_active = false;
    }
  }

  //-----------------------------------------------------------------------
  mouse_drag_ended(event) {

    this.start_of_mouse_drag = null;

    event.preventDefault();

    if (this.animate_is_on) {
      this.scene.animate_active = true;
      this.animate();
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Process a mouse drag event.
   * @param event A jQuery event object
   */
  mouse_dragged(event) {
    let delta_x, delta_y, delta_z;

    if (this.start_of_mouse_drag) {
      delta_x = event.clientX - this.start_of_mouse_drag.clientX;
      delta_y = event.clientY - this.start_of_mouse_drag.clientY;
      delta_z = event.clientZ - this.start_of_mouse_drag.clientZ;

      this.scene.angle_x += delta_y;
      this.scene.angle_y += delta_x;
      // this.scene.angle_z += delta_z;
      this.scene.render();

      this.start_of_mouse_drag = event;
      event.preventDefault();
    }
  }

  //------------------------------------------------------------------------------
  animation_status(event) {
    if ($(event.target).is(":checked"))  {
      this.animate_is_on = true;
      this.scene.animate_active = true;
      this.animate();
    } else {
      this.animate_is_on = false;
      this.scene.animate_active = false;
    }
  }


  //------------------------------------------------------------------------------
  animate() {

    let now, elapsed_time;

    if (this.scene.animate_active) {

      // console.log("Animating now")
      now = Date.now();
      elapsed_time = now - this.previous_time;

      if (elapsed_time >= this.frame_rate) {
        this.scene.angle_x += 0.3;
        this.scene.angle_y += 3; //1;
        // this.scene.angle_z += 3; //1;
        this.scene.render();
        this.previous_time = now;
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  //------------------------------------------------------------------------------
  removeAllEventHandlers() {
    $('#' + this.id + '_pause').unbind("click", this.animation_status);

    var cid = '#' + this.id + "_canvas";
    $( cid ).unbind("mousedown", this.mouse_drag_started );
    $( cid ).unbind("mouseup",   this.mouse_drag_ended );
    $( cid ).unbind("mousemove", this.mouse_dragged );
  }

}

