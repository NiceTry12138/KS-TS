export namespace DecoratorClass {
    function catchError(construct: Function) {
        let property = construct.prototype;
        let methodNames = Object.getOwnPropertyNames(property).filter(name => typeof property[name] === `function`);
        methodNames.forEach((methodName: string) => {
            let func = property[methodName] as Function;
            let newFunc = function(...args: any[]) {
                try {
                    return func.apply(construct, args);
                } catch (error) {
                    console.error(error);
                }
            };
            property[methodName] = newFunc;
        })
    }

    @catchError
    class Calculator{
        public constructor() {

        }

        public add(a: number, b: number) {
            if(a < 0 || b < 0) {
                throw new Error("param invalid");
            }
            return a + b;
        }
    }

    export function Run() {
        let a = new Calculator();
        console.log(a.add(-1, -2));
    }
}

