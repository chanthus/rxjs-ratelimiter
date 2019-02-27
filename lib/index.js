"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var RateLimiter = /** @class */ (function () {
    function RateLimiter(requestsPerInterval, intervalLength, delayBetweenCallsMs, scheduler) {
        if (delayBetweenCallsMs === void 0) { delayBetweenCallsMs = 0; }
        if (scheduler === void 0) { scheduler = rxjs_1.asyncScheduler; }
        this.requestsPerInterval = requestsPerInterval;
        this.intervalLength = intervalLength;
        this.delayBetweenCallsMs = delayBetweenCallsMs;
        this.scheduler = scheduler;
        this.intervalEnds = 0;
        this.nActiveInCurrentInterval = 0;
    }
    RateLimiter.prototype.limit = function (stream) {
        var _this = this;
        return rxjs_1.of(null).pipe(operators_1.concatMap(function () {
            var now = _this.scheduler.now();
            if (_this.intervalEnds <= now) {
                _this.nActiveInCurrentInterval = 1;
                _this.intervalEnds = now + _this.intervalLength;
                return stream;
            }
            else {
                if (++_this.nActiveInCurrentInterval > _this.requestsPerInterval) {
                    _this.nActiveInCurrentInterval = 1;
                    _this.intervalEnds += _this.intervalLength;
                }
                var delayBetweenCallsMs = _this.delayBetweenCallsMs * _this._clampedInterval();
                var wait = _this.intervalEnds - _this.intervalLength - now + delayBetweenCallsMs;
                return wait > 0
                    ? rxjs_1.of(null).pipe(operators_1.delay(wait, _this.scheduler), operators_1.switchMapTo(stream))
                    : stream;
            }
        }));
    };
    RateLimiter.prototype._clampedInterval = function () {
        return Math.max(this.nActiveInCurrentInterval - 1, 0);
    };
    return RateLimiter;
}());
exports.default = RateLimiter;
//# sourceMappingURL=index.js.map