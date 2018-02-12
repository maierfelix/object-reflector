const PREFIX = `__$`;

/**
 * Main class
 * @class ObjectReflector
 */
class ObjectReflector {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.object = null;
    this.children = [];
    this.properties = [];
    this.processOptions(opts);
  }
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
    throw new Error(`Expected target object but got nothing`);
  }
  if (opts.object === null) {
    throw new Error(`Invalid type for object definition! Expect Object but got null`);
  }
  if (typeof opts.object !== "object") {
    throw new Error(`Invalid type for object definition! Expect Object but got ${typeof object}`);
  }
  this.object = opts.object;
  this.enableChildReflection = opts.enableChildReflection;
  if (opts.hasOwnProperty("properties")) this.linkProperties(opts.properties);
};

/**
 * Attaches the given properties to the parent object
 * @param {Array} properties - The properties to link
 * @return {ObjectReflector}
 */
ObjectReflector.prototype.linkProperties = function(properties) {
  if (!Array.isArray(properties)) {
    throw new Error(`Invalid type for property definitions! Expected Array but got ${typeof properties}`);
  }
  this.properties = properties;
  if (this.properties.length) this.createObjectPropertyLinks(this.object);
  return this;
};

/**
 * Clears everything
 * @public
 */
ObjectReflector.prototype.clear = function() {
  // clear child reflections
  if (this.enableChildReflection) this.clearChildReflections();
  // clear parent reflections
  this.clearParentReflection();
  this.children = [];
};

/**
 * Clears the parent reflection
 */
ObjectReflector.prototype.clearParentReflection = function() {
  let object = this.object;
  let properties = this.properties;
  for (let ii = 0; ii < properties.length; ++ii) {
    let property = properties[ii];
    this.clearReflectedObjectProperty(object, property, true);
    this.clearReflectedObjectProperty(object, PREFIX + property, false);
  };
};

/**
 * Clears all reflected children
 */
ObjectReflector.prototype.clearChildReflections = function() {
  let children = this.children;
  let properties = this.properties;
  for (let ii = 0; ii < children.length; ++ii) {
    let child = children[ii];
    this.unreflectChild(child);
  };
};

/**
 * Deletes the reflection properties of an reflected object
 * @param {Object} object - The object to unreflect
 * @param {String} property - The property to unreflect 
 * @param {Boolean} backup - Backup and restore the original value afterwards
 */
ObjectReflector.prototype.clearReflectedObjectProperty = function(object, property, backup = false) {
  let original = object[property];
  if (object.hasOwnProperty(property)) {
    Reflect.deleteProperty(object, property);
  }
  if (backup) object[property] = original;
};

/**
 * @param {Object} child - The target child to unreflect
 * @public
 */
ObjectReflector.prototype.unreflectChild = function(child) {
  let properties = this.properties;
  for (let ii = 0; ii < properties.length; ++ii) {
    let property = properties[ii];
    this.clearReflectedObjectProperty(child, property, true);
  };
  let index = this.getChildIndexByChild(child);
  if (index > -1) this.children.splice(index, 1);
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
    if (this.enableChildReflection) this.createChildReflection(child);
  }
};

/**
 * Creates reflection property links on a child
 * @param {Object} child - The child to reflect
 */
ObjectReflector.prototype.createChildReflection = function(child) {
  let parent = this.object;
  let properties = this.properties;
  for (let ii = 0; ii < properties.length; ++ii) {
    let property = properties[ii];
    Object.defineProperty(child, property, {
      enumerable: false,
      configurable: true,
      get: () => parent[property],
      set: (value) => parent[PREFIX + property] = value
    });
  };
};

/**
 * Enables linking of the parent object's given properties
 * @param {Object} parent - The parent object to link
 */
ObjectReflector.prototype.createObjectPropertyLinks = function(parent) {
  let properties = this.properties;
  for (let ii = 0; ii < properties.length; ++ii) {
    let property = properties[ii];
    Object.defineProperty(parent, PREFIX + property, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: parent[property]
    });
    Object.defineProperty(parent, property, {
      get: () => parent[PREFIX + property],
      set: (value) => this.updateLinkedChildrenPropertyValues(property, value)
    });
  };
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
  let children = this.children;
  for (let ii = 0; ii < children.length; ++ii) {
    let child = children[ii];
    if (child === target) return ii;
  };
  return -1;
};

/**
 * Synchronizes the child's state with the parent's state
 * @param {Object} child - The target child
 */
ObjectReflector.prototype.synchronizeChildState = function(child) {
  let parent = this.object;
  let properties = this.properties;
  for (let ii = 0; ii < properties.length; ++ii) {
    let property = properties[ii];
    child[property] = parent[property];
  };
};

/**
 * Updates the linked property values of all children
 * @param {String} property - The property to update
 * @param {*} value - The value to update with
 * @return {*} The updated value
 */
ObjectReflector.prototype.updateLinkedChildrenPropertyValues = function(property, value) {
  this.object[PREFIX + property] = value;
  let children = this.children;
  for (let ii = 0; ii < children.length; ++ii) {
    let child = children[ii];
    child[property] = value;
  };
  return value;
};

export default ObjectReflector;
