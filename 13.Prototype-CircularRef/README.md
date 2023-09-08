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

```js
function isObject(value) {
    const valueType = typeof value;
    return (value !== null) && (valueType === "object" || valueType === "function")
}

function deepClone(originValue, noteObjs = new WeakMap()) {
    if(originValue instanceof Set) {
        return new Set([...originValue]);
    }
    
    if(originValue instanceof Map) {
        return new Map([...originValue]);
    }
    
    if(typeof originValue === "function") {
        return originValue;
    }
    
    if(!isObject(originValue)) {
        return originValue;
    }
    
    if(noteObjs.has(originValue)) {
        return noteObjs.get(originValue);
    }
    
    const newObj = Array.isArray(originValue) ? [] : {};
    noteObjs.set(originValue, newObj);
    
    for(const key in originValue) {
        newObj[key] = deepClone(originValue[key], noteObjs);
    }
    
    return newObj;
}
```