// TODO replace it with false
var debugMode = false;
export var logger = {
    logDebug: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (debugMode) {
            console.log.apply(console, args);
        }
    },
    log: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
    }
};
//# sourceMappingURL=logger.js.map