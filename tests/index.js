const ObjectReflector = require("../dist/object-reflector");

function assert(truth) {
  if (!truth) throw new Error(`Assertion failed!`);
};

let tests = [
  {
    description: "Empty instantiation",
    fail: true,
    script: () => {
      new ObjectReflector();
    }
  },
  {
    description: "Instantiation without target object",
    fail: true,
    script: () => {
      new ObjectReflector({ });
    }
  },
  {
    description: "Instantiation with invalid target object type",
    fail: true,
    script: () => {
      new ObjectReflector({ object: null });
    }
  },
  {
    description: "Instantiation with valid target object",
    script: () => {
      new ObjectReflector({ object: {} });
    }
  },
  {
    description: "Instantiation with invalid property list",
    fail: true,
    script: () => {
      new ObjectReflector({ object: {}, properties: 2 });
    }
  },
  {
    description: "Target object with property",
    script: () => {
      let obj = { test: 1 };
      let reflector = new ObjectReflector({ object: obj, properties: ["test"] });
    }
  },
  {
    description: "Target object with missing property",
    script: () => {
      let obj = {};
      let reflector = new ObjectReflector({ object: obj, properties: ["test"] });
    }
  },
  {
    description: "Target object with missing property and later edit",
    script: () => {
      let obj = {};
      let reflector = new ObjectReflector({ object: obj, properties: ["test"] });
      obj.test = 42;
      assert(obj.test === 42);
    }
  },
  {
    description: "Reflect two objects",
    script: () => {
      let objA = {};
      let objB = {};
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
    }
  },
  {
    description: "Reflect two objects with dynamic property",
    script: () => {
      let objA = {};
      let objB = {};
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      objA.test = 42;
      reflector.createReflection(objB);
      assert(objA.test === 42);
      assert(objB.test === 42);
    }
  },
  {
    description: "Reflect two objects with static property",
    script: () => {
      let objA = { test: 42 };
      let objB = {};
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      assert(objA.test === 42);
      assert(objB.test === 42);
    }
  },
  {
    description: "Reflect two objects with matching static properties",
    script: () => {
      let objA = { test: 42 };
      let objB = { test: 666 };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      // expect parent to overwrite child's property value
      assert(objA.test === 42);
      assert(objA.test === objB.test);
    }
  },
  {
    description: "Reflect two objects with object property",
    script: () => {
      let objA = { test: { x: 0, y: 1 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      assert(objA.test === objB.test);
    }
  },
  {
    description: "Reflect two objects with object property and parent update",
    script: () => {
      let objA = { test: { x: 0, y: 1 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      objA.test.x = 666;
      assert(objA.test.x === 666);
      assert(objB.test.x === 666);
    }
  },
  {
    description: "Reflect two objects with object property and parent property reference change",
    script: () => {
      let objA = { test: { x: 0, y: 1 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      objA.test = { z: 42, w: 666 };
      assert(objA.test === objB.test);
      assert(objA.test.z === 42 && objA.test.w === 666);
      assert(objB.test.z === 42 && objB.test.w === 666);
    }
  },
  {
    description: "Reflect two objects object property and child property reference change",
    script: () => {
      let objA = { test: { x: 0, y: 1 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      objB.test = { z: 42, w: 666 };
      assert(objA.test !== objB.test);
    }
  },
  {
    description: "Reflect two objects object property and child property change with enabled child reflection",
    script: () => {
      let objA = { test: { x: 0, y: 1 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"], enableChildReflection: true });
      reflector.createReflection(objB);
      objB.test = { z: 42, w: 666 };
      assert(objA.test === objB.test);
      assert(objA.test.z === 42);
      assert(objA.test.z === objB.test.z);
    }
  },
  {
    description: "Reflect two objects object property and parent property change with enabled child reflection",
    script: () => {
      let objA = { test: { x: 0, y: 1 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"], enableChildReflection: true });
      reflector.createReflection(objB);
      objA.test = { z: 42, w: 666 };
      assert(objA.test === objB.test);
      assert(objA.test.z === 42);
      assert(objA.test.z === objB.test.z);
    }
  },
  {
    description: "Reflect two objects with null property update",
    script: () => {
      let objA = { };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      objA.test = null;
      assert(objA.test === null);
      assert(objA.test === objB.test);
    }
  },
  {
    description: "Reflect two objects with null property update with enabled child reflection",
    script: () => {
      let objA = { };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"], enableChildReflection: true });
      reflector.createReflection(objB);
      objB.test = null;
      assert(objA.test === null);
      assert(objB.test === null);
      assert(objA.test === objB.test);
    }
  },
  {
    description: "Reflect two objects with static property and dynamic property creation and enabled child reflection",
    script: () => {
      let objA = { test: { x: 42 } };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test", "color"], enableChildReflection: true });
      reflector.createReflection(objB);
      objB.test.x = 666;
      assert(objA.test.x === 666);
      assert(objB.test.x === 666);
      objB.color = [ 255, 128, 255 ];
      assert(objB.color[0] === 255);
      assert(objA.color[0] === 255);
      assert(objA.color === objB.color);
    }
  },
  {
    description: "Reflect 3 objects",
    script: () => {
      let objA = { };
      let objB = { };
      let objC = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      reflector.createReflection(objC);
      objA.test = { x: 0, y: 1 };
      assert(objB.test === objA.test);
      assert(objC.test === objA.test);
    }
  },
  {
    description: "Clear the reflector with static property",
    script: () => {
      let objA = { test: {} };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      reflector.clear();
      assert(reflector.children.length === 0);
    }
  },
  {
    description: "Clear the reflector with dynamic property",
    script: () => {
      let objA = { };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      objA.test = {};
      reflector.clear();
      assert(reflector.children.length === 0);
    }
  },
  {
    description: "Clear the reflector with missing property",
    script: () => {
      let objA = { };
      let objB = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"] });
      reflector.createReflection(objB);
      reflector.clear();
      assert(reflector.children.length === 0);
    }
  },
  {
    description: "Unreflect and clear multiple reflected children",
    script: () => {
      let objA = { };
      let objB = { };
      let objC = { };
      let reflector = new ObjectReflector({ object: objA, properties: ["test"], enableChildReflection: true });
      reflector.createReflection(objB);
      reflector.createReflection(objC);
      objA.test = { x: 0, y: 1 };
      assert(reflector.children.length === 2);
      reflector.unreflectChild(objB);
      assert(reflector.children.length === 1);
      objA.test = 42;
      assert(objA.test === 42);
      assert(objB.test !== objA.test);
      objB.test = 666;
      assert(objB.test !== objA.test);
      assert(objC.test === objA.test);
      reflector.unreflectChild(objC);
      assert(reflector.children.length === 0);
    }
  }
];

let fails = 0;
tests.map(test => {
  let title = test.description;
  let failed = false;
  try {
    test.script();
  } catch (e) {
    failed = e;
  }
  if (!test.fail && failed) {
    console.log(`"${title}" failed!`);
    console.log(failed);
    fails++;
  }
  if (test.fail && !failed) {
    console.log(`Expected "${title}" to fail, but it passed!`);
    fails++;
  }
});

console.log(`${tests.length - fails}/${tests.length} tests passed!`);
