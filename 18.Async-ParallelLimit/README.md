# 作业目标

"实现一个 parallelLimit 函数，接收三个参数：一个异步函数数组，一个并发限制数 limit 和一个可选的参数 timeout。parallelLimit 函数会并发地执行异步函数数组中的所有函数，并且限制并发数量。如果某个异步函数执行时间超过了 timeout 参数指定的时间，则该异步函数会被取消执行，并且返回一个 Promise 对象，拒绝原因为字符串 ""timeout""

函数签名：
`function parallelLimit<T>(fnArray: (() => Promise<T>)[], limit: number, timeout?: number): Promise<T[]>`

```ts
async function mockAsyncTask(i: number): Promise<number> {
  const time = Math.random() * 1000 + 1000;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(i);
    }, time);
  });
}

async function test() {
  const fnArray = [1, 2, 3, 4, 5].map((i) => () => mockAsyncTask(i));
  const result = await parallelLimit(fnArray, 2, 2000);
  console.log(result); // [3, 1, 2, 4, 5] 不知道什么顺序
}
```

# 解题思路