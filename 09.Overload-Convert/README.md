# 作业目标

实现一个 convert 函数，它接受一个数字或一个字符串，并根据输入的不同类型返回相应的结果：
如果输入是数字，返回该数字乘以 2 的结果；
如果输入是字符串，返回该字符串转为大写字母并用感叹号结尾的结果。

```ts
console.log(convert(10)); // 输出 20
console.log(convert('hello')); // 输出 HELLO!
```

# 解题思路

TS 通过提供多个函数类型的声明来间接实现了函数的重载

# 代码

```ts
export namespace Convert {
    function convert(input: number): number;
    function convert(input: string): string;

    function convert(input: number | string): number | string {
        if(typeof input === `string`) {
            return input.toUpperCase() + "!";
        }
        return input * 2;
    }

    export function Run() {
        console.log(convert("qwer"));
        console.log(convert(2));
    }
}
```