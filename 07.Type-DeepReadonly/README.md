# 作业目标

定义一个范型类型 DeepReadonly<T>，用来将类型 T 中的所有属性变为只读属性

```ts
interface Person {
  name: string;
  address: {
    city: string;
  };
}
type ReadonlyPerson = DeepReadonly<Person>;
person.name = "xxx";
person.address.street = "xxxx";
```

# 解题思路