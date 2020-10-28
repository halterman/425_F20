/**
 * models_definitions.js, By Wayne Brown, Fall 2017
 *
 * These definitions are designed for rendering model data while optimizing
 * speed. For a single model, points, lines, and triangles are stored in
 * single arrays with the goal of rendering them using a single call
 * to gl.drawArrays().
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
 * The definition of a material surface Object.
 * @param {string} material_name
 * @constructor
 */
class ModelMaterial {
  constructor(material_name) {
    //let self = this;
    this.name = material_name; // {string}
    this.index = -1;   // {number} matches a material to an array index.
    this.Ns = null;    // {number} the specular exponent for the current material
    this.Ka = null;    // {Float32Array} the ambient reflectivity using RGB values
    this.Kd = null;    // {Float32Array} the diffuse reflectivity using RGB values
    this.Ks = null;    // {Float32Array} the specular reflectivity using RGB values
    this.Ni = null;    // {number} the optical density for the surface; index of refraction
    this.d = null;     // {number} the dissolve for the current material; transparency
    this.illum = null; // {number} illumination model code
    this.color_map = null;        // {string/img} filename, then image
    this.displacement_map = null; // {string/img} filename, then image
    this.bump_map = null;         // {string/img} filename, then image
  }
}

/**------------------------------------------------------------------------
 * Defines a set of points, suitable for rendering using gl.POINTS mode.
 * @constructor
 */
class PointsData {
  constructor() {
    // let self = this;
    this.vertices = null; // {Float32Array} 3 components per vertex (x,y,z)
    this.colors = null; // {Float32Array} 3 or 4 components per vertex RGB or RGBA
    this.material = null; // {ModelMaterial}
  }
}

/**------------------------------------------------------------------------
 * Defines a set of lines, suitable for rendering using gl.LINES mode.
 * @constructor
 */
class LinesData {

  constructor() {
    // let self = this;
    this.vertices = null; // {Float32Array} 3 components per vertex (x,y,z)
    this.colors = null; // {Float32Array} 3 or 4 components per vertex RGB or RGBA
    this.textures = null; // {Float32Array} 1 component per vertex
    this.material = null; // {ModelMaterial}
  }
}

/**------------------------------------------------------------------------
 * Defines a set of triangles, suitable for rendering using gl.TRIANGLES mode.
 * @constructor
 */
class TrianglesData {
  constructor() {
    // let self = this;
    this.number = 0;    // {number} the number of triangles
    this.vertices = null; // {Float32Array} 3 components per vertex (x,y,z)
    this.colors = null; // {Float32Array} 3 or 4 components per vertex RGB or RGBA
    this.flat_normals = null; // {Float32Array} 3 components per vertex <dx,dy,dz>
    this.smooth_normals = null; // {Float32Array} 3 components per vertex <dx,dy,dz>
    this.textures = null; // {Float32Array} 2 components per vertex (s,t)
    this.material = null; // {ModelMaterial}
  }
}

/**------------------------------------------------------------------------
 * Defines a set of triangle edges, suitable for rendering using gl.LINES mode.
 * @constructor
 */
class WireframeData {
  constructor() {
    // let self = this;
    this.vertices = null; // {Float32Array} 3 components per vertex (x,y,z)
  }
}

/**------------------------------------------------------------------------
 * Defines one model. A model can contain points, lines, and triangles.
 * @constructor
 */
class ModelArrays {
  constructor(name) {
    // let self = this;
    this.name = name;  // {string} The name of this model
    this.points = null;  // {PointsData} if the model contains points
    this.lines = null;  // {LinesData} if the model contains lines
    this.triangles = null;  // {TrianglesData} if the model contains triangles
    this.wireframe = null;  // {WireframeData} if the model has a wireframe definition
    this.rgba = false; // {boolean} if true, the colors arrays holds 4 components per color
  }
}

//=========================================================================
// Track GPU object buffers for a model.
//=========================================================================

/**------------------------------------------------------------------------
 * Description of a GPU object-buffer
 * @constructor
 */
class ObjectBufferInfo {
  constructor() {
    // let self = this;
    this.id = 0; // Vertex-object-buffer id
    this.number_values = 0; // Number of floats in the object-buffer
    this.components_per_vertex = 0; // Number of values per vertex
  }
}

/**------------------------------------------------------------------------
 * GPU object-buffers for points, suitable for rendering using gl.POINTS mode.
 * @constructor
 */
class GpuPointsData {
  constructor() {
    // let self = this;
    this.number = 0;
    this.vertices = null; // {ObjectBufferInfo}
    this.colors = null; // {ObjectBufferInfo}
    this.material = null; // {ModelMaterial}
  }
}

/**------------------------------------------------------------------------
 * GPU object-buffers for lines, suitable for rendering using gl.LINES mode.
 * @constructor
 */
class GpuLinesData {
  constructor() {
    // let self = this;
    this.number = 0;
    this.vertices = null; // {ObjectBufferInfo}
    this.colors = null; // {ObjectBufferInfo}
    this.textures = null; // {ObjectBufferInfo}
    this.material = null; // {ModelMaterial}
  }
}

/**------------------------------------------------------------------------
 * GPU object-buffers for triangles, suitable for rendering using gl.TRIANGLES mode.
 * @constructor
 */
class GpuTrianglesData {
  constructor() {
    // let self = this;
    this.number = 0;
    this.vertices = null; // {ObjectBufferInfo}
    this.colors = null; // {ObjectBufferInfo}
    this.flat_normals = null; // {ObjectBufferInfo}
    this.smooth_normals = null; // {ObjectBufferInfo} 3 components per vertex <dx,dy,dz>
    this.textures = null; // {ObjectBufferInfo} 2 components per vertex (s,t)
    this.material = null; // {ModelMaterial}
  }
}

/**------------------------------------------------------------------------
 * GPU object-buffers for triangles, suitable for rendering using gl.TRIANGLES mode.
 * @constructor
 */
class GpuWireframeData {
  constructor() {
    // let self = this;
    this.number = 0;
    this.vertices = null; // {ObjectBufferInfo}
  }
}


