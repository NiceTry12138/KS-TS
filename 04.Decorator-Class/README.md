# 作业目标

 定义一个装饰器，在类的声明上，为该类的所有方法添加一个异常处理

```ts
@catchError
class Calculator {
  public add(a: number, b: number): number {
    return a + b;
  }
}

const calculator = new Calculator();
console.log(calculator.add(1, 2)); // 3
calculator.add(null, 2); // catch
```

# 解题思路

1. 为所有方法添加异常处理，所以需要修改原型中的方法

参考方法装饰器中修改属性的写法

```ts
let func = construct.prototype[`funcName`];
let newFunc = function(...args[]) {
  // do something
  func.apply(this, args);
  // do something
}
```

2. 为所有方法添加异常处理，所以拿到所有方法

```ts
let methodNames = Object.getOwnPropertyNames(property).filter(name => typeof property[name] === `function`);
```

# 代码

```typescript
function catchError(construct: Function) {
    let property = construct.prototype;
    let methodNames = Object.getOwnPropertyNames(property).filter(name => typeof property[name] === `function`);
    methodNames.forEach((methodName: string) => {
        let func = property[methodName] as Function;
        let newFunc = function(...args: any[]) {
            try {
                return func.apply(construct, args);
            } catch (error) {
                console.error(error);
            }
        };
        property[methodName] = newFunc;
    })
}

@catchError
class Calculator{
    public constructor() {

    }

    public add(a: number, b: number) {
        if(a < 0 || b < 0) {
            throw new Error("param invalid");
        }
        return a + b;
    }
}

let a = new Calculator();
console.log(a.add(-1, -2));
```