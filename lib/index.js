"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = record;
var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));
var _fs = _interopRequireDefault(require("fs"));
var _promises = _interopRequireDefault(require("fs/promises"));
var _path = _interopRequireDefault(require("path"));
var _bluebird = _interopRequireDefault(require("bluebird"));
var _gifEncoder = _interopRequireDefault(require("gif-encoder"));
var _jimp = _interopRequireDefault(require("jimp"));
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function record(page, options) {
    var tempDir = await _promises.default.mkdtemp('puppeteer-');
    var filePath = _path.default.resolve(tempDir, 'tracing.json');
    var gifPath = _path.default.resolve(tempDir, 'out.gif');
    try {
        await page.tracing.start({
            path: filePath,
            screenshots: true,
            categories: [
                'screenshot', 
            ]
        });
        await _bluebird.default.delay(options.duration);
        var tracingData = await page.tracing.stop();
        var tracing = JSON.parse(tracingData.toString());
        var screenshots = tracing.traceEvents.filter(function(event) {
            var ref;
            return event.name === 'Screenshot' && !!(event === null || event === void 0 ? void 0 : (ref = event.args) === null || ref === void 0 ? void 0 : ref.snapshot);
        }).sort(function(ea, eb) {
            return ea.ts - eb.ts;
        }).map(function(event) {
            return Buffer.from(event.args.snapshot, 'base64');
        });
        var ref;
        var viewport = (ref = await page.viewport()) !== null && ref !== void 0 ? ref : {
            width: 0,
            height: 0
        };
        var gif = new _gifEncoder.default(viewport.width, viewport.height);
        var out = _fs.default.createWriteStream(gifPath);
        gif.pipe(out);
        gif.setFrameRate(options.duration / screenshots);
        gif.setQuality(1);
        gif.setRepeat(0);
        gif.writeHeader();
        await _bluebird.default.each(screenshots, _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(screenshot) {
            return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                while(1)switch(_ctx.prev = _ctx.next){
                    case 0:
                        _ctx.next = 2;
                        return readPixmap(screenshot, viewport.width, viewport.height);
                    case 2:
                        gif.addFrame.call(gif, _ctx.sent);
                    case 3:
                    case "end":
                        return _ctx.stop();
                }
            }, _callee);
        })));
        return await new Promise(function(resolve, reject) {
            out.on('close', _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                    while(1)switch(_ctx.prev = _ctx.next){
                        case 0:
                            _ctx.prev = 0;
                            _ctx.next = 3;
                            return _promises.default.readFile(gifPath, {
                                encoding: null
                            });
                        case 3:
                            resolve(_ctx.sent);
                            _ctx.next = 9;
                            break;
                        case 6:
                            _ctx.prev = 6;
                            _ctx.t0 = _ctx["catch"](0);
                            reject(_ctx.t0);
                        case 9:
                        case "end":
                            return _ctx.stop();
                    }
                }, _callee, null, [
                    [
                        0,
                        6
                    ]
                ]);
            })));
            out.on('error', reject);
            gif.finish();
        });
    } finally{
        await _promises.default.rmdir(tempDir, {
            recursive: true
        });
    }
}
function _readPixmap() {
    _readPixmap = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(data, w, h) {
        var image;
        return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return _jimp.default.read(data);
                case 2:
                    image = _ctx.sent;
                    image.cover(w, h, _jimp.default.HORIZONTAL_ALIGN_LEFT | _jimp.default.VERTICAL_ALIGN_TOP);
                    return _ctx.abrupt("return", image.bitmap.data);
                case 5:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _readPixmap.apply(this, arguments);
}
function readPixmap(data, w, h) {
    return _readPixmap.apply(this, arguments);
}
