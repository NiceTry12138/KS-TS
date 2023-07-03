export namespace Convert {
    function convert(input: number): number;
    function convert(input: string): string;

    function convert(input: number | string): number | string {
        if(typeof input === `string`) {
            return input.toUpperCase() + "!";
        }
        return input * 2;
    }

    export function Run() {
        console.log(convert("qwer"));
        console.log(convert(2));
    }
}