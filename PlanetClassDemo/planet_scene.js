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
class PlanetScene {
  //Private properties
  #out = null;
  #gl = null; 
  #program = null; 
  #transform = null;
  #camera = null;
  #projection = null;
  #rotate_x_matrix = null;
  #rotate_y_matrix = null;
  // #rotate_z_matrix = null;
  #scale_axes = null;

  #planet_gpu = null;
  #planet = null;
  #planet_color = null;

  #ring_gpu = null;
  #ring = null;
  #ring_color = null;

  #moon1_gpu = null;
  #moon1 = null;
  #moon1_color = null;

  #moon2_gpu = null;
  #moon2 = null;
  #moon2_color = null;

  #events = null;

  constructor(id, download, vshaders_dictionary, fshaders_dictionary, models) {

    // Private variables
    this.#out = download.out;
    // let matrix = new GlMatrix4x4();
    this.#transform = GlMatrix4x4.create();
    this.#camera = GlMatrix4x4.create();
    this.#rotate_x_matrix = GlMatrix4x4.create();
    this.#rotate_y_matrix = GlMatrix4x4.create();
    // this.#rotate_z_matrix = GlMatrix4x4.create();
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
    // Setup of models to render 
    this.#planet_gpu = new ModelArraysGPU(this.#gl, models.planet, this.#out);
    this.#planet = new RenderUniformColor(this.#gl, this.#program, this.#planet_gpu, this.#out);
    this.#planet_color = new Float32Array([0, 0, 1, 1]);  // blue

    this.#ring_gpu = new ModelArraysGPU(this.#gl, models.ring, this.#out);
    this.#ring = new RenderUniformColor(this.#gl, this.#program, this.#ring_gpu, this.#out);
    this.#ring_color = new Float32Array([1, 0, 0, 1]);  // red

    this.#moon1_gpu = new ModelArraysGPU(this.#gl, models.moon1, this.#out);
    this.#moon1 = new RenderUniformColor(this.#gl, this.#program, this.#moon1_gpu, this.#out);
    this.#moon1_color = new Float32Array([115/255, 224/255, 11/255, 1]);  // greenish

    this.#moon2_gpu = new ModelArraysGPU(this.#gl, models.moon2, this.#out);
    this.#moon2 = new RenderUniformColor(this.#gl, this.#program, this.#moon2_gpu, this.#out);
    this.#moon2_color = new Float32Array([224/255, 143/255, 11/255, 1]);  // tanish


    // Set the scaling for the global axes.
    GlMatrix4x4.scale(this.#scale_axes, 0.1, 0.1, 0.1);

    // Set up callbacks for user and timer events
    this.#events = new PlanetEvents(id, this);
    this.#events.animate();
  }

  //-----------------------------------------------------------------------
  render() {

    // Build individual transforms
    GlMatrix4x4.rotate(this.#rotate_x_matrix, this.angle_x, 1, 0, 0);
    GlMatrix4x4.rotate(this.#rotate_y_matrix, this.angle_y, 0, 1, 0);
    // GlMatrix4x4.rotate(this.#rotate_z_matrix, this.angle_y, 0, 0, 1);

    // Combine the transforms into a single transformation
    GlMatrix4x4.multiplySeries(this.#transform, this.#projection, this.#camera, this.#rotate_x_matrix, this.#rotate_y_matrix);

    // Render the model
    // this.#pyramid.render(this.#transform, this.#pyramid_color, this.draw_edges, this.wireframe);

    if (this.show_axes) {
      // Draw the axes
      GlMatrix4x4.multiplySeries(this.#transform, this.#transform, this.#scale_axes);
      this.#planet.render(this.#transform, this.#planet_color);
      this.#ring.render(this.#transform, this.#ring_color);
      this.#moon1.render(this.#transform, this.#moon1_color);
      this.#moon2.render(this.#transform, this.#moon2_color);
    }
  };

  //-----------------------------------------------------------------------
  delete() {

    // Clean up shader programs
    this.#gl.deleteShader(program.vShader);
    this.#gl.deleteShader(program.fShader);
    this.#gl.deleteProgram(program);

    // Delete each model's VOB
    this.#planet.delete(gl);
    this.#ring.delete(gl);
    this.#moon1.delete(gl);
    this.#moon2.delete(gl);

    // Remove all event handlers
    this.#events.removeAllEventHandlers();

    // Disable any animation
    this.animate_active = false;
  }

}

window['PlanetScene'] = PlanetScene;
