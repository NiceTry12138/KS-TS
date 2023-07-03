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

与 `type-filter` 类似，需要使用 `keyof` 来获取所有数据类型的集合

然后给所有的类型加上 `readonly`，组成新的类型

# 代码

```ts
interface Person {
  name: string;
  address: {
    city: string;
  };
}

type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends Object ? DeepReadonly<T[K]> : T[K] ;
}

// type DeepReadonly<T> = {
//     readonly [K in keyof T]: T[K];
// }
// person.address.city = "123"; // 通过 不符合题意 所以需要递归一下给每个 Object 的属性都加上 readonly
```