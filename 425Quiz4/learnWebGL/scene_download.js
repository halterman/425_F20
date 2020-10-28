/**
 * scene_download.js, By Wayne Brown, Fall 2017
 *
 * A SceneDownload object will load and initialize all of the files needed
 * to create 3D graphics in a canvas window.
 *
 * There can be multiple 3D canvas renderings on a single web page, so
 * a SceneDownload object is specific to a canvas window. It is also specific
 * to an instance of a webgldemo directive in the runestone system.
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

class SceneDownload {
    //-----------------------------------------------------------------------
    // Private properties of a SceneDownload object
    #downloads_needed = 0;
    #number_retrieved = 0;
    #model_dictionary; // models
    #out = null;
    #scene_object = null;
    #id = 0;

  /** -----------------------------------------------------------------------
   * A SceneDownload object knows how to download required files for a webgl
   * program, get a valid webgl context, and build webgl programs from
   * shaders.
   *
   * @param id {string} The id of the webgldemo
   * @param canvas_id {string} The id of the canvas element to render to.
   * @param scene_object {string} The name of a function that will create and render a scene.
   * @param model_list {array} A list of models that will be rendered.
   * @param shader_list {array} A list of shader programs.
   * @param image_list {array} of strings (optional)
   * @constructor
   */
  constructor(id, canvas_id, scene_object, model_list, shader_list, image_list = null) {

    // let self = this;

    //-----------------------------------------------------------------------
    // Public properties of a SceneDownload object; they are public so a
    // WebglInteractive object can change them based on student edits.
    this.vshaders = {};
    this.fshaders = {};

    this.model_data_dictionary = {};  // text data from OBJ model files
    this.materials_data_dictionary = {}; // text data from MTL files
    this.materials_dictionary = {}; // materials_dictionary ['filename']['materialname']
    this.images = { number: 0 }; // images downloaded; key is file name

    this.scene = null;

    //-----------------------------------------------------------------------
    // Constructor for SceneDownload object

    // Publicly accessible data
    this.canvas_id = canvas_id;
    this.out = new ConsoleMessages(id);
    this.#out = this.out;

    this.#scene_object = scene_object;
    this.#id = id;

    // Download all of the external content
    this.#downloads_needed = shader_list.length + model_list.length;
    if (image_list) this.#downloads_needed += image_list.length;

    this._downloadAllShaders(shader_list);
    this._downloadAllModels(model_list);
    this._downloadAllImages(image_list);

  }

  /**----------------------------------------------------------------------
   * Given a new group of models derived from a data file, add them to
   * the model_dictionary. Individual models can be access by both numeric
   * indexes and model name, so each model is added to the model_dictionary
   * twice.
   * @param new_models
   * @private
   */
  _addModelsToModelDictionary(new_models) {
    let model_names, name;

    // Add them by index
    if (this.#model_dictionary.number_models === undefined) {
      this.#model_dictionary.number_models = 0;
    }
    for (let j = 0; j < new_models.number_models; j += 1) {
      this.#model_dictionary[this.#model_dictionary.number_models] = new_models[j];
      this.#model_dictionary.number_models += 1;
    }

    // Add them by name
    model_names = Object.keys(new_models);
    for (let j = 0; j < model_names.length; j += 1) {
      name = model_names[j];
      if (name !== 'number_models' && isNaN(parseInt(name, 10))) {
        this.#model_dictionary[name] = new_models[name];
      }
    }
  }

  /**----------------------------------------------------------------------
   * This function is called each time a file has been retrieved from the
   * server. After all files have been retrieved, it creates a rendering
   * object and renders the scene in the canvas.
   * @private
   */
  initializeRendering() {

    if (this.#number_retrieved >= this.#downloads_needed) {
      this.#out.displayInfo("All files have been retrieved! Starting rendering.");

      let model_names, name, more_models;

      // Build all of the models for rendering
      this.#model_dictionary = {};
      model_names = Object.keys(this.model_data_dictionary);
      for (let j = 0; j < model_names.length; j += 1) {
        name = model_names[j];
        if (this.model_data_dictionary[name].slice(0,3) === "ply") {
          more_models = CreateModelFromPLY(name, this.model_data_dictionary[name], this.#out);
        } else {
          more_models = CreateModelsFromOBJ(this.model_data_dictionary[name], this.materials_dictionary[name], this.#out);
        }
        this._addModelsToModelDictionary(more_models);
      }

      // Create a Scene object which does all the rendering and events
      if (this.images.number > 0) {
        this.scene = new window[this.#scene_object](this.#id, this, this.vshaders, this.fshaders,
                                              this.#model_dictionary, this.images);
      } else {
        this.scene = new window[this.#scene_object](this.#id, this, this.vshaders, this.fshaders,
                                              this.#model_dictionary);
      }
      this.scene.render();
    }
  }

  /**----------------------------------------------------------------------
   * Given a file name, parse it into its file path, root name, and file extension.
   * @param file_name A string containing a possibly fully qualified file name.
   * @returns Object The file path, root file name, and the file extension.
   * @private
   */
  parseFilename(file_name) {
    let dot_position, slash_position;
    let results = { path: "", filename: "", extension: ""};

    // Get the extension
    dot_position = file_name.lastIndexOf('.');
    if (dot_position > 0) {
      results.extension = file_name.substr(dot_position+1);
      results.filename = file_name.substr(0, dot_position);
    } else {
      results.extension = "";
      results.filename = file_name;
    }

    // Get the path
    slash_position = results.filename.lastIndexOf('/');
    if (slash_position > 0) {
      results.path = results.filename.substr(0,slash_position + 1);
      results.filename = results.filename.substr(slash_position + 1);
    } else {
      results.path = "";
    }

    return results;
  }

  /**----------------------------------------------------------------------
   * Get a shader from the server and save its text in the vshaders or fshaders
   * object. The shaders are stored and retrieved by property names. The
   * property names are taken from the root file name of the shader file.
   * @param shader_filename
   * @private
   */
  _downloadShader(shader_filename) {

    let self = this;
    $.get(shader_filename,
      function (data) {
        let file_extension, name, file_parts;

        self.#number_retrieved += 1;
        self.#out.displayInfo("Downloaded shader '" + shader_filename + "', "
          + self.#number_retrieved + " of " + self.#downloads_needed);

        file_parts = self.parseFilename(shader_filename);
        name = file_parts.filename;
        file_extension = file_parts.extension;

        if (file_extension === 'vert') {
          self.vshaders[name] = data;
        } else if (file_extension === 'frag') {
          self.fshaders[name] = data;
        } else {
          self.#out.displayError('Invalid shader file name extension: the name was ' + shader_filename);
        }
        self.initializeRendering();
      }
    );
  }

  /**----------------------------------------------------------------------
   * Given a list of shader file names, download all of them from the server.
   * @param shader_list
   * @private
   */
  _downloadAllShaders(shader_list) {
    for (let j = 0; j < shader_list.length; j += 1) {
      this._downloadShader(shader_list[j]);
    }
  }

  /**----------------------------------------------------------------------
   * Download a texture map image.
   * @param obj_filename {string} The full path and file name to the OBJ file.
   * @param material {ModelMaterial} A material description.
   * @param image_filename {string} The filename of a texture map image.
   * @param type {string} which field of the material (color_map, displacement_map, bump_map)
   * @private
   */
  _downloadTextureMapImage(obj_filename, material, image_filename, type) {
    let file_parts, path_to_obj, filename, new_image;

    // Use the path to the model file to get the location of the texturemap file.
    file_parts = this.parseFilename(obj_filename);
    path_to_obj = file_parts.path;
    filename = path_to_obj + image_filename;

    this.#downloads_needed += 1;

    new_image = new Image();
    new_image.src = filename;
    new_image.onload =
      function () {
        this.#number_retrieved += 1;
        this.#out.displayInfo("Downloaded texture map image '" + image_filename
          + "' for OBJ model " + obj_filename + "', " + this.#number_retrieved + " of "
          + this.#downloads_needed);

        material[type] = new_image;

        this.initializeRendering();
      };
  }

  /**----------------------------------------------------------------------
   * The surface material properties of a model are stored in separate
   * files with a .mtl file extension.
   * @param obj_filename String The name of the .obj model file
   * @param mtl_filename String The name of a .mtl material file
   * @private
   */
  _downloadMaterialsFile(obj_filename, mtl_filename) {
    let myget, file_parts, path_to_obj;
    let materials, material_names, name;

    // Use the path to the model file to get the materials file.
    file_parts = this.parseFilename(obj_filename);
    path_to_obj = file_parts.path;
    mtl_filename = path_to_obj + mtl_filename;

    let self = this;

    myget = $.get(mtl_filename,
      function (data) {
        self.#number_retrieved += 1;
        self.#out.displayInfo("Downloaded materials file '" + mtl_filename + "', "
          + self.#number_retrieved + " of " + self.#downloads_needed);

        // Save the text data so it can be changed interactively by students
        self.materials_data_dictionary[file_parts.filename] = data;

        // Process the materials data and store it for the associated OBJ model
        materials = {};
        CreateObjModelMaterials(data, materials);
        self.materials_dictionary[file_parts.filename] = materials;

        // If any of the materials reference texture map images, download the images
        material_names = Object.keys(materials);
        for (let j = 0; j < material_names.length; j += 1) {
          name = material_names[j];
          if (materials[name].color_map) {
            _downloadTextureMapImage(obj_filename, materials[name], materials[name].color_map, "color_map");
          }
          if (materials[name].displacement_map) {
            _downloadTextureMapImage(obj_filename, materials[name], materials[name].displacement_map, "displacement_map");
          }
          if (materials[name].bump_map) {
            _downloadTextureMapImage(obj_filename, materials[name], materials[name].bump_map, "bump_map");
          }
        }

        self.initializeRendering();
      }
    );
    myget.fail(
      function () {
        self.#out.displayInfo("Getting the materials file '" + mtl_filename + "' failed.");
      }
    );
  }

  /**----------------------------------------------------------------------
   * Download an OBJ model data file from the server.
   * @param obj_filename String The name of the *.obj model file
   * @private
   */
  _downloadModel(obj_filename) {

    let self = this;

    $.get(obj_filename,
      function (data) {
        let file, file_name, file_extension, material_filename_list;

        self.#number_retrieved += 1;
        self.#out.displayInfo("Downloaded model '" + obj_filename + "', "
          + self.#number_retrieved + " of " + self.#downloads_needed);

        file = self.parseFilename(obj_filename);
        file_name = file.filename;
        file_extension = file.extension;

        // Remember the data in a dictionary. The key is the file name with
        // the file extension removed.
        self.model_data_dictionary[file_name] = data;

        if (file_extension === "obj") {
          material_filename_list = GetMaterialFileNamesFromOBJ(data, self.#out);

          // Now get all of the material files and increase the number of
          // files that are needed before execution can begin.
          self.#downloads_needed += material_filename_list.length;

          for (let j = 0; j < material_filename_list.length; j += 1) {
            self.#out.displayInfo('Adding download of material file: ' + material_filename_list[j]);
            self._downloadMaterialsFile(obj_filename, material_filename_list[j]);
          }
        }

        self.initializeRendering();
      }
    );
  }

  /**----------------------------------------------------------------------
   * Given a list of OBJ model data files, download all of the models.
   * @param model_list
   * @private
   */
  _downloadAllModels(model_list) {
    for (let j = 0; j < model_list.length; j += 1) {
      this._downloadModel(model_list[j]);
    }
  }

  /**----------------------------------------------------------------------
   * Download an image.
   * @param image_filename {string} The filename of a image file.
   * @private
   */
  _downloadImage(image_filename) {
    let file_parts, key_name, new_image;

    // Use the path to the model file to get the location of the texturemap file.
    file_parts = this.parseFilename(image_filename);
    key_name = file_parts.filename;

    new_image = new Image();
    new_image.src = image_filename;
    new_image.onload =
      function () {
        this.#number_retrieved += 1;
        this.#out.displayInfo("Downloaded image '" + image_filename
          + "', " + this.#number_retrieved + " of "
          + this.#downloads_needed);

        this.images[key_name] = new_image;
        this.images.number += 1;

        this.initializeRendering();
      };
  }

  /**----------------------------------------------------------------------
   * Given a list of OBJ model data files, download all of the models.
   * @param image_list {array} of strings; names of image files
   * @private
   */
   _downloadAllImages(image_list) {
    if (image_list) {
      for (let j = 0; j < image_list.length; j += 1) {
        _downloadImage(image_list[j]);
      }
    }
  }

  /**----------------------------------------------------------------------
   * Get a canvas element given its unique id.
   * @param canvas_id The HTML id of the canvas to render to.
   * @return The matching canvas element
   */
  getCanvas(canvas_id) {
    let canvas;

    canvas = document.getElementById(canvas_id);
    if (!canvas || canvas.nodeName !== "CANVAS") {
      this.#out.displayError('Fatal error: Canvas "' + canvas_id + '" could not be found');
    } else {
      // Always set the canvas 2D environment to the size of the window
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    return canvas;
  }

  /**----------------------------------------------------------------------
   * Get a WebGL context from a canvas
   * @param canvas {canvas} The DOM element that represents the canvas.
   * @param options {object} one or more options to set in the WebGL environment.
   * @return The WebGL context for the canvas.
   */
  getWebglContext(canvas, options = {}) {
    let context;

    // The option "preserveDrawingBuffer : true" turns off the automatic clearing
    // of the frame buffer.
    context = canvas.getContext('webgl', options );
    if (!context) {
      this.#out.displayError("No WebGL context could be found.");
    }

    return context;
  }

  /** ---------------------------------------------------------------------
   * Create and compile an individual shader.
   * @param gl {WebGLRenderingContext} The WebGL context.
   * @param type {Number} The type of shader, either
   *             gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param source {String} The code/text of the shader
   * @returns {WebGLShader} A WebGL shader program object.
   */
  createAndCompileShader(gl, type, source) {
    let typeName;
    switch (type) {
      case gl.VERTEX_SHADER:
        typeName = "Vertex Shader";
        break;
      case gl.FRAGMENT_SHADER:
        typeName = "Fragment Shader";
        break;
      default:
        this.#out.displayError("Invalid type of shader in createAndCompileShader()");
        return null;
    }

    // Create shader object
    let shader = gl.createShader(type);
    if (!shader) {
      this.#out.displayError("Fatal error: gl could not create a shader object.");
      return null;
    }

    // Put the source code into the gl shader object
    gl.shaderSource(shader, source);

    // Compile the shader code
    gl.compileShader(shader);

    // Check for any compiler errors
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // There are errors, so display them
      let errors = gl.getShaderInfoLog(shader);
      this.#out.displayError('Failed to compile ' + typeName
                       + ' with these errors:\n' + errors);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /** ---------------------------------------------------------------------
   * Given two shader programs, create a complete rendering program.
   * @param gl {WebGLRenderingContext} The WebGL context.
   * @param vertexShaderCode {String} Code for a vertex shader.
   * @param fragmentShaderCode {String} Code for a fragment shader.
   * @returns WebGLProgram {WebGLProgram} A WebGL shader program object.
   */
  createProgram(gl, vertexShaderCode, fragmentShaderCode) {
    // Create the 2 required shaders
    let vertexShader = this.createAndCompileShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
    let fragmentShader = this.createAndCompileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    // Create a WebGLProgram object
    let program = gl.createProgram();
    if (!program) {
      this.#out.displayError('Fatal error: Failed to create a program object');
      return null;
    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the WebGLProgram object
    gl.linkProgram(program);

    // Check for success
    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      // There were errors, so get the errors and display them.
      let error = gl.getProgramInfoLog(program);
      this.#out.displayError('Fatal error: Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }

    // Remember the shaders. This allows for them to be cleanly deleted.
    program.vShader = vertexShader;
    program.fShader = fragmentShader;

    return program;
  }


}
