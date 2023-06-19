# 作业目标

实现一个自定义 hasWithTypes 函数，它允许你检查一个对象是否存在某个属性及其类型，要求使用 Reflect

```ts
class Example {
  public name!: string;
}

const example = new Example();

console.debug(hasWithTypes(example, "name", String)); // true
console.debug(hasWithTypes(example, "name", Number)); // false
console.debug(hasWithTypes(example, "age", Number)); // false
```

# 解题思路