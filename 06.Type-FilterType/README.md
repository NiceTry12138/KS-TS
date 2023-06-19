# 作业目标

实现一个类型过滤器类型 Filter<T, U>，用于过滤类型 T 中所有与类型 U 匹配的元素，并将这些元素组合成一个新的元素数组类型。

```ts
type Fruit = 'apple' | 'banana' | 'orange';
type Fruits = ['apple', 'banana', 'orange', 'cherry'];
type OnlyFruits = Filter<Fruits, Fruit>; // ['apple', 'banana', 'orange']
```

遍历 Object 和 递归方式两种

# 解题思路