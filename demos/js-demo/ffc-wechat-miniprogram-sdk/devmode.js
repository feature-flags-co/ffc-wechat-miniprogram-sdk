import { devModeBtnId, devModeEventName, devModeStorageKey } from "./constants";
import { eventHub } from "./events";
import store from "./store";
import { FeatureFlagUpdateOperation } from "./types";
import { addCss, makeElementDraggable } from "./utils";
import throttleUtil from "./throttleutil";
//const DevModeIconBtnUrl = 'https://portal.feature-flags.co/assets/ff_logo.png';
var DevModeIconBtnData = 'data:image/png;base64,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';
var DevModeEventInit = /** @class */ (function () {
    function DevModeEventInit() {
        this.key = devModeStorageKey;
    }
    return DevModeEventInit;
}());
function addFfEditorFFListChangeListener(ffEditorContainer, featureFlags) {
    // ff variation change
    ffEditorContainer.querySelectorAll("#ffc-ff-editor-container .ff-list").forEach(function (node) {
        node.addEventListener('change', function (ev) {
            var _a;
            var target = ev.target;
            var id = (target === null || target === void 0 ? void 0 : target.getAttribute('data-id')) || '';
            var value = target === null || target === void 0 ? void 0 : target.value;
            var ff = featureFlags[id];
            var data = {
                id: id,
                oldValue: ff.variation,
                newValue: value
            };
            eventHub.emit("devmode_ff_".concat(FeatureFlagUpdateOperation.update), (_a = {}, _a[id] = data, _a));
        });
    });
}
function createFfEditor(featureFlags) {
    var _a, _b, _c;
    var ffEditorContainer = document.createElement("div");
    ffEditorContainer.id = 'ffc-ff-editor-container';
    ffEditorContainer.innerHTML = "\n    <div id=\"ff-editor-header\" style=\"display: flex;justify-content: space-between;cursor:move\">\n      <div style=\"font-size: 20px;;padding: 10px 20px;\">Developer mode (play with feature flags locally)</div>\n      <div id=\"ffc-ff-editor-close\" style=\"font-size: 25px;padding: 6px 20px;cursor: pointer;font-weight:600;\"></div>\n    </div>\n    <div id=\"ff-editor-search-container\" style=\"border-top: 1px solid #f0f0f0;display: flex;justify-content: center;padding-top: 20px;margin-bottom: 15px;\">\n      <input autofocus placeholder=\"Search\" id=\"ff-editor-search-query\" style=\"width:90%;height:30px;border-radius: 5px;border: 1px solid #222222;padding:0 10px\" type=\"text\"/> \n    </div>\n    <div id=\"ff-editor-content\" style=\"max-height:550px;overflow-y:auto;padding:24px 24px 0 24px;\">\n    </div>\n    <div style=\"padding: 20px; text-align: right;\">\n      <button id=\"ff-editor-reset-btn\" style=\"background-color: #fff;padding: 5px 10px;margin-left: 10px;box-sizing: border-box;border:none;color:#1890ff;cursor:pointer;\"> Reset from remote data </button>\n    </div>\n    <style>\n      #ffc-ff-editor-container #ffc-ff-editor-close:after{\n        display: inline-block;\n        content: \"\\00d7\"; /* This will render the 'X' */\n      }\n      #ffc-ff-editor-container #ff-editor-search-query:hover,#ffc-ff-editor-container #ff-editor-search-query:focus,#ffc-ff-editor-container #ff-editor-search-query:active{\n        border-color: #40a9ff !important;\n        outline-color: #40a9ff;\n      }\n\n      #ffc-ff-editor-container li:hover {\n        background: rgba(60,90,100,.04);\n      }\n    </style>\n  ";
    var left = "25%";
    var top = "50px";
    addCss(ffEditorContainer, {
        "position": "absolute",
        "left": left,
        "top": top,
        "width": "50%",
        "z-index": "9999",
        "border": "1px grey solid",
        "border-radius": "5px",
        "box-shadow": "0 8px 8px -4px lightblue",
        "background-color": "#fff",
        "font-family": "Sohne, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',\n\t\t'Droid Sans', 'Helvetica Neue', sans-serif"
    });
    ffEditorContainer.querySelector('#ff-editor-content').innerHTML = ffListHtml(featureFlags);
    // search query change
    (_a = ffEditorContainer.querySelector('#ff-editor-search-query')) === null || _a === void 0 ? void 0 : _a.addEventListener('keyup', throttleUtil.throttle(function (ev) {
        var _a, _b;
        var query = ((_b = (_a = document.getElementById('ff-editor-search-query')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim()) || '';
        if (query && query.length > 0) {
            var results = Object.keys(featureFlags).filter(function (key) { return key.indexOf(query.toLocaleLowerCase()) !== -1; }).reduce(function (res, curr) {
                res[curr] = featureFlags[curr];
                return res;
            }, {});
            ffEditorContainer.querySelector('#ff-editor-content').innerHTML = ffListHtml(results);
        }
        else {
            ffEditorContainer.querySelector('#ff-editor-content').innerHTML = ffListHtml(featureFlags);
        }
        addFfEditorFFListChangeListener(ffEditorContainer, featureFlags);
    }, 200));
    // close button click handler
    (_b = ffEditorContainer.querySelector("#ffc-ff-editor-close")) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function (ev) {
        var _a;
        (_a = document.getElementById('ffc-ff-editor-container')) === null || _a === void 0 ? void 0 : _a.remove();
    });
    // reset button click
    (_c = ffEditorContainer.querySelector("#ff-editor-reset-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function (ev) {
        eventHub.emit("devmode_ff_".concat(FeatureFlagUpdateOperation.createDevData), {});
    });
    // ff variation change
    addFfEditorFFListChangeListener(ffEditorContainer, featureFlags);
    document.body.appendChild(ffEditorContainer);
    makeElementDraggable(ffEditorContainer);
}
function ffListHtml(featureFlags) {
    return Object.keys(featureFlags).map(function (key) {
        var ff = featureFlags[key];
        var optionsHtml = ff.variationOptions.map(function (item) { return "<option ".concat(item.value === ff.variation ? 'selected' : '', " value=\"").concat(item.value, "\">").concat(item.value, "</option>"); }).join('');
        return "\n      <ul style=\"list-style-type: none;margin: 0;padding: 0;\">\n        <li style=\"display:flex;justify-content:space-between;border-bottom: #f0f0f0 1px solid;padding: 5px 5px;\">\n          <label style=\"line-height:30px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;\" title=\"".concat(ff.id, "\">").concat(ff.id, "</label>\n          <select data-id=\"").concat(ff.id, "\" class=\"ff-list\" style=\"width:300px;padding:5px\">\n            ").concat(optionsHtml, "\n          </select>\n        </li>\n      </ul>");
    }).join('');
}
function enableDevMode() {
    if (document.getElementById('ffc-devmode-container')) {
        return;
    }
    // display dev mode icon
    var devModeContainer = document.createElement("div");
    devModeContainer.id = 'ffc-devmode-container';
    addCss(devModeContainer, {
        "position": "absolute",
        "z-index": "9999",
        "bottom": "5px",
        "right": "5px",
        "font-family": "Sohne, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',\n\t\t'Droid Sans', 'Helvetica Neue', sans-serif"
    });
    // const closeBtn = document.createElement("div");
    // closeBtn.style.height = '25px';
    // closeBtn.innerHTML = `
    //   <div id="ffc-devmode-close" style="font-size: 25px;padding: 6px 20px;cursor: pointer;font-weight:600;text-align:right;width:50px"></div>
    //   <style>
    //   #ffc-devmode-close:after{
    //     display: inline-block;
    //     content: "\\00d7"; /* This will render the 'X' */
    //   }
    // </style>
    //   `;
    // // add onclick listener on close button, turn off dev mode if clicked
    // closeBtn.addEventListener('click', () => {
    //   localStorage.setItem(devModeStorageKey, `${false}`)
    //   store.isDevMode = false;
    //   disableDevMode();
    // });
    // devModeContainer.appendChild(closeBtn);
    var devModeBtn = document.createElement("img");
    devModeBtn.src = DevModeIconBtnData;
    devModeBtn.id = devModeBtnId;
    //DevModeIconBtnUrl;
    addCss(devModeBtn, {
        "padding": "10px",
        "z-index": "9999",
        "cursor": "pointer",
        "width": "70px",
    });
    // add onclick listener on icon
    devModeBtn.addEventListener('click', function () {
        if (document.getElementById('ffc-ff-editor-container')) {
            return;
        }
        createFfEditor(store.getFeatureFlags());
    });
    devModeContainer.appendChild(devModeBtn);
    document.body.appendChild(devModeContainer);
    makeElementDraggable(devModeContainer);
}
function disableDevMode() {
    var _a, _b;
    (_a = document.getElementById("ffc-devmode-container")) === null || _a === void 0 ? void 0 : _a.remove();
    (_b = document.getElementById("ffc-ff-editor-container")) === null || _b === void 0 ? void 0 : _b.remove();
}
function dispatchDevModeEvent() {
    var setItem = localStorage.setItem;
    localStorage.setItem = function (key, val) {
        if (key === devModeStorageKey) {
            var devModeStr = localStorage.getItem(devModeStorageKey) || 'false';
            if (devModeStr !== "".concat(val)) {
                var event_1 = new CustomEvent(devModeEventName, { detail: { newValue: "".concat(val), oldValue: devModeStr, key: key } });
                window.dispatchEvent(event_1);
            }
        }
        var argumentsTyped = arguments;
        setItem.apply(this, argumentsTyped);
    };
}
;
function onDevModeChange(oldValue, newValue) {
    if (oldValue !== newValue) {
        if (newValue === 'true') {
            // make sure the document.body exists before enabling dev mode
            setTimeout(function () {
                store.isDevMode = true;
                enableDevMode();
            }, 0);
        }
        else {
            // make sure the document.body exists before enabling dev mode
            setTimeout(function () {
                store.isDevMode = false;
                disableDevMode();
            }, 0);
        }
    }
}
var DevMode = /** @class */ (function () {
    function DevMode() {
        eventHub.subscribe("devmode_ff_".concat(FeatureFlagUpdateOperation.devDataCreated), function () {
            createFfEditor(store.getFeatureFlags());
        });
    }
    DevMode.prototype.init = function (password) {
        var self = this;
        self.password = password;
        if (!this.password) { // if password set, it's not allowed to activate dev mode by setting localStorage
            dispatchDevModeEvent();
            window.addEventListener(devModeEventName, function (e) {
                var _a = e.detail, key = _a.key, oldValue = _a.oldValue, newValue = _a.newValue;
                if (key === devModeStorageKey) {
                    onDevModeChange(oldValue, newValue);
                }
            });
            // currently we dont want this feature
            // // set devmode from query string
            // const queryString = window.location.search;
            // const urlParams = new URLSearchParams(queryString);
            // const devModeParam = urlParams.get(devModeQueryStr);
            // if (devModeParam !== null && ['true', 'false'].findIndex(ele => ele === devModeParam.toLocaleLowerCase()) > -1) {
            //   localStorage.setItem(devModeStorageKey, devModeParam);
            // }
            // if already in dev mode since loading of the page
            var devMode = localStorage.getItem(devModeStorageKey) || 'false';
            if (devMode === 'true') {
                // make sure the document.body exists before enabling dev mode
                setTimeout(function () {
                    store.isDevMode = true;
                    enableDevMode();
                }, 0);
            }
        }
        else {
            // clear localStorage
            localStorage.removeItem(devModeStorageKey);
        }
    };
    DevMode.prototype.activateDevMode = function (password) {
        if (!this.password || this.password === password) {
            localStorage.setItem(devModeStorageKey, "".concat(true));
            onDevModeChange('', 'true');
        }
    };
    DevMode.prototype.openEditor = function () {
        var _a;
        (_a = document.getElementById(devModeBtnId)) === null || _a === void 0 ? void 0 : _a.click();
    };
    DevMode.prototype.quit = function () {
        onDevModeChange('', 'false');
        localStorage.setItem(devModeStorageKey, "".concat(false));
    };
    return DevMode;
}());
export default new DevMode();
//# sourceMappingURL=devmode.js.map