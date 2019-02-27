"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var testing_1 = require("rxjs/testing");
var _1 = require(".");
describe('rxjs-ratelimiter', function () {
    var scheduler;
    var expect;
    var flush;
    var cold;
    beforeEach(function () {
        scheduler = new testing_1.TestScheduler(chai_1.assert.deepEqual);
        expect = scheduler.expectObservable.bind(scheduler);
        flush = scheduler.flush.bind(scheduler);
        cold = scheduler.createColdObservable.bind(scheduler);
    });
    it('queues subscriptions according to rate limit of 1 request per 10 ticks', function () {
        var limiter = new _1.default(1, 10, 0, scheduler);
        var limitObservable = function (value) { return limiter.limit(rxjs_1.of(value)); };
        expect(limitObservable('a')).toBe('(a|)');
        expect(limitObservable('b')).toBe('-(b|)');
        expect(limitObservable('c')).toBe('--(c|)');
        flush();
    });
    it('queues subscriptions according to rate limit of 2 requests per 10 ticks', function () {
        var limiter = new _1.default(2, 10, 10, scheduler);
        var limitObservable = function (value) { return limiter.limit(rxjs_1.of(value)); };
        expect(limitObservable('a')).toBe('(a|)');
        expect(limitObservable('b')).toBe('-(b|)');
        expect(limitObservable('c')).toBe('-(c|)');
        expect(limitObservable('d')).toBe('--(d|)');
        expect(limitObservable('e')).toBe('--(e|)');
        flush();
    });
    it('queues subsequent subscriptions according to rate limit of 2 requests per 10 ticks', function () {
        var limiter = new _1.default(2, 10, 0, scheduler);
        var limitObservable = function (value) { return limiter.limit(rxjs_1.of(value)); };
        expect(limitObservable('a')).toBe('(a|)');
        flush();
        chai_1.assert.equal(scheduler.now(), 0);
        expect(limitObservable('b')).toBe('(b|)');
        flush();
        chai_1.assert.equal(scheduler.now(), 0);
        expect(limitObservable('c')).toBe('-(c|)');
        flush();
        chai_1.assert.equal(scheduler.now(), 10);
        expect(limitObservable('d')).toBe('-(d|)');
        expect(limitObservable('e')).toBe('--(e|)');
        flush();
        chai_1.assert.equal(scheduler.now(), 20);
    });
    it('queues retry after original according to rate limit', function () {
        var limiter = new _1.default(1, 20, 0, scheduler);
        var iteration = 0;
        expect(limiter
            .limit(
        // this observable fails the first two times it is subscribed to
        rxjs_1.of(null).pipe(operators_1.mergeMap(function () { return (++iteration === 3 ? cold('a|') : cold('#')); })))
            .pipe(operators_1.retry())).toBe('----a|');
        flush();
    });
});
//# sourceMappingURL=index.spec.js.map