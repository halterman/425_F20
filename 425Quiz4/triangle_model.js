/**
 * simple_model.js, By Wayne Brown, Fall 2017
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

/**------------------------------------------------------------------------
 * A simple triangle composed of 3 vertices.
 * @param vertices {array} An array of 3 vertices.
 * @constructor
  */
class Triangle {
  constructor(vertices) {
    this.vertices = vertices;
  }
}

/**------------------------------------------------------------------------
 * A simple model composed of an array of triangles.
 * @param name {string} The name of the model.
 * @constructor
 */
class SimpleModel {

  constructor(name) {
    this.name = name;
    this.triangles = [];
  }
}

/**------------------------------------------------------------------------
 * Create a Simple_model of 1 triangle
 * @return SimpleModel
 */
class TraingleModel {

  constructor() {
    let vertices, triangle;

    // Vertex data
    vertices = [[0.2, 0.2, 0.15], [0.7, 0.3, 0.1], [0.7, 0.35, 0.6]];

    // Create a triangle
    triangle = new Triangle([vertices[0], vertices[1], vertices[2]]);

    // Create a model that is composed of a triangle
    let model = new SimpleModel("simple");
    model.triangles = [triangle];

    return model;
  }

  transform(matrix) {
    for (let v in this.triangles[0]) {
      console.log('(' + v[0] + ',' + v[1] + ',' + v[2]);
    }
  }
}
