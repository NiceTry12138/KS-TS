# 作业目标

 定义一个装饰器，在类的声明上，为该类的所有方法添加一个异常处理

```ts
class Calculator {
  @catchError
  public add(a: number, b: number): number {
    return a + b;
  }
}

const calculator = new Calculator();
console.log(calculator.add(1, 2)); // 3
calculator.add(null, 2); // catch
```

# 解题思路