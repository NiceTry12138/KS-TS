# 作业目标

实现数组的 forEach、concat、copyWithin、filter、map、shift、unshift、reduce、reverse、flat、findIndex、find、some、sort、slice、split 等方法
实现 Map 的 keys、values 方法

```ts
const myMap = new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
  ['key3', 'value3']
]);
console.log(keys(myMap)); // ['key1', 'key2', 'key3']
console.log(values(myMap)); // ['value1', 'value2', 'value3']
```

# 解题思路

## Array

[v8中的数组类型](https://zhuanlan.zhihu.com/p/288365366)

> 介绍数组中的元素类型

[v8中21中elements类型](https://source.chromium.org/chromium/v8/v8.git/+/ec37390b2ba2b4051f46f153a8cc179ed4656f5d:src/elements-kind.h;l=14)

> 元素类型的源码

[「数组方法」从详细操作js数组到浅析v8中array.js](https://juejin.cn/post/6846687601806557192)

v8中实现Array.prototype.forEach的源码文件是array-foreach.tq，它使用了一种叫做Torque的语言，是v8专门用来生成内置函数的语言


- forEach

[Array.prototype.forEach 源码分析](https://zhuanlan.zhihu.com/p/385521894)

```ts
for (; k < smiLen; k++) {
  fastOW.Recheck() otherwise goto Bailout(k);

  // Ensure that we haven't walked beyond a possibly updated length.
  if (k >= fastOW.Get().length) goto Bailout(k);
  const value: JSAny = fastOW.LoadElementNoHole(k)
      otherwise continue;
  Call(context, callbackfn, thisArg, value, k, fastOW.Get());
}
```

就上面的代码而言，其实很好理解，就是一个 `for` 循环遍历每个节点然后执行 `callBackfn`

- concat

```ts
transitioning javascript builtin
ArrayPrototypeConcat(
    js-implicit context: NativeContext, receiver: JSAny)(...arguments): JSAny {
  // Fast path if we invoke as `x.concat()`.
  if (arguments.length == 0) {
    typeswitch (receiver) {
      case (a: FastJSArrayForConcat): {
        return CloneFastJSArray(context, a);
      }
      case (JSAny): {
        // Fallthrough.
      }
    }
  }

  // Fast path if we invoke as `[].concat(x)`.
  try {
    const receiverAsArray: FastJSArrayForConcat =
        Cast<FastJSArrayForConcat>(receiver)
        otherwise ReceiverIsNotFastJSArrayForConcat;
    if (receiverAsArray.IsEmpty() && arguments.length == 1) {
      typeswitch (arguments[0]) {
        case (a: FastJSArrayForCopy): {
          return CloneFastJSArray(context, a);
        }
        case (JSAny): {
          // Fallthrough.
        }
      }
    }
  } label ReceiverIsNotFastJSArrayForConcat {
    // Fallthrough.
  }

  // TODO(victorgomes): Implement slow path ArrayConcat in Torque.
  tail ArrayConcat(
      context, LoadTargetFromFrame(), Undefined,
      Convert<int32>(arguments.actual_count));
}
```

函数后第一个小括号中的 `context` 和 `receiver` 表示无需传参，有引擎自动传参的属性

`context` 是当前的执行上下文，`receiver` 是调用 `concat` 方法的对象，`arguments` 是一个可变参数列表，包含要连接的数组或值

那么对于上面的函数来说

1. 判断是否有参数， 没有参数就是 `x.concat()` 这个样子，直接复制一个自己
2. 判断调用者是否为空， 即 `[].concat(arr)` 这个样子， 直接复制一个 `arr` 回去
3. 再其他情况走 `ArrayConcat` 函数

`ArrayConcat` 函数是 C++ 代码， 在 `builtins-definitions.h` 文件中注册给 `torque` 使用 

| 定义 | 作用 |
| --- | --- |
| CPP | 表示用C++语言实现的内置函数，通过BUILTIN_EXIT帧进入 |
| TFJ | 表示用Turbofan实现的内置函数，具有JS链接（可以作为JavaScript函数调用） |
| TFC | 表示用Turbofan实现的内置函数，具有CodeStub链接和自定义描述符 |
| TFS | 表示用Turbofan实现的内置函数，具有CodeStub链接 |
| TFH | 表示用Turbofan实现的处理器，具有CodeStub链接 |
| BCH | 表示字节码处理器，具有字节码分派链接 |
| ASM | 表示用平台相关的汇编语言实现的内置函数 |

本质来看的话就是 `ArrayConcat` 分情况调用 `Fast_ArrayConcat` 或者 `Slow_ArrayConcat`

单看 `Fast_ArrayConcat`

1. 对每个数组检查是否是一个JSArray对象
2. 对每个数组检查是否只包含简单接收者元素
3. 对每个数组检查是否具有快速元素
4. 对每个数组检查是否是一个简单数组
5. 数组的长度加到result_len上，并检查是否溢出或超过了FixedArray或FixedDoubleArray的最大长度
6. 最后是调用了 `ElementsAccessor::Concat` 

```cpp
// ....
Handle<JSArray> result_array = isolate->factory()->NewJSArray(
    result_elements_kind, result_len, result_len, mode);
if (result_len == 0) return result_array;

uint32_t insertion_index = 0;
Handle<FixedArrayBase> storage(result_array->elements(), isolate);
ElementsAccessor* accessor = ElementsAccessor::ForKind(result_elements_kind);
for (uint32_t i = 0; i < concat_size; i++) {
  // It is crucial to keep |array| in a raw pointer form to avoid
  // performance degradation.
  JSArray array = JSArray::cast((*args)[i]);
  uint32_t len = 0;
  array.length().ToArrayLength(&len);
  if (len == 0) continue;
  ElementsKind from_kind = array.GetElementsKind();
  accessor->CopyElements(array, 0, from_kind, storage, insertion_index, len);
  insertion_index += len;
}
// ....
return result_array;
```

针对 `ElementsAccessor::Concat` 函数，它就是新建一个数组，然后将参数中的所有数组中的元素都复制给新建的数组

> `CopyElements` 函数主要负责将源数组中的元素复制到目标数组中
> `CopyElements` 函数的实现是高度优化的，并且会针对各种情况进行特殊处理，以提高性能和效率

- copyWithin

```ts
macro ConvertRelativeIndex(index: Number, length: Number):
    Number labels OutOfBoundsLow, OutOfBoundsHigh {
  const relativeIndex = index >= 0 ? index : length + index;
  if (relativeIndex < 0) goto OutOfBoundsLow;
  if (relativeIndex >= length) goto OutOfBoundsHigh;
  return relativeIndex;
}

macro ConvertAndClampRelativeIndex(index: Number, length: Number): Number {
  try {
    return ConvertRelativeIndex(index, length) otherwise OutOfBoundsLow,
           OutOfBoundsHigh;
  } label OutOfBoundsLow {
    return 0;
  } label OutOfBoundsHigh {
    return length;
  }
}
```

使用 `ConvertAndClampRelativeIndex` 可以获得一个安全的值


| 参数 |	描述|
| --- | --- |
| target | 必需 复制到指定目标索引位置 |
| start | 可选 元素复制的起始位置 |
| end | 可选 停止复制的索引位置 (默认为 array.length)。如果为负值，表示倒数 |

```ts
transitioning javascript builtin ArrayPrototypeCopyWithin(
    js-implicit context: NativeContext, receiver: JSAny)(...arguments): JSAny {
  const object: JSReceiver = ToObject_Inline(context, receiver);

  const length: Number = GetLengthProperty(object);

  const relativeTarget: Number = ToInteger_Inline(arguments[0]);

  let to: Number = ConvertAndClampRelativeIndex(relativeTarget, length);

  const relativeStart: Number = ToInteger_Inline(arguments[1]);

  let from: Number = ConvertAndClampRelativeIndex(relativeStart, length);

  let relativeEnd: Number = length;
  if (arguments[2] != Undefined) {
    relativeEnd = ToInteger_Inline(arguments[2]);
  }
  const final: Number = ConvertAndClampRelativeIndex(relativeEnd, length);
  let count: Number = Min(final - from, length - to);
  let direction: Number = 1;

  if (from < to && to < (from + count)) {
    direction = -1;
    from = from + count - 1;
    to = to + count - 1;
  }
  while (count > 0) {
    const fromPresent: Boolean = HasProperty(object, from);
    if (fromPresent == True) {
      const fromVal: JSAny = GetProperty(object, from);
      SetProperty(object, to, fromVal);
    } else {
      DeleteProperty(object, to, LanguageMode::kStrict);
    }
    from = from + direction;
    to = to + direction;
    --count;
  }
  return object;
}
```

注意一下 `let count: Number = Min(final - from, length - to)` 代码

```ts
let fruits = ["Banana", "Orange", "Apple", "Mango", "Kiwi", "Papaya"];
fruits.copyWithin(2, 0, 2);

console.log(fruits)

fruits = ["Banana", "Orange", "Apple", "Mango", "Kiwi", "Papaya"];
fruits.copyWithin(2, 0, 100);

console.log(fruits)

// [LOG]: ["Banana", "Orange", "Banana", "Orange", "Kiwi", "Papaya"] 
// [LOG]: ["Banana", "Orange", "Banana", "Orange", "Apple", "Mango"] 
```

结合上述代码可以明白 `count` 为什么这样定义

至于后面 `direction`、`from`、`to` 值的更新，是因为一些情况从前往后设置的话会有一些值出现问题，此时需要从后往前更新

比如： `fruits.copyWithin(2, 0, 100)` 
如果从前往后更新，第6位数据依靠第4位的数据，但当更新第6位时第4位数据已经被更新成第2位的数据了，所以为了解决问题就从后往前更新

- map

参考 `array-map.tq` 文件，代码行数过多

```ts
// 普通用法
let fruits = [1, 2, 3, 4, 5];
let result = fruits.map((val, index, arr) => {
    return val * val;
});

console.log(result);


// 使用 thisArg 的用法
let fruits = [1, 2, 3, 4, 5];
let obj = {
    name: 'John',
    greet: function (val: number) {
        console.log(`${val}, ${this.name}!`);
        return val * val;
    }
}
let result = fruits.map(obj.greet, obj);

console.log(result);
```

通过将 thisArg 参数传递给 map 函数，可以将回调函数中的 this 值设置为指定的对象。这在需要在回调函数中引用特定对象的上下文时非常有用

如果没有提供 thisArg 参数，或者 thisArg 参数为 null 或 undefined，则回调函数中的 this 值将指向全局对象。通过使用 thisArg 参数，可以显式地指定回调函数中的 this 值，而不依赖于默认值

- shift

删除并返回数组的第一个元素

```ts
macro TryFastArrayShift(implicit context: Context)(receiver: JSAny): JSAny
    labels Slow, Runtime {
  const array: FastJSArray = Cast<FastJSArray>(receiver) otherwise Slow;
  let witness = NewFastJSArrayWitness(array);

  witness.EnsureArrayPushable() otherwise Slow;

  if (array.length == 0) {
    return Undefined;
  }

  const newLength = array.length - 1;

  // Check that we're not supposed to right-trim the backing store, as
  // implemented in elements.cc:ElementsAccessorBase::SetLengthImpl.
  if ((newLength + newLength + kMinAddedElementsCapacity) <
      array.elements.length) {
    goto Runtime;
  }

  // Check that we're not supposed to left-trim the backing store, as
  // implemented in elements.cc:FastElementsAccessor::MoveElements.
  if (newLength > kMaxCopyElements) goto Runtime;

  const result = witness.LoadElementOrUndefined(0);
  witness.ChangeLength(newLength);
  witness.MoveElements(0, 1, Convert<intptr>(newLength));
  witness.StoreHole(newLength);
  return result;
}
```

重要的就一句话 `witness.MoveElements(0, 1, Convert<intptr>(newLength))` 将**源位置**的元素移动到**目标位置**

第一个参数是**目标位置**、第二个参数是**源位置**、第三个参数是从 `src_index` 开始往后数 newLength 个元素

它设置新的长度之后，将所有元素全部往前移动覆盖前一位

- unshift

向数组的开头添加一个或更多元素，并返回新的长度

```cpp
static Maybe<uint32_t> UnshiftImpl(Handle<JSArray> receiver,
                                    BuiltinArguments* args,
                                    uint32_t unshift_size) {
  Handle<FixedArrayBase> backing_store(receiver->elements(),
                                        receiver->GetIsolate());
  return Subclass::AddArguments(receiver, backing_store, args, unshift_size,
                                AT_START);
}
```

1. 获取 `receiver` 参数（即要操作的 JSArray 对象）的 elements 属性，它是一个 `FixedArrayBase` 对象，表示数组的底层存储
2. 调用 `Subclass::AddArguments` 方法，将 `args` 参数（即要添加的元素）插入到 `backing_store` `的开头位置，unshift_size` 参数表示要插入的元素个数，`AT_START` 参数表示插入位置是数组的开头
3. 返回一个 `Maybe<uint32_t>` 对象，表示操作是否成功以及新的数组长度

- reduce

将数组元素计算为一个值（从左到右）

```ts
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((accumulator, currentValue) => {
    console.log(accumulator);
    return accumulator + currentValue;
}, 0);

console.log(sum); // 输出 15
```

`Array.reduce` 函数有两个参数

1. `callback` 是一个函数，有四个参数
  - `accumulator` 累计器，保存了上一次回调函数的返回值或初始值
  - `currentValue` 当前正在处理的数组元素
  - `currentIndex` 当前数组元素的索引
  - `array` 调用 `reduce` 方法的数组
2. `initiaValue` 可选参数，表示累计器的初始值

```ts
transitioning macro FastArrayReduce(implicit context: Context)(
    o: JSReceiver, len: Number, callbackfn: Callable,
    initialAccumulator: JSAny|TheHole): JSAny
    labels Bailout(Number, JSAny | TheHole) {
  const k = 0;
  let accumulator = initialAccumulator;
  Cast<Smi>(len) otherwise goto Bailout(k, accumulator);
  const fastO = Cast<FastJSArrayForRead>(o) otherwise goto Bailout(k, accumulator);
  let fastOW = NewFastJSArrayForReadWitness(fastO);

  // Build a fast loop over the array.
  for (let k: Smi = 0; k < len; k++) {
    fastOW.Recheck() otherwise goto Bailout(k, accumulator);

    // Ensure that we haven't walked beyond a possibly updated length.
    if (k >= fastOW.Get().length) goto Bailout(k, accumulator);

    const value: JSAny = fastOW.LoadElementNoHole(k) otherwise continue;
    typeswitch (accumulator) {
      case (TheHole): {
        accumulator = value;
      }
      case (accumulatorNotHole: JSAny): {
        accumulator = Call(context, callbackfn, Undefined, accumulatorNotHole, value, k,fastOW.Get());
      }
    }
  }
// ....
}
```

> 上述就是 `torque` 如何实现 `array-reduce` 的源码

重要的就两点：`accumulator` 变量 和 回调函数的执行 `Call`

- findIndex

```ts
var ages = [3, 10, 18, 20];
 
function checkAdult(age: number) {
    return age >= 18;
}
 
console.log(ages.findIndex(checkAdult));
```

返回符合传入测试（函数）条件的数组元素索引

```ts
transitioning macro FastArrayFindIndex(implicit context: Context)(
    o: JSReceiver, len: Number, callbackfn: Callable, thisArg: JSAny): Number
    labels Bailout(Smi) {
  let k: Smi = 0;
  const smiLen = Cast<Smi>(len) otherwise goto Bailout(k);
  const fastO = Cast<FastJSArray>(o) otherwise goto Bailout(k);
  let fastOW = NewFastJSArrayWitness(fastO);

  // Build a fast loop over the smi array.
  for (; k < smiLen; k++) {
    // .....
    const value: JSAny = fastOW.LoadElementOrUndefined(k);
    const testResult: JSAny =
        Call(context, callbackfn, thisArg, value, k, fastOW.Get());
    if (ToBoolean(testResult)) {
      return k;
    }
  }
  return -1;
}
```

直接看上面 `torque` 的源码，简单明了，就是一个 `for` 循环，根据 `Call` 执行回调函数的返回值，来判断是否查找到了目标值

- find

返回符合传入测试（函数）条件的数组元素

```ts
var ages = [3, 10, 18, 20];
 
function checkAdult(age: number) {
    return age >= 18;
}
 
console.log(ages.find(checkAdult));
```

