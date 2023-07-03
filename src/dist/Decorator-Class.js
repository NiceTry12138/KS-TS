"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecoratorClass = void 0;
var DecoratorClass;
(function (DecoratorClass) {
    function catchError(construct) {
        let property = construct.prototype;
        let methodNames = Object.getOwnPropertyNames(property).filter(name => typeof property[name] === `function`);
        methodNames.forEach((methodName) => {
            let func = property[methodName];
            let newFunc = function (...args) {
                try {
                    return func.apply(construct, args);
                }
                catch (error) {
                    console.error(error);
                }
            };
            property[methodName] = newFunc;
        });
    }
    let Calculator = class Calculator {
        constructor() {
        }
        add(a, b) {
            if (a < 0 || b < 0) {
                throw new Error("param invalid");
            }
            return a + b;
        }
    };
    Calculator = __decorate([
        catchError
    ], Calculator);
    function Run() {
        let a = new Calculator();
        console.log(a.add(-1, -2));
    }
    DecoratorClass.Run = Run;
})(DecoratorClass || (exports.DecoratorClass = DecoratorClass = {}));
//# sourceMappingURL=Decorator-Class.js.map