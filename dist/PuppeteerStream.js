"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStream = exports.launch = exports.Stream = void 0;
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
// add stealth plugin and use defaults (all evasion techniques)
puppeteer_extra_1.default.use(puppeteer_extra_plugin_stealth_1.default());
class Stream extends stream_1.Readable {
    constructor(page, options) {
        super(options);
        this.page = page;
    }
    _read() { }
    destroy() {
        super.destroy();
        // TODO: do not destory page just stop recording
        // await page.evaluate((filename) => {
        // 	window.postMessage({ type: "REC_STOP" }, "*");
        // }, exportname);
        return this.page.close();
    }
}
exports.Stream = Stream;
function launch(opts) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts)
            opts = {};
        if (!opts.args)
            opts.args = [];
        const extensionPath = path_1.default.join(__dirname, "..", "extension");
        const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
        let loadExtension = false;
        let loadExtensionExcept = false;
        let whitelisted = false;
        opts.args.map((x) => {
            if (x.includes("--load-extension=")) {
                loadExtension = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--disable-extensions-except=")) {
                loadExtensionExcept = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--whitelisted-extension-id")) {
                whitelisted = true;
                return x + "," + extensionId;
            }
            return x;
        });
        if (!loadExtension)
            opts.args.push("--load-extension=" + extensionPath);
        if (!loadExtensionExcept)
            opts.args.push("--disable-extensions-except=" + extensionPath);
        if (!whitelisted)
            opts.args.push("--whitelisted-extension-id=" + extensionId);
        if (((_a = opts.defaultViewport) === null || _a === void 0 ? void 0 : _a.width) && ((_b = opts.defaultViewport) === null || _b === void 0 ? void 0 : _b.height))
            opts.args.push(`--window-size=${(_c = opts.defaultViewport) === null || _c === void 0 ? void 0 : _c.width}x${(_d = opts.defaultViewport) === null || _d === void 0 ? void 0 : _d.height}`);
        opts.headless = false;
        // @ts-ignore
        const browser = yield puppeteer_extra_1.default.launch(opts);
        // @ts-ignore
        browser.encoders = new Map();
        const targets = browser.targets();
        const extensionTarget = targets.find(
        // @ts-ignore
        (target) => target.type() === "background_page" && target._targetInfo.title === "Video Capture");
        // @ts-ignore
        browser.videoCaptureExtension = yield extensionTarget.page();
        // @ts-ignore
        yield browser.videoCaptureExtension.exposeFunction("sendData", (opts) => {
            const data = Buffer.from(str2ab(opts.data));
            // @ts-ignore
            browser.encoders.get(opts.id).push(data);
        });
        return browser;
    });
}
exports.launch = launch;
function getStream(page, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new Stream(page);
        if (!opts.audio && !opts.video)
            throw new Error("At least audio or video must be true");
        if (!opts.mimeType) {
            if (opts.video)
                opts.mimeType = "video/webm";
            else if (opts.audio)
                opts.mimeType = "audio/webm";
        }
        if (!opts.frameSize)
            opts.frameSize = 20;
        yield page.bringToFront();
        // @ts-ignore
        yield page.browser().videoCaptureExtension.evaluate((settings) => {
            // @ts-ignore
            START_RECORDING(settings);
        }, Object.assign(Object.assign({}, opts), { index: page._id }));
        // @ts-ignore
        page.browser().encoders.set(page._id, encoder);
        return encoder;
    });
}
exports.getStream = getStream;
function str2ab(str) {
    // Convert a UTF-8 String to an ArrayBuffer
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBbUQ7QUFDbkQsZ0RBQXdCO0FBRXhCLDBEQUEwRDtBQUMxRCxnRUFBZ0U7QUFDaEUsc0VBQXdDO0FBQ3hDLG9HQUEyRDtBQUUzRCwrREFBK0Q7QUFDL0QseUJBQVMsQ0FBQyxHQUFHLENBQUMsd0NBQWEsRUFBRSxDQUFDLENBQUE7QUFFOUIsTUFBYSxNQUFPLFNBQVEsaUJBQVE7SUFDbkMsWUFBb0IsSUFBVSxFQUFFLE9BQXlCO1FBQ3hELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQURJLFNBQUksR0FBSixJQUFJLENBQU07SUFFOUIsQ0FBQztJQUVELEtBQUssS0FBSSxDQUFDO0lBRVYsT0FBTztRQUNOLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixnREFBZ0Q7UUFDaEQsc0NBQXNDO1FBQ3RDLGtEQUFrRDtRQUNsRCxrQkFBa0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FDRDtBQWZELHdCQWVDO0FBU0QsU0FBc0IsTUFBTSxDQUFDLElBQXVEOzs7UUFDbkYsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRS9CLE1BQU0sYUFBYSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RCxNQUFNLFdBQVcsR0FBRyxrQ0FBa0MsQ0FBQztRQUN2RCxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7UUFDaEMs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