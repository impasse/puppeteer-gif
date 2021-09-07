"use strict";
var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));
var _puppeteer = _interopRequireDefault(require("puppeteer"));
var _index = _interopRequireDefault(require("./index"));
var _promises = _interopRequireDefault(require("fs/promises"));
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
function _main() {
    _main = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
        var browser, page, buf;
        return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return _puppeteer.default.launch();
                case 2:
                    browser = _ctx.sent;
                    _ctx.next = 5;
                    return browser.newPage();
                case 5:
                    page = _ctx.sent;
                    page.setViewport({
                        width: 1920,
                        height: 1080
                    });
                    _ctx.next = 9;
                    return page.goto('https://v.qq.com');
                case 9:
                    _ctx.next = 11;
                    return (0, _index).default(page, {
                        duration: 10000
                    });
                case 11:
                    buf = _ctx.sent;
                    _ctx.next = 14;
                    return _promises.default.writeFile('out.gif', buf);
                case 14:
                    _ctx.next = 16;
                    return page.close();
                case 16:
                    _ctx.next = 18;
                    return browser.close();
                case 18:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    return _main.apply(this, arguments);
}
function main() {
    return _main.apply(this, arguments);
}
main().then(function() {
    return console.log('ok');
}).catch(console.error);
