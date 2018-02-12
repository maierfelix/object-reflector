(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ObjectReflector = factory());
}(this, (function () { 'use strict';

var PREFIX = "__$";

/**
 * Main class
 * @class ObjectReflector
 */
var ObjectReflector = function ObjectReflector(opts) {
  if ( opts === void 0 ) opts = {};

  this.object = null;
  this.children = [];
  this.properties = [];
  this.processOptions(opts);
};

/**
 * Process the passed in options
 * Options:
 * - object: The target parent object
 * - *properties: The properties to link children to
 * - *enableChildReflection: Allows linked children to change their parent's linked properties
 * @param {Object} opts
 */
ObjectReflector.prototype.processOptions = function(opts) {
  if (!opts.hasOwnProperty("object")) {
    throw new Error("Expected target object but got nothing");
  }
  if (opts.object === null) {
    throw new Error("Invalid type for object definition! Expect Object but got null");
  }
  if (typeof opts.object !== "object") {
    throw new Error(("Invalid type for object definition! Expect Object but got " + (typeof object)));
  }
  this.object = opts.object;
  this.enableChildReflection = opts.enableChildReflection;
  if (opts.hasOwnProperty("properties")) { this.linkProperties(opts.properties); }
};

/**
 * Attaches the given properties to the parent object
 * @param {Array} properties - The properties to link
 * @return {ObjectReflector}
 */
ObjectReflector.prototype.linkProperties = function(properties) {
  if (!Array.isArray(properties)) {
    throw new Error(("Invalid type for property definitions! Expected Array but got " + (typeof properties)));
  }
  this.properties = properties;
  if (this.properties.length) { this.createObjectPropertyLinks(this.object); }
  return this;
};

/**
 * Clears everything
 * @public
 */
ObjectReflector.prototype.clear = function() {
  // clear child reflections
  if (this.enableChildReflection) { this.clearChildReflections(); }
  // clear parent reflections
  this.clearParentReflection();
  this.children = [];
};

/**
 * Clears the parent reflection
 */
ObjectReflector.prototype.clearParentReflection = function() {
  var this$1 = this;

  var object = this.object;
  var properties = this.properties;
  for (var ii = 0; ii < properties.length; ++ii) {
    var property = properties[ii];
    this$1.clearReflectedObjectProperty(object, property, true);
    this$1.clearReflectedObjectProperty(object, PREFIX + property, false);
  }
};

/**
 * Clears all reflected children
 */
ObjectReflector.prototype.clearChildReflections = function() {
  var this$1 = this;

  var children = this.children;
  for (var ii = 0; ii < children.length; ++ii) {
    var child = children[ii];
    this$1.unreflectChild(child);
  }
};

/**
 * Deletes the reflection properties of an reflected object
 * @param {Object} object - The object to unreflect
 * @param {String} property - The property to unreflect 
 * @param {Boolean} backup - Backup and restore the original value afterwards
 */
ObjectReflector.prototype.clearReflectedObjectProperty = function(object, property, backup) {
  if ( backup === void 0 ) backup = false;

  var original = object[property];
  if (object.hasOwnProperty(property)) {
    Reflect.deleteProperty(object, property);
  }
  if (backup) { object[property] = original; }
};

/**
 * @param {Object} child - The target child to unreflect
 * @public
 */
ObjectReflector.prototype.unreflectChild = function(child) {
  var this$1 = this;

  var properties = this.properties;
  for (var ii = 0; ii < properties.length; ++ii) {
    var property = properties[ii];
    this$1.clearReflectedObjectProperty(child, property, true);
  }
  var index = this.getChildIndexByChild(child);
  if (index > -1) { this.children.splice(index, 1); }
};

/**
 * Let the user create a link from object A to object B
 * @param {Object} child - The child to link
 * @public
 */
ObjectReflector.prototype.createReflection = function(child) {
  if (!this.isChildRegistered(child)) {
    this.registerChild(child);
    this.synchronizeChildState(child);
    if (this.enableChildReflection) { this.createChildReflection(child); }
  }
};

/**
 * Creates reflection property links on a child
 * @param {Object} child - The child to reflect
 */
ObjectReflector.prototype.createChildReflection = function(child) {
  var parent = this.object;
  var properties = this.properties;
  var loop = function ( ii ) {
    var property = properties[ii];
    Object.defineProperty(child, property, {
      enumerable: false,
      configurable: true,
      get: function () { return parent[property]; },
      set: function (value) { return parent[PREFIX + property] = value; }
    });
  };

  for (var ii = 0; ii < properties.length; ++ii) loop( ii );
};

/**
 * Enables linking of the parent object's given properties
 * @param {Object} parent - The parent object to link
 */
ObjectReflector.prototype.createObjectPropertyLinks = function(parent) {
  var this$1 = this;

  var properties = this.properties;
  var loop = function ( ii ) {
    var property = properties[ii];
    Object.defineProperty(parent, PREFIX + property, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: parent[property]
    });
    Object.defineProperty(parent, property, {
      get: function () { return parent[PREFIX + property]; },
      set: function (value) { return this$1.updateLinkedChildrenPropertyValues(property, value); }
    });
  };

  for (var ii = 0; ii < properties.length; ++ii) loop( ii );
};

/**
 * Registers a child object into the linker
 * @param {Object} child - The child to register
 */
ObjectReflector.prototype.registerChild = function(child) {
  this.children.push(child);
};

/**
 * Checks if a child is already registered into the linker
 * @param {Object} child - The child to check
 * @return {Boolean}
 */
ObjectReflector.prototype.isChildRegistered = function(child) {
  return this.getChildIndexByChild(child) > -1;
};

/**
 * Tries to fetch a child from the registered childrens
 * @param {Object} target - The target child to search for
 * @return {Number} The target child's index
 */
ObjectReflector.prototype.getChildIndexByChild = function(target) {
  var children = this.children;
  for (var ii = 0; ii < children.length; ++ii) {
    var child = children[ii];
    if (child === target) { return ii; }
  }
  return -1;
};

/**
 * Synchronizes the child's state with the parent's state
 * @param {Object} child - The target child
 */
ObjectReflector.prototype.synchronizeChildState = function(child) {
  var parent = this.object;
  var properties = this.properties;
  for (var ii = 0; ii < properties.length; ++ii) {
    var property = properties[ii];
    child[property] = parent[property];
  }
};

/**
 * Updates the linked property values of all children
 * @param {String} property - The property to update
 * @param {*} value - The value to update with
 * @return {*} The updated value
 */
ObjectReflector.prototype.updateLinkedChildrenPropertyValues = function(property, value) {
  this.object[PREFIX + property] = value;
  var children = this.children;
  for (var ii = 0; ii < children.length; ++ii) {
    var child = children[ii];
    child[property] = value;
  }
  return value;
};

return ObjectReflector;

})));
