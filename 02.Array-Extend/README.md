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

其对应的 torque 代码如下

```ts
transitioning macro FastArrayFind(implicit context: Context)(
    o: JSReceiver, len: Number, callbackfn: Callable, thisArg: JSAny): JSAny
    labels Bailout(Smi) {
  let k: Smi = 0;
  const smiLen = Cast<Smi>(len) otherwise goto Bailout(k);
  const fastO = Cast<FastJSArray>(o) otherwise goto Bailout(k);
  let fastOW = NewFastJSArrayWitness(fastO);

  // Build a fast loop over the smi array.
  for (; k < smiLen; k++) {
    fastOW.Recheck() otherwise goto Bailout(k);

    // Ensure that we haven't walked beyond a possibly updated length.
    if (k >= fastOW.Get().length) goto Bailout(k);

    const value: JSAny = fastOW.LoadElementOrUndefined(k);
    const testResult: JSAny =
        Call(context, callbackfn, thisArg, value, k, fastOW.Get());
    if (ToBoolean(testResult)) {
      return value;
    }
  }
  return Undefined;
}
```

遍历整个数组，通过回调函数判断返回值的真假，最后将值返回回去

- some

用于检测数组中的元素是否满足指定条件

1. 如果有一个元素满足条件，则表达式返回 `true` , 剩余的元素不会再执行检测
2. 如果没有满足条件的元素，则返回 `false`

```ts
var ages = [3, 10, 18, 20];
 
function checkAdult(age: number) {
    console.log(age);
    return age >= 18;
}
 
console.log(ages.some(checkAdult)); 
// [LOG]: 3 
// [LOG]: 10 
// [LOG]: 18 
// [LOG]: true
```

> 遍历数组，然后在找到返回值为 true 的时候停止，并且输出true；没有返回值为 true 的时候，输出false

对应的 torque 代码如下

```ts
transitioning macro FastArraySome(implicit context: Context)(
    o: JSReceiver, len: Number, callbackfn: Callable, thisArg: JSAny): JSAny
    labels Bailout(Smi) {
  let k: Smi = 0;
  const smiLen = Cast<Smi>(len) otherwise goto Bailout(k);
  const fastO = Cast<FastJSArray>(o) otherwise goto Bailout(k);
  let fastOW = NewFastJSArrayWitness(fastO);

  // Build a fast loop over the smi array.
  for (; k < smiLen; k++) {
    fastOW.Recheck() otherwise goto Bailout(k);

    // Ensure that we haven't walked beyond a possibly updated length.
    if (k >= fastOW.Get().length) goto Bailout(k);
    const value: JSAny = fastOW.LoadElementNoHole(k) otherwise continue;
    const result: JSAny =
        Call(context, callbackfn, thisArg, value, k, fastOW.Get());
    if (ToBoolean(result)) {
      return True;
    }
  }
  return False;
}
```

- sort

用于对数组的元素进行排序

在数据量小的子数组中使用插入排序，然后再使用归并排序将有序的子数组进行合并排序，时间复杂度为 `O(nlogn)`

排序顺序可以是字母或数字，并按升序或降序

它可以接受一个可选的比较函数作为参数，来定义排序的规则。如果没有提供比较函数，那么数组的元素会被转换为字符串，然后按照 `Unicode` 编码的顺序进行排序

1. 如果比较函数返回一个小于 0 的值，那么第一个参数会排在第二个参数前面
2. 如果返回一个大于 0 的值，那么第二个参数会排在第一个参数前面
3. 如果返回 0，那么两个参数的顺序不变

```ts
var ages = [22, 19, 18, 20];
console.log(ages.sort());

ages = [22, 19, 18, 20];
console.log(ages.sort((a, b) => b - a));
```

Array.sort 函数会原地修改数组，也就是说，它不会返回一个新的数组，而是直接改变原来的数组

[ V8 sort 的大概思路](https://juejin.cn/post/6961559041457946632)

- slice

从一个数组中提取一部分元素，并返回一个新的数组，而不会改变原始数组

Array.slice 方法接受两个可选的参数，分别是 start 和 end ，表示提取的开始位置和结束位置（不包括）的索引

1. 如果 start 或 end 是负数，表示从数组的末尾开始计算，例如 -1 表示最后一个元素，-2 表示倒数第二个元素，依此类推
2. 如果 start 或 end 超出了数组的范围，会被自动调整到合理的值
3. 如果 start 大于等于 end ，或者 start 和 end 都是负数且 start 小于等于 end ，则返回一个空数组
4. 如果没有指定 start 或 end ，则默认为 0 和数组的长度

```ts
var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];

// 提取从索引 1 到索引 3（不包括）的元素
var citrus = fruits.slice(1, 3); 
console.log(citrus); // ["Orange", "Lemon"]

// 提取从索引 -3 到索引 -1（不包括）的元素
var myBest = fruits.slice(-3, -1);
console.log(myBest); // ["Lemon", "Apple"]

// 提取从索引 0 到数组末尾的所有元素
var all = fruits.slice();
console.log(all); // ["Banana", "Orange", "Lemon", "Apple", "Mango"]
```

对应 `slice` 的部分源码如下

```ts
transitioning javascript builtin
ArrayPrototypeSlice(
    js-implicit context: NativeContext, receiver: JSAny)(...arguments): JSAny {
  const o: JSReceiver = ToObject_Inline(context, receiver);

  const len: Number = GetLengthProperty(o);

  const start: JSAny = arguments[0];
  const relativeStart: Number = ToInteger_Inline(start);

  let k: Number = relativeStart < 0 ? Max((len + relativeStart), 0) :
                                      Min(relativeStart, len);

  const end: JSAny = arguments[1];
  const relativeEnd: Number = end == Undefined ? len : ToInteger_Inline(end);

  if ((start == Undefined || TaggedEqual(start, SmiConstant(0))) &&
      end == Undefined) {
    typeswitch (receiver) {
      case (a: FastJSArrayForCopy): {
        return CloneFastJSArray(context, a);
      }
      case (JSAny): {
      }
    }
  }
  
  const final: Number = relativeEnd < 0 ? Max((len + relativeEnd), 0) : Min(relativeEnd, len);

  const count: Number = Max(final - k, 0);
  // ... 一些注释 和 数据处理
  try {
    return HandleFastSlice(context, o, k, count)
        otherwise Slow;
  } label Slow {}

  // ... 手动slice的代码
  return a;
}
```

- splice

通过移除或替换已存在的元素和/或添加新元素来改变一个数组的内容

```ts
Array.splice(start, deleteCount, item1, item2, ...);
```

| 参数 | 作用 |
| --- | --- |
| start | 是要开始改变数组的位置的索引 |
| deleteCount | 是要从 start 开始删除的元素数量 |
| item1, item2, … | 是要从 start 开始加入到数组中的元素。这个方法会修改原数组，并返回一个包含被删除元素的新数组 |

```ts
const fruits = ["apple", "banana", "cherry", "durian"];
const removed = fruits.splice(1, 1); // 删除第二个元素（"banana"）
console.log(removed);
removed = fruits.splice(1, 0, "blueberry"); // 在第二个位置插入一个新元素（"blueberry"）
console.log(removed);
removed = fruits.splice(2, 2, "grape", "kiwi"); // 把第三个和第四个元素（"cherry" 和 "durian"）替换成两个新元素（"grape" 和 "kiwi"）
console.log(removed);
```

## Map

- keys


- values

