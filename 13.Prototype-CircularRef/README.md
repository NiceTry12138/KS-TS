# 作业目标

在上面的基础上，同样支持循环引用的对象

```ts
// 循环引用对象
const obj7: any = { a: 1 };
obj7.b = obj7;
const cloned7 = deepClone(obj7);
console.log(cloned7.a); // 1
console.log(cloned7.b === cloned7); // true"
```

# 解题思路