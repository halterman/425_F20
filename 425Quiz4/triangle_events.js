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

class TriangleEvents {
    
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

    this.my_var = 3;
    // console.log("my_var in constructor: " + this.my_var);

    //------------------------------------------------------------------------------

    // Constructor code after the functions are defined.
    $('#enlarge_button').on('click', evt => this.enlarge(evt));
    //$('#' + id + '_axes').on("click", evt => this.axes_status(evt));

    // Add standard mouse events to the canvas
    var cid = '#' + id + "_canvas";
    $(cid).mousedown(evt => this.mouse_drag_started(evt));
    $(cid).mouseup(evt => this.mouse_drag_ended(evt));
    $(cid).mousemove(evt => this.mouse_dragged(evt));

  }
   

  //-----------------------------------------------------------------------
  mouse_drag_started(event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    this.start_of_mouse_drag = event;
    event.preventDefault();

    if (this.animate_is_on) {
      this.scene.animate_active = false;
    }
  }

  //-----------------------------------------------------------------------
  mouse_drag_ended(event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
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
    let delta_x, delta_y;

    // console.log("my_var in mouse_dragged: " + this.my_var);

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (this.start_of_mouse_drag) {
      delta_x = event.clientX - this.start_of_mouse_drag.clientX;
      delta_y = event.clientY - this.start_of_mouse_drag.clientY;
      //console.log("moved: " + delta_x + " " + delta_y);

      // console.log("In mouse dragged this.scene: ", this.scene);
      // console.log("In mouse dragged this: ", this);
      // console.log(this.scene);
      // console.log("In mouse_dragged");
      this.scene.angle_x += delta_y;
      this.scene.angle_y += delta_x;
      this.scene.render();

      this.start_of_mouse_drag = event;
      event.preventDefault();
    }
  }

  //------------------------------------------------------------------------------
  animation_status(event) {
    //out.displayInfo('animation_status event happened');
    // console.log("Animation event happened");
    if ($(event.target).is(":checked"))  {
      this.animate_is_on = true;
      this.scene.animate_active = true;
      this.animate();
    } else {
      this.animate_is_on = false;
      this.scene.animate_active = false;
    }
  }

  enlarge(event) {
    console.log("Enlarging");
    let M = GlMatrix4x4.create();
    GlMatrix4x4.setIdentity(M);

    console.log(this.scene.tri.triangles[0].vertices);
    //this.scene.tri.triangles[0].vertices[0] = [0, 0, 0];
    console.log(this.scene.tri.triangles[0].vertices);

    this.scene.render();
  }

  //------------------------------------------------------------------------------
  draw_edges_status(event) {
    this.scene.draw_edges = $(event.target).is(":checked");
    this.scene.render();
  }

  //------------------------------------------------------------------------------
  wireframe_status(event) {
    this.scene.wireframe = $(event.target).is(":checked");
    this.scene.render();
  }

  //------------------------------------------------------------------------------
  axes_status(event) {
    this.scene.show_axes = $(event.target).is(":checked");
    this.scene.render();
  }

  //------------------------------------------------------------------------------
  animate() {

    let now, elapsed_time;

    if (this.scene.animate_active) {

      // console.log("Animating now")
      now = Date.now();
      elapsed_time = now - this.previous_time;

      if (elapsed_time >= this.frame_rate) {
        this.scene.angle_x -= 0.5;
        this.scene.angle_y += 5; //1;
        this.scene.render();
        this.previous_time = now;
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  //------------------------------------------------------------------------------
  removeAllEventHandlers() {
    $('#' + this.id + '_pause').unbind("click", this.animation_status);
    $('#' + this.id + '_draw_edges').unbind("click", this.draw_edges_status);
    $('#' + this.id + '_wireframe').unbind("click", this.wireframe_status);
    $('#' + this.id + '_axes').unbind("click", this.axes_status);

    var cid = '#' + this.id + "_canvas";
    $( cid ).unbind("mousedown", this.mouse_drag_started );
    $( cid ).unbind("mouseup",   this.mouse_drag_ended );
    $( cid ).unbind("mousemove", this.mouse_dragged );
  }

}

