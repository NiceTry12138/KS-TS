export namespace CreateArray {
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

    export function Run() {
        const arr1 = [1, 2, 3];
        const arr2 = ['a', 'b', 'c'];

        const newArr1 = createArray(arr1, arr2);
        console.log(newArr1); // 输出 [1, 2, 3, "a", "b", "c"]

        const newArr2 = createArray(1, 'a', true)(3);
        console.log(newArr2); // 输出 [1, "a", true, 1, "a", true, 1, "a", true]
    }
}