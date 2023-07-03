namespace Filter {
    type Fruit = 'apple' | 'banana' | 'orange';
    type Fruits = ['apple', 'banana', 'orange', 'cherry'];

    type Filter<T extends readonly any[], U> = {
        [K in keyof T]: T[K] extends U ? T[K] : never;
    }[number];

    type OnlyFruits = Filter<Fruits, Fruit>; // ['apple', 'banana', 'orange']
}