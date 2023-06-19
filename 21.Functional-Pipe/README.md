# 作业目标

实现一个 Pipe 函数，它接受任意数量的函数作为参数，并返回一个新函数，新函数可以依次执行这些函数，并将结果传递到下一个函数，直到执行完所有函数并返回最终结果。例如，你需要实现 Pipe 函数和返回的新函数。

```ts
const add = (a: number, b: number) => a + b; 
const multiply = (a: number, b: number) => a * b; 
const pipeFunctions = Pipe(add, multiply); 
pipeFunctions(5, 2, 3); // (5 + 2) * 3 = 21
```

# 解题思路