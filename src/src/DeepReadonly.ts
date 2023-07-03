export namespace DeepReadonlyNS{
    interface Person {
        name: string;
        address: {
            city: string;
        };
    }

    type DeepReadonly<T> = {
        readonly [K in keyof T]: T[K] extends Object ? DeepReadonly<T[K]> : T[K] ;
    }

    export function Run() {
        let rP: DeepReadonly<Person> = {
            name: "name",
            address: {city: "city"}
        };

        // rP.name = "123"; // Error
        // rP.address.city = "123"; // Error
    }
}