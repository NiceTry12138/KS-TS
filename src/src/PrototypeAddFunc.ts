export namespace PrototypeAddFunc {
    class Person {
        constructor(public name: string, public age: number) {}

        greet() {
            console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
        }
    }

    // // 方法一 使用 Mixin
    // let mix = {
    //     celebrateBirthday: function(){
    //         console.log("Happy birthday, Alice! You are now 31 years old.");
    //     }
    // }

    // Object.assign(Person.prototype, mix);

    // // // 方法二 直接设置
    // Person.prototype.celebrateBirthday = function() {
    //     console.log("Happy birthday, Alice! You are now 31 years old.");
    // }

    export function Run() {
        const person = new Person("Alice", 30);
        person.greet(); // 输出 "Hello, my name is Alice and I am 30 years old."
        (person as any).celebrateBirthday(); // 输出 "Happy birthday, Alice! You are now 31 years old."
        person.greet(); // 输出 "Hello, my name is Alice and I am 31 years old."
    }
}