# 作业目标

实现一个自定义 hasWithTypes 函数，它允许你检查一个对象是否存在某个属性及其类型，要求使用 Reflect

```ts
class Example {
  public name: String = new String("123");
}

const example = new Example();

console.debug(hasWithTypes(example, "name", String)); // true
console.debug(hasWithTypes(example, "name", Number)); // false
console.debug(hasWithTypes(example, "age", Number)); // false
```

# 解题思路

1. 判断属性类型，要先判断属性是否存在

```ts
Reflect.has(obj, name)
```

2. 判断属性类型，要先获得属性

```ts
Reflect.get(obj, name)
```

3. 判断类型

```ts
// 使用 instanceof 可以处理继承关系
Reflect.get(obj, name) instanceof targetType

// 使用 Reflect.getPrototypeOf 不能处理继承关系，需要手动循环 直至 Object
Reflect.getPrototypeOf(propertyValue) === targetType.prototype
```

