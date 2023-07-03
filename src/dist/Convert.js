"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Convert = void 0;
var Convert;
(function (Convert) {
    function convert(input) {
        if (typeof input === `string`) {
            return input.toUpperCase() + "!";
        }
        return input * 2;
    }
    function Run() {
        console.log(convert("qwer"));
        console.log(convert(2));
    }
    Convert.Run = Run;
})(Convert || (exports.Convert = Convert = {}));
//# sourceMappingURL=Convert.js.map