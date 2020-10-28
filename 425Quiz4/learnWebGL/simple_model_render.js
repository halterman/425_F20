/**
 * simple_model_render.js, By Wayne Brown, Fall 2017
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

class SimpleModelRender {
  // Shader variable locations
  #a_Vertex_location = null;
  #u_Color_location = null;
  #u_Transform_location = null;

  #edge_color = new Float32Array( [0.0, 0.0, 0.0, 1.0]); // BLACK

  #gl = null;
  #model = null;

/**------------------------------------------------------------------------
 * Given a model description, create the buffer objects needed to render
 * the model. This is very closely tied to the shader implementations.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {object} The shader program that will render the model.
 * @param model {ModelToGpu} The model GPU object buffer info.
 * @param out {ConsoleMessages} Can display messages to the web page.
 * @constructor
 */
  constructor(gl, program, model, out) {

    // let self = this;
    //-----------------------------------------------------------------------
    // Constructor: Get the location of the shader variables
    this.#u_Color_location     = gl.getUniformLocation(program, 'u_Color');
    this.#u_Transform_location = gl.getUniformLocation(program, 'u_Transform');
    this.#a_Vertex_location    = gl.getAttribLocation(program,  'a_Vertex');

    this.#gl = gl;
    this.#model = model;
  }



  /**----------------------------------------------------------------------
   * Delete the Buffer Objects associated with this model.
   * @param gl {WebGLRenderingContext} WebGL context
   */
  delete(gl) {
    if (this.#model.number_triangles > 0) {
      gl.deleteBuffer(this.#model.triangles_vertex_buffer_id);
    }
  }

  /**----------------------------------------------------------------------
   * Render the model.
   * @param transform {Float32Array} The transformation to apply to the model vertices.
   * @param model_color {Float32Array} The color of the model faces; RGBA
   * @param draw_edges {boolean} If true, render the edges of the triangles.
   * @param wireframe {boolean} If true, render the edges of the triangles.
   *
   */
  render(transform, model_color, draw_edges, wireframe) {
    let j, start;

    // Set the transform for all the triangle vertices
    this.#gl.uniformMatrix4fv(this.#u_Transform_location, false, transform);

    // Activate the model's vertex Buffer Object
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.triangles_vertex_buffer_id);

    // Bind the vertices Buffer Object to the 'a_Vertex' shader variable
    this.#gl.vertexAttribPointer(this.#a_Vertex_location, 3, this.#gl.FLOAT, false, 0, 0);
    this.#gl.enableVertexAttribArray(this.#a_Vertex_location);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // 1. Render the triangles:

    if (!wireframe) {
      // Set the color for all of the triangle faces
      this.#gl.uniform4fv(this.#u_Color_location, model_color);

      // Draw all of the triangles
      this.#gl.drawArrays(this.#gl.TRIANGLES, 0, this.#model.number_triangles * 3);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // 2. Render the edges around each triangle:

    if (wireframe || draw_edges) {
      // Set the color for all of the edges
      this.#gl.uniform4fv(this.#u_Color_location, this.#edge_color);

      // Draw a line_loop around each of the triangles
      for (j = 0, start = 0; j < this.#model.number_triangles; j += 1, start += 3) {
        this.#gl.drawArrays(this.#gl.LINE_LOOP, start, 3);
      }
    }

  }

}