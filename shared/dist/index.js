"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForCardsLoaded = exports.getAllCards = exports.validateCostPayment = exports.PortaleVonMolthar = void 0;
__exportStar(require("./game/types.js"), exports);
var index_js_1 = require("./game/index.js");
Object.defineProperty(exports, "PortaleVonMolthar", { enumerable: true, get: function () { return index_js_1.PortaleVonMolthar; } });
var costCalculation_js_1 = require("./game/costCalculation.js");
Object.defineProperty(exports, "validateCostPayment", { enumerable: true, get: function () { return costCalculation_js_1.validateCostPayment; } });
var index_js_2 = require("./game/index.js");
Object.defineProperty(exports, "getAllCards", { enumerable: true, get: function () { return index_js_2.getAllCards; } });
var browserCardDatabaseLoader_js_1 = require("./game/browserCardDatabaseLoader.js");
Object.defineProperty(exports, "waitForCardsLoaded", { enumerable: true, get: function () { return browserCardDatabaseLoader_js_1.waitForCardsLoaded; } });
//# sourceMappingURL=index.js.map