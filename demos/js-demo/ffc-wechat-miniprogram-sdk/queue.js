var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { eventHub } from "./events";
var Queue = /** @class */ (function () {
    // flushLimit === 0 means no limit
    // and 
    function Queue(flushLimit, arriveflushLimitTopic) {
        if (flushLimit === void 0) { flushLimit = 0; }
        if (arriveflushLimitTopic === void 0) { arriveflushLimitTopic = ''; }
        this.flushLimit = flushLimit;
        this.arriveflushLimitTopic = arriveflushLimitTopic;
        this.queue = [];
    }
    Queue.prototype.add = function (element) {
        this.queue.push(element);
        if (this.flushLimit > 0 && this.queue.length >= this.flushLimit) {
            eventHub.emit(this.arriveflushLimitTopic, {});
        }
    };
    Queue.prototype.flush = function () {
        var allElements = __spreadArray([], this.queue, true);
        this.queue = [];
        return allElements;
    };
    return Queue;
}());
export { Queue };
//# sourceMappingURL=queue.js.map