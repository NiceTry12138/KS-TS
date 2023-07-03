# 作业目标

实现一个 createArray 函数，它接受两个或三个参数，并根据输入参数的不同类型返回不同的函数签名：
如果输入参数有两个，它需要返回一个新的数组类型；
如果输入参数有三个，它需要返回一个新的函数类型，该函数接受一个数字类型的参数

```ts
const arr1 = [1, 2, 3];
const arr2 = ['a', 'b', 'c'];

const newArr1 = createArray(arr1, arr2);
console.log(newArr1); // 输出 [1, 2, 3, "a", "b", "c"]

const newArr2 = createArray(1, 'a', true)(3);
console.log(newArr2); // 输出 [1, "a", true, 1, "a", true, 1, "a", true]
```

# 解题思路

```ts
function createArray<T, U>(arr1: T[], arr2: U[]): (T | U)[];
function createArray<T, U, V>(item1: T, item2: U, item3: V): (num: number) => (T | U | V)[];

function createArray(...args: any[]) {
    let result = new Array();
    args.forEach((item) => {
        result = result.concat(item);
    });

    if(args.length === 3) {
        return function(num: number) {
            let newArr = new Array();
            for(let index = 0; index < num; ++index) {
                newArr = newArr.concat(...result);
            }
            return newArr;
        }
    }

    return result;
}
```