# 作业目标

了解 TypeScript 中装饰器都有哪几种，分别是用来做什么的

# 解题思路

## 装饰器与装饰器工厂

装饰器(`Decorators`): 装饰器是一种特殊类型的声明，它可以附加到类声明、类属性和类方法上，以修改它们的行为或元数据。装饰器以特殊的 @ 符号开始，后跟装饰器的名称（装饰器工厂函数）。装饰器可以在编译时静态地应用于类，并在运行时对类的实例进行处理

装饰器的作用是提供了一种简洁的语法来修改类的行为或元数据，例如添加新的功能、修改属性或方法的行为、应用验证逻辑等。通过装饰器，可以实现代码的重用和扩展，使得类的功能更加灵活和可配置

```ts
function classDecorator(constructor: Function) {
  console.log('Class decorator');
}

@classDecorator
class MyClass {
  myProperty: string;
  
  myMethod() {
    console.log('Original method implementation');
  }
}

const instance = new MyClass();
instance.myMethod(); // 输出日志
```

装饰器工厂(`Decorator Factory`): 装饰器工厂是一个函数，用于创建并返回装饰器实例。装饰器工厂接收一些参数，这些参数可以在装饰器函数内部使用。装饰器工厂允许我们在装饰器的创建过程中进行配置和定制。

装饰器工厂函数返回的实际装饰器函数将应用于类、属性或方法，并用于修改它们的行为或元数据。装饰器工厂提供了一种创建可重用装饰器的方式，可以在多个类或多个位置使用相同的装饰器逻辑

```ts
function propertyDecoratorFactory(metadata: any): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    console.log(`Property decorator with metadata: ${metadata}`);
  };
}

class MyClass {
  @propertyDecoratorFactory('someMetadata')
  myProperty: string;
}

const instance = new MyClass();
```

在我看来，如果你的装饰器不需要参数，那么直接根据需求写一个装饰器函数即可

如果你的装饰器需要参数，那么就需要写一个装饰器工厂，装饰器工厂返回值才是你需要的装饰器函数。装饰器工厂可以根据传入参数不同返回不同的装饰器函数，也可以依靠函数定义的作用域，将传入的参数给装饰器函数使用

## 属性装饰器

属性装饰器是应用于类的属性上的装饰器，它用于修改属性的行为或元数据

```ts
function propertyDecorator(target: object, propertyKey: string | symbol): void {
  // 修改属性行为或元数据
}
```

属性装饰器接收两个参数

- `target` 参数是属性所属的类的原型对象
- `propertyKey` 参数是属性的名称

**修改属性的元数据**

属性装饰器可以用于修改属性的元数据，例如添加标记、描述属性等。可以通过使用装饰器工厂函数和装饰器函数来实现

```ts
function propertyDecorator(metadata: any): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata('metadataKey', metadata, target, propertyKey);
  };
}

class MyClass {
  @propertyDecorator('someMetadata')
  myProperty: string;
}

const metadata = Reflect.getMetadata('metadataKey', MyClass.prototype, 'myProperty');
console.log(metadata); // 输出 'someMetadata'
```

**修改属性的访问器**

属性装饰器也可以用于修改属性的访问器方法，即 getter 和 setter。可以通过装饰器函数来实现

```ts
function propertyDecorator(target: Object, propertyKey: string | symbol) {
  let value: string;
  Object.defineProperty(target, propertyKey, {
    get: function () {
      return value;
    },
    set: function (newValue: string) {
      value = newValue.toUpperCase();
    },
    enumerable: true,
    configurable: true
  });
}

class MyClass {
  @propertyDecorator
  myProperty: string;
}

const instance = new MyClass();
instance.myProperty = 'hello';
console.log(instance.myProperty); // 输出 'HELLO'
```

**修改属性的可配置性**

属性装饰器还可以用于修改属性的可配置性，即是否可以通过 delete 运算符删除属性。可以通过装饰器函数来实现

