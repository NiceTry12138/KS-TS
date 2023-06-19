# 作业目标

TypeScript 实现一个深拷贝对象的方法，不允许使用序列化的的方法，要求支持泛型

```ts
// 普通对象
const obj1 = { a: 1, b: { c: 2 }};
const cloned1 = deepClone(obj1);
console.log(obj1 === cloned1); // false
console.log(obj1.b === cloned1.b); // false

/ 数组对象
const obj2 = [1, [2, { a: 3 }]];
const cloned2 = deepClone(obj2);
console.log(obj2 === cloned2); // false
console.log(obj2[1] === cloned2[1]); // false
console.log(obj2[1][1] === cloned2[1][1]); // false

// Map 对象
const obj5 = new Map([[{ a: 1 }, { b: 2 }]]);
const cloned5 = deepClone(obj5);
console.log(obj5 === cloned5); // false
console.log(obj5.get({ a: 1 }) === cloned5.get({ a: 1 })); // false
```

# 解题思路