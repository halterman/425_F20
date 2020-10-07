/**
 * models_arrays_gpu.js, By Wayne Brown, Fall 2017
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

/**------------------------------------------------------------------------
 * Copy arrays that define a model to the GPU.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param model_arrays {ModelArrays} array data for a model
 * @param out - an object that can display messages to the web page
 * @constructor
 */
class ModelArraysGPU {

  constructor(gl, model_arrays, out) {
    //let self = this;

    this.gl = gl;

    this.points = null;  // {GpuPointsData} if the model contains points
    this.lines = null;  // {GpuLinesData} if the model contains lines
    this.triangles = null;  // {GpuTrianglesData} if the model contains triangles
    this.wireframe = null;  // {Float32Array} if the model has a wireframe definition
    this.raw_data = model_arrays;  // {ModelArrays} the original data for this model

    let color_components;
    //-----------------------------------------------------------------------
    // Constructor

    if (model_arrays.rgba) {
      color_components = 4;
    } else {
      color_components = 3;
    }

    // Build the buffers for the points
    if (model_arrays.points !== null && model_arrays.points.vertices.length > 0) {
      this.points = new GpuPointsData();
      this.points.number = model_arrays.points.vertices.length / 3;
      this.points.vertices = _createBufferObject(model_arrays.points.vertices, 3);
      this.points.colors = _createBufferObject(model_arrays.points.vertices, color_components);
      this.points.material = model_arrays.points.material;
    }

    // Build the buffers for the lines
    if (model_arrays.lines !== null && model_arrays.lines.vertices.length > 0) {
      this.lines = new GpuLinesData();

      this.lines.number = model_arrays.lines.vertices.length / 3 / 2;
      this.lines.vertices = this._createBufferObject(model_arrays.lines.vertices, 3);
      this.lines.colors = this._createBufferObject(model_arrays.lines.colors, color_components);
      this.lines.textures = this._createBufferObject(model_arrays.lines.textures, 2);
      this.lines.material = model_arrays.lines.material;
    }

    // Build the buffers for the triangles
    if (model_arrays.triangles !== null && model_arrays.triangles.vertices.length > 0) {
      this.triangles = new GpuTrianglesData();

      this.triangles.number = model_arrays.triangles.vertices.length / 3 / 3;
      this.triangles.vertices = this._createBufferObject(model_arrays.triangles.vertices, 3);
      this.triangles.colors = this._createBufferObject(model_arrays.triangles.colors, color_components);
      this.triangles.flat_normals = this._createBufferObject(model_arrays.triangles.flat_normals, 3);
      this.triangles.smooth_normals = this._createBufferObject(model_arrays.triangles.smooth_normals, 3);
      this.triangles.textures = this._createBufferObject(model_arrays.triangles.textures, 2);
      this.triangles.material = model_arrays.triangles.material;
    }

    if (model_arrays.wireframe !== null && model_arrays.wireframe.vertices.length > 0) {
      this.wireframe = new GpuWireframeData();

      this.wireframe.number = model_arrays.wireframe.vertices.length / 3;
      this.wireframe.vertices = this._createBufferObject(model_arrays.wireframe.vertices, 3);
    }
  }



  /**----------------------------------------------------------------------
   * Remove the Buffer Objects used by this model on the GPU
   */
  delete() {
    if (this.points !== null && this.points.number > 0) {
      if (this.points.vertices) this.gl.deleteBuffer(this.points.vertices.id);
      if (this.points.colors) this.gl.deleteBuffer(this.points.colors.id);
    }
    if (this.lines !== null && this.lines.number > 0) {
      if (this.lines.vertices) this.gl.deleteBuffer(this.lines.vertices.id);
      if (this.lines.colors) this.gl.deleteBuffer(this.lines.colors.id);
      if (thithis.lines.textures) this.gl.deleteBuffer(this.lines.textures.id);
    }
    if (this.triangles !== null && this.triangles.number > 0) {
      if (this.triangles.vertices) this.gl.deleteBuffer(this.triangles.vertices.id);
      if (this.triangles.colors) this.gl.deleteBuffer(this.triangles.colors.id);
      if (this.triangles.flat_normals) this.gl.deleteBuffer(this.triangles.flat_normals.id);
      if (this.triangles.smooth_normals) this.gl.deleteBuffer(this.triangles.smooth_normals.id);
      if (this.triangles.textures) this.gl.deleteBuffer(this.triangles.textures.id);
    }
    if (this.wireframe !== null && this.wireframe.number > 0) {
      if (this.wireframe.vertices) this.gl.deleteBuffer(this.wireframe.vertices.id);
    }
  }


/**----------------------------------------------------------------------
   * Create a GPU buffer object and transfer data into the buffer.
   * @param data {Float32Array} the array of data to be put into the buffer object.
   * @param components_per_vertex {number}
   * @private
   */
_createBufferObject(data, components_per_vertex) {
  let buffer_id, buffer_info;

  // Don't create a gpu buffer object if there is no data.
  if (data === null) return null;

  // Create a buffer object
  buffer_id = this.gl.createBuffer();
  if (!buffer_id) {
    out.displayError('Failed to create the buffer object for ' + model_arrays.name);
    return null;
  }

  // Make the buffer object the active buffer.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_id);

  // Upload the data for this buffer object to the GPU.
  this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

  buffer_info = new ObjectBufferInfo();
    buffer_info.id = buffer_id;
    buffer_info.number_values = data.length;
    buffer_info.components_per_vertex = components_per_vertex;

    return buffer_info;
  }

}