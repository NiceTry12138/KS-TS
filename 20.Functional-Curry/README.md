# 作业目标

实现一个 Curry 函数，它接受一个函数作为参数，并返回一个新函数，新函数可以进行柯里化

```ts
const add = (a: number, b: number) => a + b; 
const curriedAdd = Curry(add); 
const addFive = curriedAdd(5); addFive(2); // 7
```

# 解题思路