```ts
function propertyDecorator(target: Object, propertyKey: string | symbol) {
  Object.defineProperty(target, propertyKey, {
    configurable: false
  });
}

class MyClass {
  @propertyDecorator
  myProperty: string;
}

const instance = new MyClass();
delete instance.myProperty; // 抛出错误，无法删除属性
```

## 方法装饰器

方法装饰器是应用于类的方法上的装饰器，它用于修改方法的行为或元数据

```ts
function methodDecorator(target: object, methodName: string | symbol, descriptor: PropertyDescriptor): void {
  // 修改方法行为或元数据
}
```

方法装饰器接收三个参数

- `target` 参数是方法所属的类的原型对象
- `methodName` 参数是方法的名称
- `descriptor` 参数是方法的属性描述符

除了与属性装饰器类似的 **修改方法的元数据** 和 **修改方法的可配置性**

方法装饰器可以 **修改方法的行为**，例如添加日志、验证输入等。可以通过装饰器函数来实现

```ts
function methodDecorator(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Called method ${propertyKey.toString()} with arguments: ${args}`);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

class MyClass {
  @methodDecorator
  myMethod() {
    // 方法的实现
  }
}

const instance = new MyClass();
instance.myMethod(); // 输出日志，并调用原始方法的实现
```

这里就不得不提一下 方法装饰器的第三个参数 `PropertyDescriptor`

`PropertyDescriptor` 是一个 `TypeScript` 内置类型，其 `value` 表示属性的值，在方法装饰其中表示 **函数体**

另外，方法装饰器建议返回 `PropertyDescriptor` 

在 `TypeScript` 中，将 `PropertyDescriptor` 对象作为参数传递给方法装饰器函数允许我们直接修改这个对象，并实时反映这些更改。因此，即使没有显式地返回 `PropertyDescriptor` 对象，对它的修改仍然会生效

虽然返回 `PropertyDescriptor` 是可选的，但如果需要在其他装饰器中访问或修改 `PropertyDescriptor` 对象，或者希望对其进行其他操作，可以显式地返回 `PropertyDescriptor` 对象

## 类装饰器

类装饰器是应用于类的装饰器，它用于修改类的行为或元数据

```ts
function classDecorator(constructor: Function): void {
  // 修改类行为或元数据
}
```

类装饰器接收一个参数

- `constructor` 参数是类的构造函数。通过修改 `constructor` 函数，可以对类的行为进行操作

**应用混入(Mixin)模式**

类装饰器还可以用于实现混入模式，即将额外的行为添加到类中。可以通过装饰器工厂函数和装饰器函数来实现

```ts
function mixinDecorator(mixin: any) {
  return function (constructor: Function) {
    Object.assign(constructor.prototype, mixin);
  };
}

const LogMixin = {
  log(message: string) {
    console.log(`Log: ${message}`);
  }
};

@mixinDecorator(LogMixin)
class MyClass {
  myMethod() {
    console.log('Original method implementation');
  }
}

const instance = new MyClass();
instance.log('Hello'); // 输出 'Log: Hello'
```

**修改类的函数**

类装饰器可以用于修改类的构造函数，例如添加额外的逻辑、修改参数等。可以通过装饰器函数来实现

```ts
function classDecorator(constructor: Function) {
  console.log('Class decorator');
  constructor.prototype.newMethod = function () {
    console.log('New method added');
  };
}

@classDecorator
class MyClass {
  myMethod() {
    console.log('Original method implementation');
  }
}

const instance = new MyClass();
instance.newMethod(); // 输出 'New method added'
```

## 代码

```ts
// 定义一个装饰器，用于输出方法执行前的日志
function logBefore(info: string) {
    console.log('logBefore func');
  return function(taget: any, name: string, desc: PropertyDescriptor) {
    console.log('Before method execution');
  }
}

// 定义另一个装饰器，用于输出方法执行后的日志
function logAfter(info: string) {
    console.log('logAfter func');
  return function(taget: any, name: string, desc: PropertyDescriptor) {
    console.log('After method execution');
  }
}

function classDec(target: any) {
    console.log(`classDec func`);
}

