"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasWithType = void 0;
var HasWithType;
(function (HasWithType) {
    class A {
    }
    class B extends A {
    }
    class Example {
        constructor() {
            this.name = new String("123");
            this.val = new B();
        }
    }
    function hasWithTypes(obj, name, type) {
        if (!Reflect.has(obj, name)) {
            return false;
        }
        return Reflect.get(obj, name) instanceof type;
    }
    function Run() {
        let a = new Example();
        console.log(hasWithTypes(a, "name", String));
        console.log(hasWithTypes(a, "val", A));
        console.log(hasWithTypes(a, "val", B));
        console.log(hasWithTypes(a, "name", Number));
        console.log(hasWithTypes(a, "age", Number));
    }
    HasWithType.Run = Run;
})(HasWithType || (exports.HasWithType = HasWithType = {}));
//# sourceMappingURL=HasWithType.js.map