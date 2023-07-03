"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepReadonlyNS = void 0;
var DeepReadonlyNS;
(function (DeepReadonlyNS) {
    function Run() {
        let rP = {
            name: "name",
            address: { city: "city" }
        };
        // rP.name = "123"; // Error
        // rP.address.city = "123"; // Error
    }
    DeepReadonlyNS.Run = Run;
})(DeepReadonlyNS || (exports.DeepReadonlyNS = DeepReadonlyNS = {}));
//# sourceMappingURL=DeepReadonly.js.map