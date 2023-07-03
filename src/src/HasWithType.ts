export namespace HasWithType {
    class A {

    }

    class B extends A {

    }

    class Example {
        public name: String = new String("123");

        public val: B = new B();
    }

    function hasWithTypes<T>(obj: any, name: string, targetType: new (...args: any[]) => T) {
        if(!Reflect.has(obj, name)) {
            return false;
        }

        return Reflect.get(obj, name) instanceof targetType;
    }

    export function Run() {
        let a = new Example();
        console.log(hasWithTypes(a, "name", String));
        console.log(hasWithTypes(a, "val", A));
        console.log(hasWithTypes(a, "val", B));
        console.log(hasWithTypes(a, "name", Number));
        console.log(hasWithTypes(a, "age", Number));
    }
}