function propertyDes(target: any, name: string) {

}

@classDec
class Example {
  @logBefore("")
  @logAfter("")
  public method(num: number) {
    console.log('Method execution');
    return 10;
  }

  @propertyDes
  public desc = "desc";
}

const example = new Example();
example.method(1);

// [LOG]: "logBefore func" 
// [LOG]: "logAfter func" 
// [LOG]: "After method execution" 
// [LOG]: "Before method execution" 
// [LOG]: "classDec func" 
// [LOG]: "Method execution" 
```

根据上面的代码输出可以发现，装饰器工厂函数是从上往下执行，但是装饰器函数是从下往上执行的

```js
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;/
};

__decorate([
    logBefore(""),
    logAfter("")
], Example.prototype, "method", null);
__decorate([
    propertyDes
], Example.prototype, "desc", void 0);
Example = __decorate([
    classDec
], Example);
```

这是前面TS代码翻译成JS代码的装饰器执行部分

1. 首先，肯定是执行 `logBefore()` 和 `logAfter()` 两个函数得到返回值，然后将返回值作为参数传递给 `__decorate` 函数，所以装饰器工厂的执行顺序是从上往下的
2. 然后就是执行 `__decorate` 函数了

`var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;`

分析上面的代码，`c` 表示参数个数，当 `c < 3` 的时候就是 **类装饰器**，否则是 **属性装饰器** 和 **方法装饰器**

那么如果是 **类装饰器** 那么 `r` 就是类的 `prototype`; 如果是 **方法**或者**属性装饰器** 那么 `r` 就是对应的 `PropertyDescriptor`

如果当前版本定义了 `Reflect` 类，就调用 `Reflect.decorate`; 这里直接分析后面的 `for` 循环代码

`for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;`

装饰器序号从后往前迭代，所以装饰器的执行顺序是从下往上的; 然后判断一下当前迭代器是是否有效; 然后根据 类装饰器、方法装饰器、属性装饰器 不同的参数个数，执行不同的逻辑

比如: 如果是**类装饰器**那么 `arguments.length` 长度就是2， 会执行 `d(r)` 刚好对应类装饰器的定义；如果是**方法**或者**属性装饰器**那么 `arguments.length` 长度都是4，全部会执行 `d(target, key, r)` 但是由于属性装饰器只有两个参数，所以属性装饰器会丢弃第三个参数 `r`

这里需要注意的是 `c > 3 ? d(target, key, r) : d(target, key)` 在现在版本的TS是不会执行后面的 `d(target, key)` 因为 `c` 都是4

# KTS

1. @System(tag, stores: T | T[])

类装饰器工厂，将 System 的 Constructor、Tag 和 能够修改的 Store 注册到对应的 SystemManager 系统中，这个系统存储了所有的 System 信息

2. @store(tag)

类装饰器工厂，将 Store 的Constructor 和 Tag 注册到 StoreManager 中，这个系统存储了所有的 Store 信息

3. @D.on(undefined | Store | Delegate | MulticastDelegate)

方法装饰器工厂，有重载。根据参数不同返回不同的装饰器函数

- 首先事件判断类型
  - Execute 那么就是 UEC++ 单发事件、 Broadcast 就是 UEC++ 广播事件
  - 根据 C++ 事件类型返回不同的装饰器函数

- 如果不是 C++ 事件，那么就是框架内的 Event 和 Action，直接返回装饰器函数
  - 通过 `Reflect.getMetadata("design:paramtypes", target, _propertyKey)` 获得对应函数的参数信息
  - 检查参数个数是否只有一个
  - 通过 `subscribeOperator.register` 注册信息，并且检查注册是否成功

> 注意 框架内的 Event、StoreEvent、StoreAction、Action 都有一个属性叫做 SelfType，用于一些类型判断

`Reflect.getMetadata` 类似的用法还有一些 

- `"design:paramtypes"`：获取方法的参数类型数组
- `"design:returntype"`：获取方法的返回类型
- `"design:type"`：获取属性的类型
- `"design:metadata"`：获取装饰器元数据
