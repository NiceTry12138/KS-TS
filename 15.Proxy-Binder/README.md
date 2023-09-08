# 作业目标

写一个 binder，解决右边代码调用的错误问题

```ts
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`Hello, my name is ${this.name} and I'm a dog`);
  }
}

const dog = new Dog('Fido');
const speak = dog.speak;
speak();
```

# 解题思路

```ts
const dog = new Dog('Fido');
const speak1 = dog.speak.bind(dog);
speak1();
```