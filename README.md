<h1 aling="center"><img src="https://i.imgur.com/a20tPCY.png" width="10%"></h1>
<h1 align="center">Object Reflector</h1>

<div align="center">
  <strong>Simple & powerful object reflections.</strong>
</div>

<br/>

<div align="center">
  <a href="https://www.npmjs.com/package/object-reflector">
    <img src="https://img.shields.io/npm/v/object-reflector.svg?style=flat-square" alt="NPM Version" />
  </a>
</div>

## Table of Contents
- [Features](#features)
- [Examples](#examples)
- [Installation](#installation)
- [API](#api)
- [FAQ](#faq)

## Features
 - **lightweight**: weighing only ``4kb``
 - **minimal**: there are only 4 methods
 - **powerful**: create powerful references with minimal effort

This library lets you create powerful references between objects without affecting your code style. You can reuse and update data references between huge amounts of objects with only a few lines of code. The data between reflected objects is shared, not copied. This can save a lot memory and speed up your app performance!

## Examples

The library's flow is all about parents and childrens. You define an object as a parent and then add childrens to it which inherit and share the properties you want.

#### Parent reflections

```js
let a = {};
let b = {};

let reflector = new ObjectReflector({
  object: a, // our parent object
  properties: ["data"] // we want "data" to be reflected
});
reflector.createReflection(b); // b.data is now a reflection to a.data

a.data = { color: "red" }; // this updates all reflected objects
b.data; // -> { color: "red" }
a.data === b.data; // true
```

### Child reflections

This example shows how to change a parent's data from within a child. The previous example showed us how a parent can change it's children, now we do the opposit!

```js
let a = {};
let b = {};

let reflector = new ObjectReflector({
  object: a, // our parent object
  properties: ["data"], // we want "data" to be reflected
  enableChildReflection: true // this enables child reflections
});
reflector.createReflection(b); // b.data is now a reflection to a.data

a.data = { color: "red" }; // this updates all reflected objects
b.data; // -> { color: "red" }
b.data = { meow: 42 };  // this also updates the parent's data!
a.data; // -> { meow: 42 }
a.data === b.data; // true
```

## Installation

Node:
```sh
npm install object-reflector
```

Browser:
```sh
<script type="text/javascript" src="https://raw.githubusercontent.com/maierfelix/object-reflector/master/dist/object-reflector.min.js"></script>
```

## API

``reflector = new ObjectReflector(opts)``
 
 Initializes a new ObjectReflector instance.
 - ``opts.object`` The parent object to reflect from
 - ``opts.properties`` Array of properties you want to reflect from the object
 - ``opts.enableChildReflection`` Enables child reflections, so childs can update their parent too!

``reflector.createReflection(object)``

Creates a reflection to the passed in object.

``reflector.unreflectChild(object)``

Removes a reflection from the passed in object.

``reflector.clear()``

Clears all reflected childs.

## FAQ

#### How is the performance?

*Parent reflections* are very fast, I use them in a 3D engine to share large amounts of meshes and textures between objects.

*Child reflections* are slower because they use getters/setters in the background. They are clearly fast enough for most cases, but too slow when it comes to realtime stuff or very very large sets of data.
