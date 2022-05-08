var EventEmitter = /** @class */ (function () {
    function EventEmitter(events) {
        this.events = events || {};
    }
    EventEmitter.prototype.subscribe = function (name, cb) {
        var _this = this;
        (this.events[name] || (this.events[name] = [])).push(cb);
        return {
            unsubscribe: function () {
                return _this.events[name] && _this.events[name].splice(_this.events[name].indexOf(cb) >>> 0, 1);
            }
        };
    };
    EventEmitter.prototype.emit = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (this.events[name] || []).forEach(function (fn) { return fn.apply(void 0, args); });
    };
    return EventEmitter;
}());
export var eventHub = new EventEmitter();
//# sourceMappingURL=events.js.map