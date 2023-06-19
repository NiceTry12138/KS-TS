# 作业目标

实现一个 Memoize 函数，它接受一个函数作为参数，并返回一个新函数。新函数可以缓存输入参数和函数执行结果，以避免重复计算

```ts
const expensiveFunction = (a: number, b: number) => { console.log('Calculating...'); return a + b; };
const memoizedFunction = Memoize(expensiveFunction);
memoizedFunction(1, 2); // 输出：Calculating... 3
memoizedFunction(1, 2); // 输出：3（没有 log 输出）"
```

# 解题思路