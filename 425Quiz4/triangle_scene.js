/**
 * simple_pyramind_scene.js, By Wayne Brown, Fall 2017
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

/** -----------------------------------------------------------------------
 * Create a WebGL 3D scene, store its state, and render its models.
 *
 * @param id {string} The id of the webglinteractive directive
 * @param download {SceneDownload} An instance of the SceneDownload class
 * @param vshaders_dictionary {dict} A dictionary of vertex shaders.
 * @param fshaders_dictionary {dict} A dictionary of fragment shaders.
 * @param models {object} A dictionary (or array) of models.
 * @constructor
 */
class TriangleScene {
  //Private properties
  #out = null;
  #gl = null; 
  #program = null; 
  #transform = null;
  #camera = null;
  #projection = null;
  #rotate_x_matrix = null;
  #rotate_y_matrix = null;
  #scale_axes = null;
  #triangle_model = null;
  #triangle_color = null;
  #triangle = null;
  #triangle_gpu = null;
  #x_axis_gpu =null;
  #y_axis_gpu = null;
  #z_axis_gpu = null;
  #x_axis = null;
  #y_axis = null;
  #z_axis =null;
  #x_axis_color;
  #y_axis_color = null;
  #z_axis_color = null;
  #events = null;

  constructor(id, download, vshaders_dictionary, fshaders_dictionary, models) {

    // Private variables
    this.#out = download.out;
    // let matrix = new GlMatrix4x4();
    this.#transform = GlMatrix4x4.create();
    this.#camera = GlMatrix4x4.create();
    this.#rotate_x_matrix = GlMatrix4x4.create();
    this.#rotate_y_matrix = GlMatrix4x4.create();
    this.#scale_axes = GlMatrix4x4.create();

    // Public variables that will possibly be used or changed by event handlers.
    this.canvas = null;
    this.angle_x = 0.0;
    this.angle_y = 0.0;
    this.animate_active = false;
    this.draw_edges = true;
    this.wireframe = false;
    this.show_axes = true;


    //-----------------------------------------------------------------------
    // Object constructor. One-time initialization of the scene.

    // Get the rendering context for the canvas
    this.canvas = download.getCanvas(id + "_canvas");
    if (this.canvas) {
      this.#gl = download.getWebglContext(this.canvas);
    }
    if (!this.#gl) {
      return;
    }

    // Initialize the state of the gl context
    this.#gl.enable(this.#gl.DEPTH_TEST);

    console.log("Number of texture units available: " + this.#gl.getParameter(this.#gl.MAX_TEXTURE_IMAGE_UNITS));


    this.#projection = GlMatrix4x4.createOrthographic(-1, 1, -1, 1, -8, 8);
    GlMatrix4x4.lookAt(this.#camera, 0, 0, 4, 0, 0, 0, 0, 1, 0);

    // Compile and link shader programs to create a complete rendering program.
    this.#program = download.createProgram(this.#gl, vshaders_dictionary["uniform_color"], fshaders_dictionary["uniform_color"]);

    this.#gl.useProgram(this.#program);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Create a simple model of a triangle.
    this.#triangle_model = new TraingleModel();
    this.#triangle_color = new Float32Array([1.0, 0.0, 0.0, 1.0]);

    // Create GPU buffer objects for the model
    this.#triangle_gpu = new ModelToGpu(this.#gl, this.#triangle_model, this.#out);

    // Initialize the pyramid model rendering variables
    this.#triangle = new SimpleModelRender(this.#gl, this.#program, this.#triangle_gpu, this.#out);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Setup of models to render the global axes
    this.#x_axis_gpu = new ModelArraysGPU(this.#gl, models.x_axis, this.#out);
    this.#y_axis_gpu = new ModelArraysGPU(this.#gl, models.y_axis, this.#out);
    this.#z_axis_gpu = new ModelArraysGPU(this.#gl, models.z_axis, this.#out);

    this.#x_axis = new RenderUniformColor(this.#gl, this.#program, this.#x_axis_gpu, this.#out);
    this.#y_axis = new RenderUniformColor(this.#gl, this.#program, this.#y_axis_gpu, this.#out);
    this.#z_axis = new RenderUniformColor(this.#gl, this.#program, this.#z_axis_gpu, this.#out);

    this.#x_axis_color = new Float32Array([1, 0, 0, 1]);  // red
    this.#y_axis_color = new Float32Array([0, 1, 0, 1]);  // green
    this.#z_axis_color = new Float32Array([0, 0, 1, 1]);  // blue

    // Set the scaling for the global axes.
    GlMatrix4x4.scale(this.#scale_axes, 0.1, 0.1, 0.1);

    // Set up callbacks for user and timer events
    this.#events = new TriangleEvents(id, this);
    this.#events.animate();
    this.tri = this.#triangle_model;
  }

  //-----------------------------------------------------------------------
  render() {

    // Build individual transforms
    GlMatrix4x4.rotate(this.#rotate_x_matrix, this.angle_x, 1, 0, 0);
    GlMatrix4x4.rotate(this.#rotate_y_matrix, this.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    GlMatrix4x4.multiplySeries(this.#transform, this.#projection, this.#camera, this.#rotate_x_matrix, this.#rotate_y_matrix);

    // Render the model
    this.#triangle.render(this.#transform, this.#triangle_color, this.draw_edges, this.wireframe);

    if (this.show_axes) {
      // Draw the axes
      GlMatrix4x4.multiplySeries(this.#transform, this.#transform, this.#scale_axes);
      this.#x_axis.render(this.#transform, this.#x_axis_color);
      this.#y_axis.render(this.#transform, this.#y_axis_color);
      this.#z_axis.render(this.#transform, this.#z_axis_color);
    }
  };

  //-----------------------------------------------------------------------
  delete() {

    // Clean up shader programs
    this.#gl.deleteShader(program.vShader);
    this.#gl.deleteShader(program.fShader);
    this.#gl.deleteProgram(program);

    // Delete each model's VOB
    this.#triangle.delete(gl);
    this.#x_axis.delete(gl);
    this.#y_axis.delete(gl);
    this.#z_axis.delete(gl);

    // Remove all event handlers
    this.#events.removeAllEventHandlers();

    // Disable any animation
    this.animate_active = false;
  }

}

window['TriangleScene'] = TriangleScene;
