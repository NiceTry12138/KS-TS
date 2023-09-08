# 作业目标

通过原型给类增加一个 celebrateBirthday 方法

```ts
class Person {
  constructor(public name: string, public age: number) {}

  greet() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
}

const person = new Person("Alice", 30);
person.greet(); // 输出 "Hello, my name is Alice and I am 30 years old."
person.celebrateBirthday(); // 输出 "Happy birthday, Alice! You are now 31 years old."
person.greet(); // 输出 "Hello, my name is Alice and I am 31 years old."
```

# 解题思路

```js
class Person {
  constructor(public name: string, public age: number) {}

  greet() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
}

(Person.prototype as any).celebrateBirthday = function() {
  this.age = 31;
  this.greet();
}

const person = new Person("Alice", 30);
person.greet(); // 输出 "Hello, my name is Alice and I am 30 years old."
person.celebrateBirthday(); // 输出 "Happy birthday, Alice! You are now 31 years old."
person.greet(); // 输出 "Hello, my name is Alice and I am 31 years old."
```